<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'tenant_id';

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'middle_name',
        'contact_num',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the user associated with the tenant.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Get the leases for the tenant.
     */
    public function leases(): HasMany
    {
        return $this->hasMany(Lease::class, 'tenant_id', 'tenant_id');
    }

    /**
     * Get the current active lease for the tenant.
     */
    public function currentLease()
    {
        return $this->leases()->where('lease_status', 'Active')->first();
    }
}