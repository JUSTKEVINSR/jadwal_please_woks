<?php

namespace App\Events;

use App\Models\Video;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VideoCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $video;

    public function __construct(Video $video)
    {
        $this->video = $video;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('public-videos'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'video.created';
    }

    public function broadcastWith(): array
    {
        return [
            'video' => $this->video,
            'message' => 'Video baru telah ditambahkan'
        ];
    }
}
