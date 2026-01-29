<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class DaftarTamuDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public $id;

    public function __construct(int $id)
    {
        $this->id = $id;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('public-daftar-tamu'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'daftar-tamu.deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'daftar_tamu_id' => $this->id,
            'message' => 'Data tamu telah dihapus'
        ];
    }
}
