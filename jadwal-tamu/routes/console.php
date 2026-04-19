<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-update jadwal rapat status every minute:
//   Belum → Proses  : when jam_mulai has passed today
//   Proses → Selesai: when the meeting date moves to the next day
Schedule::command('jadwal:update-status')->everyMinute();
