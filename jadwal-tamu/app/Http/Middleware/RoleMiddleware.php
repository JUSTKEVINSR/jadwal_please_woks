<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    // In app/Http/Middleware/RoleMiddleware.php

public function handle(Request $request, Closure $next, string $role): Response
{
    // Ensure you use the fully qualified class name for Auth
    $user = Auth::user(); 

    // 1. Check if the user is authenticated (logged in).
    if (!$user) {
        return redirect()->route('login');
    }

    // 2. Check the user's role against the required role passed from the route.
    // This assumes your User model has a 'role' column.
    if ($user->role !== $role) {
        // Abort the request with a 403 Forbidden error
        abort(403, 'Unauthorized action. Required role: ' . $role);
    }

    return $next($request);
}

}
