<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoomMasterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \DB::table('room_master')->upsert([
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
        ], ['room_code'], ['name', 'updated_at']);
    }
}
