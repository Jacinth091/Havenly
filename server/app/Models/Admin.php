<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Admin extends Model
{
    use SoftDeletes;

    /**
     * The primary key associated with the table.
     * SQL: admin_id INT(11)
     */
    protected $primaryKey = 'admin_id';
    
    public $incrementing = true;
    
    protected $keyType = 'int';

    /**
     * The attributes that are mass assignable.
     * Matches SQL columns exactly.
     */
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'middle_name',
        'contact_num',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Attributes to append to array form.
     */
    protected $appends = [
        'full_name',
        'full_name_with_middle',
        'initials',
        'status',
        'formatted_contact_num',
    ];

    /* -------------------------------------------------------------------------- */
    /* RELATIONSHIPS                                */
    /* -------------------------------------------------------------------------- */

    /**
     * Get the user associated with the admin.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /* -------------------------------------------------------------------------- */
    /* ACCESSORS                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * Get the admin's full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Get the admin's full name with middle name.
     */
    public function getFullNameWithMiddleAttribute(): string
    {
        $middle = $this->middle_name ? ' ' . $this->middle_name . ' ' : ' ';
        return trim("{$this->first_name}{$middle}{$this->last_name}");
    }

    /**
     * Get the admin's initials.
     */
    public function getInitialsAttribute(): string
    {
        $initials = strtoupper(substr($this->first_name, 0, 1));
        
        if ($this->middle_name) {
            $initials .= strtoupper(substr($this->middle_name, 0, 1));
        }
        
        $initials .= strtoupper(substr($this->last_name, 0, 1));
        
        return $initials;
    }

    /**
     * Get the admin's status as a readable string.
     */
    public function getStatusAttribute(): string
    {
        if ($this->trashed()) {
            return 'Deleted';
        }
        
        return $this->is_active ? 'Active' : 'Inactive';
    }

    /**
     * Get formatted contact number.
     */
    public function getFormattedContactNumAttribute(): string
    {
        if (!$this->contact_num) {
            return 'Not set';
        }

        // Format Philippine phone numbers (assuming +63 or 0 prefix)
        $number = preg_replace('/\D/', '', $this->contact_num);
        
        if (strlen($number) === 10 && str_starts_with($number, '9')) {
            return '+63 ' . substr($number, 0, 3) . ' ' . substr($number, 3, 3) . ' ' . substr($number, 6);
        }
        
        if (strlen($number) === 11 && str_starts_with($number, '09')) {
            return '+63 ' . substr($number, 1, 3) . ' ' . substr($number, 4, 3) . ' ' . substr($number, 7);
        }
        
        return $this->contact_num;
    }

    /* -------------------------------------------------------------------------- */
    /* SCOPES                                    */
    /* -------------------------------------------------------------------------- */

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    public function scopeByName($query, $name)
    {
        return $query->where(function ($q) use ($name) {
            $q->where('first_name', 'LIKE', "%{$name}%")
              ->orWhere('last_name', 'LIKE', "%{$name}%")
              ->orWhere('middle_name', 'LIKE', "%{$name}%");
        });
    }

    /* -------------------------------------------------------------------------- */
    /* ACTIONS                                    */
    /* -------------------------------------------------------------------------- */

    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    public function isActive(): bool
    {
        return $this->is_active && !$this->trashed();
    }
}