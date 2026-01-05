<?php

namespace App\Events;

use App\Models\JadwalRapat;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;


class JadwalRapatDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public $id;

    /**
     * Create a new event instance.
     */
    public function __construct(int $id)
    {
        $this->id = $id;
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
        return 'jadwal-rapat.deleted';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'jadwal_rapat_id' => $this->id,
            'message' => 'Jadwal rapat telah dihapus realtime'
        ];
    }
}