<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Lease extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'lease_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'room_id',
        'tenant_id',
        'lease_reference',
        'start_date',
        'end_date',
        'monthly_rent',
        'security_deposit',
        'payment_due_day',
        'contract_signed_date',
        'early_termination_fee',
        'contract_notes',
        'lease_status',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'monthly_rent' => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'early_termination_fee' => 'decimal:2',
        'payment_due_day' => 'integer',
        'contract_signed_date' => 'date',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Append these computed attributes
    protected $appends = [
        'is_current',
        'is_expired',
        'is_upcoming',
        'remaining_days',
        'total_months',
        'formatted_rent',
        'formatted_security_deposit',
        'next_payment_due_date',
        'days_until_due',
        'total_paid',
        'balance',
        'paid_months',
        'unpaid_months',
        'payment_status',
        'can_renew',
        'can_terminate',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($lease) {
            if (empty($lease->lease_reference)) {
                $lease->lease_reference = self::generateLeaseReference();
            }
        });

        static::updating(function ($lease) {
            // If lease status changes to Expired, update room status
            if ($lease->isDirty('lease_status') && $lease->lease_status === 'Expired') {
                $lease->room()->update(['room_status' => 'Available']);
            }
        });
    }

    /**
     * Get the room associated with the lease.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id', 'room_id');
    }

    /**
     * Get the tenant associated with the lease.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }

    /**
     * Get the transactions for the lease.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'lease_id', 'lease_id');
    }

    /**
     * Get completed transactions.
     */
    public function completedTransactions(): HasMany
    {
        return $this->transactions()->where('transaction_status', 'Completed');
    }

    /**
     * Get pending transactions.
     */
    public function pendingTransactions(): HasMany
    {
        return $this->transactions()->where('transaction_status', 'Pending');
    }

    /**
     * Get payments by month.
     */
    public function paymentsByMonth()
    {
        return $this->completedTransactions()
            ->whereNotNull('payment_for_month')
            ->get()
            ->groupBy(function ($transaction) {
                return Carbon::parse($transaction->payment_for_month)->format('Y-m');
            });
    }

    /**
     * Check if lease is currently active.
     */
    public function getIsCurrentAttribute(): bool
    {
        $now = Carbon::now();
        return $this->lease_status === 'Active' &&
               $this->start_date <= $now &&
               $this->end_date >= $now;
    }

    /**
     * Check if lease is expired.
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->lease_status === 'Expired' ||
               ($this->lease_status === 'Active' && $this->end_date < Carbon::now());
    }

    /**
     * Check if lease is upcoming.
     */
    public function getIsUpcomingAttribute(): bool
    {
        return $this->lease_status === 'Active' && $this->start_date > Carbon::now();
    }

    /**
     * Get remaining days in lease.
     */
    public function getRemainingDaysAttribute(): int
    {
        if ($this->is_expired) {
            return 0;
        }
        
        $remaining = Carbon::now()->diffInDays($this->end_date, false);
        return max(0, $remaining);
    }

    /**
     * Get total lease duration in months.
     */
    public function getTotalMonthsAttribute(): float
    {
        return $this->start_date->floatDiffInMonths($this->end_date);
    }

    /**
     * Get next payment due date.
     */
    public function getNextPaymentDueDateAttribute(): Carbon
    {
        $now = Carbon::now();
        $currentMonth = $now->copy()->day(1);
        
        // Check if we should use this month or next month
        $dueDay = min($this->payment_due_day, 28);
        
        // Check payments for this month
        $thisMonthPayment = $this->completedTransactions()
            ->whereNotNull('payment_for_month')
            ->whereYear('payment_for_month', $now->year)
            ->whereMonth('payment_for_month', $now->month)
            ->sum('amount');
        
        // If this month is already paid, next due is next month
        if ($thisMonthPayment >= $this->monthly_rent) {
            $dueDate = $now->copy()->addMonth()->day($dueDay);
        } else {
            $dueDate = $now->copy()->day($dueDay);
            
            // If due date has passed, use next month
            if ($dueDate->lt($now)) {
                $dueDate->addMonth();
            }
        }
        
        return $dueDate;
    }

    /**
     * Get days until next payment is due.
     */
    public function getDaysUntilDueAttribute(): int
    {
        return Carbon::now()->diffInDays($this->next_payment_due_date, false);
    }

    /**
     * Get total amount paid.
     */
    public function getTotalPaidAttribute(): float
    {
        return $this->completedTransactions()->sum('amount');
    }

    /**
     * Get current balance (expected total - paid).
     */
    public function getBalanceAttribute(): float
    {
        // Calculate months from start to end (or current date if lease is current)
        $endDate = $this->is_current ? Carbon::now() : $this->end_date;
        $monthsElapsed = $this->start_date->floatDiffInMonths($endDate);
        
        $expectedTotal = ceil($monthsElapsed) * $this->monthly_rent;
        
        return max(0, $expectedTotal - $this->total_paid);
    }

    /**
     * Get list of paid months.
     */
    public function getPaidMonthsAttribute(): array
    {
        return $this->completedTransactions()
            ->whereNotNull('payment_for_month')
            ->pluck('payment_for_month')
            ->map(function ($date) {
                return Carbon::parse($date)->format('Y-m');
            })
            ->unique()
            ->toArray();
    }

    /**
     * Get list of unpaid months.
     */
    public function getUnpaidMonthsAttribute(): array
    {
        $paidMonths = $this->paid_months;
        $allMonths = [];
        
        $current = $this->start_date->copy()->day(1);
        $end = $this->is_current ? Carbon::now() : $this->end_date;
        
        while ($current <= $end) {
            $monthKey = $current->format('Y-m');
            if (!in_array($monthKey, $paidMonths)) {
                $allMonths[] = $monthKey;
            }
            $current->addMonth();
        }
        
        return $allMonths;
    }

    /**
     * Get payment status.
     */
    public function getPaymentStatusAttribute(): string
    {
        if ($this->balance <= 0) {
            return 'Paid';
        } elseif ($this->days_until_due < 0) {
            return 'Overdue';
        } elseif ($this->days_until_due <= 7) {
            return 'Due Soon';
        } else {
            return 'On Track';
        }
    }

    /**
     * Check if lease can be renewed.
     */
    public function getCanRenewAttribute(): bool
    {
        return $this->is_current && $this->remaining_days <= 30;
    }

    /**
     * Check if lease can be terminated.
     */
    public function getCanTerminateAttribute(): bool
    {
        return $this->is_current && !$this->is_expired;
    }

    /**
     * Get formatted monthly rent.
     */
    public function getFormattedRentAttribute(): string
    {
        return '₱' . number_format($this->monthly_rent, 2);
    }

    /**
     * Get formatted security deposit.
     */
    public function getFormattedSecurityDepositAttribute(): string
    {
        return '₱' . number_format($this->security_deposit, 2);
    }

    /**
     * Generate a unique lease reference.
     */
    public static function generateLeaseReference(): string
    {
        $year = date('Y');
        $month = date('m');
        $count = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count() + 1;
        
        return "LEASE-{$year}{$month}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Scope for active leases.
     */
    public function scopeActive($query)
    {
        return $query->where('lease_status', 'Active')->where('is_active', true);
    }

    /**
     * Scope for current leases (active and within date range).
     */
    public function scopeCurrent($query)
    {
        $now = Carbon::now();
        return $query->active()
            ->where('start_date', '<=', $now)
            ->where('end_date', '>=', $now);
    }

    /**
     * Scope for expired leases.
     */
    public function scopeExpired($query)
    {
        $now = Carbon::now();
        return $query->where(function ($q) use ($now) {
            $q->where('lease_status', 'Expired')
              ->orWhere(function ($q2) use ($now) {
                  $q2->where('lease_status', 'Active')
                     ->where('end_date', '<', $now);
              });
        });
    }

    /**
     * Scope for upcoming leases.
     */
    public function scopeUpcoming($query)
    {
        return $query->active()->where('start_date', '>', Carbon::now());
    }

    /**
     * Scope for overdue leases.
     */
    public function scopeOverdue($query)
    {
        return $query->current()->whereHas('transactions', function ($q) {
            $q->where('transaction_status', 'Pending')
              ->orWhere(function ($q2) {
                  $q2->where('transaction_status', 'Completed')
                     ->where('payment_for_month', '<', Carbon::now()->subMonth());
              });
        });
    }

    /**
     * Scope for leases expiring soon.
     */
    public function scopeExpiringSoon($query, $days = 30)
    {
        $date = Carbon::now()->addDays($days);
        return $query->current()->where('end_date', '<=', $date);
    }

    /**
     * Scope for leases by tenant.
     */
    public function scopeByTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    /**
     * Scope for leases by room.
     */
    public function scopeByRoom($query, $roomId)
    {
        return $query->where('room_id', $roomId);
    }

    /**
     * Scope for leases by property.
     */
    public function scopeByProperty($query, $propertyId)
    {
        return $query->whereHas('room', function ($q) use ($propertyId) {
            $q->where('property_id', $propertyId);
        });
    }

    /**
     * Scope for leases by landlord.
     */
    public function scopeByLandlord($query, $landlordId)
    {
        return $query->whereHas('room.property', function ($q) use ($landlordId) {
            $q->where('landlord_id', $landlordId);
        });
    }

    /**
     * Renew the lease for additional months.
     */
    public function renew(int $additionalMonths, float $newRent = null): bool
    {
        if (!$this->can_renew) {
            return false;
        }

        $this->end_date = $this->end_date->addMonths($additionalMonths);
        
        if ($newRent) {
            $this->monthly_rent = $newRent;
        }
        
        return $this->save();
    }

    /**
     * Terminate the lease.
     */
    public function terminate(string $reason = null): bool
    {
        if (!$this->can_terminate) {
            return false;
        }

        $this->lease_status = 'Terminated';
        $this->end_date = Carbon::now();
        
        if ($reason) {
            $this->contract_notes .= "\nTerminated: " . $reason;
        }
        
        // Update room status
        $this->room->update(['room_status' => 'Available']);
        
        return $this->save();
    }

    /**
     * Mark lease as expired.
     */
    public function markAsExpired(): bool
    {
        $this->lease_status = 'Expired';
        $this->room->update(['room_status' => 'Available']);
        return $this->save();
    }

    /**
     * Record a payment.
     */
    public function recordPayment(float $amount, array $paymentData = []): Transaction
    {
        return $this->transactions()->create(array_merge([
            'amount' => $amount,
            'transaction_status' => 'Completed',
            'transaction_date' => Carbon::now(),
        ], $paymentData));
    }

    /**
     * Get lease summary for dashboard.
     */
    public function getSummary(): array
    {
        return [
            'lease_id' => $this->lease_id,
            'reference' => $this->lease_reference,
            'tenant_name' => $this->tenant->full_name,
            'room_number' => $this->room->room_number,
            'property_name' => $this->room->property->property_name,
            'start_date' => $this->start_date->format('Y-m-d'),
            'end_date' => $this->end_date->format('Y-m-d'),
            'monthly_rent' => $this->formatted_rent,
            'status' => $this->lease_status,
            'payment_status' => $this->payment_status,
            'remaining_days' => $this->remaining_days,
            'next_payment_due' => $this->next_payment_due_date->format('Y-m-d'),
            'total_paid' => $this->total_paid,
            'balance' => $this->balance,
            'paid_months' => count($this->paid_months),
            'unpaid_months' => count($this->unpaid_months),
        ];
    }
    /**
     * Check if a specific month is paid.
     */
    public function isMonthPaid($year, $month): bool
    {
        $monthStart = Carbon::create($year, $month, 1)->startOfMonth();
        $monthEnd = (clone $monthStart)->endOfMonth();
        
        $paidAmount = $this->completedTransactions()
            ->whereBetween('payment_for_month', [$monthStart, $monthEnd])
            ->sum('amount');
        
        return $paidAmount >= $this->monthly_rent;
    }

    /**
     * Get payment history.
     */
    public function getPaymentHistory()
    {
        return $this->completedTransactions()
            ->orderBy('transaction_date', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'date' => $transaction->transaction_date->format('Y-m-d'),
                    'amount' => $transaction->amount,
                    'method' => $transaction->payment_method,
                    'for_month' => $transaction->payment_for_month 
                        ? Carbon::parse($transaction->payment_for_month)->format('F Y') 
                        : 'N/A',
                    'reference' => $transaction->reference_number,
                    'status' => $transaction->transaction_status,
                ];
            });
    }

    /**
     * Get upcoming payments schedule.
     */
    public function getPaymentSchedule()
    {
        $schedule = [];
        $current = $this->start_date->copy()->day(1);
        $end = $this->end_date->copy()->day(1);
        
        while ($current <= $end) {
            $monthKey = $current->format('Y-m');
            $dueDate = $current->copy()->day(min($this->payment_due_day, 28));
            $isPaid = $this->isMonthPaid($current->year, $current->month);
            
            $schedule[] = [
                'month' => $current->format('F Y'),
                'due_date' => $dueDate->format('Y-m-d'),
                'amount' => $this->monthly_rent,
                'status' => $isPaid ? 'Paid' : ($dueDate < Carbon::now() ? 'Overdue' : 'Pending'),
                'paid_amount' => $isPaid ? $this->monthly_rent : 0,
            ];
            
            $current->addMonth();
        }
        
        return $schedule;
    }
}