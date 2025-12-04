<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'transaction_id';

    protected $fillable = [
        'lease_id',
        'amount',
        'receipt_number',
        'payment_method',
        'transaction_date',
        'transaction_status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the lease associated with the transaction.
     */
    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class, 'lease_id', 'lease_id');
    }

    /**
     * Scope for completed transactions.
     */
    public function scopeCompleted($query)
    {
        return $query->where('transaction_status', 'Completed');
    }
}