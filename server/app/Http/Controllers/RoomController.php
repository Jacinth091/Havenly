<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use function PHPUnit\Framework\isEmpty;

class RoomController extends Controller
{

    public function getAllRooms(Request $request) {
        try {
            $user = Auth::user();
            $statusFilter = $request->input('status');

            if (!$user->landlord) {
                return response()->json(['success' => false, 'message' => 'Invalid role detected!'], 403);
            }

            $per_page = $request->input('per_page', 10);
            
            // 1. Check if Landlord has any rooms at all (using the new relationship)
            // Note: Use '->' not '.'
            if ($user->landlord->rooms()->doesntExist()) {
                return response()->json([
                    'success' => true, // Return true so frontend doesn't show error, just empty list
                    'message' => "No rooms found.",
                    'data' => [
                        'summary' => ['All' => 0],
                        'rooms' => []
                    ]
                ], 200);
            }

            // 2. Get Statistics (Summary)
            $rawCounts = $user->landlord->rooms()
                ->select('room_status', DB::raw('count(*) as count'))
                ->groupBy('room_status')
                ->pluck('count', 'room_status')
                ->toArray();

            $summary = [
                'All' => array_sum($rawCounts),
                ...$rawCounts
            ];

            // 3. Fetch Data with Filters
            $rooms = $user->landlord->rooms() // Use the HasManyThrough relationship
                ->with('property:property_id,property_name') // Eager load property name for context
                ->when($statusFilter && $statusFilter !== 'All', function ($q) use ($statusFilter) {
                    $q->where('room_status', $statusFilter);
                })
                ->with(['leases' => function ($query) {
                    $query->where('lease_status', 'Active')
                        ->where('is_active', true)
                        ->with('tenant');
                }])
                ->orderBy('room_number') // Or orderBy('room_number')
                ->paginate($per_page);

            // 4. Transform Data
            $rooms->through(function ($room) {
                $activeLease = $room->leases->first();
                $tenant = $activeLease ? $activeLease->tenant : null;

                return [
                    'property_id' => $room->property_id,
                    'room_id' => $room->room_id,
                    'room_number' => $room->room_number,
                    'property_name' => $room->property->property_name ?? 'Unknown', // Useful for "All Rooms" view
                    'monthly_rent' => (float) $room->monthly_rent,
                    'room_status' => $room->room_status,
                    'tenant' => $tenant ? [
                        'first_name' => $tenant->first_name,
                        'last_name' => $tenant->last_name,
                        'due_date' => $activeLease->next_due_date ?? now()->format('Y-m-d'),
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
            $propertyId = $request->property_id;
            $statusFilter = $request->input('status'); // e.g., 'Occupied', 'Available', or null/'All'

            // 1. Validation
            if (!$user->landlord) {
                return response()->json(['success' => false, 'message' => 'Invalid role detected!'], 403);
            }

            $property = $user->landlord->properties()->where('property_id', $propertyId)->first();

            if (!$property) {
                return response()->json(['success' => false, 'message' => "Property not found!"], 404);
            }
            

            // 2. Get Status Counts (For the Tabs/Badges)
            // 
            // This runs a fast query to count rooms by status: { "Occupied": 5, "Available": 3 }
            $rawCounts = $property->rooms()
                ->select('room_status', DB::raw('count(*) as count'))
                ->groupBy('room_status')
                ->pluck('count', 'room_status')
                ->toArray();

            // Calculate 'All' manually
            $summary = [
                'All' => array_sum($rawCounts),
                ...$rawCounts
            ];

            // 3. Fetch Rooms with Filtering & Relationships
            $per_page = $request->input('per_page', 10);
            
            $rooms = $property->rooms()
                // Apply Filter IF status is provided and NOT 'All'
                ->when($statusFilter && $statusFilter !== 'All', function ($q) use ($statusFilter) {
                    $q->where('room_status', $statusFilter);
                })
                ->with(['leases' => function ($query) {
                    $query->where('lease_status', 'Active')
                        ->where('is_active', true)
                        ->with('tenant');
                }])
                ->orderBy('room_number')
                ->paginate($per_page);

            // 4. Transform Data
            $rooms->through(function ($room) {
                $activeLease = $room->leases->first();
                $tenant = $activeLease ? $activeLease->tenant : null;

                return [
                    'room_id' => $room->room_id,
                    'room_number' => $room->room_number,
                    'monthly_rent' => (float) $room->monthly_rent,
                    'room_status' => $room->room_status,
                    'tenant' => $tenant ? [
                        'first_name' => $tenant->first_name,
                        'last_name' => $tenant->last_name,
                        'due_date' => $activeLease->next_due_date ?? now()->format('Y-m-d'),
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Successfully fetched rooms',
                'data' => [
                    // 'property' => $property->only(['property_id', 'property_name', 'address', 'city']),
                    'property' => $property,
                    'summary' => $summary, // Send the counts here
                    'rooms' => $rooms,
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


}
