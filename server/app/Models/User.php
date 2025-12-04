<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Tymon\JWTAuth\Contracts\JWTSubject;

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
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password_hash',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password_hash',
        'deleted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
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

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
            'email' => $this->email
        ];
    }
}