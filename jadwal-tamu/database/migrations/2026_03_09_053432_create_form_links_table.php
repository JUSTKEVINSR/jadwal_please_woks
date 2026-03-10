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
        Schema::create('form_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jadwal_rapat_id')->nullable()->constrained('jadwal_rapats')->onDelete('cascade');
            $table->text('url');
            $table->boolean('photo_required')->default(true);
            $table->dateTime('close_time')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_links');
    }
};
