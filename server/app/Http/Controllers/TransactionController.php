<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Lease;
use App\Models\Landlord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    // Landlords manually record payments
    public function recordPayment(Request $request)
    {
        // Validate 
        $validated = $request->validate([
            'lease_id' => 'required|exists:leases,lease_id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:Cash,Bank Transfer,GCash,PayMaya,Check,Other',
            'payment_for_month' => 'required|date', // 
            'transaction_date' => 'required|date|before_or_equal:now', // 
            'reference_number' => 'nullable|string'
        ]);

        $user = Auth::user();
        $landlord = Landlord::where('user_id', $user->user_id)->first();

        // Authorization: Ensure lease belongs to this landlord
        $lease = Lease::where('lease_id', $validated['lease_id'])
            ->whereHas('room.property', function($q) use ($landlord) {
                $q->where('landlord_id', $landlord->landlord_id);
            })->first();

        if (!$lease) {
            return response()->json(['error' => 'Invalid lease or unauthorized'], 403);
        }

        // Only valid, active leases can receive payments
        // (Note: You might allow payments on 'Expired' leases for back-pay, but 'Active' is safer default)
        if ($lease->lease_status === 'Terminated' || $lease->lease_status === 'Archived') {
            return response()->json(['error' => 'Cannot record payment for terminated/archived lease'], 400);
        }

        $transaction = Transaction::create([
            'lease_id' => $validated['lease_id'],
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'payment_for_month' => $validated['payment_for_month'],
            'transaction_date' => $validated['transaction_date'],
            'reference_number' => $validated['reference_number'],
            'transaction_status' => 'Completed', // Default as per  (Manual entry implies completion)
            'is_active' => true
        ]);

        return response()->json(['message' => 'Payment recorded', 'data' => $transaction], 201);
    }

    // Landlord views rent payments
    public function getLandlordTransactions()
    {
        $landlord = Landlord::where('user_id', Auth::id())->first();

        $transactions = Transaction::with(['lease.tenant', 'lease.room.property'])
            ->whereHas('lease.room.property', function($q) use ($landlord) {
                $q->where('landlord_id', $landlord->landlord_id);
            })
            ->orderBy('transaction_date', 'desc')
            ->get();

        return response()->json($transactions);
    }
}