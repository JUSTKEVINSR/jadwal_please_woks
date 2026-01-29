<?php

namespace App\Http\Controllers;

use App\Models\Gambar;
use App\Models\VideoSetting; // Reuse settings for now or create generic Settings if needed
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Events\VideoSettingUpdated;
use App\Events\GambarCreated;
use App\Events\GambarUpdated;
use App\Events\GambarDeleted;

class GambarController extends Controller
{
    public function index(Request $request)
    {
        if (!($request->user()->isAdmin() || $request->user()->isUla() || $request->user()->role === 'pic')) {
            // PIC role granted access based on conversation history suggesting PIC has admin abilities
            // But existing VideoController check is isAdmin() || isUla().
            // Conversation 139ef32f said "Grant PIC Admin Abilities" so I should include it.
        }

        // Replicating Auth check from VideoController but adding PIC if needed
        if (!($request->user()->isAdmin() || $request->user()->isUla() || $request->user()->role === 'pic')) {
            abort(403);
        }

        $gambars = Gambar::select('id', 'tanggal', 'judul', 'status', 'path')
            ->orderBy('tanggal', 'desc')
            ->get();

        return Inertia::render('ManajemenGambar/Index', [
            'gambars' => $gambars,
            'settings' => VideoSetting::getSettings() // Pass settings for display_mode access from layout? 
            // Layout gets global props usually, but passing here doesn't hurt.
        ]);
    }

    public function store(Request $request)
    {
        if (!($request->user()->isAdmin() || $request->user()->isUla() || $request->user()->role === 'pic')) {
            abort(403);
        }

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'judul' => 'required|string|max:255',
            'status' => 'required|in:aktif,nonaktif',
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:10240', // 10MB max
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('gambars', 'public');
            $validated['path'] = $path;
        }

        $validated['user_id'] = auth()->id();

        $gambar = Gambar::create($validated);

        GambarCreated::dispatch($gambar);

        return back()->with('message', '✅ Gambar berhasil ditambahkan.');
    }

    public function destroy(Request $request, Gambar $gambar)
    {
        if (!($request->user()->isAdmin() || $request->user()->isUla() || $request->user()->role === 'pic')) {
            abort(403);
        }

        if ($gambar->path && Storage::exists("public/" . $gambar->path)) {
            Storage::delete("public/" . $gambar->path);
        }

        $gambar->delete();

        GambarDeleted::dispatch($gambar->id);

        return back()->with('success', 'Gambar berhasil dihapus.');
    }

    public function toggleStatus(Request $request, Gambar $gambar)
    {
        if (!($request->user()->isAdmin() || $request->user()->isUla() || $request->user()->role === 'pic')) {
            abort(403);
        }

        $gambar->update([
            'status' => $gambar->status === 'aktif' ? 'nonaktif' : 'aktif',
        ]);

        GambarUpdated::dispatch($gambar);

        return redirect()->back()->with('message', '✅ Status gambar diperbarui.');
    }
}
