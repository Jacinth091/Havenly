<?php

namespace App\Http\Controllers;

use App\Models\Landlord;
use App\Models\Property;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;


class PropertyController extends Controller{

    public function getOwnedProperties(Request $request){
        try {
            $user = Auth::user();

            if(!$user->landlord){
                return response()->json([
                    'success' => false,
                    'message'=> 'Bad Request, Invalid role detected!'
                ], 403);
            }
            $per_page = $request->input('per_page', 10);
            $per_page = ($per_page > 100) ? 100 :$per_page;

            $properties = $user->landlord->properties()
                ->orderBy('created_at','desc')
                ->paginate($per_page);
                // ->get();
            
           return response()->json([
                'status' => 'success',
                'landlord' => [
                    'name' => $user->landlord->full_name,
                    'id' => $user->landlord->landlord_id
                ],
                'properties' => $properties
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch properties.',
                'error' => $th->getMessage() // Dev only: remove in production
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

}
