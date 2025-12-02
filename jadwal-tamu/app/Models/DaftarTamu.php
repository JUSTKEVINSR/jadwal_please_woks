<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DaftarTamu extends Model
{
    use HasFactory;

    // Nama tabel (pastikan sesuai dengan migration: daftar_tamus)
    protected $table = 'daftar_tamus';

    // Kolom yang bisa diisi mass-assignment
    protected $fillable = [
        'nama',
        'jabatan',
        'instansi',
        'tujuan',
        'tanggal_kunjungan',
        'jam_mulai',
        'jam_selesai',
    ];

    // Cast otomatis
    protected $casts = [
        'tanggal_kunjungan' => 'date:Y-m-d',
        'jam_mulai' => 'string',
        'jam_selesai' => 'string',
    ];

    /**
     * Accessor untuk gabungan waktu
     * Contoh hasil: "09:00 - 10:00"
     */
    public function getWaktuAttribute(): string
    {
        return "{$this->jam_mulai} - {$this->jam_selesai}";
    }

    /**
     * (Opsional) Relasi ke tabel users
     * Jika nanti ingin tahu siapa yang input tamu
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
