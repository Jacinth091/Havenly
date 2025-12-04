<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Room extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'room_id';

    protected $fillable = [
        'property_id',
        'room_number',
        'monthly_rent',
        'room_type',
        'room_capacity',
        'room_status',
        'utilities_included',
        'photo_url',
        'room_description',
    ];

    protected $casts = [
        'monthly_rent' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the property that owns the room.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id', 'property_id');
    }

    /**
     * Get the leases for the room.
     */
    public function leases(): HasMany
    {
        return $this->hasMany(Lease::class, 'room_id', 'room_id');
    }

    /**
     * Get the current active lease for the room.
     */
    public function currentLease(): HasOne
    {
        return $this->hasOne(Lease::class, 'room_id', 'room_id')
                    ->where('lease_status', 'Active')
                    ->latest();
    }
}