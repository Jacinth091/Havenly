<?php

namespace App\Http\Controllers;

use App\Models\Lease;
use App\Models\Room;
use App\Models\Landlord;
use App\Models\Tenant;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class LeaseController extends Controller
{
    // Lease agreement creation and tracking
    public function store(Request $request)
    {
        // Validate inputs
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,room_id',
            'tenant_id' => 'required|exists:tenants,tenant_id',
            'start_date' => 'required|date|after_or_equal:today', // 
            'end_date' => 'required|date|after:start_date',       // 
            'monthly_rent' => 'required|numeric|min:1',
            'payment_due_day' => 'required|integer|min:1|max:31',
        ]);

        $user = Auth::user();
        $landlord = Landlord::where('user_id', $user->user_id)->first();

        // 1. Verify Property Ownership
        // Ensure the room belongs to a property owned by this landlord
        $room = Room::where('room_id', $validated['room_id'])
                    ->whereHas('property', function($q) use ($landlord) {
                        $q->where('landlord_id', $landlord->landlord_id);
                    })->firstOrFail();

        // 2. Business Rule: Room Availability 
        if ($room->room_status !== 'Available') {
            return response()->json(['error' => 'Room is not available for lease.'], 409);
        }

        // 3. Business Rule: Single Active Lease per Tenant 
        $activeTenantLease = Lease::where('tenant_id', $validated['tenant_id'])
                                  ->where('lease_status', 'Active')
                                  ->exists();
        if ($activeTenantLease) {
            return response()->json(['error' => 'Tenant already has an active lease.'], 409);
        }

        DB::beginTransaction();
        try {
            // Rent Locking: Store rent in lease separate from room's current rent
            $lease = Lease::create([
                'room_id' => $validated['room_id'],
                'tenant_id' => $validated['tenant_id'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'monthly_rent' => $validated['monthly_rent'], // Historical record
                'payment_due_day' => $validated['payment_due_day'],
                'lease_status' => 'Active',
                'is_active' => true
            ]);

            // Update Room Status to Occupied
            $room->update(['room_status' => 'Occupied']);

            DB::commit();
            return response()->json(['message' => 'Lease created successfully', 'data' => $lease], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create lease'], 500);
        }
    }

    public function terminate(Request $request, string $id)
    {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['success' => false, 'message' => "Unauthorized"], 401);
            $validator = Validator::make($request->all(), [
                'reason' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Validation Error', 
                    'errors' => $validator->errors()
                ], 422);
            }
            $result = DB::transaction(function () use ($request, $user, $id) {
                $lease = Lease::with('room.property')->findOrFail($id);
                $landlord = Landlord::where('user_id', $user->user_id)->first();

                if (!$landlord || $lease->room->property->landlord_id !== $landlord->landlord_id) {
                    throw new \Exception("Unauthorized: You do not own the property associated with this lease.");
                }
                if (!$lease->terminate($request->input('reason'))) {
                    throw new \Exception("Lease could not be terminated. It may already be terminated or archived.");
                }

                return $lease->fresh();
            });

            return response()->json([
                'success' => true, 
                'message' => 'Lease terminated successfully.', 
                'data' => $result
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Lease not found.'], 404);
        } catch (\Exception $e) {
            $statusCode = str_contains($e->getMessage(), 'Unauthorized') ? 403 : 500;
            return response()->json(['success' => false, 'message' => $e->getMessage()], $statusCode);
        }
    }

    public function archive(string $id)
    {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['success' => false, 'message' => "Unauthorized"], 401);
            $result = DB::transaction(function () use ($user, $id) {
                $lease = Lease::with('room.property')->findOrFail($id);
                $landlord = Landlord::where('user_id', $user->user_id)->first();

                if (!$landlord || $lease->room->property->landlord_id !== $landlord->landlord_id) {
                    throw new \Exception("Unauthorized: You do not own the property associated with this lease.");
                }
                if (!$lease->archive()) {
                    throw new \Exception("Lease could not be archived.");
                }

                return $lease->fresh();
            });

            return response()->json([
                'success' => true, 
                'message' => 'Lease archived successfully.', 
                'data' => $result
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Lease not found.'], 404);
        } catch (\Exception $e) {
            $statusCode = str_contains($e->getMessage(), 'Unauthorized') ? 403 : 500;
            return response()->json(['success' => false, 'message' => $e->getMessage()], $statusCode);
        }
    }

    public function getLandlordLeases(Request $request)
    {
        try {
            $user = Auth::user();
            
            // 1. Role Check
            if (!$user->landlord) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }
            $landlordId = $user->landlord->landlord_id;

            // 2. Base Query
            $query = Lease::with(['tenant', 'room.property'])
                ->whereHas('room.property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                });

            // 3. Calculate Summary (Before filtering)
            // Using clone to get stats for ALL leases regardless of current search/filter
            $allLeasesQuery = clone $query; 
            // Optimization: Don't get() all records if you have thousands. 
            // But for now, keeping your logic for consistent counts:
            $allLeases = $allLeasesQuery->get(); 
            
            $summary = [
                'All'      => $allLeases->count(),
                'Active'   => $allLeases->where('lease_status', 'Active')->count(),
                'Expiring' => $allLeases->filter(function($l) {
                    return $l->lease_status === 'Active' && 
                        // Check if end date is within the next 7 days
                        $l->end_date <= Carbon::today()->addDays(7) && 
                        // Check if end date hasn't passed yet (is today or future)
                        $l->end_date >= Carbon::today(); 
                })->count(),
                'History'  => $allLeases->whereIn('lease_status', ['Expired', 'Terminated', 'Archived'])->count(),
            ];

            // 4. Apply Search
            $search = $request->input('search');
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->whereHas('tenant', function($t) use ($search) {
                        $t->where('first_name', 'LIKE', "%{$search}%")
                          ->orWhere('last_name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('room', function($r) use ($search) {
                        $r->where('room_number', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('room.property', function($p) use ($search) {
                        $p->where('property_name', 'LIKE', "%{$search}%");
                    });
                });
            }

            // 5. Apply Status Filter
            $status = $request->input('status', 'All');
            
            if ($status === 'Active') {
                $query->where('lease_status', 'Active');
            } elseif ($status === 'Expiring') {
                $query->where('lease_status', 'Active')
                      // Changed 30 to 7 to match the new "1 week" logic
                      ->whereBetween('end_date', [now(), now()->addDays(7)]); 
            } elseif ($status === 'History') {
                $query->whereIn('lease_status', ['Expired', 'Terminated', 'Archived']);
            }

            // 6. Paginate
            $paginatedLeases = $query->orderBy('created_at', 'desc')
                                     ->paginate($request->input('limit', 6));

            // 7. Transform Data (FLATTENING THE STRUCTURE HERE)
            // This converts the complex nested objects into simple strings for the table
            $paginatedLeases->through(function ($lease) {
                return [
                    'id'              => $lease->lease_id,
                    'status'          => $lease->lease_status,
                    'tenant'          => $lease->tenant 
                                         ? $lease->tenant->first_name . ' ' . $lease->tenant->last_name 
                                         : 'Unknown',
                    'email'         => $lease->tenant && $lease->tenant->user 
                                                    ? $lease->tenant->user->email 
                                                    : null,
                    'contact_num'   => $lease->tenant ? $lease->tenant->contact_num : null,
                    'property'        => $lease->room && $lease->room->property 
                                         ? $lease->room->property->property_name 
                                         : 'Unknown Property',
                    'unit'            => $lease->room 
                                         ? $lease->room->room_number 
                                         : 'N/A',
                    'monthly_rent'    => $lease->monthly_rent,
                    'start_date'      => $lease->start_date ? $lease->start_date->format('Y-m-d') : null,
                    'end_date'        => $lease->end_date ? $lease->end_date->format('Y-m-d') : null,
                    'payment_due_day' => $lease->payment_due_day,
                    
                    // Optional: Include raw IDs if needed for actions like terminate/archive
                    'tenant_id'       => $lease->tenant_id,
                    'room_id'         => $lease->room_id,
                ];
            });

            // 8. Return Response (SEPARATED KEYS)
            return response()->json([
                'success'    => true,
                'message'    => 'Leases fetched successfully!',
                'leases'     => $paginatedLeases->items(), 
                'summary'    => $summary,
                'pagination' => [
                    'current_page' => $paginatedLeases->currentPage(),
                    'last_page'    => $paginatedLeases->lastPage(),
                    'total_items'  => $paginatedLeases->total(),
                    'limit'        => $paginatedLeases->perPage(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to fetch leases', 'error' => $e->getMessage()], 500);
        }
    }

    public function createLeaseAndAssignTenantToProperty(Request $request)
    {
        try {
            // 1. AUTHENTICATION
            $user = Auth::user();
            if (!$user) return response()->json(['success' => false, 'message' => "Unauthorized"], 401);

            // 2. VALIDATION
            $validator = Validator::make($request->all(), [
                'property_id' => 'required|integer|exists:properties,property_id',
                'room_id' => 'required|integer|exists:rooms,room_id',
                'tenant_id' => 'required|integer|exists:tenants,tenant_id',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'monthly_rent' => 'required|numeric|min:0',
                'security_deposit' => 'nullable|numeric|min:0',
                'payment_due_day' => 'required|integer|between:1,31',
                'transaction.amount' => 'required|numeric|min:0',
                'transaction.payment_method' => 'required|string',
                'transaction.reference_number' => 'nullable|string', // Allow null, handled in logic
                'transaction.payment_for_month' => 'required|date',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Validation Error', 'errors' => $validator->errors()], 422);
            }

            // 3. DATABASE TRANSACTION
            $result = DB::transaction(function () use ($request, $user) {
                
                // A. VERIFY OWNERSHIP & PROPERTY MATCH
                $room = Room::with('property')->findOrFail($request->room_id);

                if ($room->property_id != $request->property_id) {
                    throw new \Exception("Data Mismatch: Room does not belong to selected property.");
                }
                
                if ($room->room_status !== 'Available') {
                    throw new \Exception("This unit is no longer available.");
                }

                $landlord = Landlord::where('user_id', $user->user_id)->first();
                if (!$landlord || $room->property->landlord_id !== $landlord->landlord_id) {
                    throw new \Exception("Unauthorized: You do not own this property.");
                }

                // B. CREATE LEASE
                $lease = Lease::create([
                    'room_id' => $request->room_id,
                    'tenant_id' => $request->tenant_id,
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'monthly_rent' => $request->monthly_rent,
                    'security_deposit' => $request->security_deposit ?? 0,
                    'payment_due_day' => $request->payment_due_day,
                    'notes' => $request->notes,
                    'lease_status' => 'Active',
                    'is_active' => true
                ]);

                // C. LOGIC: HANDLE REFERENCE NUMBER GENERATION
                $inputRef = $request->input('transaction.reference_number');
                $paymentMethod = $request->input('transaction.payment_method');
                $finalRefNumber = $inputRef;

                // LOGIC: If the frontend sent "SYSTEM_GENERATED" (which usually means Cash),
                // OR if the payment method is explicitly Cash, we auto-generate.
                if ($inputRef === 'SYSTEM_GENERATED' || $paymentMethod === 'Cash') {
                    // Format: PAY-{Year}{Month}{Day}-{RandomString}
                    // Example: PAY-20231209-X8K29A
                    $finalRefNumber = 'PAY-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
                }
                
                // If it was NOT system generated (e.g. GCash Ref "123456789"), 
                // $finalRefNumber stays as "123456789".

                // D. CREATE TRANSACTION
                $transaction = Transaction::create([
                    'lease_id' => $lease->lease_id,
                    'amount' => $request->input('transaction.amount'),
                    'payment_method' => $paymentMethod,
                    'reference_number' => $finalRefNumber, // <--- Used the processed variable
                    'payment_for_month' => $request->input('transaction.payment_for_month'),
                    'transaction_date' => now(),
                    'transaction_status' => 'Completed',
                    'is_active' => true
                ]);

                // E. UPDATE ROOM STATUS
                $room->update(['room_status' => 'Occupied']);

                return ['lease' => $lease, 'transaction' => $transaction];
            });

            return response()->json(['success' => true, 'message' => 'Lease created successfully.', 'data' => $result], 201);

        } catch (\Exception $e) {
             $statusCode = (str_contains($e->getMessage(), 'Unauthorized') || str_contains($e->getMessage(), 'Mismatch')) ? 403 : 500;
             return response()->json(['success' => false, 'message' => $e->getMessage()], $statusCode);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => 'Server Error', 'error' => $th->getMessage()], 500);
        }
    }

    public function getLeaseList(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if (!$user->landlord) {
            return response()->json([
                'message' => 'Landlord profile not found for this user.'
            ], 404);
        }

        try {
            $landlord = $user->landlord;
            
            // Parameters
            $statusTab = $request->input('status', 'All'); 
            $search = $request->input('search');
            $limit = $request->input('limit', 6);

            // 1. Base Query (Scoped to Landlord)
            // We use this to calculate counts for the tabs
            $baseQuery = Lease::with(['tenant', 'room.property'])
                ->whereHas('room.property', function ($q) use ($landlord) {
                    $q->where('landlord_id', $landlord->landlord_id);
                });

            // 2. Calculate Summary Counts (for the tabs)
            // We fetch all records once to count them categorized
            $allLeasesForCounts = (clone $baseQuery)->get();
            
            $summary = [
                'All' => $allLeasesForCounts->count(),
                'Active' => $allLeasesForCounts->where('lease_status', 'Active')->count(),
                'Expiring' => $allLeasesForCounts->filter(function($l) {
                    return $l->lease_status === 'Active' && 
                           $l->end_date <= Carbon::now()->addDays(30) && 
                           $l->end_date >= Carbon::now();
                })->count(),
                'History' => $allLeasesForCounts->whereIn('lease_status', ['Expired', 'Terminated', 'Archived'])->count(),
            ];

            // 3. Apply Filters to the Main Query
            
            // Search Filter (Tenant Name, Property Name, Room Number)
            if ($search) {
                $baseQuery->where(function ($q) use ($search) {
                    $q->whereHas('tenant', function ($t) use ($search) {
                        $t->where(DB::raw("CONCAT(first_name, ' ', last_name)"), 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('room.property', function ($p) use ($search) {
                        $p->where('property_name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('room', function ($r) use ($search) {
                        $r->where('room_number', 'LIKE', "%{$search}%");
                    });
                });
            }

            // Status Tab Filter
            switch ($statusTab) {
                case 'Active':
                    $baseQuery->where('lease_status', 'Active');
                    break;
                case 'Expiring':
                    $baseQuery->where('lease_status', 'Active')
                              ->whereBetween('end_date', [Carbon::now(), Carbon::now()->addDays(30)]);
                    break;
                case 'History':
                    $baseQuery->whereIn('lease_status', ['Expired', 'Terminated', 'Archived']);
                    break;
                // 'All' falls through (no filter)
            }

            // 4. Pagination & Formatting
            $leases = $baseQuery->orderBy('created_at', 'desc')->paginate($limit);

            $formattedData = $leases->map(function ($lease) {
                return [
                    'id' => $lease->lease_id,
                    'tenant' => $lease->tenant ? $lease->tenant->first_name . ' ' . $lease->tenant->last_name : 'Unknown',
                    'property' => $lease->room->property->property_name ?? 'N/A',
                    'room' => $lease->room->room_number ?? 'N/A',
                    'start' => Carbon::parse($lease->start_date)->format('Y-m-d'),
                    'end' => Carbon::parse($lease->end_date)->format('Y-m-d'),
                    'payment_due_day' => $lease->payment_due_day,
                    'status' => $lease->lease_status,
                    'rent' => (float) $lease->monthly_rent,
                    'deposit' => (float) $lease->security_deposit,
                ];
            });

            return response()->json([
                'success' => true,
                'leases' => $formattedData,
                'summary' => $summary,
                'pagination' => [
                    'current_page' => $leases->currentPage(),
                    'last_page' => $leases->lastPage(),
                    'total_items' => $leases->total(),
                    'limit' => $leases->perPage(),
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error("Lease Fetch Error: " . $e->getMessage());

            return response()->json([
                'message' => 'An unexpected error occurred while fetching leases.',
                'error_code' => 'SERVER_ERROR'
            ], 500);
        }
    }

    private function formatLeaseResponse($paginatedLeases, $summaryStats)
    {
        // Transform the data to be "flat" for the frontend
        $formattedLeases = $paginatedLeases->through(function ($lease) {
            return [
                'id'              => $lease->lease_id,
                
                // Flatten Tenant: Combine names into one string
                'tenant'          => $lease->tenant 
                                     ? $lease->tenant->first_name . ' ' . $lease->tenant->last_name 
                                     : 'Unknown',
                
                // Flatten Property: Just get the name
                'property'        => $lease->room && $lease->room->property 
                                     ? $lease->room->property->property_name 
                                     : 'Unknown Property',
                
                // Flatten Unit: Just get the room number
                'unit'            => $lease->room 
                                     ? $lease->room->room_number 
                                     : 'N/A',
                
                'status'          => $lease->status,
                'start_date'      => $lease->start_date, // Already Y-m-d from DB usually
                'end_date'        => $lease->end_date,
                'monthly_rent'    => (float) $lease->monthly_rent,
                'payment_due_day' => $lease->payment_due_day,
                
                // Keep original IDs hidden if you need them for actions (like terminate/renew)
                // or just use 'id' above if that suffices.
                'room_id'         => $lease->room_id, 
                'tenant_id'       => $lease->tenant_id,
            ];
        });

        return response()->json([
            'success' => true,
            'leases'  => $formattedLeases, // The flat list
            'summary' => $summaryStats,    // The count logic
            'pagination' => [
                'current_page' => $paginatedLeases->currentPage(),
                'last_page'    => $paginatedLeases->lastPage(),
                'total_items'  => $paginatedLeases->total(),
                'limit'        => $paginatedLeases->perPage(),
            ]
        ], 200);
    }

}