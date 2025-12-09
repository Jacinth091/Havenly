<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Carbon\Carbon;

class Tenant extends Model
{
    use SoftDeletes;

    /**
     * The primary key associated with the table.
     * SQL: tenant_id INT(11)
     */
    protected $primaryKey = 'tenant_id';
    
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
        'has_active_lease',
        'current_room',         // Derived from relationship
        'current_property',     // Derived from relationship
        'total_leases',
        'total_paid',
        'outstanding_balance',
        'payment_status',
        'lease_history_count',
        'average_stay_months',
        'is_good_tenant',
        'next_payment_due',
        'days_overdue',
    ];

    /* -------------------------------------------------------------------------- */
    /* RELATIONSHIPS                                */
    /* -------------------------------------------------------------------------- */

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
    public function currentLease(): HasOne
    {
        return $this->hasOne(Lease::class, 'tenant_id', 'tenant_id')
            ->where('lease_status', 'Active')
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->latest();
    }

    /**
     * Get all active leases (including upcoming).
     */
    public function activeLeases()
    {
        return $this->leases()
            ->where('lease_status', 'Active')
            ->where('is_active', true);
    }

    /**
     * Get completed leases.
     */
    public function completedLeases()
    {
        return $this->leases()
            ->whereIn('lease_status', ['Expired', 'Terminated', 'Archived']);
    }

    /**
     * Get upcoming lease (booked but not started).
     */
    public function upcomingLease(): HasOne
    {
        return $this->hasOne(Lease::class, 'tenant_id', 'tenant_id')
            ->where('lease_status', 'Active')
            ->where('is_active', true)
            ->where('start_date', '>', now())
            ->latest();
    }

    /**
     * Get transactions through leases.
     * Note: Requires HasManyThrough logic manually or via whereHas due to structure.
     */
    public function transactions()
    {
        return Transaction::whereHas('lease', function ($query) {
            $query->where('tenant_id', $this->tenant_id);
        });
    }

    /* -------------------------------------------------------------------------- */
    /* ACCESSORS                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * Get tenant's full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Get tenant's full name with middle name.
     */
    public function getFullNameWithMiddleAttribute(): string
    {
        $middle = $this->middle_name ? ' ' . $this->middle_name . ' ' : ' ';
        return trim("{$this->first_name}{$middle}{$this->last_name}");
    }

    /**
     * Get tenant's initials.
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
     * Get tenant's status as a readable string.
     */
    public function getStatusAttribute(): string
    {
        if ($this->trashed()) {
            return 'Deleted';
        }
        
        if (!$this->is_active) {
            return 'Inactive';
        }
        
        return $this->has_active_lease ? 'Active Tenant' : 'No Active Lease';
    }

    /**
     * Get formatted contact number.
     */
    public function getFormattedContactNumAttribute(): string
    {
        return $this->formatPhoneNumber($this->contact_num);
    }

    /**
     * Check if tenant has an active lease.
     */
    public function getHasActiveLeaseAttribute(): bool
    {
        // Use loaded relationship if available to avoid N+1
        if ($this->relationLoaded('currentLease')) {
             return $this->currentLease !== null;
        }
        return $this->currentLease()->exists();
    }

    /**
     * Get current room (if tenant has active lease).
     */
    public function getCurrentRoomAttribute()
    {
        $currentLease = $this->currentLease;
        return $currentLease ? $currentLease->room : null;
    }

    /**
     * Get current property (if tenant has active lease).
     */
    public function getCurrentPropertyAttribute()
    {
        $currentRoom = $this->current_room;
        return $currentRoom ? $currentRoom->property : null;
    }

    /**
     * Get total number of leases.
     */
    public function getTotalLeasesAttribute(): int
    {
        return $this->leases()->count();
    }

    /**
     * Get total amount paid by tenant.
     */
    public function getTotalPaidAttribute(): float
    {
        return (float) $this->transactions()
            ->where('transaction_status', 'Completed')
            ->sum('amount');
    }

    /**
     * Get outstanding balance.
     */
    public function getOutstandingBalanceAttribute(): float
    {
        $balance = 0;
        
        // This relies on Lease model having a 'balance' attribute
        foreach ($this->activeLeases()->get() as $lease) {
            $balance += $lease->balance ?? 0;
        }
        
        return (float) $balance;
    }

    /**
     * Get payment status.
     */
    public function getPaymentStatusAttribute(): string
    {
        if ($this->outstanding_balance <= 0) {
            return 'Paid Up';
        }
        
        $currentLease = $this->currentLease;
        if ($currentLease) {
            // Assuming Lease model has payment_status logic
            return $currentLease->payment_status ?? 'Pending';
        }
        
        return 'No Active Lease';
    }

    /**
     * Get number of completed leases.
     */
    public function getLeaseHistoryCountAttribute(): int
    {
        return $this->completedLeases()->count();
    }

    /**
     * Get average stay duration in months.
     */
    public function getAverageStayMonthsAttribute(): float
    {
        $completedLeases = $this->completedLeases()->get();
        
        if ($completedLeases->isEmpty()) {
            return 0;
        }
        
        // Assuming Lease model calculates 'total_months'
        $totalMonths = $completedLeases->sum(function ($lease) {
            return $lease->total_months ?? 0;
        });
        
        return $totalMonths / $completedLeases->count();
    }

    /**
     * Check if tenant is considered "good".
     */
    public function getIsGoodTenantAttribute(): bool
    {
        if (!$this->is_active || $this->trashed()) {
            return false;
        }
        
        // Check for overdue payments
        if ($this->payment_status === 'Overdue') {
            return false;
        }
        
        // Check for terminated leases
        $terminatedLeases = $this->leases()->where('lease_status', 'Terminated')->count();
        if ($terminatedLeases > 0) {
            return false;
        }
        
        return true;
    }

    /**
     * Get next payment due date.
     */
    public function getNextPaymentDueAttribute(): ?Carbon
    {
        $currentLease = $this->currentLease;
        return $currentLease ? $currentLease->next_payment_due_date : null;
    }

    /**
     * Get days overdue (negative if overdue).
     */
    public function getDaysOverdueAttribute(): int
    {
        $nextDue = $this->next_payment_due;
        if (!$nextDue) {
            return 0;
        }
        
        return Carbon::now()->diffInDays($nextDue, false);
    }

    /* -------------------------------------------------------------------------- */
    /* SCOPES                                    */
    /* -------------------------------------------------------------------------- */

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithActiveLease($query)
    {
        return $query->whereHas('leases', function ($q) {
            $q->where('lease_status', 'Active')
              ->where('is_active', true)
              ->where('start_date', '<=', now())
              ->where('end_date', '>=', now());
        });
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'LIKE', "%{$search}%")
              ->orWhere('last_name', 'LIKE', "%{$search}%")
              ->orWhere('middle_name', 'LIKE', "%{$search}%")
              ->orWhere('contact_num', 'LIKE', "%{$search}%")
              ->orWhereHas('user', function ($q2) use ($search) {
                  $q2->where('username', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
              })
              ->orWhereHas('currentLease.room.property', function ($q3) use ($search) {
                  $q3->where('property_name', 'LIKE', "%{$search}%")
                      ->orWhere('address', 'LIKE', "%{$search}%");
              });
        });
    }

    public function scopeInProperty($query, $propertyId)
    {
        return $query->whereHas('leases.room', function ($q) use ($propertyId) {
            $q->where('property_id', $propertyId);
        });
    }

    public function scopeByLandlord($query, $landlordId)
    {
        return $query->whereHas('leases.room.property', function ($q) use ($landlordId) {
            $q->where('landlord_id', $landlordId);
        });
    }

    /* -------------------------------------------------------------------------- */
    /* HELPER METHODS                               */
    /* -------------------------------------------------------------------------- */

    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    public function isActive(): bool
    {
        return $this->is_active && !$this->trashed();
    }

    private function formatPhoneNumber($number): string
    {
        if (!$number) {
            return 'Not set';
        }

        $number = preg_replace('/\D/', '', $number);
        
        if (strlen($number) === 10 && str_starts_with($number, '9')) {
            return '+63 ' . substr($number, 0, 3) . ' ' . substr($number, 3, 3) . ' ' . substr($number, 6);
        }
        
        if (strlen($number) === 11 && str_starts_with($number, '09')) {
            return '+63 ' . substr($number, 1, 3) . ' ' . substr($number, 4, 3) . ' ' . substr($number, 7);
        }
        
        return $number;
    }

    /**
     * Get tenant's dashboard summary.
     */
    public function getDashboardSummary(): array
    {
        $currentLease = $this->currentLease;
        
        return [
            'tenant' => [
                'name' => $this->full_name,
                'contact' => $this->formatted_contact_num,
                'status' => $this->status,
                'payment_status' => $this->payment_status,
                'is_good_tenant' => $this->is_good_tenant,
            ],
            'current_lease' => $currentLease ? [
                'room' => $currentLease->room->room_number ?? 'N/A',
                'property' => $currentLease->room->property->property_name ?? 'N/A',
                'start_date' => $currentLease->start_date->format('Y-m-d'),
                'end_date' => $currentLease->end_date->format('Y-m-d'),
                'monthly_rent' => $currentLease->formatted_rent ?? 0,
                // Ensure lease model has these attributes or relations loaded
            ] : null,
            'statistics' => [
                'total_leases' => $this->total_leases,
                'completed_leases' => $this->lease_history_count,
                'average_stay' => round($this->average_stay_months, 1) . ' months',
                'total_paid' => '₱' . number_format($this->total_paid, 2),
                'outstanding_balance' => '₱' . number_format($this->outstanding_balance, 2),
                'payment_compliance' => $this->calculatePaymentCompliance() . '%',
            ],
        ];
    }

    /**
     * Calculate payment compliance percentage.
     */
    public function calculatePaymentCompliance(): float
    {
        // Need to ensure leases relationship is loaded or queried
        $totalMonths = $this->leases->sum(function ($lease) {
            return isset($lease->total_months) ? ceil($lease->total_months) : 0;
        });
        
        if ($totalMonths == 0) {
            return 100;
        }
        
        $paidMonths = $this->transactions()
            ->where('transaction_status', 'Completed')
            ->whereNotNull('payment_for_month')
            ->count();
        
        return round(($paidMonths / $totalMonths) * 100, 2);
    }
}