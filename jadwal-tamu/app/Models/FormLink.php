<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'jadwal_rapat_id',
        'url',
        'photo_required',
        'close_time',
        'is_active',
    ];

    protected $casts = [
        'photo_required' => 'boolean',
        'is_active' => 'boolean',
        'close_time' => 'datetime',
    ];

    public function jadwalRapat()
    {
        return $this->belongsTo(JadwalRapat::class, 'jadwal_rapat_id');
    }
}
