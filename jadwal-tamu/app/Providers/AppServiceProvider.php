<?php

namespace App\Providers;

use App\Models\JadwalRapat;
use App\Observers\JadwalRapatObserver;
use App\Models\Video;
use App\Observers\VideoObserver;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ✅ Paksa semua asset, route, js, css menjadi HTTPS
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);

        Inertia::share([
            'auth' => fn() => [
                'user' => auth()->user(),
            ],
        ]);

        // Register JadwalRapat Observer
        JadwalRapat::observe(JadwalRapatObserver::class);

        // Register Video Observer
        Video::observe(VideoObserver::class);
    }
}
