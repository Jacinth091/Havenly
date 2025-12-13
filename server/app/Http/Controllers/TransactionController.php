<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Lease;
use App\Models\Landlord;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str; 
use Illuminate\Support\Facades\DB; 

class TransactionController extends Controller
{


    public function recordPayment(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user->landlord) {
                return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
            }
            $landlordId = $user->landlord->landlord_id;

            // Validate
            $validator = Validator::make($request->all(), [
                'lease_id'          => 'required|exists:leases,lease_id',
                'amount'            => 'required|numeric|min:0.01',
                'payment_method'    => 'required|in:Cash,Bank Transfer,GCash,PayMaya,Check,Other',
                'payment_for_month' => 'required|date', 
                'transaction_date'  => 'required|date|before_or_equal:now',
                'reference_number'  => 'nullable|string|max:50',
                'notes'             => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Validation Error', 'errors' => $validator->errors()], 422);
            }

            // Verify Ownership
            $lease = Lease::with('room.property')
                ->where('lease_id', $request->lease_id)
                ->whereHas('room.property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                })->first();

            if (!$lease) {
                return response()->json(['success' => false, 'message' => 'Lease not found or unauthorized.'], 404);
            }

            if (in_array($lease->lease_status, ['Archived', 'Terminated'])) {
                return response()->json(['success' => false, 'message' => 'Cannot pay for an inactive lease.'], 400);
            }

            // Generate Reference if needed
            $refNumber = $request->reference_number;
            if (empty($refNumber) || $request->payment_method === 'Cash') {
                $refNumber = 'PAY-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
            }

            // --- LOGIC: STATUS DETERMINATION ---
            // Checks start as Pending. Cash/Online usually Completed (unless you want manual review for those too)
            $status = 'Completed'; 
            if ($request->payment_method !== 'Cash') {
                $status = 'Pending';
            }
            
            $transaction = Transaction::create([
                'lease_id'           => $lease->lease_id,
                'amount'             => $request->amount,
                'payment_method'     => $request->payment_method,
                'payment_for_month'  => $request->payment_for_month,
                'transaction_date'   => $request->transaction_date,
                'reference_number'   => $refNumber,
                'transaction_status' => $status,
                'is_active'          => true,
                'notes'              => $request->notes
            ]);

            return response()->json([
                'success' => true, 
                'message' => $status === 'Pending' ? 'Payment recorded. Waiting for verification.' : 'Payment verified successfully.', 
                'data' => $transaction
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }


    public function getTransactionsByTenant(Request $request, $tenantId)
    {
        try {
            $user = Auth::user();
            
            $query = Transaction::with(['lease.room.property'])
                ->whereHas('lease', function($q) use ($tenantId) {
                    $q->where('tenant_id', $tenantId);
                });

            // Role Logic
            if ($user->role === 'Tenant') {
                if ($user->tenant->tenant_id != $tenantId) {
                    return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role === 'Landlord') {
                $landlordId = $user->landlord->landlord_id;
                $query->whereHas('lease.room.property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                });
            } elseif ($user->role !== 'Admin') {
                return response()->json(['success' => false, 'message' => 'Unauthorized role'], 403);
            }

            // Apply Filters
            $this->applyFilters($query, $request);

            // UPDATED: Calculate summary for Tenant view as well
            $summary = $this->calculateSummary(clone $query);

            return $this->formatResponse($query->paginate($request->input('limit', 10)), $summary);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error fetching tenant transactions', 'error' => $e->getMessage()], 500);
        }
    }

    public function getAllTransactions(Request $request)
    {
        try {
            if (Auth::user()->role !== 'Admin') {
                return response()->json(['success' => false, 'message' => 'Unauthorized. Admin access only.'], 403);
            }

            $query = Transaction::with(['lease.tenant', 'lease.room.property.landlord']);

            $this->applyFilters($query, $request);

            // UPDATED: Calculate summary for Admin view
            $summary = $this->calculateSummary(clone $query);

            return $this->formatResponse($query->paginate($request->input('limit', 20)), $summary);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error fetching all transactions', 'error' => $e->getMessage()], 500);
        }
    }


    public function verifyTransaction($id)
    {
        try {
            $user = Auth::user();
            $landlordId = $user->landlord->landlord_id;

            // Find transaction belonging to this landlord
            $transaction = Transaction::where('transaction_id', $id)
                ->whereHas('lease.room.property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                })->firstOrFail();

            if ($transaction->transaction_status === 'Completed') {
                return response()->json(['success' => false, 'message' => 'Transaction is already verified.'], 400);
            }

            $transaction->update(['transaction_status' => 'Completed']);

            return response()->json(['success' => true, 'message' => 'Payment verified successfully.']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to verify transaction.'], 500);
        }
    }

    public function rejectTransaction($id)
    {
        try {
            $user = Auth::user();
            $landlordId = $user->landlord->landlord_id;

            $transaction = Transaction::where('transaction_id', $id)
                ->whereHas('lease.room.property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                })->firstOrFail();

            // 'Cancelled' maps to 'Overdue' or 'Rejected' in your frontend logic
            $transaction->update(['transaction_status' => 'Cancelled']); 

            return response()->json(['success' => true, 'message' => 'Transaction marked as invalid/overdue.']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to reject transaction.'], 500);
        }
    }
    public function getTransactionsByLandlord(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user->landlord) return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            
            $landlordId = $user->landlord->landlord_id;

            // 1. BASE QUERY (Owner check)
            $query = Transaction::with(['lease.tenant', 'lease.room.property'])
                ->whereHas('lease.room.property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                });

            // 2. APPLY SEARCH (Apply this BEFORE summary so counts match search results)
            if ($request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('reference_number', 'LIKE', "%{$search}%")
                      ->orWhereHas('lease.tenant', function($t) use ($search) {
                          $t->where('first_name', 'LIKE', "%{$search}%")
                            ->orWhere('last_name', 'LIKE', "%{$search}%");
                      });
                });
            }

            // 3. CALCULATE SUMMARY (Do this on a CLONE before applying status filters)
            // This ensures "All" count stays 10 even when viewing "Pending" tab
            $summaryQuery = clone $query;
            $summary = $this->calculateSummary($summaryQuery);

            // 4. APPLY STATUS FILTER (Tab Logic)
            $status = $request->input('status', 'All');

            if ($status === 'Archived') {
                // Only show archived items
                $query->where('is_active', false);
            } else {
                // For All, Completed, Pending -> Only show ACTIVE items
                $query->where('is_active', true);

                if ($status === 'Completed') {
                    $query->where('transaction_status', 'Completed');
                } elseif ($status === 'Pending') {
                    $query->where('transaction_status', 'Pending');
                }
                // 'All' shows everything that is active
            }

            // 5. PAGINATE & FORMAT
            $query->orderBy('transaction_date', 'desc');
            
            return $this->formatResponse($query->paginate($request->input('limit', 10)), $summary);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error', 'error' => $e->getMessage()], 500);
        }
    }

    public function archiveTransaction($id)
    {
        try {
            $user = Auth::user();
            if (!$user->landlord) {
                return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
            }
            
            $landlordId = $user->landlord->landlord_id;
            $transaction = Transaction::where('transaction_id', $id)
                ->whereHas('lease.room.property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                })->firstOrFail();

            // 3. Perform Archive
            // We update the 'is_active' flag to false to hide it from main views
            $transaction->update(['is_active' => false]);

            return response()->json([
                'success' => true, 
                'message' => 'Transaction archived successfully.'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Transaction not found or access denied.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to archive transaction.', 'error' => $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // HELPERS
    // =========================================================================
    private function calculateSummary($query)
    {
        // We select raw counts based on conditions.
        // NOTE: We assume 'is_active' = 1 is visible, 'is_active' = 0 is archived.
        
        $stats = $query->reorder()->selectRaw("
            sum(case when is_active = 1 then 1 else 0 end) as total_active,
            sum(case when transaction_status = 'Completed' and is_active = 1 then 1 else 0 end) as completed,
            sum(case when transaction_status = 'Pending' and is_active = 1 then 1 else 0 end) as pending,
            sum(case when is_active = 0 then 1 else 0 end) as archived
        ")->first();

        return [
            'total_records'  => (int) ($stats->total_active ?? 0),
            'verified_count' => (int) ($stats->completed ?? 0), // Maps to 'Completed' tab
            'pending_count'  => (int) ($stats->pending ?? 0),
            'archived_count' => (int) ($stats->archived ?? 0),  // Maps to 'Archived' tab
        ];
    }
    
    private function applyFilters($query, $request)
    {
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reference_number', 'LIKE', "%{$search}%")
                  ->orWhereHas('lease.tenant', function($t) use ($search) {
                      $t->where('first_name', 'LIKE', "%{$search}%")
                        ->orWhere('last_name', 'LIKE', "%{$search}%");
                  });
            });
        }

        if ($request->has('show_archived') && $request->show_archived == 'true') {
             // Optional: logic if you want to see archived items
             $query->where('is_active', false);
        } else {
             $query->where('is_active', true);
        }

        if ($request->has('status') && $request->status !== 'All') {
             switch($request->status) {
                 case 'Verified': $query->where('transaction_status', 'Completed'); break;
                 case 'Pending':  $query->where('transaction_status', 'Pending'); break;
                 case 'Overdue':  $query->where('transaction_status', 'Cancelled'); break;
             }
        }
        $query->orderBy('transaction_date', 'desc');
    }

    private function formatResponse($paginated, $summaryStats)
    {
        $formatted = $paginated->through(function ($txn) {
            return [
                'id'       => $txn->transaction_id,
                'tenant'   => $txn->lease->tenant ? $txn->lease->tenant->first_name . ' ' . $txn->lease->tenant->last_name : 'Unknown',
                'property' => $txn->lease->room->property->property_name ?? 'N/A',
                'unit'     => $txn->lease->room->room_number ?? 'N/A',
                'amount'   => (float) $txn->amount,
                'date'     => Carbon::parse($txn->transaction_date)->format('Y-m-d'),
                
                // Frontend expects 'status' key
                'status'   => $txn->transaction_status, 
                
                'method'   => $txn->payment_method,
                'ref'      => $txn->reference_number,
                
                // Pass is_active so frontend knows if it's archived
                'is_active'=> (bool) $txn->is_active 
            ];
        });

        return response()->json([
            'success' => true,
            'transactions' => $formatted,
            'summary' => $summaryStats,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'total_items'  => $paginated->total(),
                'limit'        => $paginated->perPage(),
            ]
        ], 200);
    }
}