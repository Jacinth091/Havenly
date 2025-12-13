<?php

namespace App\Http\Controllers;

use App\Models\Lease;
use App\Models\Tenant;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TenantController extends Controller
{
    public function getTenantsInProperty(Request $request) {
        try {
            $user = Auth::user();
            if(!$user) {
                return response()->json(['success' => false, 'message' => "Bad Request, User not authenticated!"], 401);
            }
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
            
            // Optimize: Don't load transactions - calculate balance separately if needed
            $tenants = $query->with([
                'user', 
                'leases' => function ($q) use ($landlordId) {
                    $q->whereHas('room.property', fn($p) => $p->where('landlord_id', $landlordId))
                    ->with(['room.property']) // Removed transactions to improve performance
                    ->orderBy('created_at', 'desc')
                    ->limit(5); // Limit leases per tenant
                }
            ])->paginate($per_page);
            
            // Pre-calculate balances for active leases only (much faster)
            $activeLeaseIds = [];
            foreach ($tenants->items() as $tenant) {
                $activeLease = $tenant->leases->first(fn($l) => $l->lease_status === 'Active');
                if ($activeLease) {
                    $activeLeaseIds[] = $activeLease->lease_id;
                }
            }
            $activeLeaseIds = array_unique($activeLeaseIds);
            
            $balances = [];
            if (!empty($activeLeaseIds)) {
                $payments = \App\Models\Transaction::whereIn('lease_id', $activeLeaseIds)
                    ->where('transaction_status', 'Completed')
                    ->selectRaw('lease_id, SUM(amount) as total_paid')
                    ->groupBy('lease_id')
                    ->pluck('total_paid', 'lease_id')
                    ->toArray();
                
                $leaseRents = \App\Models\Lease::whereIn('lease_id', $activeLeaseIds)
                    ->pluck('monthly_rent', 'lease_id')
                    ->toArray();
                
                foreach ($activeLeaseIds as $leaseId) {
                    $totalPaid = (float) ($payments[$leaseId] ?? 0);
                    $monthlyRent = (float) ($leaseRents[$leaseId] ?? 0);
                    $balances[$leaseId] = max(0, $monthlyRent - $totalPaid);
                }
            }
                
            $tenants->through(function ($tenant) use ($balances) {
                $latestLease = $tenant->leases->first(fn($l) => $l->lease_status === 'Active') 
                            ?? $tenant->leases->first();

                // Use pre-calculated balance
                $outstandingBalance = 0;
                if ($latestLease && $latestLease->lease_status === 'Active' && isset($balances[$latestLease->lease_id])) {
                    $outstandingBalance = $balances[$latestLease->lease_id];
                }
                
                // Format balance with currency symbol
                $formattedBalance = $outstandingBalance > 0 
                    ? '₱' . number_format($outstandingBalance, 2)
                    : '₱0.00';
                    
                // Simple payment status
                $paymentStatus = $outstandingBalance > 0 ? 'Overdue' : 'Current';

                return [
                    'tenant_id'        => $tenant->tenant_id,
                    'full_name'        => $tenant->first_name . ' ' . $tenant->last_name,
                    'email'            => $tenant->user->email ?? 'N/A',
                    'contact_num'      => $tenant->contact_num,
                    'current_property' => $latestLease?->room?->property?->property_name ?? 'N/A',
                    'current_room'     => $latestLease?->room?->room_number ?? 'N/A',
                    'status'           => $latestLease?->lease_status ?? 'History',
                    'lease_start_date' => $latestLease?->start_date ? $latestLease->start_date->format('Y-m-d') : null,
                    'lease_end_date'   => $latestLease?->end_date ? $latestLease->end_date->format('Y-m-d') : null,
                    'balance'          => $outstandingBalance, // Raw numeric value for calculations
                    'formatted_balance' => $formattedBalance,  // Formatted for display
                    'payment_status'   => $paymentStatus,
                    'joined_at'        => $tenant->created_at->format('Y-m-d'),
                    // Additional useful fields
                    'days_overdue'     => $tenant->days_overdue ?? 0,
                    'next_payment_due' => $tenant->next_payment_due ? $tenant->next_payment_due->format('Y-m-d') : null,
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

    /**
     * Get the current authenticated tenant's dashboard data.
     * Returns lease info, landlord details, and payment history.
     */
    public function getTenantDashboard(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated.'
                ], 401);
            }

            // Get the tenant record associated with this user
            $tenant = Tenant::where('user_id', $user->user_id)
                ->with([
                    'user',
                    'currentLease' => function ($q) {
                        $q->with([
                            'room.property.landlord.user',
                            'transactions' => function ($tq) {
                                $tq->where('transaction_status', 'Completed')
                                   ->orderBy('transaction_date', 'desc')
                                   ->limit(10);
                            }
                        ]);
                    }
                ])
                ->first();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tenant profile not found.'
                ], 404);
            }

            $currentLease = $tenant->currentLease;

            // Build lease info
            $leaseInfo = null;
            if ($currentLease) {
                $room = $currentLease->room;
                $property = $room?->property;
                $landlord = $property?->landlord;

                // Build landlord info without triggering accessors
                $landlordName = 'N/A';
                $landlordContact = 'N/A';
                if ($landlord) {
                    $landlordName = trim(($landlord->first_name ?? '') . ' ' . ($landlord->last_name ?? ''));
                    $landlordContact = $landlord->contact_num ?? 'N/A';
                }
                
                $leaseInfo = [
                    'lease_id' => $currentLease->lease_id,
                    'property' => $property?->property_name ?? 'N/A',
                    'unit' => $room?->room_number ?? 'N/A',
                    'address' => ($property?->address ?? '') . ', ' . ($property?->city ?? ''),
                    'landlord' => $landlordName,
                    'landlord_contact' => $landlordContact,
                    'landlord_email' => $landlord?->user?->email ?? 'N/A',
                    'rent' => (float) $currentLease->monthly_rent,
                    'due_day' => $currentLease->payment_due_day ?? 5,
                    'start_date' => $currentLease->start_date->format('M d, Y'),
                    'end_date' => $currentLease->end_date->format('M d, Y'),
                    'status' => $currentLease->lease_status,
                    'remaining_days' => max(0, \Carbon\Carbon::now()->diffInDays($currentLease->end_date, false)),
                    'payment_status' => $this->calculatePaymentStatus($currentLease),
                    'balance' => $this->calculateLeaseBalance($currentLease),
                ];
            }

            // Build payment history
            $paymentHistory = [];
            if ($currentLease && $currentLease->transactions) {
                // Build tenant name once to avoid accessor
                $tenantFullName = trim(($tenant->first_name ?? '') . ' ' . ($tenant->last_name ?? ''));
                
                $paymentHistory = $currentLease->transactions->map(function ($transaction) use ($tenantFullName, $currentLease) {
                    return [
                        'id' => $transaction->transaction_id,
                        'tenant' => $tenantFullName,
                        'property' => $currentLease->room?->property?->property_name ?? 'N/A',
                        'unit' => $currentLease->room?->room_number ?? 'N/A',
                        'date' => $transaction->transaction_date->format('M d, Y'),
                        'amount' => (float) $transaction->amount,
                        'method' => $transaction->payment_method,
                        'ref' => $transaction->reference_number ?? '-',
                        'status' => $transaction->transaction_status,
                    ];
                })->toArray();
            }

            // Build tenant info - use direct attributes to avoid slow accessors
            $tenantInfo = [
                'tenant_id' => $tenant->tenant_id,
                'full_name' => trim(($tenant->first_name ?? '') . ' ' . ($tenant->last_name ?? '')),
                'first_name' => $tenant->first_name,
                'last_name' => $tenant->last_name,
                'email' => $user->email,
                'contact_num' => $tenant->contact_num ?? 'N/A',
                'status' => $tenant->is_active ? 'Active' : 'Inactive',
            ];

            return response()->json([
                'success' => true,
                'message' => 'Dashboard data fetched successfully.',
                'data' => [
                    'tenant' => $tenantInfo,
                    'lease' => $leaseInfo,
                    'payment_history' => $paymentHistory,
                ]
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Server Error',
                'error' => config('app.debug') ? $th->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get the current authenticated tenant's payments with pagination and filters.
     */
    public function getTenantPayments(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated.'
                ], 401);
            }

            $tenant = $user->tenant ?? Tenant::where('user_id', $user->user_id)->first();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tenant profile not found.'
                ], 404);
            }

            // Get query parameters
            $perPage = $request->input('limit', 10);
            $search = $request->input('search', '');
            $statusFilter = $request->input('status', 'All');

            // Get all leases for this tenant
            $leaseIds = Lease::where('tenant_id', $tenant->tenant_id)->pluck('lease_id');

            // Base query for transactions
            $query = \App\Models\Transaction::whereIn('lease_id', $leaseIds)
                ->with(['lease.room.property.landlord']);

            // Calculate summary counts
            $allCount = (clone $query)->count();
            $completedCount = (clone $query)->where('transaction_status', 'Completed')->count();
            $pendingCount = (clone $query)->where('transaction_status', 'Pending')->count();

            $summary = [
                'All' => $allCount,
                'Verified' => $completedCount,
                'Pending' => $pendingCount,
            ];

            // Apply status filter
            if ($statusFilter !== 'All') {
                $mappedStatus = $statusFilter === 'Verified' ? 'Completed' : $statusFilter;
                $query->where('transaction_status', $mappedStatus);
            }

            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference_number', 'like', "%{$search}%")
                      ->orWhere('payment_method', 'like', "%{$search}%")
                      ->orWhereHas('lease.room.property', function ($pq) use ($search) {
                          $pq->where('property_name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('lease.room', function ($rq) use ($search) {
                          $rq->where('room_number', 'like', "%{$search}%");
                      });
                });
            }

            // Order and paginate
            $payments = $query->orderBy('transaction_date', 'desc')->paginate($perPage);

            // Build tenant and landlord names once to avoid accessors
            $tenantFullName = trim(($tenant->first_name ?? '') . ' ' . ($tenant->last_name ?? ''));
            
            // Transform data
            $payments->through(function ($transaction) use ($tenantFullName) {
                $lease = $transaction->lease;
                $room = $lease?->room;
                $property = $room?->property;
                $landlord = $property?->landlord;

                // Build landlord info without triggering accessors
                $landlordName = 'N/A';
                $landlordContact = 'N/A';
                if ($landlord) {
                    $landlordName = trim(($landlord->first_name ?? '') . ' ' . ($landlord->last_name ?? ''));
                    $landlordContact = $landlord->contact_num ?? 'N/A';
                }

                return [
                    'id' => $transaction->transaction_id,
                    'tenant' => $tenantFullName,
                    'property' => $property?->property_name ?? 'N/A',
                    'unit' => $room?->room_number ?? 'N/A',
                    'amount' => (float) $transaction->amount,
                    'date' => $transaction->transaction_date->format('Y-m-d'),
                    'status' => $transaction->transaction_status === 'Completed' ? 'Verified' : $transaction->transaction_status,
                    'method' => $transaction->payment_method,
                    'ref' => $transaction->reference_number ?? '-',
                    'landlord_name' => $landlordName,
                    'landlord_contact' => $landlordContact,
                    'landlord_email' => $landlord?->user?->email ?? 'N/A',
                ];
            });

            // Tenant info for receipts - use direct attributes
            $tenantInfo = [
                'name' => trim(($tenant->first_name ?? '') . ' ' . ($tenant->last_name ?? '')),
                'contact' => $tenant->contact_num ?? 'N/A',
                'email' => $user->email,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Payments fetched successfully.',
                'data' => [
                    'tenant' => $tenantInfo,
                    'summary' => $summary,
                    'payments' => $payments,
                ]
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Server Error',
                'error' => config('app.debug') ? $th->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get the current authenticated tenant's lease information including history.
     */
    public function getTenantLeases(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated.'
                ], 401);
            }

            $tenant = Tenant::where('user_id', $user->user_id)
                ->with([
                    'leases' => function ($q) {
                        $q->with(['room.property.landlord.user'])
                          ->orderBy('start_date', 'desc');
                    }
                ])
                ->first();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tenant profile not found.'
                ], 404);
            }

            // Tenant info - use direct attributes to avoid slow accessors
            $tenantInfo = [
                'user_id' => $user->user_id,
                'first_name' => $tenant->first_name,
                'middle_name' => $tenant->middle_name,
                'last_name' => $tenant->last_name,
                'full_name' => trim(($tenant->first_name ?? '') . ' ' . ($tenant->last_name ?? '')),
                'contact_num' => $tenant->contact_num ?? 'N/A',
                'email' => $user->email,
            ];

            // Find active lease
            $activeLease = null;
            $leaseHistory = [];

            foreach ($tenant->leases as $lease) {
                $room = $lease->room;
                $property = $room?->property;
                $landlord = $property?->landlord;

                // Build landlord info without triggering accessors
                $landlordName = 'N/A';
                $landlordContact = 'N/A';
                if ($landlord) {
                    $landlordName = trim(($landlord->first_name ?? '') . ' ' . ($landlord->last_name ?? ''));
                    $landlordContact = $landlord->contact_num ?? 'N/A';
                }

                $leaseData = [
                    'lease_id' => $lease->lease_id,
                    'lease_status' => $lease->lease_status,
                    'start_date' => $lease->start_date->format('Y-m-d'),
                    'end_date' => $lease->end_date->format('Y-m-d'),
                    'payment_due_day' => $lease->payment_due_day ?? 5,
                    'monthly_rent' => (float) $lease->monthly_rent,
                    'security_deposit' => (float) $lease->security_deposit,
                    'notes' => $lease->notes ?? 'No special terms specified.',
                    'created_at' => $lease->created_at->format('Y-m-d'),
                    'property_name' => $property?->property_name ?? 'N/A',
                    'address' => $property?->address ?? 'N/A',
                    'city' => $property?->city ?? 'N/A',
                    'unit' => $room?->room_number ?? 'N/A',
                    'landlord_name' => $landlordName,
                    'landlord_contact' => $landlordContact,
                    'landlord_email' => $landlord?->user?->email ?? 'N/A',
                    'remaining_days' => max(0, \Carbon\Carbon::now()->diffInDays(\Carbon\Carbon::parse($lease->end_date), false)),
                    'is_current' => $lease->lease_status === 'Active' && $lease->is_active && \Carbon\Carbon::parse($lease->start_date) <= \Carbon\Carbon::now() && \Carbon\Carbon::parse($lease->end_date) >= \Carbon\Carbon::now(),
                ];

                // Check if this is an active/current lease
                if ($lease->is_current) {
                    $activeLease = $leaseData;
                } else {
                    // Add to history
                    $leaseHistory[] = [
                        'id' => $lease->lease_id,
                        'property' => $property?->property_name ?? 'N/A',
                        'unit' => $room?->room_number ?? 'N/A',
                        'start' => $lease->start_date->format('Y-m-d'),
                        'end' => $lease->end_date->format('Y-m-d'),
                        'status' => $lease->lease_status,
                        'monthly_rent' => (float) $lease->monthly_rent,
                        'address' => $property?->address ?? 'N/A',
                        'city' => $property?->city ?? 'N/A',
                        'security_deposit' => (float) $lease->security_deposit,
                        'payment_due_day' => $lease->payment_due_day ?? 5,
                        'notes' => $lease->notes ?? 'No special terms specified.',
                        'landlord_name' => $landlord?->full_name ?? 'N/A',
                        'landlord_contact' => $landlord?->formatted_contact_num ?? 'N/A',
                        'landlord_email' => $landlord?->user?->email ?? 'N/A',
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Lease data fetched successfully.',
                'data' => [
                    'tenant' => $tenantInfo,
                    'active_lease' => $activeLease,
                    'lease_history' => $leaseHistory,
                ]
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Server Error',
                'error' => config('app.debug') ? $th->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get the current authenticated tenant's profile.
     */
    public function getTenantProfile(Request $request)
    {
        try {
            // Use $request->user() instead of Auth::user() for compatibility with JWT middleware
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated.'
                ], 401);
            }

            // Find the tenant record - try both through relationship and direct query
            $tenant = $user->tenant ?? Tenant::where('user_id', $user->user_id)->first();

            if (!$tenant) {
                // Return more helpful debug info
                return response()->json([
                    'success' => false,
                    'message' => 'Tenant profile not found. Please contact support.',
                    'debug' => config('app.debug') ? [
                        'user_id' => $user->user_id,
                        'role' => $user->role,
                    ] : null
                ], 404);
            }

            $profileData = [
                'user_id' => $user->user_id,
                'tenant_id' => $tenant->tenant_id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'first_name' => $tenant->first_name,
                'middle_name' => $tenant->middle_name,
                'last_name' => $tenant->last_name,
                'full_name' => $tenant->full_name,
                'contact_num' => $tenant->contact_num,
                'formatted_contact_num' => $tenant->formatted_contact_num,
                'created_at' => $user->created_at ? $user->created_at->format('Y-m-d') : null,
                'is_active' => $tenant->is_active,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Profile fetched successfully.',
                'data' => $profileData
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Server Error',
                'error' => config('app.debug') ? $th->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update the current authenticated tenant's profile.
     */
    public function updateTenantProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated.'
                ], 401);
            }

            $tenant = $user->tenant ?? Tenant::where('user_id', $user->user_id)->first();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tenant profile not found.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'first_name' => 'sometimes|required|string|max:255|regex:/^[\p{L}\s\'-]+$/u',
                'middle_name' => 'nullable|string|max:255|regex:/^[\p{L}\s\'-]+$/u',
                'last_name' => 'sometimes|required|string|max:255|regex:/^[\p{L}\s\'-]+$/u',
                'contact_num' => 'nullable|string|regex:/^[0-9\-]{10,15}$/',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation Error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update tenant record
            $tenant->update([
                'first_name' => $request->input('first_name', $tenant->first_name),
                'middle_name' => $request->input('middle_name', $tenant->middle_name),
                'last_name' => $request->input('last_name', $tenant->last_name),
                'contact_num' => $request->input('contact_num', $tenant->contact_num),
            ]);

            // Return updated profile
            $profileData = [
                'user_id' => $user->user_id,
                'tenant_id' => $tenant->tenant_id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'first_name' => $tenant->first_name,
                'middle_name' => $tenant->middle_name,
                'last_name' => $tenant->last_name,
                'full_name' => $tenant->full_name,
                'contact_num' => $tenant->contact_num,
                'formatted_contact_num' => $tenant->formatted_contact_num,
                'created_at' => $user->created_at->format('Y-m-d'),
                'is_active' => $tenant->is_active,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully.',
                'data' => $profileData
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Server Error',
                'error' => config('app.debug') ? $th->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function createTenantAccount(Request $request){
        try {
            $user = Auth::user();
            if(!$user) {
                return response()->json(['success' => false, 'message' => "Bad Request, User not authenticated!"], 401);
            }
            $allowedRoles = ['Admin', 'Landlord'];

            if(!in_array($user->role, $allowedRoles)){
                return response()->json([
                    'success' => false,
                    'message' => "Invalid Request. User must be a landlord account"
                ]);
            }
            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:255|regex:/^[\p{L}\s\'-]+$/u',
                'middle_name' => 'nullable|string|max:255|regex:/^[\p{L}\s\'-]+$/u',
                'last_name' => 'required|string|max:255|regex:/^[\p{L}\s\'-]+$/u',
                'username' => [
                    'required',
                    'string',
                    'max:255',
                    'regex:/^[a-zA-Z0-9._-]+$/',
                    Rule::unique('users')->where(function ($query) {
                        return $query->where('is_active', true)
                                    ->whereNull('deleted_at');
                    }),
                ],
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique('users')->where(function ($query) {
                        return $query->where('is_active', true)
                                    ->whereNull('deleted_at');
                    }),
                ],
                'password' => 'required|string|min:8|confirmed', 
                'contact_num' => 'nullable|string|regex:/^[0-9]{10,15}$/',
                // 'role' => 'required|string|in:tenant,landlord'
            ]);
            $role = "Tenant";
            if ($validator->fails()) {
                error_log("Validation Errors: " . json_encode($validator->errors()));
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()|| 'Validation Error, Try again!',
                    'errors' => $validator->errors()
                ], 422);
            }

            $result = DB::transaction(function () use ($request, $role){
                // Create the user
                $user = User::create([
                    'username' => $request->username,
                    'email' => $request->email,
                    'password_hash' => Hash::make($request->password),
                    'role' => $role,
                    'is_active' => true, // Set default active status
                ]);

                if(!$user->user_id){
                    throw new \Exception('User Creation Failed');
                }

                $user_id = $user->user_id;

                if($user->role ==="tenant"){
                    $tenant = Tenant::create([
                        'user_id' => $user_id,
                        'first_name' => $request->first_name,
                        'middle_name' => $request->middle_name,
                        'last_name' => $request->last_name,
                        'contact_num' => $request->contact_num,
                        'is_active' => true, // Set default active status
                    ]);
                }
                return [
                    'user' => $user,
                    // 'token' => $token,
                    'first_name' => $request->first_name,    // Pass these from request
                    'middle_name' => $request->middle_name,  // since they're not in users table
                    'last_name' => $request->last_name,
                    'contact_num' => $request->contact_num,
                ];
            });
            return response()->json([
                'success' => true,
                'message' => 'Tenant account created successfully!'
            ], 201);

        } catch (\Exception $e) {
            error_log("Registration Error: " . $e->getMessage());
            error_log("Stack Trace: " . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Calculate payment status for a lease without using accessors.
     */
    private function calculatePaymentStatus($lease): string
    {
        $balance = $this->calculateLeaseBalance($lease);
        
        if ($balance <= 0) {
            return 'Paid';
        }
        
        // Calculate days until due
        $dueDay = $lease->payment_due_day ?? 5;
        $now = \Carbon\Carbon::now();
        $dueDate = \Carbon\Carbon::create($now->year, $now->month, $dueDay);
        
        if ($dueDate->isPast()) {
            $dueDate->addMonth();
        }
        
        $daysUntilDue = $now->diffInDays($dueDate, false);
        
        if ($daysUntilDue < 0) {
            return 'Overdue';
        } elseif ($daysUntilDue <= 7) {
            return 'Due Soon';
        } else {
            return 'On Track';
        }
    }

    /**
     * Calculate lease balance without using accessors.
     */
    private function calculateLeaseBalance($lease): float
    {
        // Calculate months elapsed since start
        $now = \Carbon\Carbon::now();
        $startDate = \Carbon\Carbon::parse($lease->start_date);
        $endDate = \Carbon\Carbon::parse($lease->end_date);
        
        // If lease hasn't started yet, balance is 0
        if ($now < $startDate) {
            return 0.00;
        }
        
        // Use end_date if expired, or now if ongoing
        $calculationEnd = $now > $endDate ? $endDate : $now;
        
        // Calculate months elapsed (rounded up)
        $monthsElapsed = ceil($startDate->floatDiffInMonths($calculationEnd));
        
        // Get total paid from transactions
        $totalPaid = \App\Models\Transaction::where('lease_id', $lease->lease_id)
            ->where('transaction_status', 'Completed')
            ->sum('amount');
        
        $expectedTotal = $monthsElapsed * (float) $lease->monthly_rent;
        
        return (float) max(0, $expectedTotal - $totalPaid);
    }

}
