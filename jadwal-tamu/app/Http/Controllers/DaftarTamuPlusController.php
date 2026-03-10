<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DaftarTamuPlusController extends Controller
{
    public function index()
    {
        $daftarTamuPluses = \App\Models\DaftarTamuPlus::latest()->get()->map(function ($item) {
            $jadwal = \App\Models\JadwalRapat::where('rapat_code', $item->tujuan)->first();
            $item->tujuan_judul = $jadwal ? $jadwal->judul : $item->tujuan;

            if ($item->signature_code) {
                $sig = \App\Models\FormSignature::where('code', $item->signature_code)->first();
                $item->signature_url = $sig ? $sig->signature : null;
            }

            if ($item->photo_code) {
                $photo = \App\Models\FormPhoto::where('code', $item->photo_code)->first();
                $item->photo_url = $photo ? asset('storage/' . $photo->photo_path) : null;
            }

            return $item;
        });

        return inertia('DaftarTamuPlus/Index', [
            'daftarTamuPluses' => $daftarTamuPluses,
        ]);
    }
}
