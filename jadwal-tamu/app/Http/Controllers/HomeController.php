<?php

namespace App\Http\Controllers;

use App\Models\JadwalRapat;
use Carbon\Carbon;

use App\Models\Video;
use Inertia\Inertia;
use Illuminate\Support\Facades\URL;

class HomeController extends Controller
{
    public function index()
    {
        $jadwal = JadwalRapat::with('room')->where('status', '!=', 'Selesai')
            ->orderBy('tanggal', 'asc')
            ->orderBy('jam_mulai', 'asc')
            ->whereDate('tanggal', Carbon::today())
            
            ->get();

        // ✅ Ambil video aktif
        $videoAktif = Video::select('id', 'judul', 'path')
            ->where('status', 'aktif')
            ->latest()
            ->first();

        // ✅ Generate signed URL (valid 6 jam, auto-refresh setiap page load)
        $videoData = null;
        if ($videoAktif && $videoAktif->path) {
            $videoData = [
                'id' => $videoAktif->id,
                'judul' => $videoAktif->judul,
                'url' => URL::temporarySignedRoute(
                    'video.stream',
                    now()->addHours(6), // Valid 6 jam
                    ['video' => $videoAktif->id]
                ),
            ];
        }

        return Inertia::render('Home', [
            'jadwal' => $jadwal,
            'video' => $videoData, // Kirim object dengan URL signed
            'canLogin' => \Route::has('login'),
            'canRegister' => \Route::has('register'),
        ]);
    }
}