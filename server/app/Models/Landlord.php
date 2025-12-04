<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Landlord extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'landlord_id';

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
     * Get the user associated with the landlord.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Get the properties for the landlord.
     */
    public function properties(): HasMany
    {
        return $this->hasMany(Property::class, 'landlord_id', 'landlord_id');
    }
}