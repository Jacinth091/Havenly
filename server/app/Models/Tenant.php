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

    protected $primaryKey = 'tenant_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'middle_name',
        'contact_num',
        'emergency_contact_name',
        'emergency_contact_number',
        'id_type',
        'id_number',
        'date_of_birth',
        'occupation',
        'work_address',
        'is_active',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Append these computed attributes
    protected $appends = [
        'full_name',
        'full_name_with_middle',
        'initials',
        'age',
        'status',
        'formatted_contact_num',
        'formatted_emergency_contact',
        'has_active_lease',
        'current_room',
        'current_property',
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
     * Get upcoming lease (if tenant has booked but not yet moved in).
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
     */
    public function transactions()
    {
        return Transaction::whereHas('lease', function ($query) {
            $query->where('tenant_id', $this->tenant_id);
        });
    }

    /**
     * Get maintenance requests made by tenant.
     */
    public function maintenanceRequests()
    {
        // Assuming you have a MaintenanceRequest model
        // return $this->hasMany(MaintenanceRequest::class, 'tenant_id', 'tenant_id');
        return collect(); // Placeholder
    }

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
     * Get tenant's age.
     */
    public function getAgeAttribute(): ?int
    {
        if (!$this->date_of_birth) {
            return null;
        }
        
        return Carbon::parse($this->date_of_birth)->age;
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
     * Get formatted emergency contact.
     */
    public function getFormattedEmergencyContactAttribute(): string
    {
        if (!$this->emergency_contact_name && !$this->emergency_contact_number) {
            return 'Not set';
        }
        
        $name = $this->emergency_contact_name ?: 'N/A';
        $number = $this->emergency_contact_number ? $this->formatPhoneNumber($this->emergency_contact_number) : 'N/A';
        
        return "{$name} ({$number})";
    }

    /**
     * Check if tenant has an active lease.
     */
    public function getHasActiveLeaseAttribute(): bool
    {
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
        return $this->transactions()
            ->where('transaction_status', 'Completed')
            ->sum('amount');
    }

    /**
     * Get outstanding balance.
     */
    public function getOutstandingBalanceAttribute(): float
    {
        $balance = 0;
        
        foreach ($this->activeLeases()->get() as $lease) {
            $balance += $lease->balance;
        }
        
        return $balance;
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
            return $currentLease->payment_status;
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
        
        $totalMonths = $completedLeases->sum(function ($lease) {
            return $lease->total_months;
        });
        
        return $totalMonths / $completedLeases->count();
    }

    /**
     * Check if tenant is considered "good" (no overdue payments, no issues).
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
        
        // Check for terminated leases (might indicate problems)
        $terminatedLeases = $this->leases()->where('lease_status', 'Terminated')->count();
        if ($terminatedLeases > 0) {
            return false;
        }
        
        // Check maintenance request frequency (if implemented)
        // $highMaintenanceCount = $this->maintenanceRequests()->count() > 5;
        
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

    /**
     * Format phone number helper.
     */
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
     * Scope for active tenants.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for tenants with active leases.
     */
    public function scopeWithActiveLease($query)
    {
        return $query->whereHas('leases', function ($q) {
            $q->where('lease_status', 'Active')
              ->where('is_active', true)
              ->where('start_date', '<=', now())
              ->where('end_date', '>=', now());
        });
    }

    /**
     * Scope for tenants without active leases.
     */
    public function scopeWithoutActiveLease($query)
    {
        return $query->whereDoesntHave('leases', function ($q) {
            $q->where('lease_status', 'Active')
              ->where('is_active', true)
              ->where('start_date', '<=', now())
              ->where('end_date', '>=', now());
        });
    }

    /**
     * Scope for tenants with overdue payments.
     */
    public function scopeWithOverduePayments($query)
    {
        return $query->whereHas('leases', function ($q) {
            $q->where('lease_status', 'Active')
              ->where('is_active', true)
              ->where('start_date', '<=', now())
              ->where('end_date', '>=', now())
              ->whereHas('transactions', function ($q2) {
                  $q2->where('transaction_status', 'Pending')
                     ->orWhere(function ($q3) {
                         $q3->where('transaction_status', 'Completed')
                            ->where('payment_for_month', '<', Carbon::now()->subMonth());
                     });
              });
        });
    }

    /**
     * Scope for tenants by search term.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'LIKE', "%{$search}%")
              ->orWhere('last_name', 'LIKE', "%{$search}%")
              ->orWhere('middle_name', 'LIKE', "%{$search}%")
              ->orWhere('contact_num', 'LIKE', "%{$search}%")
              ->orWhere('id_number', 'LIKE', "%{$search}%")
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

    /**
     * Scope for tenants in a specific property.
     */
    public function scopeInProperty($query, $propertyId)
    {
        return $query->whereHas('leases.room', function ($q) use ($propertyId) {
            $q->where('property_id', $propertyId);
        });
    }

    /**
     * Scope for tenants by landlord.
     */
    public function scopeByLandlord($query, $landlordId)
    {
        return $query->whereHas('leases.room.property', function ($q) use ($landlordId) {
            $q->where('landlord_id', $landlordId);
        });
    }

    /**
     * Activate the tenant.
     */
    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    /**
     * Deactivate the tenant.
     */
    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    /**
     * Check if tenant is active.
     */
    public function isActive(): bool
    {
        return $this->is_active && !$this->trashed();
    }

    /**
     * Get tenant's payment history.
     */
    public function getPaymentHistory($limit = 10): array
    {
        return $this->transactions()
            ->where('transaction_status', 'Completed')
            ->orderBy('transaction_date', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($transaction) {
                return [
                    'date' => $transaction->transaction_date->format('Y-m-d'),
                    'amount' => $transaction->amount,
                    'method' => $transaction->payment_method,
                    'for_month' => $transaction->payment_for_month 
                        ? Carbon::parse($transaction->payment_for_month)->format('F Y') 
                        : 'N/A',
                    'reference' => $transaction->reference_number,
                    'lease' => $transaction->lease->lease_reference,
                ];
            })
            ->toArray();
    }

    /**
     * Get tenant's lease history.
     */
    public function getLeaseHistory(): array
    {
        return $this->leases()
            ->with(['room.property', 'room.property.landlord'])
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(function ($lease) {
                return [
                    'lease_reference' => $lease->lease_reference,
                    'room' => $lease->room->room_number,
                    'property' => $lease->room->property->property_name,
                    'landlord' => $lease->room->property->landlord->full_name,
                    'start_date' => $lease->start_date->format('Y-m-d'),
                    'end_date' => $lease->end_date->format('Y-m-d'),
                    'duration' => round($lease->total_months, 1) . ' months',
                    'monthly_rent' => $lease->formatted_rent,
                    'status' => $lease->lease_status,
                    'total_paid' => $lease->total_paid,
                ];
            })
            ->toArray();
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
                'room' => $currentLease->room->room_number,
                'property' => $currentLease->room->property->property_name,
                'address' => $currentLease->room->property->full_address,
                'start_date' => $currentLease->start_date->format('Y-m-d'),
                'end_date' => $currentLease->end_date->format('Y-m-d'),
                'remaining_days' => $currentLease->remaining_days,
                'monthly_rent' => $currentLease->formatted_rent,
                'next_payment_due' => $currentLease->next_payment_due_date->format('Y-m-d'),
                'balance' => $currentLease->balance,
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
        $totalMonths = $this->leases->sum(function ($lease) {
            return ceil($lease->total_months);
        });
        
        if ($totalMonths === 0) {
            return 100;
        }
        
        $paidMonths = $this->transactions()
            ->where('transaction_status', 'Completed')
            ->whereNotNull('payment_for_month')
            ->count();
        
        return ($paidMonths / $totalMonths) * 100;
    }

    /**
     * Record a new payment.
     */
    public function recordPayment(float $amount, array $paymentData = []): ?Transaction
    {
        $currentLease = $this->currentLease;
        if (!$currentLease) {
            return null;
        }
        
        return $currentLease->recordPayment($amount, $paymentData);
    }

    /**
     * Get tenant's upcoming payments schedule.
     */
    public function getUpcomingPayments($months = 3): array
    {
        $currentLease = $this->currentLease;
        if (!$currentLease) {
            return [];
        }
        
        $schedule = [];
        $current = Carbon::now()->day(1);
        
        for ($i = 0; $i < $months; $i++) {
            $month = $current->copy()->addMonths($i);
            $dueDate = $month->copy()->day(min($currentLease->payment_due_day, 28));
            $isPaid = $currentLease->isMonthPaid($month->year, $month->month);
            
            $schedule[] = [
                'month' => $month->format('F Y'),
                'due_date' => $dueDate->format('Y-m-d'),
                'amount' => $currentLease->monthly_rent,
                'status' => $isPaid ? 'Paid' : ($dueDate < Carbon::now() ? 'Overdue' : 'Pending'),
                'days_until_due' => $isPaid ? null : Carbon::now()->diffInDays($dueDate, false),
            ];
        }
        
        return $schedule;
    }
    /**
     * Get tenant's emergency contact information.
     */
    public function getEmergencyContactInfo(): array
    {
        return [
            'name' => $this->emergency_contact_name,
            'number' => $this->emergency_contact_number,
            'formatted' => $this->formatted_emergency_contact,
            'relationship' => $this->emergency_contact_relationship, // if you add this field
        ];
    }

    /**
     * Get tenant's identification information.
     */
    public function getIdentificationInfo(): array
    {
        return [
            'type' => $this->id_type,
            'number' => $this->id_number,
            'date_of_birth' => $this->date_of_birth ? $this->date_of_birth->format('Y-m-d') : null,
            'age' => $this->age,
            'occupation' => $this->occupation,
            'work_address' => $this->work_address,
        ];
    }

    /**
     * Check if tenant can renew current lease.
     */
    public function canRenewLease(): bool
    {
        $currentLease = $this->currentLease;
        return $currentLease && $currentLease->can_renew;
    }

    /**
     * Check if tenant can terminate current lease.
     */
    public function canTerminateLease(): bool
    {
        $currentLease = $this->currentLease;
        return $currentLease && $currentLease->can_terminate;
    }

    /**
     * Get tenant's maintenance request history.
     */
    public function getMaintenanceHistory()
    {
        // Assuming you have a MaintenanceRequest model
        // return $this->maintenanceRequests()
        //     ->orderBy('created_at', 'desc')
        //     ->get()
        //     ->map(function ($request) {
        //         return [
        //             'date' => $request->created_at->format('Y-m-d'),
        //             'type' => $request->type,
        //             'description' => $request->description,
        //             'status' => $request->status,
        //             'room' => $request->room->room_number,
        //         ];
        //     });
        return []; // Placeholder
    }
}