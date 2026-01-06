<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class UserPlus extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users_plus';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_code',
    ];

    protected $appends = [
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getRoleAttribute(): string
    {
        return match ($this->role_code) {
            1945 => 'admin',
            8008 => 'ula',
            880 => 'kasubak',
            default => 'user',
        };
    }

    public function isAdmin(): bool
    {
        $isAdmin = $this->role_code === 1945;
        \Log::info('UserPlus::isAdmin check', [
            'user_id' => $this->id,
            'role_code' => $this->role_code,
            'role_code_type' => gettype($this->role_code),
            'is_admin' => $isAdmin,
        ]);
        return $isAdmin;
    }

    public function isUla(): bool
    {
        return $this->role_code === 8008;
    }
}
