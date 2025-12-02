<?php

namespace App\Http\Controllers;

use App\Models\DaftarTamu;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DaftarTamuController extends Controller
{
    /**
     * Tampilkan daftar tamu
     */
    public function index()
    {
        // ✅ Get all data (pagination di frontend)
        $tamu = DaftarTamu::orderBy('tanggal_kunjungan', 'desc')
            ->orderBy('jam_mulai', 'asc')
            ->get();

        return Inertia::render('DaftarTamu/Index', [
            'tamu' => [
                'data' => $tamu,
                'total' => $tamu->count(),
            ],
        ]);
    }

    /**
     * Simpan tamu baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'instansi' => 'nullable|string|max:255',
            'tujuan' => 'required|string|max:255',
            'tanggal_kunjungan' => 'required|date',
            'jam_mulai' => 'required|string', // Format: HH:MM (24 jam)
            'jam_selesai' => 'required|string',
        ]);

        DaftarTamu::create($validated);

        return redirect()
            ->back()
            ->with('message', '✅ Tamu berhasil ditambahkan');
    }

    /**
     * Update data tamu
     */
    public function update(Request $request, DaftarTamu $daftarTamu)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'instansi' => 'nullable|string|max:255',
            'tujuan' => 'required|string|max:255',
            'tanggal_kunjungan' => 'required|date',
            'jam_mulai' => 'required|string',
            'jam_selesai' => 'required|string',
        ]);

        $daftarTamu->update($validated);

        return redirect()
            ->back()
            ->with('message', '✏️ Data tamu berhasil diperbarui');
    }

    /**
     * Hapus tamu
     */
    public function destroy(DaftarTamu $daftarTamu)
    {
        $daftarTamu->delete();

        return redirect()
            ->back()
            ->with('message', '🗑️ Data tamu berhasil dihapus');
    }
}