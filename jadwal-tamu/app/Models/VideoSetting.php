<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VideoSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'cycle_duration',
        'is_shuffle',
        'is_muted',
        'is_looped',
        'show_youtube_hud',
    ];

    protected $casts = [
        'is_shuffle' => 'boolean',
        'is_muted' => 'boolean',
        'is_looped' => 'boolean',
        'show_youtube_hud' => 'boolean',
    ];

    /**
     * Get the single settings record or create one if it doesn't exist.
     */
    public static function getSettings()
    {
        return self::firstOrCreate([], [
            'cycle_duration' => 0,
            'is_shuffle' => false,
            'is_muted' => true,
            'is_looped' => false,
            'show_youtube_hud' => false,
        ]);
    }
}
