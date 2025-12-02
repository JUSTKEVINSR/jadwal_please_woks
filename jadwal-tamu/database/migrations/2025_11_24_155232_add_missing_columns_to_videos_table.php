<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up()
{
    Schema::table('videos', function (Blueprint $table) {
        if (!Schema::hasColumn('videos', 'user_id')) {
            $table->unsignedBigInteger('user_id')->nullable()->after('path');
        }

        if (!Schema::hasColumn('videos', 'token')) {
            $table->string('token')->nullable()->after('user_id');
        }
    });
}

public function down()
{
    Schema::table('videos', function (Blueprint $table) {
        if (Schema::hasColumn('videos', 'user_id')) {
            $table->dropColumn('user_id');
        }

        if (Schema::hasColumn('videos', 'token')) {
            $table->dropColumn('token');
        }
    });
}

};
