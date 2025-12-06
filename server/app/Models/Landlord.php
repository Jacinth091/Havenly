<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Carbon\Carbon;

class Landlord extends Model
{
    use SoftDeletes;

    /**
     * The primary key associated with the table.
     * SQL: landlord_id INT(11)
     */
    protected $primaryKey = 'landlord_id';
    
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
     * attributes to append to array form.
     */
    protected $appends = [
        'full_name',
        'full_name_with_middle',
        'initials',
        'status',
        'formatted_contact_num',
        'properties_count',
        'active_properties_count',
        'total_rooms',
        'total_monthly_income',
    ];

    /* -------------------------------------------------------------------------- */
    /* RELATIONSHIPS                                */
    /* -------------------------------------------------------------------------- */

    /**
     * Get the user associated with the landlord.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Get the properties owned by this landlord.
     */
    public function properties(): HasMany
    {
        return $this->hasMany(Property::class, 'landlord_id', 'landlord_id');
    }

    /**
     * Get active properties owned by this landlord.
     */
    public function activeProperties(): HasMany
    {
        return $this->properties()->where('is_active', true);
    }

    /**
     * Get all rooms across all properties of this landlord.
     * OPTIMIZED: Uses HasManyThrough for better eager loading support.
     * Structure: Landlord -> Property -> Room
     */
    public function rooms(): HasManyThrough
    {
        return $this->hasManyThrough(
            Room::class,
            Property::class,
            'landlord_id', // Foreign key on properties table
            'property_id', // Foreign key on rooms table
            'landlord_id', // Local key on landlords table
            'property_id'  // Local key on properties table
        );
    }

    /**
     * Get all leases across all properties of this landlord.
     * NOTE: Laravel does not support HasManyThrough across 2 intermediate tables 
     * natively without packages. Using a query builder approach here.
     */
    public function leases()
    {
        return Lease::query()->whereHas('room.property', function ($query) {
            $query->where('landlord_id', $this->landlord_id);
        });
    }

    /**
     * Get active leases across all properties of this landlord.
     */
    public function activeLeases()
    {
        return $this->leases()
            ->where('lease_status', 'Active')
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    /* -------------------------------------------------------------------------- */
    /* ACCESSORS                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * Get the landlord's full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Get the landlord's full name with middle name.
     */
    public function getFullNameWithMiddleAttribute(): string
    {
        $middle = $this->middle_name ? ' ' . $this->middle_name . ' ' : ' ';
        return trim("{$this->first_name}{$middle}{$this->last_name}");
    }

    /**
     * Get the landlord's initials.
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
     * Get the landlord's status as a readable string.
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

    /**
     * Get total number of properties owned.
     */
    public function getPropertiesCountAttribute(): int
    {
        return $this->properties()->count();
    }

    /**
     * Get number of active properties owned.
     */
    public function getActivePropertiesCountAttribute(): int
    {
        return $this->activeProperties()->count();
    }

    /**
     * Get total number of rooms across all properties.
     */
    public function getTotalRoomsAttribute(): int
    {
        return $this->rooms()->count();
    }

    /**
     * Get total potential monthly income from all properties.
     */
    public function getTotalMonthlyIncomeAttribute(): float
    {
        return (float) $this->rooms()->sum('monthly_rent');
    }

    /**
     * Get current monthly income from occupied rooms.
     */
    public function getCurrentMonthlyIncomeAttribute(): float
    {
        return (float) $this->rooms()->where('room_status', 'Occupied')->sum('monthly_rent');
    }

    /**
     * Get occupancy rate percentage.
     */
    public function getOccupancyRateAttribute(): float
    {
        $totalRooms = $this->total_rooms;
        if ($totalRooms === 0) {
            return 0;
        }
        
        $occupiedRooms = $this->rooms()->where('room_status', 'Occupied')->count();
        return ($occupiedRooms / $totalRooms) * 100;
    }

    /* -------------------------------------------------------------------------- */
    /* SCOPES                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * Scope for active landlords.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for landlords with properties.
     */
    public function scopeHasProperties($query)
    {
        return $query->whereHas('properties');
    }

    /**
     * Scope for landlords by name search.
     */
    public function scopeSearchByName($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'LIKE', "%{$search}%")
              ->orWhere('last_name', 'LIKE', "%{$search}%")
              ->orWhere('middle_name', 'LIKE', "%{$search}%");
        });
    }

    /**
     * Scope for landlords in a specific city.
     */
    public function scopeInCity($query, $city)
    {
        return $query->whereHas('properties', function ($q) use ($city) {
            $q->where('city', $city);
        });
    }

    /* -------------------------------------------------------------------------- */
    /* HELPER METHODS                               */
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

    /**
     * Get landlord's properties summary.
     */
    public function getPropertiesSummary(): array
    {
        return [
            'total_properties' => $this->properties_count,
            'active_properties' => $this->active_properties_count,
            'total_rooms' => $this->total_rooms,
            'occupied_rooms' => $this->rooms()->where('room_status', 'Occupied')->count(),
            'available_rooms' => $this->rooms()->where('room_status', 'Available')->count(),
            'maintenance_rooms' => $this->rooms()->where('room_status', 'Maintenance')->count(),
            'occupancy_rate' => round($this->occupancy_rate, 2),
            'total_monthly_income' => $this->total_monthly_income,
            'current_monthly_income' => $this->current_monthly_income,
        ];
    }

    /**
     * Get landlord's recent transactions.
     */
    public function recentTransactions($limit = 10)
    {
        return Transaction::whereHas('lease.room.property', function ($query) {
                $query->where('landlord_id', $this->landlord_id);
            })
            ->orderBy('transaction_date', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get landlord's upcoming rent due dates.
     */
    public function upcomingDueDates($days = 30)
    {
        return $this->activeLeases()
            ->with(['tenant', 'room'])
            ->get()
            ->map(function ($lease) use ($days) {
                // Assuming Lease model has this accessor
                $dueDate = $lease->next_payment_due_date ?? Carbon::parse($lease->start_date)->addMonths(1); 
                
                $daysUntilDue = now()->diffInDays($dueDate, false);
                
                if ($daysUntilDue >= 0 && $daysUntilDue <= $days) {
                    return [
                        'lease' => $lease,
                        'due_date' => $dueDate,
                        'days_until_due' => $daysUntilDue,
                        'amount' => $lease->monthly_rent,
                    ];
                }
                
                return null;
            })
            ->filter()
            ->sortBy('days_until_due')
            ->values(); // Reset keys for JSON
    }

    /**
     * Get landlord's yearly income summary.
     */
    public function yearlyIncomeSummary($year = null)
    {
        $year = $year ?? date('Y');
        
        return Transaction::whereHas('lease.room.property', function ($query) {
                $query->where('landlord_id', $this->landlord_id);
            })
            ->where('transaction_status', 'Completed')
            ->whereYear('transaction_date', $year)
            ->selectRaw('MONTH(transaction_date) as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->mapWithKeys(function ($item) {
                return [date('F', mktime(0, 0, 0, $item->month, 1)) => $item->total];
            });
    }

    /**
     * Get landlord's payment methods summary.
     */
    public function paymentMethodsSummary()
    {
        return Transaction::whereHas('lease.room.property', function ($query) {
                $query->where('landlord_id', $this->landlord_id);
            })
            ->where('transaction_status', 'Completed')
            ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('payment_method')
            ->get();
    }
}