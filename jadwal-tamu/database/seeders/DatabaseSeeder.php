<?php

namespace Database\Seeders;

//use App\Models\User; (Legacy Model)
use App\Models\UserPlus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call(RoleMasterSeeder::class);
        $this->call(RoomMasterSeeder::class);
        $this->call(UsersPlusSeeder::class);
    }
}
