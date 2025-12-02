<?php

namespace App\Http\Controllers;

use App\Models\JadwalRapat;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon; // 👈 1. ADD THIS IMPORT

class JadwalRapatController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status', 'Belum');

        $jadwalRapat = JadwalRapat::when($status, function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->orderBy('tanggal', 'desc')
            ->orderBy('jam_mulai', 'asc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('JadwalRapat/Index', [
            'jadwal' => $jadwalRapat,
            'statusFilter' => $status,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'jam_mulai' => 'required', // Input is 12-hour format
            'jam_selesai' => 'required', // Input is 12-hour format
            'judul' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
            'lokasi' => 'required|string',
            'status' => 'required|in:Belum,Selesai',
        ]);

        // 2. ADD TIME CONVERSION LOGIC (for saving)
        // Convert 12-hour input (e.g., '12:00 AM') to 24-hour database format (e.g., '00:00:00')
        $validated['jam_mulai'] = Carbon::createFromFormat('h:i A', $validated['jam_mulai'])->format('H:i:s');
        $validated['jam_selesai'] = Carbon::createFromFormat('h:i A', $validated['jam_selesai'])->format('H:i:s');

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
            'jam_mulai' => 'required', // Input is 12-hour format
            'jam_selesai' => 'required', // Input is 12-hour format
            'judul' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
            'lokasi' => 'required|string',
            'status' => 'required|in:Belum,Selesai',
        ]);
        
        // 3. ADD TIME CONVERSION LOGIC (for updating)
        $validated['jam_mulai'] = Carbon::createFromFormat('h:i A', $validated['jam_mulai'])->format('H:i:s');
        $validated['jam_selesai'] = Carbon::createFromFormat('h:i A', $validated['jam_selesai'])->format('H:i:s');


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
}