<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lease extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'lease_id';

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
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'monthly_rent' => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'early_termination_fee' => 'decimal:2',
        'contract_signed_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

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
     * Scope for active leases.
     */
    public function scopeActive($query)
    {
        return $query->where('lease_status', 'Active');
    }

    /**
     * Scope for expired leases.
     */
    public function scopeExpired($query)
    {
        return $query->where('lease_status', 'Expired');
    }
}