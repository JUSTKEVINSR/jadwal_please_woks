<?php

namespace App\Http\Controllers;

use App\Models\JadwalRapat;
use App\Models\RoomMaster;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon; // 👈 1. ADD THIS IMPORT

class JadwalRapatController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status', 'Belum');

        $jadwalRapat = JadwalRapat::with('room')->when($status, function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->orderBy('tanggal', 'desc')
            ->orderBy('jam_mulai', 'asc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('JadwalRapat/Index', [
            'jadwal' => $jadwalRapat,
            'statusFilter' => $status,
            'rooms' => RoomMaster::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'jam_mulai' => 'required|date_format:h:i A', // Input is 12-hour format
            'jam_selesai' => 'required|date_format:h:i A', // Input is 12-hour format
            'judul' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
            'lokasi' => 'required|integer',
            'status' => 'required|in:Belum,Selesai',
            'gunakan_zoom' => 'required|in:yes,no',
            'nama_pic' => 'nullable|string',
            'nomor_pic' => 'nullable|string',
        ]);

        // Convert 12-hour input to 24-hour format
        $jam_mulai_24 = Carbon::createFromFormat('h:i A', $validated['jam_mulai'])->format('H:i:s');
        $jam_selesai_24 = Carbon::createFromFormat('h:i A', $validated['jam_selesai'])->format('H:i:s');

        // Check for existing schedule with same date, times, and location
        $exists = JadwalRapat::where('tanggal', $validated['tanggal'])
            ->where('jam_mulai', $jam_mulai_24)
            ->where('jam_selesai', $jam_selesai_24)
            ->where('lokasi', $validated['lokasi'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['tanggal' => 'Jadwal dengan tanggal, waktu, dan lokasi yang sama sudah ada.']);
        }

        $validated['jam_mulai'] = $jam_mulai_24;
        $validated['jam_selesai'] = $jam_selesai_24;

        $jadwalRapat = new JadwalRapat($validated);
        $jadwalRapat->user_id = auth()->id();
        $jadwalRapat->save();

        return redirect()->route('jadwal-rapat.index')
            ->with('message', 'Jadwal rapat berhasil dibuat');
    }

    public function update(Request $request, JadwalRapat $jadwalRapat)
    {
        if ($jadwalRapat->user_id !== auth()->id()) {
            abort(403);
        }

        if ($request->has('status') && $request->keys() === ['status']) {
            $request->validate([
                'status' => 'required|in:Belum,Proses,Selesai',
            ]);

            $jadwalRapat->update(['status' => $request->status]);

            return back()->with('message', 'Status jadwal rapat berhasil diperbarui');
        }

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'jam_mulai' => 'required|date_format:h:i A', // Input is 12-hour format
            'jam_selesai' => 'required|date_format:h:i A', // Input is 12-hour format
            'judul' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
            'lokasi' => 'required|integer',
            'status' => 'required|in:Belum,Selesai',
            'gunakan_zoom' => 'required|in:yes,no',
            'nama_pic' => 'nullable|string',
            'nomor_pic' => 'nullable|string',
        ]);

        // Convert 12-hour input to 24-hour format
        $jam_mulai_24 = Carbon::createFromFormat('h:i A', $validated['jam_mulai'])->format('H:i:s');
        $jam_selesai_24 = Carbon::createFromFormat('h:i A', $validated['jam_selesai'])->format('H:i:s');

        // Check for existing schedule with same date, times, and location (excluding current record)
        $exists = JadwalRapat::where('tanggal', $validated['tanggal'])
            ->where('jam_mulai', $jam_mulai_24)
            ->where('jam_selesai', $jam_selesai_24)
            ->where('lokasi', $validated['lokasi'])
            ->where('id', '!=', $jadwalRapat->id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['tanggal' => 'Jadwal dengan tanggal, waktu, dan lokasi yang sama sudah ada.']);
        }

        $validated['jam_mulai'] = $jam_mulai_24;
        $validated['jam_selesai'] = $jam_selesai_24;

        $jadwalRapat->update($validated);

        return redirect()->route('jadwal-rapat.index')
            ->with('message', 'Jadwal rapat berhasil diperbarui');
    }

    public function destroy(JadwalRapat $jadwalRapat)
    {
        if ($jadwalRapat->user_id !== auth()->id()) {
            abort(403);
        }

        $jadwalRapat->delete();

        return back()->with('message', 'Jadwal rapat berhasil dihapus');
    }

    public function getBookedTimes(Request $request)
    {
        try {
            $validated = $request->validate([
                'tanggal' => 'required|date',
                'lokasi' => 'required|integer',
                'exclude_id' => 'nullable|integer',
            ]);

            \Log::info('getBookedTimes called', $validated);

            $query = JadwalRapat::whereDate('tanggal', $validated['tanggal'])
                ->where('lokasi', $validated['lokasi'])
                ->where('status', '!=', 'Selesai')
                ->where('user_id', auth()->id());

            if ($validated['exclude_id'] ?? null) {
                $query->where('id', '!=', $validated['exclude_id']);
            }

            $booked = $query->get(['jam_mulai', 'jam_selesai']);

            \Log::info('Booked times found', ['count' => $booked->count()]);

            return response()->json([
                'booked' => $booked->map(function ($item) {
                    return [
                        'start' => $item->jam_mulai,
                        'end' => $item->jam_selesai,
                        'status' => $item->status,
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getBookedTimes', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getBookedDates(Request $request)
    {
        try {
            $validated = $request->validate([
                'month' => 'required|string|regex:/^\d{4}-\d{2}$/',
                'lokasi' => 'required|integer',
            ]);

            \Log::info('getBookedDates called', $validated);

            $query = JadwalRapat::whereRaw("DATE_FORMAT(tanggal, '%Y-%m') = ?", [$validated['month']])
                ->where('lokasi', $validated['lokasi'])
                ->where('status', '!=', 'Selesai')
                ->where('user_id', auth()->id());

            $booked = $query->get(['tanggal', 'status']);

            \Log::info('Booked dates found', ['count' => $booked->count()]);

            return response()->json([
                'booked' => $booked->map(function ($item) {
                    return [
                        'date' => $item->tanggal->toDateString(),
                        'status' => $item->status,
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getBookedDates', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}