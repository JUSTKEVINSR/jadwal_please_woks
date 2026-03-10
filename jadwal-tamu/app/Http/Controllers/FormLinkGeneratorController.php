<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\JadwalRapat;
use App\Models\FormLink;

class FormLinkGeneratorController extends Controller
{
    public function index()
    {
        $jadwalRapats = JadwalRapat::all();
        $savedLinks = FormLink::with('jadwalRapat')->latest()->get();

        return Inertia::render('FormLinkGenerator/Index', [
            'jadwalRapats' => $jadwalRapats,
            'savedLinks' => $savedLinks
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'jadwal_rapat_id' => 'required|exists:jadwal_rapats,id',
            'url' => 'required|url',
            'photo_required' => 'boolean',
            'close_time' => 'nullable|date',
        ]);

        FormLink::create($validated);

        return redirect()->back()->with('success', 'Link berhasil disimpan!');
    }

    public function toggle(FormLink $formLink)
    {
        $formLink->update(['is_active' => !$formLink->is_active]);
        return redirect()->back()->with('success', 'Status link berhasil diubah!');
    }

    public function destroy(FormLink $formLink)
    {
        $formLink->delete();
        return redirect()->back()->with('success', 'Link berhasil dihapus!');
    }
}
