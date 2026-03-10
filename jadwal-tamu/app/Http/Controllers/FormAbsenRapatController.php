<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormAbsenRapatController extends Controller
{
    public function index(Request $request)
    {
        $jadwalRapats = \App\Models\JadwalRapat::all();
        $photoReq = $request->query('photoRequired', 'true');

        $closeTimeParam = $request->query('closeTime');
        $isClosed = false;

        if ($closeTimeParam) {
            try {
                $closeTime = \Carbon\Carbon::parse($closeTimeParam, 'Asia/Jakarta');
                if (now()->setTimezone('Asia/Jakarta')->greaterThanOrEqualTo($closeTime)) {
                    $isClosed = true;
                }
            } catch (\Exception $e) {
                // Ignore parse errors, default to false
            }
        }

        return Inertia::render('FormAbsenRapat/Index', [
            'jadwalRapats' => $jadwalRapats,
            'initialTujuan' => $request->query('tujuan', ''),
            'initialPhotoRequired' => $photoReq === 'true',
            'isClosed' => $isClosed,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'instansi' => 'nullable|string|max:255',
            'tujuan' => 'required|string|max:255',
            'tanggal_kunjungan' => 'required|date',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'signature_code' => 'nullable|string',
            'photo_code' => 'nullable|string',
        ]);

        if (auth()->check()) {
            $validated['user_id'] = auth()->id();
        }

        \App\Models\DaftarTamuPlus::create($validated);

        return redirect()->route('home')->with('success', 'Berhasil mengisi form absen rapat!');
    }
}
