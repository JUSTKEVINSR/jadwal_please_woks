import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import { FaPhotoVideo, FaPlus, FaTrash, FaCalendarAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowRotateRight, FaShuffle, FaYoutube, FaMusic, FaRepeat } from "react-icons/fa6";
import CircularDatePicker from "@/Components/CircularDatePicker";

interface Video {
    id?: number;
    tanggal: string;
    judul: string;
    durasi: string;
    status: "aktif" | "nonaktif";
    file?: File | null;
    path?: string | null;
    token?: string;
    source_type: 'local' | 'youtube';
    signed_url?: string; // ✅ Signed URL dari backend
}



export default function Index() {
    const { videos, auth, settings } = usePage().props as any;

    useEffect(() => {
        if (auth.user.role !== 'admin' && auth.user.role !== 'ula' && auth.user.role !== 'pic') {
            router.visit('/');
        }
    }, [auth.user.role]);

    // Real-time updates for videos
    useEffect(() => {
        if (window.Echo) {
            const channel = window.Echo.channel('public-videos');

            channel.listen('.video.created', (data: any) => {
                console.log('VideoManager: New video created:', data);
                toast.success('Video baru telah ditambahkan (Realtime)');
                router.reload({ only: ['videos'] });
            });

            channel.listen('.video.updated', (data: any) => {
                console.log('VideoManager: Video updated:', data);
                toast.info('Video telah diperbarui (Realtime)');
                router.reload({ only: ['videos'] });
            });

            channel.listen('.video.deleted', (data: any) => {
                console.log('VideoManager: Video deleted:', data);
                toast.info('Video telah dihapus (Realtime)');
                router.reload({ only: ['videos'] });
            });

            channel.listen('.video.settings.updated', (data: any) => {
                console.log('VideoManager: Settings updated:', data);
                router.reload({ only: ['settings'] });
            });

            return () => {
                channel.stopListening('.video.created');
                channel.stopListening('.video.updated');
                channel.stopListening('.video.deleted');
            };
        }
    }, []);

    const [showModalAdd, setShowModalAdd] = useState(false);
    const [showModalCycle, setShowModalCycle] = useState(false);
    const [form, setForm] = useState<Video & { youtube_url?: string }>({
        tanggal: (() => {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })(),
        judul: "",
        durasi: "",
        status: "nonaktif",
        source_type: 'local',
        file: null,
        youtube_url: '',
    });

    const handleAddVideo = () => {
        setForm({
            tanggal: (() => {
                const d = new Date();
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            })(),
            judul: "",
            durasi: "",
            status: "nonaktif",
            source_type: 'local',
            file: null,
            youtube_url: '',
        });
        setShowModalAdd(true);
    };

    const [cycleDuration, setCycleDuration] = useState(settings?.cycle_duration || 0);

    const handleVideoCycle = () => {
        setCycleDuration(settings?.cycle_duration || 0);
        setShowModalCycle(true);
    };

    const handleUpdateCycle = (e: React.FormEvent) => {
        e.preventDefault();
        router.patch(route('manajemen-video.update-settings'), {
            cycle_duration: cycleDuration
        }, {
            onSuccess: () => {
                toast.success("✅ Durasi cycle diperbarui!");
                setShowModalCycle(false);
            }
        });
    };

    const handleShuffle = () => {
        router.patch(route('manajemen-video.update-settings'), {
            is_shuffle: !settings.is_shuffle
        }, {
            onSuccess: () => {
                toast.info(`🔄 Shuffle ${!settings.is_shuffle ? 'Aktif' : 'Nonaktif'}`);
            }
        });
    };

    const handleToggleMute = () => {
        router.patch(route('manajemen-video.update-settings'), {
            is_muted: !settings.is_muted
        }, {
            onSuccess: () => {
                toast.info(`🔊 Video ${!settings.is_muted ? 'Muted' : 'Unmuted'}`);
            }
        });
    };

    const handleToggleHud = () => {
        router.patch(route('manajemen-video.update-settings'), {
            show_youtube_hud: !settings.show_youtube_hud
        }, {
            onSuccess: () => {
                toast.info(`📺 YouTube HUD ${!settings.show_youtube_hud ? 'On' : 'Off'}`);
            }
        });
    };

    const handleToggleLoop = () => {
        router.patch(route('manajemen-video.update-settings'), {
            is_looped: !settings.is_looped
        }, {
            onSuccess: () => {
                toast.info(`🔄 Loop Video ${!settings.is_looped ? 'Aktif' : 'Nonaktif'}`);
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("tanggal", form.tanggal);
        formData.append("judul", form.judul);
        formData.append("durasi", form.durasi);
        formData.append("status", form.status);
        formData.append("source_type", form.source_type);

        if (form.source_type === 'local' && form.file) {
            formData.append("file", form.file);
        } else if (form.source_type === 'youtube' && form.youtube_url) {
            formData.append("youtube_url", form.youtube_url);
        }

        router.post("/manajemen-video", formData, {
            onSuccess: () => {
                toast.success("✅ Video berhasil ditambahkan!");
                setShowModalAdd(false);
            },
            onError: (errors) => {
                console.error("Upload Error:", errors);
                if (errors.file) {
                    toast.error(errors.file);
                } else if (Object.keys(errors).length > 0) {
                    toast.error(`Gagal menyimpan: ${Object.values(errors)[0]}`);
                } else {
                    toast.error("Gagal mengupload video. Pastikan ukuran file < 40MB.");
                }
            }
        });
    };

    const handleDelete = (id?: number) => {
        if (!id) return;
        if (confirm("Hapus video ini?")) {
            router.delete(`/manajemen-video/${id}`, {
                preserveScroll: true,
                onSuccess: () => toast.info("🗑️ Video dihapus"),
            });
        }
    };

    const handleToggleStatus = (id: number) => {
        router.put(`/manajemen-video/${id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.info("🔄 Status diperbarui!");
                router.reload();
            },
        });
    };

    const MAX_ROWS = 7;
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(videos.length / MAX_ROWS);
    const start = (page - 1) * MAX_ROWS;
    const currentRows = videos.slice(start, start + MAX_ROWS);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl md:text-3xl font-bold text-[#0B3D91] flex items-center gap-2">
                    <FaPhotoVideo /> Manajemen Video
                </h2>
            }
        >
            <div className="bg-[#B0DAFF] p-5 rounded-2xl shadow-md">



                <div className="flex justify-end mb-3 col-span-1 gap-2">

                    {/* Button Mute */}
                    <button
                        onClick={handleToggleMute}
                        className={`${settings?.is_muted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#0B3D91] hover:bg-[#001f45]'} text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors`}
                        title={settings?.is_muted ? 'Klik untuk Unmute' : 'Klik untuk Mute'}
                    >
                        <FaMusic /> {settings?.is_muted ? 'Mute Aktif' : 'Mute Video'}
                    </button>

                    {/* Button Youtube Hud */}
                    <button
                        onClick={handleToggleHud}
                        className={`${settings?.show_youtube_hud ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0B3D91] hover:bg-[#001f45]'} text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors`}
                        title={settings?.show_youtube_hud ? 'Klik untuk Sembunyikan HUD' : 'Klik untuk Tampilkan HUD'}
                    >
                        <FaYoutube /> {settings?.show_youtube_hud ? 'Hud On' : 'Hud Off'}
                    </button>

                    {/* Button Shuffle video */}
                    <button
                        onClick={handleShuffle}
                        className={`${settings?.is_shuffle ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0B3D91] hover:bg-[#001f45]'} text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors`}
                    >
                        <FaShuffle /> {settings?.is_shuffle ? 'Shuffle Aktif' : 'Shuffle Video'}
                    </button>


                    {/* Button Cycle video */}

                    <button
                        onClick={handleVideoCycle}
                        className={`${settings?.cycle_duration > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0B3D91] hover:bg-[#001f45]'} text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors`}
                    >

                        <FaArrowRotateRight /> Cycle: {settings?.cycle_duration > 0 ? `${settings.cycle_duration}` : 'Off'}
                    </button>

                    {/* Button loop video */}

                    <button
                        onClick={handleToggleLoop}
                        className={`${settings?.is_looped ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0B3D91] hover:bg-[#001f45]'} text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors`}
                    >

                        <FaRepeat /> Loop: {settings?.is_looped ? 'On' : 'Off'}
                    </button>


                    {/* Button Tambah */}

                    <button
                        onClick={handleAddVideo}
                        className="bg-[#0B3D91] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#001f45]"
                    >
                        <FaPlus /> Tambah Video
                    </button>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm text-gray-700">
                        <thead className="bg-[#0B3D91] text-white">
                            <tr>
                                <th className="p-2 border">Tanggal</th>
                                <th className="p-2 border">Judul</th>
                                <th className="p-2 border">Source</th>
                                <th className="p-2 border">Durasi</th>
                                <th className="p-2 border">File</th>
                                <th className="p-2 border">Status</th>
                                <th className="p-2 border">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentRows.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-4 text-gray-500 italic">
                                        Tidak ada video
                                    </td>
                                </tr>
                            )}

                            {currentRows.map((v) => (
                                <tr key={v.id} className="border hover:bg-gray-50">
                                    <td className="p-2 border">{v.tanggal}</td>
                                    <td className="p-2 border">{v.judul}</td>
                                    <td className="p-2 border text-center">
                                        {v.source_type === 'youtube' ? (
                                            <span className="text-red-600 font-bold text-xs border border-red-200 bg-red-50 px-2 py-1 rounded">YouTube</span>
                                        ) : (
                                            <span className="text-blue-600 font-bold text-xs border border-blue-200 bg-blue-50 px-2 py-1 rounded">Local</span>
                                        )}
                                    </td>
                                    <td className="p-2 border text-center">{v.durasi}</td>
                                    <td className="p-2 border text-center">
                                        {v.path && v.signed_url ? (
                                            <a
                                                href={v.signed_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline hover:text-blue-800"
                                            >
                                                Lihat Video
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 italic">Tidak ada</span>
                                        )}
                                    </td>

                                    <td className="p-2 border text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(v.id!)}
                                            className={`px-3 py-1 rounded-full text-white transition-colors ${v.status === "aktif"
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-red-500 hover:bg-red-600"
                                                }`}
                                        >
                                            {v.status === "aktif" ? "Aktif" : "Nonaktif"}
                                        </button>
                                    </td>

                                    <td className="p-2 border text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(v.id!)}
                                            className="text-red-500 text-lg hover:text-red-700 transition-colors"
                                            title="Hapus video"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-4 gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-4 py-2 border rounded disabled:opacity-40 hover:bg-gray-100 transition-colors"
                        >
                            « Prev
                        </button>

                        <span className="px-4 py-2 bg-[#0B3D91] text-white rounded">
                            Halaman {page} dari {totalPages}
                        </span>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="px-4 py-2 border rounded disabled:opacity-40 hover:bg-gray-100 transition-colors"
                        >
                            Next »
                        </button>
                    </div>
                )}

                {/* MODAL Tambah Video */}
                {showModalAdd && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white p-6 rounded-xl w-full max-w-[400px] relative">
                            <button
                                onClick={() => setShowModalAdd(false)}
                                className="absolute right-3 top-2 text-xl text-gray-500 hover:text-red-600"
                            >
                                ✕
                            </button>

                            <h3 className="text-center font-bold text-lg text-[#0B3D91]">Tambah Video</h3>

                            <form onSubmit={handleSubmit} className="space-y-3 mt-4">

                                <div className="relative">
                                    <CircularDatePicker
                                        selectedDate={form.tanggal ? new Date(form.tanggal) : new Date()}
                                        onDateChange={(date) => {
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            setForm({ ...form, tanggal: `${year}-${month}-${day}` });
                                        }}
                                    />
                                    <FaCalendarAlt className="absolute right-3 top-3 text-[#0B3D91] pointer-events-none" />
                                </div>

                                <input
                                    type="text"
                                    value={form.judul}
                                    onChange={(e) =>
                                        setForm({ ...form, judul: e.target.value })
                                    }
                                    className="w-full border p-2 rounded"
                                    placeholder="Judul"
                                    required
                                />

                                <input
                                    type="text"
                                    value={form.durasi}
                                    onChange={(e) =>
                                        setForm({ ...form, durasi: e.target.value })
                                    }
                                    className="w-full border p-2 rounded"
                                    placeholder="Durasi (contoh: 05:30)"
                                    required
                                />

                                {/* Source Type Selection */}
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="source_type"
                                            value="local"
                                            checked={form.source_type === 'local'}
                                            onChange={() => setForm({ ...form, source_type: 'local' })}
                                        />
                                        <span>Upload File</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="source_type"
                                            value="youtube"
                                            checked={form.source_type === 'youtube'}
                                            onChange={() => setForm({ ...form, source_type: 'youtube' })}
                                        />
                                        <span>YouTube Link</span>
                                    </label>
                                </div>

                                {form.source_type === 'local' ? (
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) =>
                                            setForm({ ...form, file: e.target.files?.[0] })
                                        }
                                        className="w-full border p-2 rounded"
                                        required
                                    />
                                ) : (
                                    <input
                                        type="url"
                                        value={form.youtube_url}
                                        onChange={(e) =>
                                            setForm({ ...form, youtube_url: e.target.value })
                                        }
                                        className="w-full border p-2 rounded"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        required
                                    />
                                )}



                                <button
                                    type="submit"
                                    className="w-full bg-[#0B3D91] text-white p-2 rounded hover:bg-[#001f45] transition-colors"
                                >
                                    Simpan
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL CYCLE */}
                {showModalCycle && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white p-6 rounded-xl w-full max-w-[400px] relative">
                            <button
                                onClick={() => setShowModalCycle(false)}
                                className="absolute right-3 top-2 text-xl text-gray-500 hover:text-red-600"
                            >
                                ✕
                            </button>

                            <h3 className="text-center font-bold text-lg text-[#0B3D91]">Pengaturan Cycle Video</h3>

                            <form onSubmit={handleUpdateCycle} className="space-y-4 mt-4">

                                {/* Duration Selection */}
                                <div className="grid grid-cols-2 gap-2">
                                    {[0, 30, 300, 600, 1800].map((sec) => (
                                        <label key={sec} className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded border hover:bg-gray-100">
                                            <input
                                                type="radio"
                                                name="cycle_duration"
                                                value={sec}
                                                checked={cycleDuration === sec}
                                                onChange={() => setCycleDuration(sec)}
                                            />
                                            <span>
                                                {sec === 0 ? 'Off' :
                                                    sec < 60 ? `${sec} Detik` :
                                                        `${sec / 60} Menit`
                                                }
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Custom (Detik)</label>
                                    <input
                                        type="number"
                                        value={cycleDuration}
                                        onChange={(e) => setCycleDuration(parseInt(e.target.value) || 0)}
                                        className="w-full border p-2 rounded"
                                        placeholder="durasi cycle per menit"
                                        min="0"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#0B3D91] text-white p-2 rounded hover:bg-[#001f45] transition-colors font-bold"
                                >
                                    Simpan Pengaturan
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <ToastContainer position="bottom-right" autoClose={2000} />
            </div>
        </AuthenticatedLayout>
    );
}