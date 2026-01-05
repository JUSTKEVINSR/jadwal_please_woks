<?php

namespace App\Observers;

use App\Events\JadwalRapatCreated;
use App\Events\JadwalRapatUpdated;
use App\Events\JadwalRapatDeleted;
use App\Models\JadwalRapat;

class JadwalRapatObserver
{
    public function created(JadwalRapat $jadwalRapat)
    {
        \Log::info('JadwalRapatObserver: Created event triggered', ['id' => $jadwalRapat->id]);
        event(new JadwalRapatCreated($jadwalRapat));
    }

    public function updated(JadwalRapat $jadwalRapat)
    {
        \Log::info('JadwalRapatObserver: Updated event triggered', ['id' => $jadwalRapat->id]);
        event(new JadwalRapatUpdated($jadwalRapat));
    }

    public function deleted(JadwalRapat $jadwalRapat)
    {
        \Log::info('JadwalRapatObserver: Deleted event triggered', ['id' => $jadwalRapat->id]);
        event(new JadwalRapatDeleted($jadwalRapat->id));
    }
}