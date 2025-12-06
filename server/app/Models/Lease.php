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

    /**
     * The primary key associated with the table.
     * SQL: lease_id INT(11)
     */
    protected $primaryKey = 'lease_id';
    
    public $incrementing = true;
    
    protected $keyType = 'int';

    /**
     * The attributes that are mass assignable.
     * Matches SQL columns exactly.
     */
    protected $fillable = [
        'room_id',
        'tenant_id',
        'start_date',
        'end_date',
        'monthly_rent',
        'security_deposit',
        'payment_due_day',
        'lease_status', // ENUM('Active', 'Expired', 'Terminated', 'Archived')
        'notes',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'monthly_rent' => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'payment_due_day' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Attributes to append to array form.
     */
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

        static::updating(function ($lease) {
            // If lease status changes to Expired or Terminated, update room status
            if ($lease->isDirty('lease_status') && in_array($lease->lease_status, ['Expired', 'Terminated'])) {
                // Check if the room exists before updating
                if ($lease->room) {
                    $lease->room->update(['room_status' => 'Available']);
                }
            }
        });
    }

    /* -------------------------------------------------------------------------- */
    /* RELATIONSHIPS                                */
    /* -------------------------------------------------------------------------- */

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
    public function completedTransactions()
    {
        return $this->transactions()->where('transaction_status', 'Completed');
    }

    /**
     * Get pending transactions.
     */
    public function pendingTransactions()
    {
        return $this->transactions()->where('transaction_status', 'Pending');
    }

    /* -------------------------------------------------------------------------- */
    /* ACCESSORS                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * Check if lease is currently active (status is Active AND dates cover current date).
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
        return (int) max(0, $remaining);
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
        
        // Use property specific due day or default to 1
        $dueDay = min($this->payment_due_day ?? 1, 28);
        
        // Check payments for this month
        $thisMonthPayment = $this->completedTransactions()
            ->whereNotNull('payment_for_month')
            ->whereYear('payment_for_month', $now->year)
            ->whereMonth('payment_for_month', $now->month)
            ->sum('amount');
        
        // If this month is fully paid, next due is next month
        if ($thisMonthPayment >= $this->monthly_rent) {
            $dueDate = $now->copy()->addMonth()->day($dueDay);
        } else {
            $dueDate = $now->copy()->day($dueDay);
            
            // If due date has passed for this month and it's not paid, it's overdue (date remains in past)
            // But if we want the "next" logical billing cycle, standard practice varies.
            // Keeping logic simple: if today > due date, and unpaid, due date was earlier this month.
        }
        
        return $dueDate;
    }

    /**
     * Get days until next payment is due.
     */
    public function getDaysUntilDueAttribute(): int
    {
        return (int) Carbon::now()->diffInDays($this->next_payment_due_date, false);
    }

    /**
     * Get total amount paid.
     */
    public function getTotalPaidAttribute(): float
    {
        return (float) $this->completedTransactions()->sum('amount');
    }

    /**
     * Get current balance (expected total rent to date - total paid).
     */
    public function getBalanceAttribute(): float
    {
        // Calculate months elapsed since start
        // Limit end date to today if lease is ongoing, or end_date if expired
        $calculationEnd = $this->is_expired ? $this->end_date : Carbon::now();
        
        // Ensure we don't calculate before start date
        if (Carbon::now() < $this->start_date) {
            return 0.00;
        }

        // Simple calculation: months * rent
        // Note: floatDiffInMonths can be precise, usually rental logic uses ceil or floor depending on policy
        $monthsElapsed = ceil($this->start_date->floatDiffInMonths($calculationEnd));
        
        $expectedTotal = $monthsElapsed * $this->monthly_rent;
        
        return (float) max(0, $expectedTotal - $this->total_paid);
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
            ->values()
            ->toArray();
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
        return $this->is_current && $this->remaining_days <= 60; // Usually 30-60 days notice
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

    /* -------------------------------------------------------------------------- */
    /* SCOPES                                    */
    /* -------------------------------------------------------------------------- */

    public function scopeActive($query)
    {
        return $query->where('lease_status', 'Active')->where('is_active', true);
    }

    public function scopeCurrent($query)
    {
        $now = Carbon::now();
        return $query->active()
            ->where('start_date', '<=', $now)
            ->where('end_date', '>=', $now);
    }

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

    public function scopeUpcoming($query)
    {
        return $query->active()->where('start_date', '>', Carbon::now());
    }

    /* -------------------------------------------------------------------------- */
    /* ACTIONS                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * Renew the lease for additional months.
     */
    public function renew(int $additionalMonths, float $newRent = null): bool
    {
        if (!$this->can_renew) {
            // Optional: throw exception or return false
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
            $this->notes .= "\n[Terminated: " . now()->format('Y-m-d') . "] " . $reason;
        }
        
        // Room update handled by boot() method or controller logic
        
        return $this->save();
    }

    /**
     * Mark lease as expired.
     */
    public function markAsExpired(): bool
    {
        $this->lease_status = 'Expired';
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
            // 'reference' => $this->lease_reference, // Removed: Column does not exist
            'tenant_name' => $this->tenant->full_name ?? 'Unknown',
            'room_number' => $this->room->room_number ?? 'N/A',
            'property_name' => $this->room->property->property_name ?? 'N/A',
            'start_date' => $this->start_date->format('Y-m-d'),
            'end_date' => $this->end_date->format('Y-m-d'),
            'monthly_rent' => $this->formatted_rent,
            'status' => $this->lease_status,
            'payment_status' => $this->payment_status,
            'remaining_days' => $this->remaining_days,
            'next_payment_due' => $this->next_payment_due_date->format('Y-m-d'),
            'total_paid' => $this->total_paid,
            'balance' => $this->balance,
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
}