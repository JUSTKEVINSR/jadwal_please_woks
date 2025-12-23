<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Models\UserPlus;
use App\Models\RoomMaster;

class JadwalRapat extends Model
{
    use HasFactory;

    protected $table = 'jadwal_rapats';

    protected $fillable = [
        'user_id',
        'tanggal',
        'jam_mulai',
        'jam_selesai',
        'judul',
        'keterangan',
        'lokasi',
        'slug',
        'status',
        'gunakan_zoom',
        'nama_pic',
        'nomor_pic',
        'kasubak',
        'ula',
    ];

    /**
     * Cast otomatis untuk format data.
     * Gunakan string untuk kolom bertipe TIME di database.
     */
    protected $casts = [
        'tanggal' => 'date:Y-m-d',
        'jam_mulai' => 'string',
        'jam_selesai' => 'string',
        'lokasi' => 'integer',
    ];

    /**
     * Default value kolom tertentu.
     */
    protected $attributes = [
        'status' => 'Belum',
        'gunakan_zoom' => 'no',
        'kasubak' => 'pending',
        'ula' => 'pending',
    ];

    /**
     * Relasi: Jadwal rapat dimiliki oleh user.
     */
    public function user()
    {
        return $this->belongsTo(UserPlus::class);
    }

    /**
     * Relasi: Jadwal rapat memiliki lokasi dari room_master.
     */
    public function room()
    {
        return $this->belongsTo(RoomMaster::class, 'lokasi', 'room_code');
    }

    /**
     * Slug otomatis setiap kali membuat jadwal baru.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($jadwal) {
            if (empty($jadwal->slug)) {
                $jadwal->slug = Str::slug($jadwal->judul . '-' . now()->format('YmdHis'));
            }
        });
    }

    /**
     * Accessor: tampilkan waktu gabungan (jam mulai - jam selesai)
     */
    public function getWaktuAttribute(): string
    {
        return "{$this->jam_mulai} - {$this->jam_selesai}";
    }

    /**
     * Scope: filter jadwal berdasarkan status.
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
