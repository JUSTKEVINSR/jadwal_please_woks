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
        $videoAktif = Video::select('id', 'judul', 'path', 'source_type')
            ->where('status', 'aktif')
            ->latest()
            ->first();

        // ✅ Generate URL (signed route for local, direct path for youtube)
        $videoData = null;
        if ($videoAktif && $videoAktif->path) {
            $url = $videoAktif->path; // Default to path (for youtube)

            if ($videoAktif->source_type === 'local') {
                $url = URL::temporarySignedRoute(
                    'video.stream',
                    now()->addHours(6),
                    ['video' => $videoAktif->id]
                );
            }

            $videoData = [
                'id' => $videoAktif->id,
                'judul' => $videoAktif->judul,
                'source_type' => $videoAktif->source_type,
                'url' => $url,
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