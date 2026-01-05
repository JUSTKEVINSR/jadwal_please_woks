<?php

namespace App\Observers;

use App\Events\VideoCreated;
use App\Events\VideoUpdated;
use App\Events\VideoDeleted;
use App\Models\Video;

class VideoObserver
{
    public function created(Video $video)
    {
        \Log::info('VideoObserver: Created event triggered', ['id' => $video->id]);
        event(new VideoCreated($video));
    }

    public function updated(Video $video)
    {
        \Log::info('VideoObserver: Updated event triggered', ['id' => $video->id]);
        event(new VideoUpdated($video));
    }

    public function deleted(Video $video)
    {
        \Log::info('VideoObserver: Deleted event triggered', ['id' => $video->id]);
        event(new VideoDeleted($video->id));
    }
}
