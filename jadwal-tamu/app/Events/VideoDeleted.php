<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class VideoDeleted implements ShouldBroadcast
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
            new Channel('public-videos'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'video.deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'video_id' => $this->id,
            'message' => 'Video telah dihapus'
        ];
    }
}
