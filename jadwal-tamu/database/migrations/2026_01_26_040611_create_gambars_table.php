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
        Schema::create('gambars', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->string('judul');
            $table->string('path'); // File path
            $table->enum('status', ['aktif', 'nonaktif'])->default('nonaktif');
            $table->foreignId('user_id')->nullable()->constrained('users_plus')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gambars');
    }
};
