<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class RunningTextDeleted implements ShouldBroadcast
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
            new Channel('public-running-text'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'running-text.deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'running_text_id' => $this->id,
            'message' => 'Running text telah dihapus'
        ];
    }
}
