<?php

namespace App\Http\Controllers;

use App\Models\DaftarTamu;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Events\DaftarTamuCreated;
use App\Events\DaftarTamuUpdated;
use App\Events\DaftarTamuDeleted;

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

        $validated['user_id'] = auth()->id();

        $daftarTamu = DaftarTamu::create($validated);

        DaftarTamuCreated::dispatch($daftarTamu);

        return redirect()
            ->back()
            ->with('message', '✅ Tamu berhasil ditambahkan');
    }

    /**
     * Update data tamu
     */
    public function update(Request $request, DaftarTamu $daftarTamu)
    {
        // Authorization: Admin can edit any entry, non-admin can only edit their own
        $user = auth()->user();
        if (!$user->isAdmin() && $daftarTamu->user_id !== $user->id) {
            abort(403, 'You can only edit your own entries.');
        }

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

        DaftarTamuUpdated::dispatch($daftarTamu);

        return redirect()
            ->back()
            ->with('message', '✏️ Data tamu berhasil diperbarui');
    }

    /**
     * Hapus tamu
     */
    public function destroy(DaftarTamu $daftarTamu)
    {
        // Authorization: Admin can delete any entry, non-admin can only delete their own
        $user = auth()->user();
        if (!$user->isAdmin() && $daftarTamu->user_id !== $user->id) {
            abort(403, 'You can only delete your own entries.');
        }

        $daftarTamu->delete();

        DaftarTamuDeleted::dispatch($daftarTamu->id);

        return redirect()
            ->back()
            ->with('message', '🗑️ Data tamu berhasil dihapus');
    }
}