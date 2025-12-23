<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DaftarTamu;
use Illuminate\Http\Request;

class DaftarTamuApiController extends Controller
{
    // GET /api/tamu
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => DaftarTamu::orderBy('tanggal_kunjungan', 'desc')
                ->orderBy('jam_mulai', 'asc')
                ->get()
        ]);
    }

    // POST /api/tamu
    public function store(Request $request)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'instansi' => 'nullable|string|max:255',
            'tujuan' => 'required|string|max:255',
            'tanggal_kunjungan' => 'required|date',
            'jam_mulai' => 'required|string',
            'jam_selesai' => 'required|string',
        ]);

        $data['user_id'] = auth()->id();

        $tamu = DaftarTamu::create($data);

        return response()->json([
            'success' => true,
            'data' => $tamu
        ], 201);
    }

    // PUT /api/tamu/{tamu}
    public function update(Request $request, DaftarTamu $tamu)
    {
        // Authorization: Admin can edit any entry, non-admin can only edit their own
        $user = auth()->user();
        if (!$user->isAdmin() && $tamu->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only edit your own entries.'
            ], 403);
        }

        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'instansi' => 'nullable|string|max:255',
            'tujuan' => 'required|string|max:255',
            'tanggal_kunjungan' => 'required|date',
            'jam_mulai' => 'required|string',
            'jam_selesai' => 'required|string',
        ]);

        $tamu->update($data);

        return response()->json([
            'success' => true,
            'data' => $tamu
        ]);
    }

    // DELETE /api/tamu/{tamu}
    public function destroy(DaftarTamu $tamu)
    {
        // Authorization: Admin can delete any entry, non-admin can only delete their own
        $user = auth()->user();
        if (!$user->isAdmin() && $tamu->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own entries.'
            ], 403);
        }

        $tamu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data tamu berhasil dihapus'
        ]);
    }
}
