<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\JadwalRapatApiController;
use App\Http\Controllers\Api\DaftarTamuApiController;
use App\Http\Controllers\Api\VideoApiController;
use App\Http\Controllers\Api\HomeApiController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\VideoController;

/*
|--------------------------------------------------------------------------
| PUBLIC API ROUTES
|--------------------------------------------------------------------------
*/

// Public Home API (tanpa login)
Route::get('/home', [HomeApiController::class, 'index']);

// Public video streaming with signed URL
Route::get('/video/stream/{video}', [VideoController::class, 'stream'])
    ->middleware('signed')
    ->name('api.video.stream');

// Simple test
Route::get('/test', fn() => ['message' => 'API berjalan!']);


/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthApiController::class, 'login']);
Route::post('/logout', [AuthApiController::class, 'logout'])
    ->middleware('auth:sanctum');

// User info (for Postman test)
Route::middleware('auth:sanctum')->get('/user', fn(Request $request) => $request->user());


/*
|--------------------------------------------------------------------------
| PROTECTED API ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Dashboard API
    Route::get('/', [DashboardApiController::class, 'index']);

    // JADWAL RAPAT
    Route::get('/jadwal', [JadwalRapatApiController::class, 'index']);
    Route::post('/jadwal', [JadwalRapatApiController::class, 'store']);
    Route::put('/jadwal/{jadwal}', [JadwalRapatApiController::class, 'update']);
    Route::delete('/jadwal/{jadwal}', [JadwalRapatApiController::class, 'destroy']);
    Route::get('/jadwal/booked-dates', [JadwalRapatApiController::class, 'bookedDates']);
    Route::get('/jadwal/available-slots', [JadwalRapatApiController::class, 'availableSlots']);

    // DAFTAR TAMU
    Route::get('/tamu', [DaftarTamuApiController::class, 'index']);
    Route::post('/tamu', [DaftarTamuApiController::class, 'store']);
    Route::put('/tamu/{tamu}', [DaftarTamuApiController::class, 'update']);
    Route::delete('/tamu/{tamu}', [DaftarTamuApiController::class, 'destroy']);

    // VIDEO MANAGEMENT
    Route::get('/videos', [VideoApiController::class, 'index']);
    Route::post('/videos', [VideoApiController::class, 'store']);
    Route::put('/videos/{video}/toggle', [VideoApiController::class, 'toggle']);
    Route::delete('/videos/{video}', [VideoApiController::class, 'destroy']);
});
