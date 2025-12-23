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

public function handle(Request $request, Closure $next, string $roles): Response
{
    // Ensure you use the fully qualified class name for Auth
    $user = Auth::user();

    // 1. Check if the user is authenticated (logged in).
    if (!$user) {
        return redirect()->route('login');
    }

    // 2. Split the roles string into an array of roles.
    $allowedRoles = explode('|', $roles);

    // 3. Check if the user's role is in the allowed roles.
    if (!in_array($user->role, $allowedRoles)) {
        // Abort the request with a 403 Forbidden error
        abort(403, 'Unauthorized action. Required roles: ' . $roles);
    }

    return $next($request);
}

}
