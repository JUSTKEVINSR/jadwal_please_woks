import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import { FaPhotoVideo, FaPlus, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Video {
    id?: number;
    tanggal: string;
    judul: string;
    durasi: string;
    status: "aktif" | "nonaktif";
    file?: File | null;
    path?: string | null;
    token?: string;
    signed_url?: string; // ✅ Signed URL dari backend
}

export default function Index() {
    const { videos } = usePage().props as unknown as { videos: Video[] };

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<Video>({
        tanggal: "",
        judul: "",
        durasi: "",
        status: "nonaktif",
        file: null,
    });

    const handleAddVideo = () => {
        setForm({
            tanggal: "",
            judul: "",
            durasi: "",
            status: "nonaktif",
            file: null,
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("tanggal", form.tanggal);
        formData.append("judul", form.judul);
        formData.append("durasi", form.durasi);
        formData.append("status", form.status);
        if (form.file) formData.append("file", form.file);

        router.post("/manajemen-video", formData, {
            onSuccess: () => {
                toast.success("✅ Video berhasil ditambahkan!");
                setShowModal(false);
            },
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
                {/* Button Tambah */}
                <div className="flex justify-end mb-3">
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
                                            className={`px-3 py-1 rounded-full text-white transition-colors ${
                                                v.status === "aktif"
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

                {/* MODAL */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white p-6 rounded-xl w-full max-w-[400px] relative">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute right-3 top-2 text-xl text-gray-500 hover:text-red-600"
                            >
                                ✕
                            </button>

                            <h3 className="text-center font-bold text-lg text-[#0B3D91]">Tambah Video</h3>

                            <form onSubmit={handleSubmit} className="space-y-3 mt-4">
                                <input
                                    type="date"
                                    value={form.tanggal}
                                    onChange={(e) =>
                                        setForm({ ...form, tanggal: e.target.value })
                                    }
                                    className="w-full border p-2 rounded"
                                    required
                                />

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

                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) =>
                                        setForm({ ...form, file: e.target.files?.[0] })
                                    }
                                    className="w-full border p-2 rounded"
                                    required
                                />

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

                <ToastContainer position="bottom-right" autoClose={2000} />
            </div>
        </AuthenticatedLayout>
    );
}