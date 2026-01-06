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

        // ✅ Ambil semua video aktif
        $videosAktif = \App\Models\Video::select('id', 'judul', 'path', 'source_type')
            ->where('status', 'aktif')
            ->latest()
            ->get();

        // ✅ Generate URL untuk semua video
        $videosData = $videosAktif->map(function ($v) {
            $url = $v->path;
            if ($v->source_type === 'local') {
                $url = URL::temporarySignedRoute(
                    'video.stream',
                    now()->addHours(6),
                    ['video' => $v->id]
                );
            }
            return [
                'id' => $v->id,
                'judul' => $v->judul,
                'source_type' => $v->source_type,
                'url' => $url,
            ];
        });

        return Inertia::render('Home', [
            'jadwal' => $jadwal,
            'videos' => $videosData,
            'settings' => \App\Models\VideoSetting::getSettings(),
            'canLogin' => \Route::has('login'),
            'canRegister' => \Route::has('register'),
        ]);
    }
}