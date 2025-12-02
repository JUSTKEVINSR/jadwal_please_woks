<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jadwal_rapats', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel users
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            // Detail jadwal
            $table->date('tanggal')->index(); // 🔹 index untuk performa
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->string('judul');
            $table->text('keterangan')->nullable();
            $table->string('lokasi');

            // Identifier unik
            $table->string('slug')->unique();

            // Status
            $table->enum('status', ['Belum', 'Proses', 'Selesai'])->default('Belum');

            $table->timestamps();

            // (Opsional) validasi logis waktu
            // $table->check('jam_selesai > jam_mulai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_rapats');
    }
};
