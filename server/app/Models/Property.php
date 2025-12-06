<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class Property extends Model
{
    use SoftDeletes;

    /**
     * The primary key associated with the table.
     * SQL: property_id INT(11)
     */
    protected $primaryKey = 'property_id';
    
    public $incrementing = true;
    
    protected $keyType = 'int';

    /**
     * The attributes that are mass assignable.
     * Matches SQL columns exactly.
     */
    protected $fillable = [
        'landlord_id',
        'property_name',
        'address',
        'city',
        'total_rooms',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'total_rooms' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * attributes to append to array form.
     */
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

    /* -------------------------------------------------------------------------- */
    /* RELATIONSHIPS                                */
    /* -------------------------------------------------------------------------- */

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
     * Property -> Room -> Lease
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
            ->where('leases.is_active', true)
            ->where('rooms.is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    /**
     * Get transactions through leases.
     * Property -> Room -> Lease -> Transaction
     * Note: HasManyThrough only supports one level deep natively. 
     * Using WhereHas query for deeper relationships.
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

    /* -------------------------------------------------------------------------- */
    /* ACCESSORS                                    */
    /* -------------------------------------------------------------------------- */

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
        return (float) $this->rooms()->sum('monthly_rent');
    }

    /**
     * Get current monthly income (occupied rooms only).
     */
    public function getCurrentMonthlyIncomeAttribute(): float
    {
        return (float) $this->occupiedRooms()->sum('monthly_rent');
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
        
        $occupancyRate = $this->occupancy_rate;

        if ($occupancyRate >= 90) {
            return 'Full';
        }
        
        if ($occupancyRate >= 50) {
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
        // Using Collection methods after eager loading
        return $this->activeLeases()->with('tenant')->get()->pluck('tenant');
    }

    /* -------------------------------------------------------------------------- */
    /* HELPER METHODS                               */
    /* -------------------------------------------------------------------------- */

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
            'average_monthly_income' => $byMonth->avg('total') ?? 0,
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
        return (float) $this->transactions()
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
                // Ensure Lease model has payment_status accessor
                return isset($lease->payment_status) && $lease->payment_status === 'Overdue';
            })
            ->map(function ($lease) {
                return [
                    'lease' => $lease,
                    'tenant' => $lease->tenant->full_name ?? 'Unknown',
                    'room' => $lease->room->room_number ?? 'N/A',
                    'amount_due' => $lease->balance ?? 0,
                    'days_overdue' => isset($lease->days_until_due) ? abs($lease->days_until_due) : 0,
                ];
            })
            ->values();
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
                // Ensure Lease model has remaining_days accessor
                $remaining = $lease->remaining_days ?? 999;
                return $remaining <= $days && $remaining > 0;
            })
            ->sortBy('remaining_days')
            ->values();
    }

    /* -------------------------------------------------------------------------- */
    /* SCOPES                                    */
    /* -------------------------------------------------------------------------- */

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeHasAvailableRooms($query)
    {
        return $query->whereHas('rooms', function ($q) {
            $q->where('room_status', 'Available')->where('rooms.is_active', true);
        });
    }

    public function scopeInCity($query, $city)
    {
        return $query->where('city', $city);
    }

    public function scopeByLandlord($query, $landlordId)
    {
        return $query->where('landlord_id', $landlordId);
    }

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

    public function scopeHighOccupancy($query)
    {
        // Using >= 80% occupancy threshold
        return $query->whereHas('rooms', function ($q) {
            $q->where('room_status', 'Occupied');
        }, '>=', DB::raw('total_rooms * 0.8'));
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

    /**
     * Get property dashboard statistics.
     */
    public function getDashboardStats(): array
    {
        $overdue = $this->getOverduePayments();
        $expiring = $this->getUpcomingExpirations(30);

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
                'overdue_payments' => $overdue->count(),
                'expiring_soon' => $expiring->count(),
            ],
        ];
    }

    /**
     * Add a new room to the property.
     */
    public function addRoom(array $roomData): Room
    {
        $roomData['property_id'] = $this->property_id;
        // Ensure you create using the relationship or Room model
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
                DATE_FORMAT(transaction_date, '{$format}') as date_label,
                SUM(amount) as total,
                COUNT(*) as count
            ")
            ->where('transaction_status', 'Completed')
            ->groupBy('date_label')
            ->orderBy('date_label', 'desc')
            ->limit($limit)
            ->get()
            ->reverse();
        
        return [
            'labels' => $transactions->pluck('date_label'),
            'income' => $transactions->pluck('total'),
            'transactions' => $transactions->pluck('count'),
        ];
    }

    /**
     * Get average room rent.
     */
    public function getAverageRoomRent(): float
    {
        return (float) $this->rooms()->avg('monthly_rent') ?? 0;
    }
}