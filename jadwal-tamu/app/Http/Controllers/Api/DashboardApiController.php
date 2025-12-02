<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalRapat;
use App\Models\DaftarTamu;
use App\Models\Video;

class DashboardApiController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total_jadwal' => JadwalRapat::count(),
                'rapat_selesai' => JadwalRapat::where('status', 'Selesai')->count(),
                'rapat_tertunda' => JadwalRapat::whereIn('status', ['Belum', 'Proses'])->count(),

                'total_tamu' => DaftarTamu::count(),
                'total_video' => Video::count(),
            ]
        ]);
    }
}
