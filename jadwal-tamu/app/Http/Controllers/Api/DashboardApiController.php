<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalRapat;
use App\Models\DaftarTamuPlus;
use App\Models\Video;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardApiController extends Controller
{
    public function getSummary(): JsonResponse
    {
        try {
            $today = Carbon::today();

            $summary = [
                'total_jadwal' => JadwalRapat::count(),
                'rapat_selesai' => JadwalRapat::where('status', 'Selesai')->count(),
                'rapat_tertunda' => JadwalRapat::whereIn('status', ['Belum', 'Proses'])->count(),

                'total_tamu' => DaftarTamuPlus::count(),
                'total_video' => Video::count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $summary
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard summary: ' . $e->getMessage()
            ], 500);
        }
    }
}
