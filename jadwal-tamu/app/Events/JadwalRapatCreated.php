<?php

namespace App\Events;

use App\Models\JadwalRapat;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JadwalRapatCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $jadwalRapat;

    /**
     * Create a new event instance.
     */
    public function __construct(JadwalRapat $jadwalRapat)
    {
        $this->jadwalRapat = $jadwalRapat;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('public-jadwal-rapat'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'jadwal-rapat.created';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'jadwal_rapat' => $this->jadwalRapat->load(['room', 'user']),
            'message' => 'Jadwal rapat baru telah ditambahkan realtime'
        ];
    }
}