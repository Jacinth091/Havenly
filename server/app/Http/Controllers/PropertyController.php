<?php

namespace App\Http\Controllers;

use App\Models\Landlord;
use App\Models\Property;
use App\Models\Room;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;


class PropertyController extends Controller{

    public function getOwnedProperties(Request $request) {  
        try {
            $user = Auth::user();
            if (!$user->landlord) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bad Request, Invalid role detected!'
                ], 403);
            }
            $landlordId = $user->landlord->landlord_id;
            $cities = Property::where('landlord_id', $landlordId)
                ->whereNotNull('city')
                ->where('city', '!=', '')
                ->distinct()
                ->orderBy('city', 'asc')
                ->pluck('city'); 
            $summary = Property::where('landlord_id', $landlordId)
                ->selectRaw('
                    count(*) as total_properties,
                    sum(case when is_active = 1 then 1 else 0 end) as active_properties,
                    sum(case when is_active = 0 then 1 else 0 end) as inactive_properties,
                    sum(total_rooms) as total_rooms_count
                ')
                ->first();
            $per_page = $request->input('limit', 10);
            $per_page = ($per_page > 100) ? 100 : $per_page;
            
            $search = $request->input('search');
            $status = $request->input('status', 'All');
            $cityFilter = $request->input('city', 'All'); 
            $query = Property::where('landlord_id', $landlordId);
            $query->when($search, function ($q) use ($search) {
                $q->where(function ($innerQ) use ($search) {
                    $innerQ->where('property_name', 'like', "%{$search}%")
                           ->orWhere('city', 'like', "%{$search}%")
                           ->orWhere('address', 'like', "%{$search}%");
                });
            });

            if ($status === 'Active') {
                $query->where('is_active', true);
            } elseif ($status === 'Inactive') {
                $query->where('is_active', false);
            }

            if ($cityFilter !== 'All' && !empty($cityFilter)) {
                $query->where('city', $cityFilter);
            }
            $properties = $query->orderBy('created_at', 'desc')
                                ->paginate($per_page);

            return response()->json([
                'status' => 'success',
                'landlord' => [
                    'name' => $user->landlord->first_name . ' ' . $user->landlord->last_name,
                    'id' => $landlordId
                ],
                'summary' => [
                    'total' => (int) $summary->total_properties,
                    'active' => (int) $summary->active_properties,
                    'inactive' => (int) $summary->inactive_properties,
                    'total_rooms' => (int) $summary->total_rooms_count, 
                ],
                'available_cities' => $cities, 
                'properties' => $properties
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch properties.',
                'error' => $th->getMessage()
            ], 500);
        }
    }
    public function createPropertyAndRoom(Request $request){
        try {
            $user = Auth::user();
            if(!$user){
                return response()->json([
                    'success' => false,
                    'message' => "Bad Request, User not authenticated!"
                ], 403);
            }
            $allowedRoles = ['landlord', 'admin'];

            if(!in_array(strtolower($user->role), $allowedRoles)){
                return response()->json([
                    'success' => false,
                    "message" => 'Bad Request, Invalid role!',
                    'userRole' => strtolower($user->role)
                ],403);
            }

            $validator = Validator::make($request->all(), [
                'property_name' => 'required|string|max:100',
                'address' => 'required|string|max:255',
                'city' => 'required|string|max:100',
                'rooms' => 'nullable|array',
                'rooms.*.room_number' => 'required_with:rooms|string',
                'rooms.*.monthly_rent' =>'required_with:rooms|numeric|min:0'
            ]);

            if($validator->fails()){
                return response()->json([
                    'success' => false,
                    'message' => "Validation Error",
                    'error' => $validator->errors()
                ],422);
            }

            $landlordId = null;
            if (strtolower($user->role) === 'admin') {
                // Admin must explicitly say who owns this property
                if (!$request->has('landlord_id')) {
                    return response()->json([
                        'success' => false, 
                        'message' => 'Admin must specify a landlord_id'
                    ], 422);
                }
                $landlordId = $request->landlord_id;
            } else {
                // Landlords can only create properties for themselves
                $landlordProfile = DB::table('landlords')->where('user_id', $user->user_id)->first();
                if (!$landlordProfile) {
                    return response()->json(['success' => false, 'message' => 'Landlord profile not found'], 404);
                }
                $landlordId = $landlordProfile->landlord_id;
            }

            if(!$landlordId){
                return response()->json([
                    'success' => false,
                    'message' => "Error, cannot continue operation. Landlord Id is null!"
                ],403);
            }

            $result = DB::transaction(function () use ($validator, $request, $landlordId){
                $property = Property::create([
                    'landlord_id' => $landlordId, // Assuming auth setup
                    'property_name' => $request->input('property_name'),
                    'address' => $request->input('address'),
                    'city' => $request->input('city'),
                    'total_rooms' => count($request->rooms ?? []), // Set total immediately
                    'is_active' => true,
                    'created_at'=> Carbon::now(),
                    'updated_at'=> Carbon::now(),
                    
                ]);

                if(!$property){
                    throw new \Exception("Failed to create property");
                }

                $roomData = [];
                if (!empty($request->rooms)) {
                    foreach ($request->rooms as $room) {
                        $roomData[] = [
                            'property_id' => $property->property_id, // Link to new property
                            'room_number' => $room['room_number'],
                            'monthly_rent' => $room['monthly_rent'],
                            'room_status' => $room['room_status'] ?? 'Available',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                    
                    // Bulk insert for performance
                    Room::insert($roomData); 
                    if (empty($roomData)) {
                        throw new \Exception("Failed to create rooms: No room data provided");
                    }
                }

                return [
                    'property'=> $property,
                    'rooms' => $roomData
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Property created successfully!',
                'property' => $result['property'],
                'rooms' => $result['rooms'] ?? []
            ],201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }   


    public function show($id)
    {
        try {
            $user = Auth::user();
            $landlordId = $user->landlord->landlord_id ?? null;

            // 1. Ownership/Access Check
            $query = Property::with(['rooms' => function ($q) {
                // Optional: Eager load a summary of rooms
                $q->select('property_id', 'room_id', 'room_number', 'room_status', 'monthly_rent');
            }]);

            // If not admin, restrict to own properties [cite: 168]
            if (strtolower($user->role) !== 'admin') {
                if (!$landlordId) return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
                $query->where('landlord_id', $landlordId);
            }

            $property = $query->where('property_id', $id)->first();

            if (!$property) {
                return response()->json(['success' => false, 'message' => 'Property not found or access denied'], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $property
            ]);

        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => 'Server Error', 'error' => $th->getMessage()], 500);
        }
    }

    /**
     * Update property details.
     * Enforces unique property name per landlord[cite: 168].
     */
    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $landlordId = $user->landlord->landlord_id ?? null;

            // 1. Authorization
            $property = Property::where('property_id', $id)->first();
            
            if (!$property) {
                return response()->json(['success' => false, 'message' => 'Property not found'], 404);
            }

            // Allow Admin OR Owner
            if (strtolower($user->role) !== 'admin') {
                if ($property->landlord_id !== $landlordId) {
                    return response()->json(['success' => false, 'message' => 'Unauthorized action'], 403);
                }
            }

            // 2. Validate
            $validator = Validator::make($request->all(), [
                'property_name' => 'sometimes|string|max:100',
                'address' => 'sometimes|string|max:255',
                'city' => 'sometimes|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'error' => $validator->errors()], 422);
            }

            // 3. Unique Name Check (Per Landlord) [cite: 168]
            if ($request->has('property_name')) {
                $exists = Property::where('landlord_id', $property->landlord_id)
                    ->where('property_name', $request->property_name)
                    ->where('property_id', '!=', $id) // Exclude self
                    ->exists();

                if ($exists) {
                    return response()->json([
                        'success' => false, 
                        'message' => 'You already have a property with this name.'
                    ], 422);
                }
            }

            // 4. Update
            $property->update($request->only(['property_name', 'address', 'city']));

            return response()->json([
                'success' => true,
                'message' => 'Property updated successfully',
                'data' => $property
            ]);

        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => 'Update failed', 'error' => $th->getMessage()], 500);
        }
    }

    /**
     * Soft Delete a property.
     * Enforces Rule: Cannot delete if active rooms/leases exist.
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $user = Auth::user();
            $landlordId = $user->landlord->landlord_id ?? null;

            // 1. Authorization
            $property = Property::where('property_id', $id)->first();

            if (!$property) {
                return response()->json(['success' => false, 'message' => 'Property not found'], 404);
            }

            if (strtolower($user->role) !== 'admin') {
                if ($property->landlord_id !== $landlordId) {
                    return response()->json(['success' => false, 'message' => 'Unauthorized action'], 403);
                }
            }

            // 2. Business Rule: Check for Active Leases 
            // We check if ANY room in this property has an ACTIVE lease.
            $hasActiveLeases = Room::where('property_id', $id)
                ->whereHas('leases', function ($q) {
                    $q->where('lease_status', 'Active')
                      ->where('is_active', true);
                })->exists();

            if ($hasActiveLeases) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete property. Active tenants/leases exist.'
                ], 409); // Conflict
            }

            // 3. Soft Delete Process [cite: 206]
            // First, soft delete the rooms (cascade logic for soft delete)
            Room::where('property_id', $id)->delete();
            
            // Then, soft delete the property
            $property->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Property and associated rooms deleted successfully.'
            ]);

        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Deletion failed', 'error' => $th->getMessage()], 500);
        }
    }

    /**
     * Admin only: View all properties in the system[cite: 18].
     */
    public function adminIndex(Request $request)
    {
        try {
            if (strtolower(Auth::user()->role) !== 'admin') {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $per_page = $request->input('limit', 20);
            
            $properties = Property::with('landlord:landlord_id,first_name,last_name')
                ->orderBy('created_at', 'desc')
                ->paginate($per_page);

            return response()->json([
                'success' => true,
                'data' => $properties
            ]);

        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => 'Server Error', 'error' => $th->getMessage()], 500);
        }
    }

}
