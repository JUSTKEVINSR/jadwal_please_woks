<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class VideoController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            abort(403);
        }
        $videos = Video::select('id', 'tanggal', 'judul', 'durasi', 'status', 'path', 'token', 'source_type')
            // ->where('user_id', auth()->id()) // ❌ Hapus filter user agar semua video tampil
            ->orderBy('tanggal', 'desc')
            ->get()
            ->map(function ($video) {
                // ✅ Generate signed URL untuk setiap video (valid 6 jam)
                if ($video->source_type === 'youtube') {
                    $video->signed_url = $video->path; // Direct link for YouTube
                } elseif ($video->path) {
                    $video->signed_url = URL::temporarySignedRoute(
                        'video.stream',
                        now()->addHours(6),
                        ['video' => $video->id]
                    );
                }
                return $video;
            });

        return Inertia::render('ManajemenVideo/Index', [
            'videos' => $videos
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            abort(403);
        }
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'judul' => 'required|string|max:255',
            'durasi' => 'required|string|max:10',
            'status' => 'required|in:aktif,nonaktif',
            'source_type' => 'required|in:local,youtube',
            'file' => 'nullable|file|mimes:mp4,avi,mov|max:204800',
            'youtube_url' => 'nullable|url',
        ]);

        if ($request->source_type === 'local') {
            if (!$request->hasFile('file')) {
                return back()->withErrors(['file' => 'File video wajib diupload untuk tipe lokal.']);
            }
            $path = $request->file('file')->store('videos', 'public');
            $validated['path'] = $path;
        } elseif ($request->source_type === 'youtube') {
            if (!$request->youtube_url) {
                return back()->withErrors(['youtube_url' => 'Link YouTube wajib diisi.']);
            }
            $validated['path'] = $request->youtube_url;
            $validated['file'] = null; // Ensure no file is processed
        }

        $validated['user_id'] = auth()->id();
        $validated['token'] = bin2hex(random_bytes(20));

        Video::create($validated);

        return back()->with('message', '✅ Video berhasil ditambahkan.');
    }

    public function destroy(Request $request, Video $video)
    {
        if (!$request->user()->isAdmin()) {
            abort(403);
        }
        // ✅ Authorization check
        // ✅ Authorization check (DIPERBOLEHKAN UNTUK SEMUA ADMIN)
        // if ($video->user_id !== auth()->id()) {
        //     abort(403, 'Unauthorized');
        // }

        if ($video->source_type === 'local' && $video->path && Storage::exists("public/" . $video->path)) {
            Storage::delete("public/" . $video->path);
        }

        $video->delete();

        return back()->with('success', 'Video berhasil dihapus.');
    }

    public function toggleStatus(Request $request, Video $video)
    {
        if (!$request->user()->isAdmin()) {
            abort(403);
        }
        // ✅ Authorization check
        // ✅ Authorization check (DIPERBOLEHKAN UNTUK SEMUA ADMIN)
        // if ($video->user_id !== auth()->id()) {
        //     abort(403, 'Unauthorized');
        // }

        $video->update([
            'status' => $video->status === 'aktif' ? 'nonaktif' : 'aktif',
        ]);

        return redirect()->back()->with('message', '✅ Status video diperbarui.');
    }

    /**
     * ✅ Stream dengan Signed URL (Auto-expire, lebih aman)
     * Request sudah divalidasi oleh middleware 'signed'
     */
    public function stream(Request $request, Video $video)
    {
        // Validasi video ada dan aktif (untuk public display)
        // Untuk manajemen, bisa skip validasi aktif
        // if ($video->status !== 'aktif') {
        //     abort(403, 'Video tidak aktif');
        // }

        $filePath = storage_path("app/public/" . $video->path);

        if (!file_exists($filePath)) {
            abort(404, 'File video tidak ditemukan');
        }

        // ✅ Support range requests untuk seeking video
        return $this->streamVideo($filePath, $request);
    }

    /**
     * Stream video dengan support range (untuk seeking)
     */
    private function streamVideo(string $filePath, Request $request)
    {
        $fileSize = filesize($filePath);
        $mimeType = 'video/mp4';

        $start = 0;
        $end = $fileSize - 1;
        $length = $fileSize;

        // ✅ Handle Range request (untuk video seeking)
        if ($request->header('Range')) {
            $range = $request->header('Range');

            if (preg_match('/bytes=(\d+)-(\d*)/', $range, $matches)) {
                $start = intval($matches[1]);
                $end = $matches[2] ? intval($matches[2]) : $end;
                $length = $end - $start + 1;
            }
        }

        $fp = fopen($filePath, 'rb');
        fseek($fp, $start);

        $statusCode = ($request->header('Range')) ? 206 : 200;

        return response()->stream(function () use ($fp, $length) {
            $chunkSize = 1024 * 8; // 8KB chunks
            $read = 0;

            while (!feof($fp) && $read < $length) {
                $toRead = min($chunkSize, $length - $read);
                echo fread($fp, $toRead);
                $read += $toRead;
                flush();
            }

            fclose($fp);
        }, $statusCode, [
            'Content-Type' => $mimeType,
            'Content-Length' => $length,
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
            'X-Content-Type-Options' => 'nosniff',
            ...(($statusCode === 206) ? [
                'Content-Range' => "bytes $start-$end/$fileSize"
            ] : [])
        ]);
    }

    /**
     * ✅ Generate signed URL untuk video tertentu (helper method)
     */
    public static function generateSignedUrl(Video $video, int $expiryHours = 6): string
    {
        return URL::temporarySignedRoute(
            'video.stream',
            now()->addHours($expiryHours),
            ['video' => $video->id]
        );
    }
}