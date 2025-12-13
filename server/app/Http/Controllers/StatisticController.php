<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StatisticController extends Controller
{
    public function getLandlordDashboardData(Request $request)
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
            $summary = $landlord->getPropertiesSummary();
            $prevMonthPropertiesCount = $landlord->activeProperties()
                ->where('created_at', '<', Carbon::now()->subMonth())
                ->count();
            
            $propertiesTrend = $summary['active_properties'] > $prevMonthPropertiesCount ? 'up' : 'neutral';
            $pendingAmount = Transaction::whereHas('lease.room.property', function ($query) use ($landlord) {
                $query->where('landlord_id', $landlord->landlord_id);
            })
            ->where('transaction_status', 'Pending')
            ->sum('amount');

            $startOfThisMonth = Carbon::now()->startOfMonth();
            $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
            $endOfLastMonth   = Carbon::now()->subMonth()->endOfMonth();

            $currentRevenue = Transaction::whereHas('lease.room.property', function ($query) use ($landlord) {
                $query->where('landlord_id', $landlord->landlord_id);
            })
            ->where('transaction_status', 'Completed')
            ->where('transaction_date', '>=', $startOfThisMonth)
            ->sum('amount');

            $lastMonthRevenue = Transaction::whereHas('lease.room.property', function ($query) use ($landlord) {
                $query->where('landlord_id', $landlord->landlord_id);
            })
            ->where('transaction_status', 'Completed')
            ->whereBetween('transaction_date', [$startOfLastMonth, $endOfLastMonth])
            ->sum('amount');

            $revenueChangePercent = $lastMonthRevenue > 0 
                ? round((($currentRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100) 
                : 100;
            $propertiesList = $landlord->properties()
                ->select('property_id', 'property_name', 'city', 'is_active')
                ->withCount('rooms')
                ->orderBy('city')
                ->get()
                ->map(function ($prop) {
                    return [
                        'id' => $prop->property_id,
                        'name' => $prop->property_name,
                        'city' => $prop->city,
                        'rooms' => $prop->rooms_count,
                        'status' => $prop->is_active ? 'Active' : 'Inactive',
                    ];
                });

            // Map Recent Transactions
            $recentTransactions = $landlord->recentTransactions(5)
                ->map(function ($tx) {
                    return [
                        'id' => $tx->transaction_id,
                        'unit' => $tx->lease->room->room_number ?? 'N/A',
                        'amount' => '₱' . number_format($tx->amount),
                        'date' => Carbon::parse($tx->transaction_date)->format('M d, Y'),
                        'status' => $tx->transaction_status,
                        'method' => $tx->payment_method,
                    ];
                });

            // Map Alerts
            $alerts = [];
            
            // Alert 1: Expiring Leases
            $expiringLeases = $landlord->activeLeases()
                ->with(['room.property'])
                ->whereBetween('end_date', [Carbon::now(), Carbon::now()->addDays(30)])
                ->get();

            foreach ($expiringLeases as $lease) {
                $daysLeft = Carbon::now()->diffInDays($lease->end_date);
                $alerts[] = [
                    'type' => 'lease_expiring',
                    'title' => 'Lease Expiring',
                    'message' => "Unit {$lease->room->room_number} ({$lease->room->property->property_name}) expires in {$daysLeft} days.",
                    'severity' => 'urgent' 
                ];
            }

            // Alert 2: Overdue (using your model helper)
            $upcomingDues = $landlord->upcomingDueDates(0);
            foreach ($upcomingDues as $due) {
                if ($due['days_until_due'] < 0) {
                    $alerts[] = [
                        'type' => 'payment_overdue',
                        'title' => 'Payment Overdue',
                        'message' => "Unit {$due['lease']->room->room_number} is overdue by " . abs($due['days_until_due']) . " days.",
                        'severity' => 'warning'
                    ];
                }
            }

            // HTTP 200: OK
            return response()->json([
                'stats' => [
                    'total_properties' => $summary['active_properties'],
                    'vacant_units' => $summary['available_rooms'],
                    'total_units' => $summary['total_rooms'],
                    'pending_collections' => $pendingAmount,
                    'revenue_current' => $currentRevenue,
                    'revenue_growth' => $revenueChangePercent,
                ],
                'properties' => $propertiesList,
                'recentTransactions' => $recentTransactions,
                'alerts' => $alerts,
            ], 200);

        } catch (\Exception $e) {
            Log::error("Dashboard Error: " . $e->getMessage());

            return response()->json([
                'message' => 'An unexpected error occurred while loading the dashboard.',
                'error_code' => 'SERVER_ERROR'
            ], 500);
        }
    }
}
