<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'property_id';

    protected $fillable = [
        'landlord_id',
        'property_name',
        'address',
        'city',
        'total_rooms',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the landlord that owns the property.
     */
    public function landlord(): BelongsTo
    {
        return $this->belongsTo(Landlord::class, 'landlord_id', 'landlord_id');
    }

    /**
     * Get the rooms for the property.
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'property_id', 'property_id');
    }

    /**
     * Get available rooms for the property.
     */
    public function availableRooms()
    {
        return $this->rooms()->where('room_status', 'Available');
    }

    /**
     * Get occupied rooms for the property.
     */
    public function occupiedRooms()
    {
        return $this->rooms()->where('room_status', 'Occupied');
    }
}