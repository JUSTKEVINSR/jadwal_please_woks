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
}
