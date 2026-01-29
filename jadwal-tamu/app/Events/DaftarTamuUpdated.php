<?php

namespace App\Events;

use App\Models\DaftarTamu;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DaftarTamuUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $daftarTamu;

    public function __construct(DaftarTamu $daftarTamu)
    {
        $this->daftarTamu = $daftarTamu;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('public-daftar-tamu'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'daftar-tamu.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'daftar_tamu' => $this->daftarTamu,
            'message' => 'Data tamu telah diperbarui'
        ];
    }
}
