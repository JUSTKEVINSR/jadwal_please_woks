<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        \Log::info('CheckAdminRole middleware', [
            'user_exists' => $user ? true : false,
            'user_class' => $user ? get_class($user) : null,
            'user_id' => $user ? $user->id : null,
            'is_admin_check' => $user ? $user->isAdmin() : false,
        ]);

        if (! $user || ! $user->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
