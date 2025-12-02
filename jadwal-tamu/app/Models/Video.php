<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;

    protected $fillable = [
        'tanggal',
        'judul',
        'durasi',
        'status',
        'path',
        'user_id',
        'token',
    ];

    protected $casts = [
        'tanggal' => 'date:Y-m-d',
    ];
    // ✅ Relasi ke user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
