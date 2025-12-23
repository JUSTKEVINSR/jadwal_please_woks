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
        // Update existing string values to integers
        \DB::statement("UPDATE jadwal_rapats SET lokasi = 1 WHERE lokasi NOT REGEXP '^[0-9]+$'");

        Schema::table('jadwal_rapats', function (Blueprint $table) {
            $table->integer('lokasi')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jadwal_rapats', function (Blueprint $table) {
            $table->string('lokasi')->change();
        });
    }
};
