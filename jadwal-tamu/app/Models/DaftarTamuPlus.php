<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; // Added this line

class DaftarTamuPlus extends Model
{
    use HasFactory;

    protected $table = 'daftar_tamu_pluses';

    protected $fillable = [
        'nama',
        'jabatan',
        'instansi',
        'tujuan',
        'tanggal_kunjungan',
        'jam_mulai',
        'jam_selesai',
        'user_id',
        'signature_code',
        'photo_code',
    ];

    protected $casts = [
        'tanggal_kunjungan' => 'date:Y-m-d',
        'jam_mulai' => 'string',
        'jam_selesai' => 'string',
    ];

    public function getWaktuAttribute(): string
    {
        return "{$this->jam_mulai} - {$this->jam_selesai}";
    }

    public function user()
    {
        return $this->belongsTo(UserPlus::class);
    }
}
