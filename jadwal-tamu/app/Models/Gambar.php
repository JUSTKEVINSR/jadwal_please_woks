<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gambar extends Model
{
    use HasFactory;

    protected $fillable = [
        'tanggal',
        'judul',
        'path',
        'status',
        'user_id',
    ];

    // Optional: Add relationship to User if needed
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
