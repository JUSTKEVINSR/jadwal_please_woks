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
        Schema::table('video_settings', function (Blueprint $table) {
            $table->enum('display_mode', ['video', 'image'])->default('video');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('video_settings', function (Blueprint $table) {
            $table->dropColumn('display_mode');
        });
    }
};
