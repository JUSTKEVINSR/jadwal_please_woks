<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use App\Models\JadwalRapat;
use Illuminate\Support\Facades\URL;

class HomeApiController extends Controller
{
    public function index()
    {
        // Jadwal: sama seperti HomeController
        $jadwal = JadwalRapat::with('room')->where('status', '!=', 'Selesai')
            ->orderBy('tanggal', 'asc')
            ->orderBy('jam_mulai', 'asc')
            ->get();

        // Video aktif
        $video = Video::select('id', 'judul', 'path')
            ->where('status', 'aktif')
            ->latest()
            ->first();

        if ($video && $video->path) {
            $video->signed_url = URL::temporarySignedRoute(
                'video.stream',
                now()->addHours(6),
                ['video' => $video->id]
            );
        }

        return response()->json([
            'success' => true,
            'data' => [
                'jadwal' => $jadwal,
                'video' => $video,
            ]
        ]);
    }
}
