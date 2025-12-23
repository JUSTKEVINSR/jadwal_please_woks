<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomMaster extends Model
{
    protected $table = 'room_master';

    protected $fillable = [
        'name',
        'room_code',
    ];
}
