<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalRapat;
use Illuminate\Http\Request;
use Carbon\Carbon;

class JadwalRapatApiController extends Controller
{
    // GET /api/jadwal
    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => JadwalRapat::where('user_id', $request->user()->id)
                ->orderBy('tanggal', 'desc')
                ->orderBy('jam_mulai', 'asc')
                ->get()
        ]);
    }

    // POST /api/jadwal
    public function store(Request $request)
    {
        $data = $request->validate([
            'tanggal' => 'required|date',
            'jam_mulai' => 'required|date_format:h:i A',
            'jam_selesai' => 'required|date_format:h:i A',
            'judul' => 'required|string|max:255',
            'lokasi' => 'required|integer',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:Belum,Proses,Selesai',
            'gunakan_zoom' => 'required|in:yes,no',
            'nama_pic' => 'nullable|string',
            'nomor_pic' => 'nullable|string',
        ]);

        // Convert 12-hour input to 24-hour format
        $data['jam_mulai'] = Carbon::createFromFormat('h:i A', $data['jam_mulai'])->format('H:i:s');
        $data['jam_selesai'] = Carbon::createFromFormat('h:i A', $data['jam_selesai'])->format('H:i:s');

        $data['user_id'] = $request->user()->id;

        $jadwal = JadwalRapat::create($data);

        return response()->json([
            'success' => true,
            'data' => $jadwal
        ], 201);
    }

    // PUT /api/jadwal/{jadwal}
    public function update(Request $request, JadwalRapat $jadwal)
    {
        if ($jadwal->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'tanggal' => 'required|date',
            'jam_mulai' => 'required|date_format:h:i A',
            'jam_selesai' => 'required|date_format:h:i A',
            'judul' => 'required|string|max:255',
            'lokasi' => 'required|integer',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:Belum,Proses,Selesai',
            'gunakan_zoom' => 'required|in:yes,no',
            'nama_pic' => 'nullable|string',
            'nomor_pic' => 'nullable|string',
        ]);

        // Convert 12-hour input to 24-hour format
        $data['jam_mulai'] = Carbon::createFromFormat('h:i A', $data['jam_mulai'])->format('H:i:s');
        $data['jam_selesai'] = Carbon::createFromFormat('h:i A', $data['jam_selesai'])->format('H:i:s');

        $jadwal->update($data);

        return ['success' => true, 'data' => $jadwal];
    }

    // DELETE /api/jadwal/{jadwal}
    public function destroy(Request $request, JadwalRapat $jadwal)
    {
        if ($jadwal->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $jadwal->delete();

        return ['success' => true];
    }

    // GET /api/jadwal/available-slots
    public function availableSlots(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'location' => 'required|integer',
        ]);

        $date = $request->date;
        $location = $request->location;

        // Get booked slots for the date and location
        $booked = JadwalRapat::where('tanggal', $date)
            ->where('lokasi', $location)
            ->select('jam_mulai', 'jam_selesai')
            ->get()
            ->map(function ($item) {
                return [
                    'start' => $item->jam_mulai,
                    'end' => $item->jam_selesai,
                ];
            });

        return response()->json([
            'success' => true,
            'booked_slots' => $booked,
        ]);
    }

    // GET /api/jadwal/booked-dates
    public function bookedDates(Request $request)
    {
        $request->validate([
            'year' => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year = $request->year;
        $month = $request->month;

        // Get distinct dates that have schedules in the given month
        $bookedDates = JadwalRapat::whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month)
            ->selectRaw('DATE(tanggal) as date')
            ->distinct()
            ->pluck('date')
            ->toArray();

        return response()->json([
            'success' => true,
            'booked_dates' => $bookedDates,
        ]);
    }
}
