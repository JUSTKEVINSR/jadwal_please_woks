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
            2026 => 'pic',
            default => 'user',
        };
    }

    public function isAdmin(): bool
    {
        // Allow both Admin (1945) and PIC (2026) to pass isAdmin check
        $isAdmin = in_array($this->role_code, [1945, 2026]);
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
