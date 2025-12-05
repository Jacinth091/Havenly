<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Transaction extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'transaction_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'lease_id',
        'amount',
        'payment_method',
        'reference_number',
        'payment_for_month',
        'transaction_date',
        'transaction_status',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'datetime',
        'payment_for_month' => 'date',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the lease associated with this transaction.
     */
    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class, 'lease_id', 'lease_id');
    }

    /**
     * Get the tenant through lease.
     */
    public function tenant()
    {
        return $this->lease->tenant();
    }

    /**
     * Get the room through lease.
     */
    public function room()
    {
        return $this->lease->room();
    }

    /**
     * Check if transaction is completed.
     */
    public function getIsCompletedAttribute(): bool
    {
        return $this->transaction_status === 'Completed';
    }

    /**
     * Check if transaction is pending.
     */
    public function getIsPendingAttribute(): bool
    {
        return $this->transaction_status === 'Pending';
    }

    /**
     * Check if transaction is cancelled.
     */
    public function getIsCancelledAttribute(): bool
    {
        return $this->transaction_status === 'Cancelled';
    }

    /**
     * Scope for completed transactions.
     */
    public function scopeCompleted($query)
    {
        return $query->where('transaction_status', 'Completed');
    }

    /**
     * Scope for pending transactions.
     */
    public function scopePending($query)
    {
        return $query->where('transaction_status', 'Pending');
    }

    /**
     * Scope for transactions in a specific month.
     */
    public function scopeForMonth($query, $year, $month)
    {
        return $query->whereYear('payment_for_month', $year)
                     ->whereMonth('payment_for_month', $month);
    }

    /**
     * Scope for transactions in a date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    /**
     * Scope for transactions by payment method.
     */
    public function scopeByMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    /**
     * Get formatted amount.
     */
    public function getFormattedAmountAttribute(): string
    {
        return '₱' . number_format($this->amount, 2);
    }

    /**
     * Get formatted transaction date.
     */
    public function getFormattedTransactionDateAttribute(): string
    {
        return $this->transaction_date->format('M d, Y h:i A');
    }

    /**
     * Get formatted payment month.
     */
    public function getFormattedPaymentMonthAttribute(): string
    {
        return $this->payment_for_month 
            ? Carbon::parse($this->payment_for_month)->format('F Y')
            : 'N/A';
    }

    /**
     * Determine if this is a rent payment.
     */
    public function getIsRentPaymentAttribute(): bool
    {
        return $this->payment_for_month !== null;
    }

    /**
     * Get payment method icon/color classes (for UI).
     */
    public function getPaymentMethodIconAttribute(): array
    {
        $icons = [
            'Cash' => ['icon' => 'money-bill', 'color' => 'success'],
            'Bank Transfer' => ['icon' => 'university', 'color' => 'primary'],
            'GCash' => ['icon' => 'mobile-alt', 'color' => 'info'],
            'PayMaya' => ['icon' => 'credit-card', 'color' => 'warning'],
            'Check' => ['icon' => 'file-invoice', 'color' => 'secondary'],
            'Other' => ['icon' => 'ellipsis-h', 'color' => 'dark'],
        ];

        return $icons[$this->payment_method] ?? ['icon' => 'question-circle', 'color' => 'dark'];
    }
}