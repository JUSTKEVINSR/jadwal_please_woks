<?php

namespace App\Http\Controllers;

use App\Models\JadwalRapat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Hitung total semua jadwal
        $totalJadwal = JadwalRapat::count();

        // Hitung jadwal dengan status selesai
        $rapatSelesai = JadwalRapat::where('status', 'Selesai')->count();

        // Hitung jadwal yang belum selesai atau masih proses
        $rapatTertunda = JadwalRapat::whereIn('status', ['Belum', 'Proses'])->count();

        return Inertia::render('Dashboard', [
            'totalJadwal' => $totalJadwal,
            'rapatSelesai' => $rapatSelesai,
            'rapatTertunda' => $rapatTertunda,
        ]);
    }
}
