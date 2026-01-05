<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('jadwal-rapat', function ($user) {
    \Log::info('Channel authorization check', [
        'user_id' => $user?->id,
        'user_authenticated' => auth()->check(),
        'channel' => 'jadwal-rapat'
    ]);

    // For testing, allow all users (authenticated or not)
    // In production, you might want to restrict to authenticated users only
    return true;
});

// Also create a public channel for testing
Broadcast::channel('public-jadwal-rapat', function () {
    return true; // Allow everyone to listen
});

Broadcast::channel('public-videos', function () {
    return true;
});
