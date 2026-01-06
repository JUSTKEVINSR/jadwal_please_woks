<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;

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
Route::middleware(['auth'])->group(function () {
    Route::get('/jadwal-rapat', [JadwalRapatController::class, 'index'])->name('jadwal-rapat.index');
    Route::post('/jadwal-rapat', [JadwalRapatController::class, 'store'])->name('jadwal-rapat.store');
    Route::put('/jadwal-rapat/{jadwalRapat}', [JadwalRapatController::class, 'update'])->name('jadwal-rapat.update');
    Route::delete('/jadwal-rapat/{jadwalRapat}', [JadwalRapatController::class, 'destroy'])->name('jadwal-rapat.destroy');
    Route::get('/jadwal-rapat/booked-times', [JadwalRapatController::class, 'getBookedTimes'])->name('jadwal-rapat.booked-times');
    Route::get('/jadwal-rapat/booked-dates', [JadwalRapatController::class, 'getBookedDates'])->name('jadwal-rapat.booked-dates');
});
// CRUD Daftar Tamu
// Route::resource('daftar-tamu', DaftarTamuController::class)->middleware(['auth']);
// ✅ Daftar Tamu - PERBAIKAN ROUTE
Route::middleware(['auth'])->group(function () {
    Route::get('/daftar-tamu', [DaftarTamuController::class, 'index'])->name('daftar-tamu.index');
    Route::post('/daftar-tamu', [DaftarTamuController::class, 'store'])->name('daftar-tamu.store');
    Route::put('/daftar-tamu/{daftarTamu}', [DaftarTamuController::class, 'update'])->name('daftar-tamu.update');
    Route::delete('/daftar-tamu/{daftarTamu}', [DaftarTamuController::class, 'destroy'])->name('daftar-tamu.destroy');
});
// CRUD Manajemen Video
// ✅ MANUAL DEFINE CRUD VIDEO (mencegah bentrok)
Route::middleware(['auth'])->group(function () {
    Route::get('/manajemen-video', [VideoController::class, 'index'])->name('manajemen-video.index');
    Route::post('/manajemen-video', [VideoController::class, 'store'])->name('manajemen-video.store');
    Route::delete('/manajemen-video/{video}', [VideoController::class, 'destroy'])->name('manajemen-video.destroy');
    Route::put('/manajemen-video/{video}/toggle', [VideoController::class, 'toggleStatus'])->name('manajemen-video.toggle');
    Route::patch('/manajemen-video/settings', [VideoController::class, 'updateSettings'])->name('manajemen-video.update-settings');
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


//BUAT BIKIN AKUN USER BARU DI BAWAH

// User Management Routes (accessible to any authenticated user)
Route::resource('users', UserController::class)->middleware(['auth', 'verified']);

// UserPlus routes accessible to any authenticated user
Route::get('/users_plus', [UserController::class, 'index'])->name('users_plus.index')->middleware(['auth', 'verified']);
Route::get('/users_plus/create', [UserController::class, 'create'])->name('users_plus.create')->middleware(['auth', 'verified']);
Route::post('/users_plus', [UserController::class, 'storePlus'])->name('users_plus.store')->middleware(['auth', 'verified']);

Route::middleware(['auth', 'verified'])->group(function () {

    // UserPlus routes accessible to any authenticated user
    Route::put('/users_plus/{userPlus}', [UserController::class, 'updatePlus'])->name('users_plus.update');
    Route::delete('/users_plus/{userPlus}', [UserController::class, 'destroyPlus'])->name('users_plus.destroy');

    // If you need other admin routes that are NOT part of the standard resource, add them here:
    // Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');

});

// Standard Laravel Breeze routes (Profile, Dashboard, etc.)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// The authentication routes from Breeze
require __DIR__ . '/auth.php';


