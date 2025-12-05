<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Carbon\Carbon;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'user_id';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = true;

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'int';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password_hash',
        'role',
        'email_verified_at',
        'last_login_at',
        'last_login_ip',
        'is_active',
        'profile_image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password_hash',
        'deleted_at',
        'last_login_ip',
    ];

    /**
     * The attributes that should be appended.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'display_name',
        'profile_complete',
        'is_verified',
        'has_profile',
        'profile_status',
        'profile_image_url',
        'role_name',
        'days_since_last_login',
        'is_online',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the password for the user.
     * Override default password field
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /**
     * Get the admin associated with the user.
     */
    public function admin(): HasOne
    {
        return $this->hasOne(Admin::class, 'user_id', 'user_id');
    }

    /**
     * Get the landlord associated with the user.
     */
    public function landlord(): HasOne
    {
        return $this->hasOne(Landlord::class, 'user_id', 'user_id');
    }

    /**
     * Get the tenant associated with the user.
     */
    public function tenant(): HasOne
    {
        return $this->hasOne(Tenant::class, 'user_id', 'user_id');
    }

    /**
     * Get the user's profile based on role.
     */
    public function profile()
    {
        return match($this->role) {
            'Admin' => $this->admin,
            'Landlord' => $this->landlord,
            'Tenant' => $this->tenant,
            default => null,
        };
    }

    

    /**
     * Get user's display name.
     */
    public function getDisplayNameAttribute(): string
    {
        $profile = $this->profile();
        
        if ($profile && method_exists($profile, 'getFullNameAttribute')) {
            return $profile->full_name;
        }
        
        return $this->username;
    }

    /**
     * Check if user's profile is complete.
     */
    public function getProfileCompleteAttribute(): bool
    {
        $profile = $this->profile();
        
        if (!$profile) {
            return false;
        }
        
        // Check required fields based on role
        $requiredFields = match($this->role) {
            'Admin' => ['first_name', 'last_name'],
            'Landlord' => ['first_name', 'last_name', 'contact_num'],
            'Tenant' => ['first_name', 'last_name', 'contact_num'],
            default => [],
        };
        
        foreach ($requiredFields as $field) {
            if (empty($profile->$field)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check if user is verified.
     */
    public function getIsVerifiedAttribute(): bool
    {
        return $this->email_verified_at !== null;
    }

    /**
     * Check if user has a profile.
     */
    public function getHasProfileAttribute(): bool
    {
        return $this->profile() !== null;
    }

    /**
     * Get profile status.
     */
    public function getProfileStatusAttribute(): string
    {
        if (!$this->has_profile) {
            return 'No Profile';
        }
        
        if (!$this->profile_complete) {
            return 'Profile Incomplete';
        }
        
        $profile = $this->profile();
        if (property_exists($profile, 'is_active')) {
            return $profile->is_active ? 'Active' : 'Inactive';
        }
        
        return 'Active';
    }

    /**
     * Get profile image URL.
     */
    public function getProfileImageUrlAttribute(): string
    {
        if ($this->profile_image) {
            return asset('storage/' . $this->profile_image);
        }
        
        // Return default avatar based on role
        $defaultAvatars = [
            'Admin' => 'default-admin.png',
            'Landlord' => 'default-landlord.png',
            'Tenant' => 'default-tenant.png',
        ];
        
        $avatar = $defaultAvatars[$this->role] ?? 'default-user.png';
        return asset('images/avatars/' . $avatar);
    }

    /**
     * Get role name (formatted).
     */
    public function getRoleNameAttribute(): string
    {
        return ucfirst(strtolower($this->role));
    }

    /**
     * Get days since last login.
     */
    public function getDaysSinceLastLoginAttribute(): ?int
    {
        if (!$this->last_login_at) {
            return null;
        }
        
        return Carbon::now()->diffInDays($this->last_login_at);
    }

    /**
     * Check if user is online (last activity within 15 minutes).
     */
    public function getIsOnlineAttribute(): bool
    {
        if (!$this->last_login_at) {
            return false;
        }
        
        return $this->last_login_at->diffInMinutes(Carbon::now()) <= 15;
    }

    /**
     * Get JWT identifier.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Get JWT custom claims.
     */
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
            'email' => $this->email,
            'user_id' => $this->user_id,
            'username' => $this->username,
            'profile_complete' => $this->profile_complete,
            'has_profile' => $this->has_profile,
        ];
    }

    /**
     * Scope for active users.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for verified users.
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Scope for users by role.
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope for users with profile.
     */
    public function scopeWithProfile($query)
    {
        return $query->whereHas($query->getModel()->role, function ($q) {
            $q->whereNotNull('first_name');
        });
    }

    /**
     * Scope for users by search term.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('username', 'LIKE', "%{$search}%")
              ->orWhere('email', 'LIKE', "%{$search}%")
              ->orWhereHas('admin', function ($q2) use ($search) {
                  $q2->where('first_name', 'LIKE', "%{$search}%")
                     ->orWhere('last_name', 'LIKE', "%{$search}%");
              })
              ->orWhereHas('landlord', function ($q3) use ($search) {
                  $q3->where('first_name', 'LIKE', "%{$search}%")
                     ->orWhere('last_name', 'LIKE', "%{$search}%");
              })
              ->orWhereHas('tenant', function ($q4) use ($search) {
                  $q4->where('first_name', 'LIKE', "%{$search}%")
                     ->orWhere('last_name', 'LIKE', "%{$search}%");
              });
        });
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'Admin' && $this->admin !== null;
    }

    /**
     * Check if user is landlord.
     */
    public function isLandlord(): bool
    {
        return $this->role === 'Landlord' && $this->landlord !== null;
    }

    /**
     * Check if user is tenant.
     */
    public function isTenant(): bool
    {
        return $this->role === 'Tenant' && $this->tenant !== null;
    }

    /**
     * Check if user is active (includes profile active status).
     */
    public function isActive(): bool
    {
        if (!$this->is_active || $this->trashed()) {
            return false;
        }
        
        $profile = $this->profile();
        if ($profile && property_exists($profile, 'is_active')) {
            return $profile->is_active;
        }
        
        return true;
    }

    /**
     * Activate the user.
     */
    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    /**
     * Deactivate the user.
     */
    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    /**
     * Verify the user's email.
     */
    public function verifyEmail(): bool
    {
        return $this->update(['email_verified_at' => now()]);
    }

    /**
     * Record login activity.
     */
    public function recordLogin(string $ip): bool
    {
        return $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ]);
    }

    /**
     * Get user's permissions based on role.
     */
    public function getPermissions(): array
    {
        $permissions = [
            'Admin' => [
                'view_dashboard',
                'manage_users',
                'manage_properties',
                'manage_leases',
                'view_reports',
                'manage_settings',
                'view_financials',
                'manage_maintenance',
            ],
            'Landlord' => [
                'view_dashboard',
                'manage_properties',
                'manage_leases',
                'view_financials',
                'view_tenants',
                'manage_maintenance',
                'view_reports',
            ],
            'Tenant' => [
                'view_dashboard',
                'view_lease',
                'make_payments',
                'request_maintenance',
                'view_payment_history',
                'update_profile',
            ],
        ];
        
        return $permissions[$this->role] ?? [];
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->getPermissions());
    }

    /**
     * Get user's dashboard statistics based on role.
     */
    public function getDashboardStats(): array
    {
        $stats = [
            'user_id' => $this->user_id,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'display_name' => $this->display_name,
            'profile_complete' => $this->profile_complete,
            'is_verified' => $this->is_verified,
            'last_login' => $this->last_login_at ? $this->last_login_at->format('Y-m-d H:i') : 'Never',
            'is_online' => $this->is_online,
        ];
        
        // Add role-specific stats
        if ($this->isAdmin()) {
            $stats['admin_stats'] = [
                'total_users' => User::count(),
                'total_landlords' => Landlord::count(),
                'total_tenants' => Tenant::count(),
                'total_properties' => Property::count(),
                'active_leases' => Lease::current()->count(),
            ];
        } elseif ($this->isLandlord() && $this->landlord) {
            $stats['landlord_stats'] = $this->landlord->getPropertiesSummary();
        } elseif ($this->isTenant() && $this->tenant) {
            $stats['tenant_stats'] = $this->tenant->getDashboardSummary();
        }
        
        return $stats;
    }

    /**
     * Update user profile with role-specific data.
     */
    public function updateProfile(array $data): bool
    {
        $profile = $this->profile();
        
        if ($profile) {
            $profile->update($data);
            return true;
        }
        
        // Create profile if it doesn't exist
        switch ($this->role) {
            case 'Admin':
                $this->admin()->create($data);
                break;
            case 'Landlord':
                $this->landlord()->create($data);
                break;
            case 'Tenant':
                $this->tenant()->create($data);
                break;
        }
        
        return true;
    }
}