<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('daftar_tamu_pluses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('nama');
            $table->string('jabatan')->nullable();
            $table->string('instansi')->nullable();
            $table->string('tujuan');
            $table->date('tanggal_kunjungan');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->integer('signature_code')->nullable();
            $table->integer('photo_code')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users_plus')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daftar_tamu_pluses');
    }
};
