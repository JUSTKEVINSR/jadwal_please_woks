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
        // Clear existing room_master data
        \DB::table('room_master')->truncate();

        // Insert new room data
        \DB::table('room_master')->insert([
            [
                'name' => 'Ruang Rapat A',
                'room_code' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ruang Rapat B',
                'room_code' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ruang Rapat C',
                'room_code' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Aula Utama',
                'room_code' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear existing room_master data
        \DB::table('room_master')->truncate();

        // Restore original room data
        \DB::table('room_master')->insert([
            [
                'name' => 'Meeting Room A',
                'room_code' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Meeting Room B',
                'room_code' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Meeting Room C',
                'room_code' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Conference Hall',
                'room_code' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
};