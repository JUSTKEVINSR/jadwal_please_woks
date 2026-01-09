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
        // Convert minutes to seconds
        DB::table('video_settings')->update([
            'cycle_duration' => DB::raw('cycle_duration * 60')
        ]);
    }

    public function down(): void
    {
        // Convert seconds back to minutes
        DB::table('video_settings')->update([
            'cycle_duration' => DB::raw('cycle_duration / 60')
        ]);
    }
};
