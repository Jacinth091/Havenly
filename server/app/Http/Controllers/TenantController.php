<?php

namespace App\Http\Controllers;

use App\Models\Lease;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TenantController extends Controller
{
    public function getTenantsInProperty(Request $request) {
        try {
            $user = Auth::user();
            
            // 1. Authorization
            if(!$user) {
                return response()->json(['success' => false, 'message' => "Bad Request, User not authenticated!"], 401);
            }

            // Optional: If you want to rely on the Landlord relationship like the other function
            // if (!$user->landlord && $user->role !== 'admin') { ... }

            // 2. Validation
            $validator = Validator::make($request->all(), [
                'property_id' => 'required|integer|exists:properties,property_id',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => "Validation Error", 'error' => $validator->errors()], 422);
            }

            $propertyId = $request->property_id;
            $perPage = $request->input("limit", 10);
            $search = $request->input('search');
            $statusTab = $request->input('statusTab', "All");

            // 3. Define Base Scope: Tenants who have EVER had a lease in THIS property
            $query = \App\Models\Tenant::whereHas('leases.room', function ($q) use ($propertyId) {
                $q->where('property_id', $propertyId);
            });

            // 4. Calculate Summary Counts (Dynamic & Accurate)
            // We count Tenants, not Leases, to match the table list
            $baseForCounts = clone $query;

            $countByStatus = function($status) use ($baseForCounts, $propertyId) {
                return (clone $baseForCounts)->whereHas('leases', function ($q) use ($propertyId, $status) {
                    $q->where('lease_status', $status)
                      ->whereHas('room', fn($r) => $r->where('property_id', $propertyId));
                })->count();
            };

            $summary = [
                'All'        => (clone $query)->count(),
                'Active'     => $countByStatus('Active'),
                'Expired'    => $countByStatus('Expired'),
                'Terminated' => $countByStatus('Terminated'),
                'Archived'   => $countByStatus('Archived'), // or 'Archived' depending on your Enum
            ];

            // 5. Apply Status Filter
            if ($statusTab !== 'All') {
                $query->whereHas('leases', function ($q) use ($propertyId, $statusTab) {
                    $q->where('lease_status', $statusTab)
                      ->whereHas('room', fn($r) => $r->where('property_id', $propertyId));
                });
            }

            // 6. Apply Search Filter
            $query->when($search, function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('first_name', 'like', "%{$search}%")
                          ->orWhere('last_name', 'like', "%{$search}%")
                          ->orWhereHas('user', fn($u) => $u->where('email', 'like', "%{$search}%"))
                          ->orWhereHas('leases.room', function ($r) use ($search) {
                              $r->where('room_number', 'like', "%{$search}%");
                          });
                });
            });

            // 7. Fetch Data
            // We eagerly load leases ONLY for this property to avoid displaying data from other properties
            $tenants = $query->with(['user', 'leases' => function ($q) use ($propertyId) {
                $q->whereHas('room', fn($r) => $r->where('property_id', $propertyId))
                  ->with('room')
                  ->orderBy('start_date', 'desc');
            }])
            ->paginate($perPage);

            // 8. Transform Data
            $tenants->through(function ($tenant) use ($statusTab) {
                // Determine which lease to display
                // If a specific tab is selected (e.g., Expired), find that specific lease.
                // Otherwise, prioritize Active, then fallback to latest.
                $displayLease = null;

                if ($statusTab !== 'All') {
                    $displayLease = $tenant->leases->first(fn($l) => $l->lease_status === $statusTab);
                } else {
                    $displayLease = $tenant->leases->first(fn($l) => $l->lease_status === 'Active') 
                                    ?? $tenant->leases->first();
                }

                return [
                    'tenant_id'   => $tenant->tenant_id,
                    'full_name'   => $tenant->first_name . ' ' . $tenant->last_name,
                    'email'       => $tenant->user->email ?? 'N/A',
                    'contact_num' => $tenant->contact_num,
                    'room_number' => $displayLease?->room?->room_number ?? 'N/A',
                    'lease_start' => $displayLease?->start_date,
                    'lease_end'   => $displayLease?->end_date,
                    'status'      => $displayLease?->lease_status ?? 'History',
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Property tenants fetched successfully',
                'data' => [
                    'summary' => $summary,
                    'tenants' => $tenants
                ]
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'success' => false, 
                'message' => 'Server Error', 
                'error' => $th->getMessage()
            ], 500);
        }
    }

    public function getTenantsWithLease(Request $request) {      
        try {
            $user = Auth::user();
            if (!$user->landlord) {
                return response()->json(['success' => false, 'message' => 'Invalid role detected!'], 403);
            }
            $landlordId = $user->landlord->landlord_id;

            $per_page = $request->input('limit', 10);
            $search = $request->input('search');
            $statusFilter = $request->input('statusTab', 'All'); 

            $query = \App\Models\Tenant::whereHas('leases.room.property', function ($q) use ($landlordId) {
                $q->where('landlord_id', $landlordId);
            });

            $baseForCounts = clone $query;
            
            $countByStatus = function($status) use ($baseForCounts, $landlordId) {
                return (clone $baseForCounts)->whereHas('leases', function ($q) use ($landlordId, $status) {
                    $q->where('lease_status', $status)
                      ->whereHas('room.property', fn($p) => $p->where('landlord_id', $landlordId));
                })->count();
            };

            $allCount = (clone $query)->count();
            $activeCount = $countByStatus('Active');
            
            $historyCount = (clone $query)->whereDoesntHave('leases', function ($q) use ($landlordId) {
                $q->where('lease_status', 'Active')
                  ->whereHas('room.property', fn($p) => $p->where('landlord_id', $landlordId));
            })->count();

            $summary = [
                'All'        => $allCount,
                'Active'     => $activeCount,
                'History'    => $historyCount,
                'Expired'    => $countByStatus('Expired'),
                'Terminated' => $countByStatus('Terminated'),
                'Archive'    => $countByStatus('Archive'),
            ];

            if ($statusFilter === 'History') {
                $query->whereDoesntHave('leases', function ($q) use ($landlordId) {
                    $q->where('lease_status', 'Active')
                      ->whereHas('room.property', fn($p) => $p->where('landlord_id', $landlordId));
                });
            } 
            elseif ($statusFilter !== 'All') {
                $query->whereHas('leases', function ($q) use ($landlordId, $statusFilter) {
                    $q->where('lease_status', $statusFilter)
                      ->whereHas('room.property', fn($p) => $p->where('landlord_id', $landlordId));
                });
            }

            $query->when($search, function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('first_name', 'like', "%{$search}%")
                          ->orWhere('last_name', 'like', "%{$search}%")
                          ->orWhereHas('user', fn($u) => $u->where('email', 'like', "%{$search}%"))
                          ->orWhereHas('leases', function ($l) use ($search) {
                              $l->whereHas('room', function ($r) use ($search) {
                                  $r->where('room_number', 'like', "%{$search}%")
                                    ->orWhereHas('property', fn($p) => $p->where('property_name', 'like', "%{$search}%"));
                              });
                          });
                });
            });
            $tenants = $query->with(['user', 'leases' => function ($q) use ($landlordId) {
                    $q->whereHas('room.property', fn($p) => $p->where('landlord_id', $landlordId))
                      ->with('room.property')
                      ->orderBy('created_at', 'desc');
                }])
                ->paginate($per_page);
            $tenants->through(function ($tenant) {
                $latestLease = $tenant->leases->first(fn($l) => $l->lease_status === 'Active') 
                               ?? $tenant->leases->first();

                return [
                    'tenant_id'        => $tenant->tenant_id,
                    'full_name'        => $tenant->first_name . ' ' . $tenant->last_name,
                    'email'            => $tenant->user->email ?? 'N/A',
                    'contact_num'      => $tenant->contact_num,
                    'current_property' => $latestLease?->room?->property?->property_name ?? 'N/A',
                    'current_room'     => $latestLease?->room?->room_number ?? 'N/A',
                    'status'           => $latestLease?->lease_status ?? 'History',
                    'joined_at'        => $tenant->created_at->format('Y-m-d'),
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Tenants fetched successfully',
                'data' => [
                    'summary' => $summary,
                    'tenants' => $tenants
                ]
            ], 200);

        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => 'Server Error', 'error' => $th->getMessage()], 500);
        }
    }

    public function getAvailableTenants(Request $request)
    {
        try {
            $user = Auth::user();
            
            // 1. Authorization
            $allowedRoles = ['landlord', 'admin'];
            if (!in_array(strtolower($user->role), $allowedRoles)) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $search = $request->input('search');
            $statusFilter = $request->input('status', 'Available'); // Default to 'Available'

            // 2. Base Query: All Active Accounts
            $query = \App\Models\Tenant::where('is_active', true);

            // 3. Calculate Summary Counts (For Tabs in Modal)
            $totalCount = (clone $query)->count();
            $availableCount = (clone $query)->whereDoesntHave('leases', function ($q) {
                $q->where('lease_status', 'Active');
            })->count();

            $summary = [
                'All' => $totalCount,
                'Available' => $availableCount,
                'Renting' => $totalCount - $availableCount
            ];

            // 4. Apply Status Filter
            if ($statusFilter === 'Available') {
                // Filter out anyone who has an Active lease
                $query->whereDoesntHave('leases', function ($q) {
                    $q->where('lease_status', 'Active');
                });
            } elseif ($statusFilter === 'Renting') {
                // Show only those currently renting
                $query->whereHas('leases', function ($q) {
                    $q->where('lease_status', 'Active');
                });
            }

            // 5. Apply Search (Name or Email)
            $query->when($search, function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('first_name', 'like', "%{$search}%")
                          ->orWhere('last_name', 'like', "%{$search}%")
                          ->orWhereHas('user', function ($u) use ($search) {
                              $u->where('email', 'like', "%{$search}%");
                          });
                });
            });

            // 6. Fetch Data
            $tenants = $query->with('user')
                ->orderBy('first_name')
                ->limit(20) // Limit results for dropdown performance
                ->get();

            // 7. Transform
            $formatted = $tenants->map(function ($t) {
                return [
                    'id' => $t->tenant_id,
                    'name' => $t->first_name . ' ' . $t->last_name,
                    'email' => $t->user->email ?? 'N/A',
                    'contact_num' => $t->contact_num,
                    // If we found them in 'Available' filter, they are Available. 
                    // Otherwise, we can check their leases count if needed.
                    'status' => 'Active Account' 
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'tenants' => $formatted
                ]
            ]);

        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => 'Server Error', 'error' => $th->getMessage()], 500);
        }
    }

}
