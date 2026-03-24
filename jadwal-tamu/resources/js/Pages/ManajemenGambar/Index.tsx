import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import { FaImages, FaPlus, FaTrash, FaCalendarAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CircularDatePicker from "@/Components/CircularDatePicker";

interface Gambar {
    id?: number;
    tanggal: string;
    judul: string;
    status: "aktif" | "nonaktif";
    file?: File | null;
    path?: string | null;
}

export default function Index() {
    const { gambars, auth, settings } = usePage().props as any;

    useEffect(() => {
        if (auth.user.role !== 'admin' && auth.user.role !== 'ula' && auth.user.role !== 'pic') {
            router.visit('/');
        }
    }, [auth.user.role]);

    // Real-time updates
    useEffect(() => {
        if (window.Echo) {
            const channel = window.Echo.channel('public-gambars');

            channel.listen('.gambar.created', (data: any) => {
                toast.success('Gambar baru telah ditambahkan (Realtime)');
                router.reload({ only: ['gambars'] });
            });

            channel.listen('.gambar.updated', (data: any) => {
                toast.info('Gambar telah diperbarui (Realtime)');
                router.reload({ only: ['gambars'] });
            });

            channel.listen('.gambar.deleted', (data: any) => {
                toast.info('Gambar telah dihapus (Realtime)');
                router.reload({ only: ['gambars'] });
            });

            return () => {
                channel.stopListening('.gambar.created');
                channel.stopListening('.gambar.updated');
                channel.stopListening('.gambar.deleted');
            };
        }
    }, []);

    const [showModalAdd, setShowModalAdd] = useState(false);
    const [form, setForm] = useState<Gambar>({
        tanggal: (() => {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })(),
        judul: "",
        status: "nonaktif",
        file: null,
    });

    const handleAddGambar = () => {
        setForm({
            tanggal: new Date().toISOString().split('T')[0],
            judul: "",
            status: "nonaktif",
            file: null,
        });
        setShowModalAdd(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("tanggal", form.tanggal);
        formData.append("judul", form.judul);
        formData.append("status", form.status);

        if (form.file) {
            formData.append("file", form.file);
        }

        router.post("/manajemen-gambar", formData, {
            onSuccess: () => {
                toast.success("✅ Gambar berhasil ditambahkan!");
                setShowModalAdd(false);
            },
            onError: (errors) => {
                console.error("Upload Error:", errors);
                if (errors.file) {
                    toast.error(errors.file);
                } else if (Object.keys(errors).length > 0) {
                    toast.error(`Gagal menyimpan: ${Object.values(errors)[0]}`);
                } else {
                    toast.error("Gagal mengupload gambar.");
                }
            }
        });
    };

    const handleDelete = (id?: number) => {
        if (!id) return;
        if (confirm("Hapus gambar ini?")) {
            router.delete(`/manajemen-gambar/${id}`, {
                preserveScroll: true,
                onSuccess: () => toast.info("🗑️ Gambar dihapus"),
            });
        }
    };

    const handleToggleStatus = (id: number) => {
        router.put(`/manajemen-gambar/${id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.info("🔄 Status diperbarui!");
                router.reload();
            },
        });
    };

    const MAX_ROWS = 7;
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(gambars.length / MAX_ROWS);
    const start = (page - 1) * MAX_ROWS;
    const currentRows = gambars.slice(start, start + MAX_ROWS);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl md:text-3xl font-bold text-[#0B3D91] flex items-center gap-2">
                    <FaImages /> Manajemen Gambar (Slideshow)
                </h2>
            }
        >
            <div className="bg-[#B0DAFF] p-5 rounded-2xl shadow-md">
                <div className="flex justify-end mb-3 col-span-1 gap-2">
                    {/* Button Tambah */}
                    <button
                        onClick={handleAddGambar}
                        className="bg-[#0B3D91] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#001f45]"
                    >
                        <FaPlus /> Tambah Gambar
                    </button>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm text-gray-700">
                        <thead className="bg-[#0B3D91] text-white">
                            <tr>
                                <th className="p-2 border">Tanggal</th>
                                <th className="p-2 border">Judul</th>
                                <th className="p-2 border">Preview</th>
                                <th className="p-2 border">Status</th>
                                <th className="p-2 border">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentRows.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-4 text-gray-500 italic">
                                        Tidak ada gambar
                                    </td>
                                </tr>
                            )}

                            {currentRows.map((v: any) => (
                                <tr key={v.id} className="border hover:bg-gray-50">
                                    <td className="p-2 border">{v.tanggal}</td>
                                    <td className="p-2 border">{v.judul}</td>
                                    <td className="p-2 border text-center">
                                        {v.path ? (
                                            <a href={`/storage/${v.path}`} target="_blank" rel="noreferrer">
                                                <img
                                                    src={`/storage/${v.path}`}
                                                    alt={v.judul}
                                                    className="w-16 h-10 object-cover rounded mx-auto border"
                                                />
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 italic">No Image</span>
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
                                            title="Hapus gambar"
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

                {/* MODAL Tambah Gambar */}
                {showModalAdd && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white p-6 rounded-xl w-full max-w-[400px] relative">
                            <button
                                onClick={() => setShowModalAdd(false)}
                                className="absolute right-3 top-2 text-xl text-gray-500 hover:text-red-600"
                            >
                                ✕
                            </button>

                            <h3 className="text-center font-bold text-lg text-[#0B3D91]">Tambah Gambar</h3>

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
                                    type="file"
                                    accept="image/*"
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
