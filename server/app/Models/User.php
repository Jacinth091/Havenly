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
     * Matches SQL: user_id INT(11)
     */
    protected $primaryKey = 'user_id';

    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = true;

    /**
     * The "type" of the primary key ID.
     */
    protected $keyType = 'int';

    /**
     * The attributes that are mass assignable.
     * Synced with SQL columns.
     */
    protected $fillable = [
        'username',
        'email',
        'password_hash',
        'role',     // ENUM('Admin', 'Landlord', 'Tenant')
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password_hash',
        'deleted_at',
    ];

    /**
     * The attributes that should be appended.
     */
    protected $appends = [
        'display_name',
        'profile_complete',
        'has_profile',
        'profile_status',
        'profile_image_url',
        'role_name',
        'days_since_created', // Changed from last_login since column is missing
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the password for the user.
     * IMPORTANT: Overrides default 'password' to use 'password_hash'
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /* -------------------------------------------------------------------------- */
    /* RELATIONSHIPS                                */
    /* -------------------------------------------------------------------------- */

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

    /* -------------------------------------------------------------------------- */
    /* ACCESSORS & MUTATORS                            */
    /* -------------------------------------------------------------------------- */

    /**
     * Get user's display name.
     */
    public function getDisplayNameAttribute(): string
    {
        $profile = $this->profile();
        
        // Assuming Admin/Landlord/Tenant models have a 'full_name' accessor or first_name/last_name
        if ($profile) {
            if (method_exists($profile, 'getFullNameAttribute')) {
                return $profile->full_name;
            }
            if (!empty($profile->first_name) && !empty($profile->last_name)) {
                return $profile->first_name . ' ' . $profile->last_name;
            }
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
        
        // Using the user table's is_active since profiles usually rely on user status
        // unless you add is_active to specific role tables as well (which your schema does have)
        $profile = $this->profile();
        if ($profile && isset($profile->is_active)) {
             return $profile->is_active ? 'Active' : 'Inactive';
        }

        return $this->is_active ? 'Active' : 'Inactive';
    }

    /**
     * Get profile image URL.
     * NOTE: 'profile_image' column does not exist in SQL. Returning default only.
     */
    public function getProfileImageUrlAttribute(): string
    {
        // Default avatars
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
     * Get days since created.
     * Replacing 'last_login' logic since that column is missing in schema.
     */
    public function getDaysSinceCreatedAttribute(): ?int
    {
        if (!$this->created_at) {
            return null;
        }
        return Carbon::now()->diffInDays($this->created_at);
    }

    /* -------------------------------------------------------------------------- */
    /* JWT METHODS                                  */
    /* -------------------------------------------------------------------------- */

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

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

    /* -------------------------------------------------------------------------- */
    /* SCOPES                                    */
    /* -------------------------------------------------------------------------- */

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
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

    /* -------------------------------------------------------------------------- */
    /* HELPER METHODS                               */
    /* -------------------------------------------------------------------------- */

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'Admin';
    }

    public function isLandlord(): bool
    {
        return $this->role === 'Landlord';
    }

    public function isTenant(): bool
    {
        return $this->role === 'Tenant';
    }

    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    // NOTE: 'last_login_at' and 'last_login_ip' columns are missing in schema.
    // This method is disabled to prevent SQL errors.
    /*
    public function recordLogin(string $ip): bool
    {
        return $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ]);
    }
    */

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

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->getPermissions());
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