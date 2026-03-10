<?php

namespace App\Http\Controllers;

use App\Models\FormPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class FormPhotoController extends Controller
{
    public function index()
    {
        $photos = FormPhoto::latest()->get();
        return Inertia::render('PhotosArchive/Index', [
            'photos' => $photos
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // max 2MB
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $path = $file->store('form_photos', 'public'); // save to storage/app/public/form_photos

            // Generate a unique 4-digit code
            do {
                $code = str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
            } while (FormPhoto::where('code', $code)->exists());

            $formPhoto = FormPhoto::create([
                'code' => $code,
                'photo_path' => Storage::url($path), // generate a URL for the stored file
            ]);

            return response()->json([
                'message' => 'Photo saved successfully',
                'code' => $formPhoto->code,
            ]);
        }

        return response()->json(['message' => 'No photo provided'], 400);
    }

    public function destroy(FormPhoto $formPhoto)
    {
        // Get the relative path from the storage URL
        $path = str_replace('/storage/', '', $formPhoto->photo_path);

        // Delete the file from the storage disk
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $formPhoto->delete();

        return redirect()->back()->with('success', 'Photo deleted successfully');
    }
}
