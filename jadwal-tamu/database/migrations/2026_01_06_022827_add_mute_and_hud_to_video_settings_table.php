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
            $table->boolean('is_muted')->default(true)->after('is_shuffle');
            $table->boolean('show_youtube_hud')->default(false)->after('is_muted');
        });
    }

    public function down(): void
    {
        Schema::table('video_settings', function (Blueprint $table) {
            $table->dropColumn(['is_muted', 'show_youtube_hud']);
        });
    }
};
