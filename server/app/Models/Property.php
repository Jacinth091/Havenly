<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Facades\DB;
class Property extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'property_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'landlord_id',
        'property_name',
        'address',
        'city',
        'total_rooms',
        'is_active',
    ];

    protected $casts = [
        'total_rooms' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Append these computed attributes
    protected $appends = [
        'full_address',
        'available_rooms_count',
        'occupied_rooms_count',
        'maintenance_rooms_count',
        'occupancy_rate',
        'total_monthly_rent',
        'current_monthly_income',
        'total_tenants',
        'active_leases_count',
        'status',
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
     * Get leases through rooms.
     */
    public function leases(): HasManyThrough
    {
        return $this->hasManyThrough(
            Lease::class,
            Room::class,
            'property_id', // Foreign key on rooms table
            'room_id',     // Foreign key on leases table
            'property_id', // Local key on properties table
            'room_id'      // Local key on rooms table
        );
    }

    /**
     * Get active leases.
     */
    public function activeLeases()
    {
        return $this->leases()
            ->where('lease_status', 'Active')
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    /**
     * Get transactions through leases.
     */
    public function transactions()
    {
        return Transaction::whereHas('lease.room', function ($query) {
            $query->where('property_id', $this->property_id);
        });
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

    /**
     * Get rooms under maintenance.
     */
    public function maintenanceRooms()
    {
        return $this->rooms()->where('room_status', 'Maintenance');
    }

    /**
     * Get the property's full address.
     */
    public function getFullAddressAttribute(): string
    {
        return "{$this->address}, {$this->city}";
    }

    /**
     * Get number of available rooms.
     */
    public function getAvailableRoomsCountAttribute(): int
    {
        return $this->availableRooms()->count();
    }

    /**
     * Get number of occupied rooms.
     */
    public function getOccupiedRoomsCountAttribute(): int
    {
        return $this->occupiedRooms()->count();
    }

    /**
     * Get number of rooms under maintenance.
     */
    public function getMaintenanceRoomsCountAttribute(): int
    {
        return $this->maintenanceRooms()->count();
    }

    /**
     * Get occupancy rate percentage.
     */
    public function getOccupancyRateAttribute(): float
    {
        if ($this->total_rooms === 0) {
            return 0;
        }
        
        $occupied = $this->occupied_rooms_count;
        return ($occupied / $this->total_rooms) * 100;
    }

    /**
     * Get total monthly rent potential (all rooms).
     */
    public function getTotalMonthlyRentAttribute(): float
    {
        return $this->rooms()->sum('monthly_rent');
    }

    /**
     * Get current monthly income (occupied rooms only).
     */
    public function getCurrentMonthlyIncomeAttribute(): float
    {
        return $this->occupiedRooms()->sum('monthly_rent');
    }

    /**
     * Get total number of tenants in the property.
     */
    public function getTotalTenantsAttribute(): int
    {
        return $this->activeLeases()->count();
    }

    /**
     * Get number of active leases.
     */
    public function getActiveLeasesCountAttribute(): int
    {
        return $this->activeLeases()->count();
    }

    /**
     * Get property status.
     */
    public function getStatusAttribute(): string
    {
        if ($this->trashed()) {
            return 'Deleted';
        }
        
        if (!$this->is_active) {
            return 'Inactive';
        }
        
        if ($this->occupancy_rate >= 90) {
            return 'Full';
        }
        
        if ($this->occupancy_rate >= 50) {
            return 'High Occupancy';
        }
        
        if ($this->available_rooms_count > 0) {
            return 'Available';
        }
        
        return 'No Available Rooms';
    }

    /**
     * Get all tenants in the property.
     */
    public function tenants()
    {
        return Tenant::whereHas('leases.room', function ($query) {
            $query->where('property_id', $this->property_id);
        });
    }

    /**
     * Get current tenants (with active leases).
     */
    public function currentTenants()
    {
        return $this->activeLeases()->with('tenant')->get()->pluck('tenant');
    }

    /**
     * Get property financial summary.
     */
    public function getFinancialSummary($startDate = null, $endDate = null): array
    {
        $query = $this->transactions()->where('transaction_status', 'Completed');
        
        if ($startDate && $endDate) {
            $query->whereBetween('transaction_date', [$startDate, $endDate]);
        }
        
        $totalIncome = $query->sum('amount');
        $transactionCount = $query->count();
        
        $byMonth = $query->selectRaw('DATE_FORMAT(transaction_date, "%Y-%m") as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();
        
        $byMethod = $query->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('payment_method')
            ->get();
        
        return [
            'total_income' => $totalIncome,
            'transaction_count' => $transactionCount,
            'average_monthly_income' => $byMonth->avg('total'),
            'by_month' => $byMonth,
            'by_method' => $byMethod,
            'current_month_income' => $this->getMonthIncome(now()->year, now()->month),
            'last_month_income' => $this->getMonthIncome(now()->subMonth()->year, now()->subMonth()->month),
        ];
    }

    /**
     * Get income for specific month.
     */
    public function getMonthIncome($year, $month): float
    {
        return $this->transactions()
            ->where('transaction_status', 'Completed')
            ->whereYear('transaction_date', $year)
            ->whereMonth('transaction_date', $month)
            ->sum('amount');
    }

    /**
     * Get overdue payments.
     */
    public function getOverduePayments()
    {
        return $this->activeLeases()
            ->with(['tenant', 'room'])
            ->get()
            ->filter(function ($lease) {
                return $lease->payment_status === 'Overdue';
            })
            ->map(function ($lease) {
                return [
                    'lease' => $lease,
                    'tenant' => $lease->tenant->full_name,
                    'room' => $lease->room->room_number,
                    'amount_due' => $lease->balance,
                    'days_overdue' => abs($lease->days_until_due),
                ];
            });
    }

    /**
     * Get upcoming lease expirations.
     */
    public function getUpcomingExpirations($days = 30)
    {
        return $this->activeLeases()
            ->with(['tenant', 'room'])
            ->get()
            ->filter(function ($lease) use ($days) {
                return $lease->remaining_days <= $days && $lease->remaining_days > 0;
            })
            ->sortBy('remaining_days');
    }

    /**
     * Get maintenance requests (if you have a maintenance_requests table).
     */
    public function maintenanceRequests()
    {
        // Assuming you have a MaintenanceRequest model
        // return $this->hasMany(MaintenanceRequest::class, 'property_id', 'property_id');
        return collect(); // Placeholder
    }

    /**
     * Scope for active properties.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for properties with available rooms.
     */
    public function scopeHasAvailableRooms($query)
    {
        return $query->whereHas('rooms', function ($q) {
            $q->where('room_status', 'Available')->where('is_active', true);
        });
    }

    /**
     * Scope for properties in a specific city.
     */
    public function scopeInCity($query, $city)
    {
        return $query->where('city', $city);
    }

    /**
     * Scope for properties by landlord.
     */
    public function scopeByLandlord($query, $landlordId)
    {
        return $query->where('landlord_id', $landlordId);
    }

    /**
     * Scope for properties by search term.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('property_name', 'LIKE', "%{$search}%")
              ->orWhere('address', 'LIKE', "%{$search}%")
              ->orWhere('city', 'LIKE', "%{$search}%")
              ->orWhereHas('landlord', function ($q2) use ($search) {
                  $q2->where('first_name', 'LIKE', "%{$search}%")
                     ->orWhere('last_name', 'LIKE', "%{$search}%");
              });
        });
    }

    /**
     * Scope for properties with high occupancy (>= 80%).
     */
    public function scopeHighOccupancy($query)
    {
        return $query->whereHas('rooms', function ($q) {
            $q->where('room_status', 'Occupied');
        }, '>=', DB::raw('total_rooms * 0.8'));
    }

    /**
     * Activate the property.
     */
    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    /**
     * Deactivate the property.
     */
    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Check if property is active.
     */
    public function isActive(): bool
    {
        return $this->is_active && !$this->trashed();
    }

    /**
     * Get property dashboard statistics.
     */
    public function getDashboardStats(): array
    {
        return [
            'rooms' => [
                'total' => $this->total_rooms,
                'available' => $this->available_rooms_count,
                'occupied' => $this->occupied_rooms_count,
                'maintenance' => $this->maintenance_rooms_count,
                'occupancy_rate' => round($this->occupancy_rate, 2),
            ],
            'financial' => [
                'total_rent_potential' => $this->total_monthly_rent,
                'current_income' => $this->current_monthly_income,
                'year_to_date_income' => $this->getFinancialSummary(
                    now()->startOfYear(),
                    now()
                )['total_income'],
            ],
            'tenants' => [
                'total' => $this->total_tenants,
                'active_leases' => $this->active_leases_count,
                'overdue_payments' => $this->getOverduePayments()->count(),
                'expiring_soon' => $this->getUpcomingExpirations(30)->count(),
            ],
        ];
    }

    /**
     * Add a new room to the property.
     */
    public function addRoom(array $roomData): Room
    {
        $roomData['property_id'] = $this->property_id;
        return Room::create($roomData);
    }

    /**
     * Update total rooms count based on actual rooms.
     */
    public function updateTotalRoomsCount(): void
    {
        $actualCount = $this->rooms()->count();
        if ($this->total_rooms !== $actualCount) {
            $this->update(['total_rooms' => $actualCount]);
        }
    }


    /**
     * Get property performance over time.
     */
    public function getPerformanceOverTime($period = 'monthly', $limit = 12): array
    {
        $format = $period === 'monthly' ? '%Y-%m' : '%Y-%m-%d';
        $groupBy = $period === 'monthly' ? 'month' : 'day';
        
        $transactions = $this->transactions()
            ->selectRaw("
                DATE_FORMAT(transaction_date, '{$format}') as {$groupBy},
                SUM(amount) as total,
                COUNT(*) as count
            ")
            ->where('transaction_status', 'Completed')
            ->groupBy($groupBy)
            ->orderBy($groupBy, 'desc')
            ->limit($limit)
            ->get()
            ->reverse();
        
        return [
            'labels' => $transactions->pluck($groupBy),
            'income' => $transactions->pluck('total'),
            'transactions' => $transactions->pluck('count'),
        ];
    }

    /**
     * Get room type distribution.
     */
    public function getRoomTypeDistribution()
    {
        // If you have a room_type column in rooms table
        return $this->rooms()
            ->select('room_type', DB::raw('COUNT(*) as count'))
            ->groupBy('room_type')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->room_type => $item->count];
            });
    }

    /**
     * Get average room rent.
     */
    public function getAverageRoomRent(): float
    {
        return $this->rooms()->avg('monthly_rent') ?? 0;
    }

    /**
     * Get property rating (if you have a reviews/ratings system).
     */
    public function getAverageRating(): float
    {
        // Assuming you have a PropertyReview model
        // return $this->reviews()->avg('rating') ?? 0;
        return 0; // Placeholder
    }

    /**
     * Get property expenses (if you have an expenses table).
     */
    public function getTotalExpenses($startDate = null, $endDate = null): float
    {
        // Assuming you have a PropertyExpense model
        // $query = $this->expenses();
        // if ($startDate && $endDate) {
        //     $query->whereBetween('date', [$startDate, $endDate]);
        // }
        // return $query->sum('amount');
        return 0; // Placeholder
    }
}