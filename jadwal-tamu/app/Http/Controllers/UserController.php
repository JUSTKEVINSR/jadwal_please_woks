<?php

namespace App\Http\Controllers;

//use App\Models\User; (Legacy Model)
use App\Models\UserPlus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; // For hashing the password
use Illuminate\Validation\Rules; // For password rules
use Illuminate\Http\RedirectResponse;

use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return $this->create();
    }

    public function create(): Response
    {
        \Log::info('UserController create called');

        if (!request()->user()->isAdmin()) {
            abort(403);
        }

        $users = UserPlus::select('id', 'name', 'email', 'role_code')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => match ($user->role_code) {
                    1945 => 'admin',
                    8008 => 'ula',
                    880 => 'kasubak',
                    default => 'user',
                },
            ];
        });

        \Log::info('Users found', ['count' => $users->count(), 'users' => $users->toArray()]);

        return Inertia::render('Profile/Users/Create', [
            'users' => $users,
        ]);
    }



    public function store(Request $request): RedirectResponse
    {
        \Log::info('UserController store called', ['request_data' => $request->all()]);

        if (!$request->user()->isAdmin()) {
            abort(403); // Forbidden
        }
        // 1. Validation
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users_plus,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:user,admin,ula,kasubak',
            //'password' => ['required', 'confirmed', Rules\Password::defaults()],
            // Optional: Validate role if your system uses them
            // 'role' => 'required|in:admin,editor,user',
        ]);
        \Log::info('Validation passed', ['validated' => $validated]);
        try {
            // 2. Creation
            // Map role to role_code
            $roleCode = match ($validated['role']) {
                'admin' => 1945,
                'ula' => 8008,
                'kasubak' => 880,
                default => 1969, // user
            };
            $user = UserPlus::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']), // Must hash the password!
                'role_code' => $roleCode,
            ]);
            \Log::info('User created', ['user_id' => $user->id]);

            // 3. Redirection/Response
            // Redirect to the user index page or display a success message
            // return Redirect::route('users.index')->with('success', 'User successfully created!');

            return redirect()->back()->with('success', 'User created successfully!');
        } catch (\Exception $e) {
            // Log the exception for debugging
            \Log::error("User creation failed: " . $e->getMessage());

            // Return an error to the frontend via Inertia
            return redirect()->back()->withErrors(['general' => 'Failed to create user due to a server error.']);
        }


    }

    public function storePlus(Request $request): RedirectResponse
    {
        \Log::info('UserController storePlus called', ['request_data' => $request->all()]);

        if (!$request->user()->isAdmin()) {
            abort(403); // Forbidden
        }
        // 1. Validation
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users_plus,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:user,admin,ula,kasubak',
        ]);
        \Log::info('Validation passed', ['validated' => $validated]);

        // Map role to role_code
        $roleCode = match ($validated['role']) {
            'admin' => 1945,
            'ula' => 8008,
            'kasubak' => 880,
            default => 1969, // user
        };

        try {
            // 2. Creation
            $userPlus = UserPlus::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role_code' => $roleCode,
            ]);
            \Log::info('UserPlus created', ['user_id' => $userPlus->id]);

            // 3. Redirection/Response
            return redirect()->back()->with('success', 'UserPlus created successfully!');
        } catch (\Exception $e) {
            // Log the exception for debugging
            \Log::error("UserPlus creation failed: " . $e->getMessage());

            // Return an error to the frontend via Inertia
            return redirect()->back()->withErrors(['general' => 'Failed to create user due to a server error.']);
        }
    }

    public function updatePlus(Request $request, $id): RedirectResponse
    {
        \Log::info('UserController updatePlus called', ['id' => $id, 'request_data' => $request->all()]);

        if (!$request->user()->isAdmin()) {
            abort(403); // Forbidden
        }
        // 1. Validation
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users_plus,email,' . $id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:user,admin,ula,kasubak',
        ]);
        \Log::info('Validation passed', ['validated' => $validated]);

        // Map role to role_code
        $roleCode = match ($validated['role']) {
            'admin' => 1945,
            'ula' => 8008,
            'kasubak' => 880,
            default => 1969, // user
        };

        try {
            // 2. Find and update
            $userPlus = UserPlus::findOrFail($id);
            $userPlus->name = $validated['name'];
            $userPlus->email = $validated['email'];
            if (!empty($validated['password'])) {
                $userPlus->password = Hash::make($validated['password']);
            }
            $userPlus->role_code = $roleCode;
            $userPlus->save();
            \Log::info('UserPlus updated', ['user_id' => $userPlus->id]);

            // 3. Redirection/Response
            return redirect()->back()->with('success', 'UserPlus updated successfully!');
        } catch (\Exception $e) {
            // Log the exception for debugging
            \Log::error("UserPlus update failed: " . $e->getMessage());

            // Return an error to the frontend via Inertia
            return redirect()->back()->withErrors(['general' => 'Failed to update user due to a server error.']);
        }
    }

    public function destroyPlus(Request $request, $id): RedirectResponse
    {
        \Log::info('UserController destroyPlus called', ['id' => $id]);

        if (!$request->user()->isAdmin()) {
            abort(403); // Forbidden
        }

        try {
            $userPlus = UserPlus::findOrFail($id);
            $userPlus->delete();
            \Log::info('UserPlus deleted', ['user_id' => $id]);

            return redirect()->back()->with('success', 'UserPlus deleted successfully!');
        } catch (\Exception $e) {
            \Log::error("UserPlus delete failed: " . $e->getMessage());

            return redirect()->back()->withErrors(['general' => 'Failed to delete user due to a server error.']);
        }
    }

    //public function index(): Response
    //{
    //    $users = User::select('id', 'name', 'email', 'role', 'created_at')
    //                 ->orderBy('name', 'asc')
    //                 ->get();

    //    return Inertia::render('Users/Index', [
    //        'users' => $users,
    //    ]);
    //}
}
