<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleMasterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \DB::table('role_master')->updateOrInsert(
            ['role_code' => 1945],
            [
                'name' => 'Admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        \DB::table('role_master')->updateOrInsert(
            ['role_code' => 1969],
            [
                'name' => 'User',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        \DB::table('role_master')->updateOrInsert(
            ['role_code' => 8008],
            [
                'name' => 'ula',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        \DB::table('role_master')->updateOrInsert(
            ['role_code' => 880],
            [
                'name' => 'kasubak',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        \DB::table('role_master')->updateOrInsert(
            ['role_code' => 2026],
            [
                'name' => 'PIC',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}
