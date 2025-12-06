<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Transaction extends Model
{
    use SoftDeletes;

    /**
     * The primary key associated with the table.
     * SQL: transaction_id INT(11)
     */
    protected $primaryKey = 'transaction_id';
    
    public $incrementing = true;
    
    protected $keyType = 'int';

    /**
     * The attributes that are mass assignable.
     * Matches SQL columns exactly.
     */
    protected $fillable = [
        'lease_id',
        'amount',
        'payment_method', // ENUM('Cash', 'Bank Transfer', 'GCash', 'PayMaya', 'Check', 'Other')
        'reference_number',
        'payment_for_month',
        'transaction_date',
        'transaction_status', // ENUM('Pending', 'Completed', 'Cancelled', 'Archived')
        'notes',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     */
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
     * Attributes to append to array form.
     */
    protected $appends = [
        'formatted_amount',
        'formatted_transaction_date',
        'formatted_payment_month',
        'status_badge',
        'payment_method_icon',
        'is_completed',
        'is_pending',
        'is_cancelled',
    ];

    /* -------------------------------------------------------------------------- */
    /* RELATIONSHIPS                                */
    /* -------------------------------------------------------------------------- */

    /**
     * Get the lease associated with this transaction.
     */
    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class, 'lease_id', 'lease_id');
    }

    /**
     * Get the tenant through lease.
     * Helper to easily access tenant details.
     */
    public function getTenantAttribute()
    {
        return $this->lease ? $this->lease->tenant : null;
    }

    /**
     * Get the room through lease.
     * Helper to easily access room details.
     */
    public function getRoomAttribute()
    {
        return $this->lease ? $this->lease->room : null;
    }

    /* -------------------------------------------------------------------------- */
    /* ACCESSORS                                    */
    /* -------------------------------------------------------------------------- */

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
        return $this->transaction_date ? $this->transaction_date->format('M d, Y h:i A') : 'N/A';
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

    /**
     * Get status badge for UI.
     */
    public function getStatusBadgeAttribute(): array
    {
        $badges = [
            'Completed' => ['color' => 'success', 'label' => 'Completed'],
            'Pending' => ['color' => 'warning', 'label' => 'Pending'],
            'Cancelled' => ['color' => 'danger', 'label' => 'Cancelled'],
            'Archived' => ['color' => 'secondary', 'label' => 'Archived'],
        ];

        return $badges[$this->transaction_status] ?? ['color' => 'light', 'label' => $this->transaction_status];
    }

    /* -------------------------------------------------------------------------- */
    /* SCOPES                                    */
    /* -------------------------------------------------------------------------- */

    public function scopeCompleted($query)
    {
        return $query->where('transaction_status', 'Completed');
    }

    public function scopePending($query)
    {
        return $query->where('transaction_status', 'Pending');
    }

    public function scopeForMonth($query, $year, $month)
    {
        return $query->whereYear('payment_for_month', $year)
                     ->whereMonth('payment_for_month', $month);
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    public function scopeByMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}