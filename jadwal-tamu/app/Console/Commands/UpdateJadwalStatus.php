<?php

namespace App\Console\Commands;

use App\Models\JadwalRapat;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateJadwalStatus extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'jadwal:update-status';

    /**
     * The console command description.
     */
    protected $description = 'Auto-update jadwal rapat status: Proses (jam mulai passed today), Selesai (date is past day)';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $now       = Carbon::now();
        $today     = $now->toDateString();
        $timeNow   = $now->format('H:i:s');

        // ─── 1. Belum → Proses ───────────────────────────────────────────────
        // Meeting is TODAY and jam_mulai has already passed → set to Proses
        $toProses = JadwalRapat::where('status', 'Belum')
            ->whereDate('tanggal', $today)
            ->whereTime('jam_mulai', '<=', $timeNow)
            ->get();

        foreach ($toProses as $jadwal) {
            $jadwal->update(['status' => 'Proses']);
            $this->info("→ Proses  : [{$jadwal->id}] {$jadwal->judul} ({$jadwal->tanggal} {$jadwal->jam_mulai})");
        }

        // ─── 2. Proses → Selesai ─────────────────────────────────────────────
        // Meeting date is BEFORE today (next day has come) → set to Selesai
        $toSelesai = JadwalRapat::where('status', 'Proses')
            ->whereDate('tanggal', '<', $today)
            ->get();

        foreach ($toSelesai as $jadwal) {
            $jadwal->update(['status' => 'Selesai']);
            $this->info("→ Selesai : [{$jadwal->id}] {$jadwal->judul} ({$jadwal->tanggal})");
        }

        // Edge-case: also catch any 'Belum' schedules from past days
        $belumPast = JadwalRapat::where('status', 'Belum')
            ->whereDate('tanggal', '<', $today)
            ->get();

        foreach ($belumPast as $jadwal) {
            $jadwal->update(['status' => 'Selesai']);
            $this->info("→ Selesai : [{$jadwal->id}] {$jadwal->judul} (was Belum, past date: {$jadwal->tanggal})");
        }

        $total = $toProses->count() + $toSelesai->count() + $belumPast->count();
        $this->info("Done. {$total} jadwal updated.");
    }
}
