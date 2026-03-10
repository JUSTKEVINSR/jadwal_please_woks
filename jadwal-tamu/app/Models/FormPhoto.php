<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormPhoto extends Model
{
    protected $fillable = [
        'code',
        'name',
        'photo_path',
    ];
}
