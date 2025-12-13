<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

use function Laravel\Prompts\error;
use function PHPUnit\Framework\isEmpty;

class RoomController extends Controller
{

    public function getAllRooms(Request $request) {
        try {
            $user = Auth::user();
            
            // 1. Role Validation
            if (!$user->landlord) {
                return response()->json(['success' => false, 'message' => 'Invalid role detected!'], 403);
            }

            $per_page = $request->input('limit', 10);
            $search = $request->input('search');
            $statusFilter = $request->input('status', 'All');

            // 2. Check if Landlord has any rooms
            if ($user->landlord->rooms()->doesntExist()) {
                return response()->json([
                    'success' => true,
                    'message' => "No rooms found.",
                    'data' => [
                        'summary' => ['All' => 0, 'Available' => 0, 'Occupied' => 0],
                        'rooms' => [] // Return empty array formatted for pagination manually if needed, or just empty
                    ]
                ], 200);
            }

            // 3. Get Statistics (Summary) - Unfiltered by search/status
            $rawCounts = $user->landlord->rooms()
                ->select('room_status', DB::raw('count(*) as count'))
                ->groupBy('room_status')
                ->pluck('count', 'room_status')
                ->toArray();

            $summary = [
                'All' => array_sum($rawCounts),
                'Available' => $rawCounts['Available'] ?? 0,
                'Occupied' => $rawCounts['Occupied'] ?? 0,
                'Maintenance' => $rawCounts['Maintenance'] ?? 0,
            ];

            // 4. Fetch Data with Filters & Search
            $query = $user->landlord->rooms();

            // A. Apply Status Filter
            if ($statusFilter && $statusFilter !== 'All') {
                $query->where('room_status', $statusFilter);
            }

            // B. Apply Search Filter
            $query->when($search, function ($q) use ($search) {
                $q->where(function ($innerQ) use ($search) {
                    // Search Room Number
                    $innerQ->where('room_number', 'like', "%{$search}%")
                    // OR Search Property Name
                    ->orWhereHas('property', function ($propQ) use ($search) {
                        $propQ->where('property_name', 'like', "%{$search}%");
                    })
                    // OR Search Tenant Name
                    ->orWhereHas('leases', function ($leaseQ) use ($search) {
                        $leaseQ->where('lease_status', 'Active')
                               ->whereHas('tenant', function ($tenantQ) use ($search) {
                                   $tenantQ->where('first_name', 'like', "%{$search}%")
                                           ->orWhere('last_name', 'like', "%{$search}%");
                               });
                    });
                });
            });

            // C. Eager Load & Order
            $rooms = $query->with('property:property_id,property_name')
                ->with(['leases' => function ($query) {
                    $query->where('lease_status', 'Active')
                        ->where('is_active', true)
                        ->with('tenant');
                }])
                ->orderBy('room_number') // You might want to sort by property first: orderBy('property_id')->orderBy('room_number')
                ->paginate($per_page);

            // 5. Transform Data
            $rooms->through(function ($room) {
                $activeLease = $room->leases->first();
                $tenant = $activeLease ? $activeLease->tenant : null;

                // Calculate next due date logic
                $nextDueDate = null;
                if ($activeLease) {
                    $day = $activeLease->payment_due_day;
                    $nextDueDate = now()->setDay($day > 28 ? 28 : $day)->format('Y-m-d');
                }

                return [
                    'property_id' => $room->property_id,
                    'room_id' => $room->room_id,
                    'room_number' => $room->room_number,
                    'property_name' => $room->property->property_name ?? 'Unknown',
                    'monthly_rent' => (float) $room->monthly_rent,
                    'room_status' => $room->room_status,
                    'tenant' => $tenant ? [
                        'first_name' => $tenant->first_name,
                        'last_name' => $tenant->last_name,
                        'full_name' => $tenant->first_name . ' ' . $tenant->last_name,
                        'due_date' => $nextDueDate,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Successfully fetched all rooms',
                'data' => [
                    'summary' => $summary,
                    'rooms' => $rooms,
                ],
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch rooms.',
                'error' => $th->getMessage()
            ], 500);
        }
    }

public function getRoomByProperty(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user->landlord) {
                return response()->json(['success' => false, 'message' => 'Invalid role detected!'], 403);
            }

            $propertyId = $request->input('property_id'); // Or fetch from route param if using {propertyId}
            // If property_id is passed via route param like in your JS code, use: $request->route('propertyId')
            // Assuming here it's in the query or route param:
            if (!$propertyId) {
                 // Fallback if passed via route param named 'id' or 'property'
                 $propertyId = $request->route('id') ?? $request->route('property');
            }
            
            if (!$propertyId) {
                return response()->json(['success' => false, 'message' => 'Property ID is required'], 400);
            }

            // 1. Ensure Landlord owns this property
            $property = $user->landlord->properties()->where('property_id', $propertyId)->first();

            if (!$property) {
                return response()->json(['success' => false, 'message' => "Property not found!"], 404);
            }

            $search = $request->input('search');
            $statusFilter = $request->input('status', 'All'); // Changed 'statusTab' to 'status' to match your JS
            $per_page = $request->input('limit', 10);

            // 2. Get Status Counts
            $rawCounts = $property->rooms()
                ->select('room_status', DB::raw('count(*) as count'))
                ->groupBy('room_status')
                ->pluck('count', 'room_status')
                ->toArray();

            $summary = [
                'All'         => array_sum($rawCounts),
                'Available'   => $rawCounts['Available'] ?? 0,
                'Occupied'    => $rawCounts['Occupied'] ?? 0,
                'Maintenance' => $rawCounts['Maintenance'] ?? 0,
            ];

            // 3. Build Query
            $query = $property->rooms();

            if ($statusFilter && $statusFilter !== 'All') {
                $query->where('room_status', $statusFilter);
            }

            $query->when($search, function ($q) use ($search) {
                $q->where(function ($innerQ) use ($search) {
                    $innerQ->where('room_number', 'like', "%{$search}%")
                    ->orWhereHas('leases', function ($leaseQ) use ($search) {
                        $leaseQ->where('lease_status', 'Active')
                               ->whereHas('tenant', function ($tenantQ) use ($search) {
                                   $tenantQ->where('first_name', 'like', "%{$search}%")
                                           ->orWhere('last_name', 'like', "%{$search}%");
                               });
                    });
                });
            });

            // 4. Eager Load
            $query->with(['leases' => function ($q) {
                $q->where('lease_status', 'Active')
                  ->where('is_active', true)
                  ->with('tenant');
            }]);

            // Paginate the query
            $paginatedRooms = $query->orderBy('room_number')->paginate($per_page);

            // 5. TRANSFORM DATA
            // 'through' modifies the collection within the paginator but keeps the pagination structure
            $paginatedRooms->through(function ($room) {
                // Get the single active lease
                $activeLease = $room->leases->first();
                $tenant = $activeLease ? $activeLease->tenant : null;

                $nextDueDate = null;
                if ($activeLease) {
                    $day = $activeLease->payment_due_day ?? 1;
                    // Simple logic for next due date based on due day
                    $nextDueDate = now()->setDay($day > 28 ? 28 : $day);
                    if ($nextDueDate->isPast()) {
                         $nextDueDate->addMonth();
                    }
                    $nextDueDate = $nextDueDate->format('Y-m-d');
                }

                return [
                    'room_id'      => $room->room_id,
                    'room_number'  => $room->room_number,
                    'monthly_rent' => (float) $room->monthly_rent,
                    'room_status'  => $room->room_status,
                    
                    'current_lease' => $activeLease ? [
                        'id'              => $activeLease->lease_id,
                        'start_date'      => $activeLease->start_date,
                        'end_date'        => $activeLease->end_date,
                        'payment_due_day' => $activeLease->payment_due_day,
                    ] : null,

                    'tenant' => $tenant ? [
                        'first_name' => $tenant->first_name,
                        'last_name'  => $tenant->last_name,
                        'full_name'  => $tenant->first_name . ' ' . $tenant->last_name,
                        'due_date'   => $nextDueDate, 
                    ] : null,
                ];
            });

            // 6. Return Structured Response
            return response()->json([
                'success' => true,
                'message' => 'Successfully fetched rooms',
                
                // Property Details (Adding extra calculated fields for the frontend card)
                'property' => [
                    'property_id'   => $property->property_id,
                    'name'          => $property->property_name,
                    'property_name' => $property->property_name,
                    'address'       => $property->address,
                    'city'          => $property->city,
                    'total_rooms'   => $property->rooms()->count(),
                    'is_active'     => (bool) $property->is_active,
                    // Note: Calculating income here requires a separate query if not stored on property table
                    // 'current_monthly_income' => ... (calculated if needed, or frontend handles it)
                ],

                'summary' => $summary,
                
                // The transformed items
                'rooms' => $paginatedRooms->items(),

                'pagination' => [
                    'current_page' => $paginatedRooms->currentPage(),
                    'last_page'    => $paginatedRooms->lastPage(),
                    'total_items'  => $paginatedRooms->total(),
                    'limit'        => $paginatedRooms->perPage(),
                ]
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch rooms.',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    public function getRoomDetailsById(Request $request){
        try {
            $user = Auth::user();
            $propertyId = $request->property_id;
            $roomId = $request->room_id;
            if (!$user->landlord) {
                return response()->json(['success' => false, 'message' => 'Invalid role detected!'], 403);
            }
            $property = $user->landlord->properties()->where('property_id', $propertyId)->first();
            if (!$property) {
                return response()->json(['success' => false, 'message' => "Property not found!"], 404);
            }

            $room = Room::where('room_id', $roomId)
                ->where('property_id', $propertyId)
                ->with(['property', 'leases' => function($query){
                    $query->where('lease_status', 'Active')
                          ->where('is_active', true)
                          ->with(['tenant', 'transactions' => function($tQuery){
                                $tQuery->orderBy('transaction_date', 'desc')
                                       ->limit(10);
                          }]);
                }])
                ->first();

            // $room = $property->rooms()
            //     ->where('room_id', $roomId)                
            //     ->with(['leases' => function ($query) {
            //         $query->where('lease_status', 'Active')
            //             ->where('is_active', true)
            //             ->with('tenant');
            //     }])
            //     ->first();

            if(!$room){
                return response()->json([
                    'success' => false,
                    'message' => "Not Found. Room cannot be found!"
                ],404);
            }
            $activeLease = $room->leases->first();
            $tenant= $activeLease ? $activeLease->tenant : null;

            $transactions = [];
            if($activeLease && $activeLease->transactions){
                $transactions = $activeLease->transactions->map(function ($txn){
                    return [            
                        'id' => $txn->transaction_id,
                        'date' => $txn->transaction_date->format('Y-m-d'), // Assuming Carbon cast
                        'amount' => (float) $txn->amount,
                        'method' => $txn->payment_method, // e.g., 'GCash', 'Cash'
                        'status' => $txn->transaction_status,
                        'ref' => $txn->reference_number ?? 'N/A',
                        // Fallback to "Month Year" if you don't have a specific column for "for_month"
                        'for_month' => $txn->transaction_date->format('M Y'), 
                    ];
                });
            }


            $response = [
                'room_id' => $room->room_id,
                'room_number' => $room->room_number,
                'room_status' => $room->room_status,
                'monthly_rent' => (float) $room->monthly_rent,

                'property' => [
                    'property_id' => $room->property->property_id,
                    'name' => $room->property->property_name, // Mapped to 'name'
                    'address' => $room->property->address,
                    'city' => $room->property->city,
                ],

                'current_lease' => $activeLease ? [
                    'lease_id' => $activeLease->lease_id,
                    'start_date' => $activeLease->start_date,
                    'end_date' => $activeLease->end_date,
                    'monthly_rent' => (float) $activeLease->monthly_rent,
                    'security_deposit' => (float) $activeLease->security_deposit,
                    'payment_due_day' => (int) $activeLease->payment_due_day, // Ensure DB has this column
                    'lease_status' => $activeLease->lease_status,
                    'notes' => $activeLease->notes,
                    
                    'tenant' => $tenant ? [
                        'tenant_id' => $tenant->tenant_id,
                        'first_name' => $tenant->first_name,
                        'last_name' => $tenant->last_name,
                        'contact_num' => $tenant->contact_num,
                        'email' => $tenant->email,
                        'is_active' => (bool) $tenant->is_active,
                    ] : null,
                ] : null,

                'transactions' => $transactions,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Successfully fetched room!',
                'data' => [
                    'rooms' => $response,
                ],
            ],200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch rooms.',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    public function createRooms(Request $request) {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => "User not authenticated!"], 403);
            }

            // 1. Determine Landlord ID
            $landlordId = null;
            if (strtolower($user->role) === 'admin') {
                $landlordId = $request->landlord_id; 
                if (!$landlordId) return response()->json(['success' => false, 'message' => 'Admin must specify landlord_id'], 422);
            } else {
                // Check if user is a landlord
                $landlordProfile = DB::table('landlords')->where('user_id', $user->user_id)->first();
                if (!$landlordProfile) return response()->json(['success' => false, 'message' => 'Landlord profile not found'], 404);
                $landlordId = $landlordProfile->landlord_id;
            }

            // 2. Validate Inputs
            $validator = Validator::make($request->all(), [
                'property_id' => 'required|numeric',
                'rooms'       => 'required|array|min:1', // Must have at least one room
                'rooms.*.room_number'  => 'required|string',
                'rooms.*.monthly_rent' => 'required|numeric|min:0',
                'rooms.*.room_status'  => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => "Validation Error", 'error' => $validator->errors()], 422);
            }

            // 3. Transaction
            $result = DB::transaction(function () use ($request, $landlordId) {
                
                // SECURITY CHECK: Ensure the property exists AND belongs to this landlord
                $propertyQuery = DB::table('properties')
                    ->where('property_id', $request->property_id);

                // If not admin, enforce ownership
                if (strtolower(Auth::user()->role) !== 'admin') {
                    $propertyQuery->where('landlord_id', $landlordId);
                }

                $property = $propertyQuery->first();

                if (!$property) {
                    throw new \Exception("Property not found or access denied.");
                }

                $roomData = [];
                $now = now();

                foreach ($request->rooms as $room) {
                    // Optional: Check if room number already exists for this property to prevent duplicates
                    $exists = DB::table('rooms')
                        ->where('property_id', $property->property_id)
                        ->where('room_number', $room['room_number'])
                        ->exists();

                    if($exists) {
                        throw new \Exception("Room number " . $room['room_number'] . " already exists in this property.");
                    }

                    $roomData[] = [
                        'property_id'   => $property->property_id,
                        'room_number'   => $room['room_number'],
                        'monthly_rent'  => $room['monthly_rent'],
                        'room_status'   => $room['room_status'] ?? 'Available',
                        'created_at'    => $now,
                        'updated_at'    => $now,
                    ];
                }

                DB::table('rooms')->insert($roomData);
                DB::table('properties')
                    ->where('property_id', $property->property_id)
                    ->increment('total_rooms', count($roomData));

                return ['property' => $property, 'count' => count($roomData)];
            });

            return response()->json([
                'success' => true,
                'message' => "Successfully added {$result['count']} rooms to {$result['property']->property_name}",
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() // In production, maybe hide generic errors
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            
            // 1. Validate Input
            $validator = Validator::make($request->all(), [
                'room_number' => 'sometimes|string|max:20',
                'monthly_rent' => 'sometimes|numeric|min:1',
                'room_status' => 'sometimes|in:Available,Occupied,Maintenance',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'error' => $validator->errors()], 422);
            }

            // 2. Authorization & Ownership Check
            // Ensure the room exists and belongs to a property owned by this landlord
            $landlordId = $user->landlord->landlord_id ?? null;
            
            if (!$landlordId && $user->role !== 'Admin') {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $query = Room::where('room_id', $id);
            
            // If not admin, restrict to landlord's properties
            if ($user->role !== 'Admin') {
                $query->whereHas('property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                });
            }

            $room = $query->first();

            if (!$room) {
                return response()->json(['success' => false, 'message' => 'Room not found or access denied'], 404);
            }

            // 3. Business Rule Validation [cite: 170]
            // "A room cannot be marked 'Available' if an active lease exists for it"
            if ($request->has('room_status') && $request->room_status === 'Available') {
                $hasActiveLease = $room->leases()
                    ->where('lease_status', 'Active')
                    ->where('is_active', true)
                    ->exists();

                if ($hasActiveLease) {
                    return response()->json([
                        'success' => false, 
                        'message' => 'Cannot set room to Available while it has an active lease.'
                    ], 409); // 409 Conflict
                }
            }

            // 4. Perform Update
            $room->update($request->only(['room_number', 'monthly_rent', 'room_status']));

            return response()->json([
                'success' => true,
                'message' => 'Room updated successfully',
                'data' => $room
            ]);

        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update room',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Soft Delete a room.
     * Enforces Business Rule: Data Integrity & Parent Count Updates[cite: 148, 206].
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $user = Auth::user();
            $landlordId = $user->landlord->landlord_id ?? null;

            // 1. Authorization & Ownership
            $query = Room::where('room_id', $id);
            if ($user->role !== 'Admin') {
                $query->whereHas('property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                });
            }
            $room = $query->first();

            if (!$room) {
                return response()->json(['success' => false, 'message' => 'Room not found'], 404);
            }

            // 2. Business Rule: Prevent deletion if active lease exists (Implicit integrity rule)
            // While [cite: 175] mentions Property deletion rules, standard integrity implies
            // you shouldn't delete a room that currently has a tenant living in it.
            $hasActiveLease = $room->leases()
                ->where('lease_status', 'Active')
                ->exists();

            if ($hasActiveLease) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Cannot delete room. There is an active lease associated with it.'
                ], 409);
            }

            // 3. Decrement Property Room Count [cite: 148]
            // Since `total_rooms` is stored on the property table, we must keep it in sync.
            DB::table('properties')
                ->where('property_id', $room->property_id)
                ->decrement('total_rooms');

            // 4. Soft Delete [cite: 206]
            $room->delete(); // Requires `use SoftDeletes` in Room Model

            DB::commit();

            return response()->json([
                'success' => true, 
                'message' => 'Room deleted successfully'
            ]);

        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete room',
                'error' => $th->getMessage()
            ], 500);
        }
    }


    /**
     * Archive Room (Toggle Active Status).
     * Rule: Cannot deactivate if an active lease exists.
     */
    public function archive($id)
    {
        try {
            $user = Auth::user();
            
            // 1. Authorization
            $landlordId = $user->landlord->landlord_id ?? null;
            if (!$landlordId && $user->role !== 'Admin') {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $query = Room::where('room_id', $id);
            if ($user->role !== 'Admin') {
                $query->whereHas('property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                });
            }
            $room = $query->first();

            if (!$room) {
                return response()->json(['success' => false, 'message' => 'Room not found'], 404);
            }

            // 2. Determine Action (Activate or Deactivate)
            $willBeActive = !$room->is_active;

            // 3. Validation: Cannot Deactivate if Occupied
            if ($willBeActive === false) {
                 // Check if currently occupied or has active lease
                 $hasActiveLease = $room->leases()
                    ->where('lease_status', 'Active')
                    ->exists();

                 if ($hasActiveLease) {
                     return response()->json([
                         'success' => false, 
                         'message' => 'Cannot archive room. It is currently occupied.'
                     ], 409);
                 }
            }

            // 4. Update
            $room->update(['is_active' => $willBeActive]);

            $statusMsg = $willBeActive ? 'activated' : 'archived';

            return response()->json([
                'success' => true,
                'message' => "Room successfully {$statusMsg}.",
                'data' => $room
            ]);

        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => 'Action failed', 'error' => $th->getMessage()], 500);
        }
    }

}
