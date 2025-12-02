<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalRapat;
use Illuminate\Http\Request;

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
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'judul' => 'required|string|max:255',
            'lokasi' => 'required|string',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:Belum,Proses,Selesai',
        ]);

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
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'judul' => 'required|string|max:255',
            'lokasi' => 'required|string',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:Belum,Proses,Selesai',
        ]);

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
}
