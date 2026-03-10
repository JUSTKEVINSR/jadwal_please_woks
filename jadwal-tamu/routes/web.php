<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;

use App\Http\Controllers\JadwalRapatController;

use App\Http\Controllers\VideoController;
use App\Http\Controllers\GambarController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FormAbsenRapatController;
use App\Http\Controllers\FormSignatureController;
use App\Http\Controllers\FormLinkGeneratorController;

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
    Route::post('/jadwal-rapat/toggle-auto-approve', [JadwalRapatController::class, 'toggleAutoApprove'])->name('jadwal-rapat.toggle-auto-approve');
    Route::post('/jadwal-rapat/{id}/restore', [JadwalRapatController::class, 'restore'])->name('jadwal-rapat.restore');
    Route::delete('/jadwal-rapat/{id}/force-delete', [JadwalRapatController::class, 'forceDelete'])->name('jadwal-rapat.force-delete');

    // Form Absen Rapat
    Route::get('/form-absen-rapat', [FormAbsenRapatController::class, 'index'])->name('form-absen-rapat.index');

    // Form Link Generator
    Route::get('/form-link-generator', [FormLinkGeneratorController::class, 'index'])->name('form-link-generator.index');
    Route::post('/form-link-generator', [FormLinkGeneratorController::class, 'store'])->name('form-link-generator.store');
    Route::put('/form-link-generator/{formLink}/toggle', [FormLinkGeneratorController::class, 'toggle'])->name('form-link-generator.toggle');
    Route::delete('/form-link-generator/{formLink}', [FormLinkGeneratorController::class, 'destroy'])->name('form-link-generator.destroy');
});
Route::post('/form-absen-rapat', [FormAbsenRapatController::class, 'store'])->name('form-absen-rapat.store');

// Form Signature endpoint (accessible for signatures)
Route::post('/form-signatures', [FormSignatureController::class, 'store'])->name('form-signatures.store');
Route::get('/signatures-archive', [FormSignatureController::class, 'index'])->name('form-signatures.index')->middleware(['auth']);
Route::delete('/form-signatures/{formSignature}', [FormSignatureController::class, 'destroy'])->name('form-signatures.destroy')->middleware(['auth']);

// Form Photo endpoints
Route::post('/form-photos', [\App\Http\Controllers\FormPhotoController::class, 'store'])->name('form-photos.store');
Route::get('/photos-archive', [\App\Http\Controllers\FormPhotoController::class, 'index'])->name('form-photos.index')->middleware(['auth']);
Route::delete('/form-photos/{formPhoto}', [\App\Http\Controllers\FormPhotoController::class, 'destroy'])->name('form-photos.destroy')->middleware(['auth']);



Route::middleware(['auth'])->group(function () {
    Route::get('/daftar-tamu-plus', [\App\Http\Controllers\DaftarTamuPlusController::class, 'index'])->name('daftar-tamu-plus.index');
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

// CRUD Manajemen Gambar
Route::middleware(['auth'])->group(function () {
    Route::get('/manajemen-gambar', [GambarController::class, 'index'])->name('manajemen-gambar.index');
    Route::post('/manajemen-gambar', [GambarController::class, 'store'])->name('manajemen-gambar.store');
    Route::delete('/manajemen-gambar/{gambar}', [GambarController::class, 'destroy'])->name('manajemen-gambar.destroy');
    Route::put('/manajemen-gambar/{gambar}/toggle', [GambarController::class, 'toggleStatus'])->name('manajemen-gambar.toggle');
});

// CRUD Running Text
Route::middleware(['auth'])->group(function () {
    Route::resource('running-text', \App\Http\Controllers\RunningTextController::class)->only(['store', 'update', 'destroy']);
    Route::put('/running-text/{runningText}/toggle', [\App\Http\Controllers\RunningTextController::class, 'toggle'])->name('running-text.toggle');
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


