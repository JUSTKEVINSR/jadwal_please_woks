<?php

namespace App\Events;

use App\Models\Gambar;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GambarCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $gambar;

    public function __construct(Gambar $gambar)
    {
        $this->gambar = $gambar;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('public-gambars'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'gambar.created';
    }

    public function broadcastWith(): array
    {
        return [
            'gambar' => $this->gambar,
            'message' => 'Gambar baru telah ditambahkan'
        ];
    }
}
