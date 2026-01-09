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
        if (config('app.env') === 'production' || str_contains(request()->getHost(), 'trycloudflare.com')) {
            URL::forceScheme('https');

            // Fix 419 Page Expired: Ensure cookies work on the tunnel domain
            config(['session.driver' => 'file']); // Ensure driver is file (optional, but safe)
            config(['session.secure' => true]);
            config(['session.domain' => request()->getHost()]);
            config(['sanctum.stateful' => explode(',', request()->getHost())]);
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
