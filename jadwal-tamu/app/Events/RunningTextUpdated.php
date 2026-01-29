<?php

namespace App\Events;

use App\Models\RunningText;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RunningTextUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $runningText;

    public function __construct(RunningText $runningText)
    {
        $this->runningText = $runningText;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('public-running-text'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'running-text.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'running_text' => $this->runningText,
            'message' => 'Running text telah diperbarui'
        ];
    }
}
