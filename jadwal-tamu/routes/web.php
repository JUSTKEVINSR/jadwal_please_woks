<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\JadwalRapatController;
use App\Http\Controllers\DaftarTamuController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ✅ Halaman utama menampilkan jadwal & video
Route::get('/', [HomeController::class, 'index'])->name('home');
// Dashboard
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');
// CRUD Jadwal Rapat
Route::resource('jadwal-rapat', JadwalRapatController::class)->middleware(['auth']);
// CRUD Daftar Tamu
// Route::resource('daftar-tamu', DaftarTamuController::class)->middleware(['auth']);
 // ✅ Daftar Tamu - PERBAIKAN ROUTE
    Route::get('/daftar-tamu', [DaftarTamuController::class, 'index'])->name('daftar-tamu.index');
    Route::post('/daftar-tamu', [DaftarTamuController::class, 'store'])->name('daftar-tamu.store');
    Route::put('/daftar-tamu/{daftarTamu}', [DaftarTamuController::class, 'update'])->name('daftar-tamu.update');
    Route::delete('/daftar-tamu/{daftarTamu}', [DaftarTamuController::class, 'destroy'])->name('daftar-tamu.destroy');
// CRUD Manajemen Video
// ✅ MANUAL DEFINE CRUD VIDEO (mencegah bentrok)
Route::middleware(['auth'])->group(function () {
    Route::get('/manajemen-video', [VideoController::class, 'index'])->name('manajemen-video.index');
    Route::post('/manajemen-video', [VideoController::class, 'store'])->name('manajemen-video.store');
    Route::delete('/manajemen-video/{video}', [VideoController::class, 'destroy'])->name('manajemen-video.destroy');
    Route::put('/manajemen-video/{video}/toggle', [VideoController::class, 'toggleStatus'])->name('manajemen-video.toggle');
});

// ===========================
// STREAM VIDEO PAKAI SIGNED URL
// ===========================
Route::get('/video/stream/{video}', [VideoController::class, 'stream'])
    ->middleware('signed')
    ->name('video.stream');

// Profile & Auth
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
