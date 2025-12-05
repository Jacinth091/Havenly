<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Room extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'room_id';
    public $incrementing = true;
    protected $keyType = 'int';

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
        'is_active',
    ];

    protected $casts = [
        'monthly_rent' => 'decimal:2',
        'room_capacity' => 'integer',
        'utilities_included' => 'boolean',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Append these computed attributes
    protected $appends = [
        'is_available',
        'is_occupied',
        'is_under_maintenance',
        'formatted_rent',
        'utilities_list',
        'current_tenant',
        'lease_history_count',
        'occupancy_percentage',
        'days_vacant',
        'next_available_date',
        'room_features',
        'status_badge',
        'photo_url_full',
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
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->latest();
    }

    /**
     * Get all active leases (including upcoming).
     */
    public function activeLeases(): HasMany
    {
        return $this->leases()
            ->where('lease_status', 'Active')
            ->where('is_active', true);
    }

    /**
     * Get completed leases.
     */
    public function completedLeases(): HasMany
    {
        return $this->leases()
            ->whereIn('lease_status', ['Expired', 'Terminated', 'Archived']);
    }

    /**
     * Get upcoming lease (if room is booked but not yet occupied).
     */
    public function upcomingLease(): HasOne
    {
        return $this->hasOne(Lease::class, 'room_id', 'room_id')
            ->where('lease_status', 'Active')
            ->where('is_active', true)
            ->where('start_date', '>', now())
            ->latest();
    }

    /**
     * Get transactions through leases.
     */
    public function transactions()
    {
        return Transaction::whereHas('lease', function ($query) {
            $query->where('room_id', $this->room_id);
        });
    }

    /**
     * Get maintenance requests for the room.
     */
    public function maintenanceRequests()
    {
        // Assuming you have a MaintenanceRequest model
        // return $this->hasMany(MaintenanceRequest::class, 'room_id', 'room_id');
        return collect(); // Placeholder
    }

    /**
     * Check if room is available.
     */
    public function getIsAvailableAttribute(): bool
    {
        return $this->room_status === 'Available' && $this->is_active;
    }

    /**
     * Check if room is occupied.
     */
    public function getIsOccupiedAttribute(): bool
    {
        return $this->room_status === 'Occupied';
    }

    /**
     * Check if room is under maintenance.
     */
    public function getIsUnderMaintenanceAttribute(): bool
    {
        return $this->room_status === 'Maintenance';
    }

    /**
     * Get formatted monthly rent.
     */
    public function getFormattedRentAttribute(): string
    {
        return '₱' . number_format($this->monthly_rent, 2);
    }

    /**
     * Get utilities included as an array.
     */
    public function getUtilitiesListAttribute(): array
    {
        if (!$this->utilities_included) {
            return [];
        }

        // If utilities_included is a JSON string or array, parse it
        if (is_string($this->utilities_included)) {
            $utilities = json_decode($this->utilities_included, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $utilities;
            }
        }

        // Default utilities if stored as boolean true
        return ['Electricity', 'Water', 'Internet'];
    }

    /**
     * Get current tenant (if room is occupied).
     */
    public function getCurrentTenantAttribute()
    {
        if (!$this->is_occupied) {
            return null;
        }

        $lease = $this->currentLease;
        return $lease ? $lease->tenant : null;
    }

    /**
     * Get number of lease history entries.
     */
    public function getLeaseHistoryCountAttribute(): int
    {
        return $this->completedLeases()->count();
    }

    /**
     * Get occupancy percentage (time occupied vs total time).
     */
    public function getOccupancyPercentageAttribute(): float
    {
        $createdAt = $this->created_at ?? Carbon::now()->subYear();
        $totalDays = $createdAt->diffInDays(now());
        
        if ($totalDays === 0) {
            return 0;
        }

        $occupiedDays = $this->leases()
            ->where('lease_status', 'Active')
            ->get()
            ->sum(function ($lease) use ($createdAt) {
                // Ensure we have Carbon instances
                $start = $lease->start_date instanceof Carbon ? $lease->start_date : Carbon::parse($lease->start_date);
                $end = $lease->end_date instanceof Carbon ? $lease->end_date : Carbon::parse($lease->end_date);

                // Bound start and end to the createdAt and now ranges
                $start = $start->greaterThan($createdAt) ? $start : $createdAt;
                $end = $end->lessThan(now()) ? $end : now();

                // If the interval is invalid or zero-length, count as 0
                if ($end->lessThanOrEqualTo($start)) {
                    return 0;
                }

                return $start->diffInDays($end);
            });

        return ($occupiedDays / $totalDays) * 100;
    }

    /**
     * Get days vacant since last tenant.
     */
    public function getDaysVacantAttribute(): int
    {
        if ($this->is_occupied) {
            return 0;
        }

        $lastLease = $this->completedLeases()
            ->orderBy('end_date', 'desc')
            ->first();

        if (!$lastLease) {
            return $this->created_at ? $this->created_at->diffInDays(now()) : 0;
        }

        return $lastLease->end_date->diffInDays(now());
    }

    /**
     * Get next available date (if room has upcoming lease).
     */
    public function getNextAvailableDateAttribute(): ?Carbon
    {
        if ($this->is_available) {
            return now();
        }

        if ($this->is_under_maintenance) {
            // Check maintenance end date if you have it
            return null;
        }

        $upcomingLease = $this->upcomingLease;
        if ($upcomingLease) {
            return null; // Room is booked for future
        }

        $currentLease = $this->currentLease;
        if ($currentLease) {
            return $currentLease->end_date;
        }

        return null;
    }

    /**
     * Get room features based on type and description.
     */
    public function getRoomFeaturesAttribute(): array
    {
        $features = [];

        if ($this->room_type) {
            $features[] = ucfirst($this->room_type);
        }

        if ($this->room_capacity) {
            $features[] = "Capacity: {$this->room_capacity} person" . ($this->room_capacity > 1 ? 's' : '');
        }

        if ($this->utilities_included) {
            $features[] = 'Utilities included';
        }

        // Add features from description (simple parsing)
        if ($this->room_description) {
            $keywords = ['aircon', 'wifi', 'kitchen', 'bathroom', 'balcony', 'furnished'];
            foreach ($keywords as $keyword) {
                if (stripos($this->room_description, $keyword) !== false) {
                    $features[] = ucfirst($keyword);
                }
            }
        }

        return array_unique($features);
    }

    /**
     * Get status badge for UI display.
     */
    public function getStatusBadgeAttribute(): array
    {
        $statuses = [
            'Available' => ['color' => 'success', 'icon' => 'check-circle'],
            'Occupied' => ['color' => 'primary', 'icon' => 'user-check'],
            'Maintenance' => ['color' => 'warning', 'icon' => 'tools'],
        ];

        $status = $this->room_status;
        $badge = $statuses[$status] ?? ['color' => 'secondary', 'icon' => 'question-circle'];

        if (!$this->is_active) {
            $badge = ['color' => 'danger', 'icon' => 'ban'];
        } elseif ($this->trashed()) {
            $badge = ['color' => 'dark', 'icon' => 'trash'];
        }

        return $badge;
    }

    /**
     * Get full photo URL with default fallback.
     */
    public function getPhotoUrlFullAttribute(): string
    {
        if ($this->photo_url) {
            return asset('storage/' . $this->photo_url);
        }

        // Return default room image based on type
        $defaultImages = [
            'studio' => 'default-studio.jpg',
            'apartment' => 'default-apartment.jpg',
            'bedroom' => 'default-bedroom.jpg',
            'suite' => 'default-suite.jpg',
        ];

        $image = $defaultImages[strtolower($this->room_type)] ?? 'default-room.jpg';
        return asset('images/' . $image);
    }

    /**
     * Scope for available rooms.
     */
    public function scopeAvailable($query)
    {
        return $query->where('room_status', 'Available')->where('is_active', true);
    }

    /**
     * Scope for occupied rooms.
     */
    public function scopeOccupied($query)
    {
        return $query->where('room_status', 'Occupied');
    }

    /**
     * Scope for rooms under maintenance.
     */
    public function scopeMaintenance($query)
    {
        return $query->where('room_status', 'Maintenance');
    }

    /**
     * Scope for active rooms.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for rooms in a specific property.
     */
    public function scopeInProperty($query, $propertyId)
    {
        return $query->where('property_id', $propertyId);
    }

    /**
     * Scope for rooms by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('room_type', $type);
    }

    /**
     * Scope for rooms within rent range.
     */
    public function scopeRentBetween($query, $min, $max)
    {
        return $query->whereBetween('monthly_rent', [$min, $max]);
    }

    /**
     * Scope for rooms with utilities included.
     */
    public function scopeWithUtilities($query)
    {
        return $query->where('utilities_included', true);
    }

    /**
     * Scope for rooms by search term.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('room_number', 'LIKE', "%{$search}%")
              ->orWhere('room_type', 'LIKE', "%{$search}%")
              ->orWhere('room_description', 'LIKE', "%{$search}%")
              ->orWhereHas('property', function ($q2) use ($search) {
                  $q2->where('property_name', 'LIKE', "%{$search}%")
                     ->orWhere('address', 'LIKE', "%{$search}%")
                     ->orWhere('city', 'LIKE', "%{$search}%");
              });
        });
    }

    /**
     * Mark room as available.
     */
    public function markAsAvailable(): bool
    {
        return $this->update([
            'room_status' => 'Available',
            'is_active' => true,
        ]);
    }

    /**
     * Mark room as occupied.
     */
    public function markAsOccupied(): bool
    {
        return $this->update(['room_status' => 'Occupied']);
    }

    /**
     * Mark room as under maintenance.
     */
    public function markAsMaintenance(string $reason = null): bool
    {
        $update = ['room_status' => 'Maintenance'];
        
        if ($reason) {
            // Add maintenance note to description
            $this->room_description .= "\n[Maintenance: " . now()->format('Y-m-d') . "] " . $reason;
            $update['room_description'] = $this->room_description;
        }
        
        return $this->update($update);
    }

    /**
     * Activate the room.
     */
    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    /**
     * Deactivate the room.
     */
    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    /**
     * Check if room is currently rentable.
     */
    public function isRentable(): bool
    {
        return $this->is_available && 
               $this->is_active && 
               !$this->trashed() &&
               $this->monthly_rent > 0;
    }

    /**
     * Get room occupancy history.
     */
    public function getOccupancyHistory($limit = 12): array
    {
        $leases = $this->leases()
            ->with('tenant')
            ->orderBy('start_date', 'desc')
            ->limit($limit)
            ->get();

        return $leases->map(function ($lease) {
            return [
                'tenant' => $lease->tenant->full_name,
                'start_date' => $lease->start_date->format('Y-m-d'),
                'end_date' => $lease->end_date->format('Y-m-d'),
                'duration' => $lease->total_months . ' months',
                'monthly_rent' => $lease->formatted_rent,
                'status' => $lease->lease_status,
            ];
        })->toArray();
    }

    /**
     * Get room financial summary.
     */
    public function getFinancialSummary(): array
    {
        $totalIncome = $this->transactions()
            ->where('transaction_status', 'Completed')
            ->sum('amount');

        $currentYearIncome = $this->transactions()
            ->where('transaction_status', 'Completed')
            ->whereYear('transaction_date', date('Y'))
            ->sum('amount');

        $averageMonthly = $this->leases()
            ->where('lease_status', 'Active')
            ->avg('monthly_rent');

        return [
            'total_income' => $totalIncome,
            'current_year_income' => $currentYearIncome,
            'average_monthly_rent' => $averageMonthly ?? $this->monthly_rent,
            'current_rent' => $this->monthly_rent,
            'occupancy_rate' => round($this->occupancy_percentage, 2),
            'days_vacant' => $this->days_vacant,
        ];
    }

    /**
     * Update room utilities.
     */
    public function updateUtilities(array $utilities): bool
    {
        $this->utilities_included = json_encode($utilities);
        return $this->save();
    }

    /**
     * Check if room has specific utility.
     */
    public function hasUtility(string $utility): bool
    {
        return in_array($utility, $this->utilities_list);
    }

    /**
     * Get next room number suggestion for the property.
     */
    public static function getNextRoomNumber($propertyId): string
    {
        $lastRoom = self::where('property_id', $propertyId)
            ->orderByRaw('CAST(room_number AS UNSIGNED) DESC')
            ->first();

        if (!$lastRoom) {
            return '101';
        }

        // Extract numeric part and increment
        preg_match('/(\d+)/', $lastRoom->room_number, $matches);
        $lastNumber = $matches[1] ?? 0;
        
        return (string)($lastNumber + 1);
    }
}