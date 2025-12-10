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
        \DB::table('role_master')->insert([
            [
                'name' => 'Admin',
                'role_code' => 1945,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'User',
                'role_code' => 1969,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
