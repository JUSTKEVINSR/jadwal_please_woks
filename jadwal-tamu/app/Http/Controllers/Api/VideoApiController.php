<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class VideoApiController extends Controller
{
    /**
     * 🔹 List semua video (hanya milik user login)
     */
    public function index(Request $request)
    {
        $videos = Video::where('user_id', $request->user()->id)
            ->orderBy('tanggal', 'desc')
            ->get()
            ->map(function ($v) {
                if ($v->source_type === 'youtube') {
                    $v->signed_url = $v->path;
                } else {
                    // Generate signed URL valid 6 jam
                    $v->signed_url = URL::temporarySignedRoute(
                        'video.stream',
                        now()->addHours(6),
                        ['video' => $v->id]
                    );
                }
                return $v;
            });

        return response()->json([
            'success' => true,
            'data' => $videos
        ]);
    }

    /**
     * 🔹 Upload video baru
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'durasi' => 'required|string|max:10',
            'status' => 'required|in:aktif,nonaktif',
            'source_type' => 'required|in:local,youtube',
            'file' => 'nullable|file|mimes:mp4,mov,avi|max:204800',
            'youtube_url' => 'nullable|url',
        ]);

        if ($request->source_type === 'local') {
            if (!$request->hasFile('file')) {
                return response()->json(['success' => false, 'message' => 'File video wajib diupload'], 422);
            }
            $path = $request->file('file')->store('videos', 'public');
            $data['path'] = $path;
        } else {
            if (!$request->youtube_url) {
                return response()->json(['success' => false, 'message' => 'Link YouTube wajib diisi'], 422);
            }
            $data['path'] = $request->youtube_url;
        }

        // Set owner
        $data['user_id'] = $request->user()->id;

        // Create token (optional)
        $data['token'] = bin2hex(random_bytes(20));

        $video = Video::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Video berhasil diupload',
            'data' => $video
        ], 201);
    }

    /**
     * 🔹 Toggle status aktif / nonaktif
     */
    public function toggle(Request $request, Video $video)
    {
        // Prevent akses video user lain
        if ($video->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $video->status = $video->status === 'aktif' ? 'nonaktif' : 'aktif';
        $video->save();

        return response()->json([
            'success' => true,
            'message' => 'Status berhasil diperbarui',
            'data' => $video
        ]);
    }

    /**
     * 🔹 Hapus video (file + database)
     */
    public function destroy(Request $request, Video $video)
    {
        if ($video->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Hapus file
        if ($video->source_type === 'local' && $video->path && Storage::exists("public/" . $video->path)) {
            Storage::delete("public/" . $video->path);
        }

        // Hapus record
        $video->delete();

        return response()->json([
            'success' => true,
            'message' => 'Video berhasil dihapus'
        ]);
    }
}
