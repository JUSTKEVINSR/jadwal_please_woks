<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\RunningTextCreated;
use App\Events\RunningTextUpdated;
use App\Events\RunningTextDeleted;

class RunningTextController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
        ]);

        $runningText = \App\Models\RunningText::create([
            'text' => $request->text,
            'is_active' => true,
        ]);

        RunningTextCreated::dispatch($runningText);

        return back()->with('success', 'Running text berhasil ditambahkan.');
    }

    public function update(Request $request, \App\Models\RunningText $runningText)
    {
        $request->validate([
            'text' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $runningText->update($request->all());

        RunningTextUpdated::dispatch($runningText);

        return back()->with('success', 'Running text berhasil diperbarui.');
    }

    public function destroy(\App\Models\RunningText $runningText)
    {
        $runningText->delete();

        RunningTextDeleted::dispatch($runningText->id);

        return back()->with('success', 'Running text berhasil dihapus.');
    }

    public function toggle(\App\Models\RunningText $runningText)
    {
        $runningText->update([
            'is_active' => !$runningText->is_active
        ]);

        RunningTextUpdated::dispatch($runningText);

        return back()->with('success', 'Status running text berhasil diubah.');
    }
}
