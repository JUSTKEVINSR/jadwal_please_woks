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
}
