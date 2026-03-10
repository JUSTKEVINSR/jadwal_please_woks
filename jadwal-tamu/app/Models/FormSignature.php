<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSignature extends Model
{
    protected $fillable = [
        'code',
        'name',
        'signature',
    ];
}
