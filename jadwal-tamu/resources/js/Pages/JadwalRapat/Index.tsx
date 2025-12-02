import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    FaCalendarAlt,
    FaClock,
    FaPlus,
    FaTrash,
    FaEdit,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { router, usePage } from "@inertiajs/react";

interface JadwalRapat {
    id?: number;
    tanggal: Date;
    jam_mulai: string;
    jam_selesai: string;
    judul: string;
    keterangan: string;
    lokasi: string;
    status: "Belum" | "Proses" | "Selesai";
}

export default function Index() {
    const { jadwal, statusFilter } = usePage().props as any;
    const [filter, setFilter] = useState(statusFilter);

    const [statusDropdown, setStatusDropdown] = useState<number | null>(null);
    useEffect(() => {
        const listener = () => setStatusDropdown(null);
        window.addEventListener("click", listener);
        return () => window.removeEventListener("click", listener);
    }, []);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [form, setForm] = useState<JadwalRapat>({
        tanggal: new Date(),
        jam_mulai: "",
        jam_selesai: "",
        judul: "",
        keterangan: "",
        lokasi: "",
        status: "Belum",
    });

    // ✅ Step 1: Grouping berdasarkan tanggal
    const grouped: Record<string, any[]> = {};
    jadwal.data.forEach((item: any) => {
        if (!grouped[item.tanggal]) grouped[item.tanggal] = [];
        grouped[item.tanggal].push(item);
    });

    // ✅ Ratakan baris tapi simpan info rowSpan
    const flatRows: {
        tanggal: string;
        data: any;
        indexDalamTanggal: number;
        totalDalamTanggal: number;
    }[] = [];

    Object.keys(grouped).forEach((tgl) => {
        grouped[tgl].forEach((data, i) => {
            flatRows.push({
                tanggal: tgl,
                data,
                indexDalamTanggal: i,
                totalDalamTanggal: grouped[tgl].length,
            });
        });
    });

    // Data halaman ini langsung dari backend
    const currentRows = flatRows;

    // Ambil info halaman dari backend
    const page = jadwal.current_page;
    const totalPages = jadwal.last_page;

    const [showTimePicker, setShowTimePicker] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<
        "jam_mulai" | "jam_selesai"
    >("jam_mulai");
    const [selectedHour, setSelectedHour] = useState(12);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
    const [pickerStep, setPickerStep] = useState<"hour" | "minute">("hour");

    // Format tanggal ke Indonesia
    const formatDateIndo = (date: string | Date) => {
        if (!date) return "-";
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const handleAdd = () => {
        setForm({
            tanggal: new Date(),
            jam_mulai: "",
            jam_selesai: "",
            judul: "",
            keterangan: "",
            lokasi: "",
            status: "Belum",
        });
        setModalMode("add");
        setShowModal(true);
    };

    const handleEdit = (item: any) => {
        setForm({
            id: item.id,
            tanggal: new Date(item.tanggal),
            jam_mulai: item.jam_mulai,
            jam_selesai: item.jam_selesai,
            judul: item.judul,
            keterangan: item.keterangan,
            lokasi: item.lokasi,
            status: item.status,
        });
        setModalMode("edit");
        setShowModal(true);
    };

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
        tanggal: form.tanggal.toISOString().split("T")[0],
        jam_mulai: form.jam_mulai,
        jam_selesai: form.jam_selesai,
        judul: form.judul,
        keterangan: form.keterangan,
        lokasi: form.lokasi,
        status: form.status || "Belum",
    };

    if (modalMode === "add") {
        router.post("/jadwal-rapat", payload, {
            onSuccess: () => {
                toast.success("✅ Jadwal berhasil ditambahkan!");
                setShowModal(false);
                router.reload({ only: ["jadwal"] });
            },
        });
    } else {
        router.put(`/jadwal-rapat/${form.id}`, payload, {
            onSuccess: () => {
                toast.success("✏️ Jadwal berhasil diedit!");
                setShowModal(false);
                router.reload({ only: ["jadwal"] });
            },
        });
    }
};


    const handleStatusChange = (
        id: number,
        newStatus: "Belum" | "Proses" | "Selesai"
    ) => {
        router.put(
            `/jadwal-rapat/${id}`,
            { status: newStatus },
            {
                onSuccess: () => {
                    toast.info(`📌 Status diubah menjadi ${newStatus}`);
                    router.reload({ only: ["jadwal"] });
                },
                onError: () => toast.error("❌ Gagal mengubah status!"),
            }
        );
    };

    const handleSetTimeFromPicker = () => {
        const formatted = `${String(selectedHour).padStart(2, "0")}:${String(
            selectedMinute
        ).padStart(2, "0")} ${ampm}`;
        setForm((prev) => ({ ...prev, [pickerTarget]: formatted }));
        setShowTimePicker(false);
        setPickerStep("hour");
    };

    const formatTime = (time: string) => {
        if (!time) return "-";
        const [hour, minute] = time.split(":");
        const hourNum = parseInt(hour);
        const ampm = hourNum >= 12 ? "PM" : "AM";
        const formattedHour = hourNum % 12 || 12;
        return `${String(formattedHour).padStart(2, "0")}:${minute} ${ampm}`;
    };
    const changeStatus = (
        id: number,
        newStatus: "Belum" | "Proses" | "Selesai"
    ) => {
        handleStatusChange(id, newStatus);
        setStatusDropdown(null);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-[#0B3D91] flex items-center gap-2">
                        <FaCalendarAlt /> Jadwal Rapat
                    </h2>
                </div>
            }
        >
            <div className="bg-[#B0DAFF] p-4 md:p-7 rounded-2xl shadow-md border border-[#7FB8E5] w-full overflow-hidden">
                {/* ✅ Filter Section Responsive */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <div className="flex gap-2 md:gap-4 overflow-x-auto">
                        {["Belum", "Proses", "Selesai"].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setFilter(
                                        status as "Belum" | "Proses" | "Selesai"
                                    );
                                    router.get(
                                        `/jadwal-rapat?status=${status}&page=1`,
                                        {},
                                        {
                                            preserveScroll: true,
                                            replace: true,
                                        }
                                    );
                                }}
                                className={`px-4 md:px-6 py-2 rounded-lg text-sm md:text-base font-semibold transition-all ${
                                    filter === status
                                        ? "bg-[#0B3D91] text-white shadow-md"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleAdd}
                        className="bg-[#0B3D91] hover:bg-[#001f45] text-white font-medium px-3 md:px-4 py-2 text-sm md:text-base rounded-md flex items-center gap-2 shadow-md"
                    >
                        <FaPlus /> Tambah Jadwal
                    </button>
                </div>

                {/* ✅ TABLE RESPONSIVE */}
                <div className="bg-white overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full text-xs md:text-sm text-gray-700 border border-gray-300 border-collapse">
                        <thead className="bg-[#0B3D91] text-white">
                            <tr>
                                <th className="px-2 md:px-4 py-2 md:py-3 border text-center">
                                    Tanggal
                                </th>
                                <th className="px-2 md:px-4 py-2 border">
                                    Pukul
                                </th>
                                <th className="px-2 md:px-4 py-2 border">
                                    Judul
                                </th>
                                <th className="px-2 md:px-4 py-2 border">
                                    Keterangan
                                </th>
                                <th className="px-2 md:px-4 py-2 border">
                                    Lokasi
                                </th>
                                <th className="px-2 md:px-4 py-2 text-center border">
                                    Status
                                </th>
                                <th className="px-2 md:px-4 py-2 text-center border">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center text-gray-500 py-6 italic"
                                    >
                                        Tidak ada jadwal untuk status ini
                                    </td>
                                </tr>
                            )}

                            {currentRows.map((row, index) => (
                                <tr
                                    key={`${row.tanggal}-${index}`}
                                    className="hover:bg-blue-50 transition"
                                >
                                    {/* Tanggal hanya tampil sekali per kelompok */}
                                    {row.indexDalamTanggal === 0 && (
                                        <td
                                            rowSpan={row.totalDalamTanggal}
                                            className="px-4 py-2 text-center font-semibold border border-gray-300"
                                        >
                                            {formatDateIndo(row.tanggal)}
                                        </td>
                                    )}

                                    <td className="px-4 py-2 border border-gray-300">
                                        {formatTime(row.data.jam_mulai)} –{" "}
                                        {formatTime(row.data.jam_selesai)}
                                    </td>

                                    <td className="px-4 py-2 border border-gray-300">
                                        {row.data.judul}
                                    </td>

                                    <td className="px-4 py-2 border border-gray-300">
                                        {row.data.keterangan || "-"}
                                    </td>

                                    <td className="px-4 py-2 border border-gray-300">
                                        {row.data.lokasi}
                                    </td>

                                    <td className="px-4 py-2 text-center border border-gray-300 relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // ✅ penting!
                                                setStatusDropdown((prev) =>
                                                    prev === row.data.id
                                                        ? null
                                                        : row.data.id
                                                );
                                            }}
                                            className={`px-3 py-1 rounded-md text-xs font-semibold block mx-auto
                      ${
                          row.data.status === "Selesai"
                              ? "bg-green-600 text-white"
                              : row.data.status === "Proses"
                              ? "bg-yellow-400 text-gray-800"
                              : "bg-red-500 text-white"
                      }
                    `}
                                        >
                                            {row.data.status}
                                        </button>

                                        {/* ✅ Dropdown custom */}
                                        {statusDropdown === row.data.id && (
                                            <div
                                                className="absolute z-50 bg-white border rounded-lg shadow-md w-28 text-xs text-gray-700 left-1/2 -translate-x-1/2 mt-1 overflow-hidden"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <div
                                                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        changeStatus(
                                                            row.data.id,
                                                            "Belum"
                                                        )
                                                    }
                                                >
                                                    Belum
                                                </div>
                                                <div
                                                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        changeStatus(
                                                            row.data.id,
                                                            "Proses"
                                                        )
                                                    }
                                                >
                                                    Proses
                                                </div>
                                                <div
                                                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        changeStatus(
                                                            row.data.id,
                                                            "Selesai"
                                                        )
                                                    }
                                                >
                                                    Selesai
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-4 py-2 text-center border border-gray-300 space-x-3">
                                        <button
                                            onClick={() => handleEdit(row.data)}
                                            className="text-yellow-500 hover:text-yellow-600"
                                        >
                                            <FaEdit />
                                        </button>
<button
  onClick={() => {
    if(confirm("Hapus jadwal ini?")) {
      router.delete(`/jadwal-rapat/${row.data.id}`, {
        onSuccess: () => {
          toast.success("🗑️ Jadwal dihapus");
          router.reload({ only: ["jadwal"] });
        },
        onError: () => toast.error("❌ Gagal menghapus"),
      });
    }
  }}
  className="text-red-500 hover:text-red-700"
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
                {totalPages >= 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() =>
                                router.get(
                                    `/jadwal-rapat?status=${filter}&page=${
                                        page - 1
                                    }`,
                                    {},
                                    { preserveScroll: true }
                                )
                            }
                            className={`
        px-4 py-2 rounded-lg border font-semibold transition-all duration-200
        ${
            page === 1
                ? "opacity-40 cursor-not-allowed bg-gray-200 text-gray-500"
                : "bg-white hover:bg-gray-100 hover:shadow-md text-[#0B3D91] border-[#0B3D91]"
        }
      `}
                        >
                            « Sebelumnya
                        </button>

                        <span className="px-4 py-2 bg-[#0B3D91] text-white rounded-lg shadow font-semibold">
                            Halaman {page}
                        </span>

                        <button
                            disabled={page === totalPages}
                            onClick={() =>
                                router.get(
                                    `/jadwal-rapat?status=${filter}&page=${
                                        page + 1
                                    }`,
                                    {},
                                    { preserveScroll: true }
                                )
                            }
                            className={`
        px-4 py-2 rounded-lg border font-semibold transition-all duration-200
        ${
            page === totalPages
                ? "opacity-40 cursor-not-allowed bg-gray-200 text-gray-500"
                : "bg-white hover:bg-gray-100 hover:shadow-md text-[#0B3D91] border-[#0B3D91]"
        }
      `}
                        >
                            Berikutnya »
                        </button>
                    </div>
                )}
            </div>
            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-[620px] relative p-8 border border-gray-100 animate-fadeIn">
                        {/* Tombol Close */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute -top-4 -right-4 bg-[#0B3D91] hover:bg-[#001f45] text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl shadow-md transition"
                        >
                            ✕
                        </button>

                        {/* Header */}
                        <h3 className="text-center text-[#0B3D91] font-bold text-xl mb-6 border-b pb-2">
                            {modalMode === "add"
                                ? "Tambah Jadwal Rapat"
                                : "Edit Jadwal Rapat"}
                        </h3>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-3 gap-5">
                                {/* tanggal */}
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Tanggal
                                    </label>
                                    <div className="relative">
                                        <DatePicker
                                            selected={form.tanggal}
                                            onChange={(date: Date | null) =>
                                                date &&
                                                setForm((prev) => ({
                                                    ...prev,
                                                    tanggal: date,
                                                }))
                                            }
                                            className="w-full border border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                            dateFormat="yyyy-MM-dd"
                                        />
                                        <FaCalendarAlt className="absolute right-3 top-3 text-[#0B3D91]" />
                                    </div>
                                </div>

                                {/* jam mulai */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Jam Mulai
                                    </label>
                                    <div className="relative">
                                        <input
                                            readOnly
                                            value={form.jam_mulai || ""}
                                            placeholder="Pilih waktu"
                                            onClick={() => {
                                                setPickerTarget("jam_mulai");
                                                setShowTimePicker(true);
                                            }}
                                            className="w-full border border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#002D62]/50 cursor-pointer text-gray-800"
                                        />
                                        <FaClock className="absolute right-3 top-3 text-[#0B3D91]" />
                                    </div>
                                </div>

                                {/* jam selesai */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Jam Berakhir
                                    </label>
                                    <div className="relative">
                                        <input
                                            readOnly
                                            value={form.jam_selesai || ""}
                                            placeholder="Pilih waktu"
                                            onClick={() => {
                                                setPickerTarget("jam_selesai");
                                                setShowTimePicker(true);
                                            }}
                                            className="w-full border border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 cursor-pointer text-gray-800"
                                        />
                                        <FaClock className="absolute right-3 top-3 text-[#0B3D91]" />
                                    </div>
                                </div>

                                {/* judul */}
                                <div className="col-span-3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Judul
                                    </label>
                                    <input
                                        type="text"
                                        value={form.judul}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                judul: e.target.value,
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                        placeholder="Masukkan judul rapat"
                                    />
                                </div>

                                {/* keterangan */}
                                <div className="col-span-3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Keterangan
                                    </label>
                                    <input
                                        type="text"
                                        value={form.keterangan}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                keterangan: e.target.value,
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                        placeholder="Keterangan tambahan (opsional)"
                                    />
                                </div>

                                {/* lokasi */}
                                <div className="col-span-3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Lokasi
                                    </label>
                                    <input
                                        type="text"
                                        value={form.lokasi}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                lokasi: e.target.value,
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                        placeholder="Masukkan lokasi rapat"
                                    />
                                </div>
                            </div>

                            {/* tombol */}
                            <div className="flex justify-end mt-6">
                                <button
                                    type="submit"
                                    className="bg-[#0B3D91] hover:bg-[#001f45] text-white font-semibold px-6 py-2.5 rounded-md text-sm shadow-md transition-transform active:scale-[0.97]"
                                >
                                    {modalMode === "add"
                                        ? "Tambah Jadwal"
                                        : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* TIME PICKER */}
            {showTimePicker && (
                <div
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]"
                    onClick={() => setShowTimePicker(false)}
                >
                    <div
                        className="bg-white text-dark p-6 rounded-2xl shadow-lg"
                        style={{
                            width: 300,
                            textAlign: "center",
                            border: "3px solid #00427c",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-3 font-bold text-[#00427c] text-xl">
                            {String(selectedHour).padStart(2, "0")}:
                            {String(selectedMinute).padStart(2, "0")} {ampm}
                        </h3>
                        <div
                            className="relative mx-auto my-5 rounded-full"
                            style={{
                                width: 220,
                                height: 220,
                                border: "3px solid #00427c",
                            }}
                        >
                            {pickerStep === "hour" &&
                                Array.from({ length: 12 }, (_, i) => {
                                    const hour = i + 1;
                                    const angle = (hour / 12) * 2 * Math.PI;
                                    const x = 110 + 80 * Math.sin(angle);
                                    const y = 110 - 80 * Math.cos(angle);
                                    return (
                                        <div
                                            key={hour}
                                            onClick={() =>
                                                setSelectedHour(hour)
                                            }
                                            style={{
                                                position: "absolute",
                                                top: y,
                                                left: x,
                                                transform:
                                                    "translate(-50%, -50%)",
                                                cursor: "pointer",
                                                fontWeight:
                                                    selectedHour === hour
                                                        ? "bold"
                                                        : "normal",
                                                color:
                                                    selectedHour === hour
                                                        ? "#00427c"
                                                        : "#333",
                                                fontSize: "1.1rem",
                                            }}
                                        >
                                            {hour}
                                        </div>
                                    );
                                })}

                            {pickerStep === "minute" &&
                                Array.from({ length: 12 }, (_, i) => {
                                    const minute = i * 5;
                                    const angle = (minute / 60) * 2 * Math.PI;
                                    const x = 110 + 80 * Math.sin(angle);
                                    const y = 110 - 80 * Math.cos(angle);
                                    return (
                                        <div
                                            key={minute}
                                            onClick={() =>
                                                setSelectedMinute(minute)
                                            }
                                            style={{
                                                position: "absolute",
                                                top: y,
                                                left: x,
                                                transform:
                                                    "translate(-50%, -50%)",
                                                cursor: "pointer",
                                                fontWeight:
                                                    selectedMinute === minute
                                                        ? "bold"
                                                        : "normal",
                                                color:
                                                    selectedMinute === minute
                                                        ? "#00427c"
                                                        : "#333",
                                                fontSize: "1rem",
                                            }}
                                        >
                                            {minute.toString().padStart(2, "0")}
                                        </div>
                                    );
                                })}

                            {/* jarum */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: `rotate(${
                                        pickerStep === "hour"
                                            ? (selectedHour % 12) * 30
                                            : selectedMinute * 6
                                    }deg)`,
                                    transformOrigin: "center center",
                                    transition: "transform 0.35s ease-in-out",
                                }}
                            >
                                <div
                                    style={{
                                        width: 3,
                                        height: pickerStep === "hour" ? 65 : 80,
                                        backgroundColor: "#00427c",
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -100%)",
                                        borderRadius: 2,
                                        transformOrigin: "bottom center",
                                    }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        width: 12,
                                        height: 12,
                                        backgroundColor: "#00427c",
                                        borderRadius: "50%",
                                        transform: "translate(-50%, -50%)",
                                        boxShadow: "0 0 6px rgba(0,0,0,0.2)",
                                    }}
                                />
                            </div>
                        </div>

                        {/* AM / PM */}
                        <div className="mt-3">
                            <button
                                className={`px-3 py-1 rounded mr-2 ${
                                    ampm === "AM"
                                        ? "bg-[#00427c] text-white"
                                        : "border border-[#00427c] text-[#00427c]"
                                }`}
                                onClick={() => setAmpm("AM")}
                            >
                                AM
                            </button>
                            <button
                                className={`px-3 py-1 rounded ${
                                    ampm === "PM"
                                        ? "bg-[#00427c] text-white"
                                        : "border border-[#00427c] text-[#00427c]"
                                }`}
                                onClick={() => setAmpm("PM")}
                            >
                                PM
                            </button>
                        </div>

                        {/* Tombol kontrol */}
                        <div className="flex justify-between mt-5">
                            <button
                                className="border px-3 py-1 rounded hover:bg-gray-100"
                                onClick={() => {
                                    setSelectedHour(12);
                                    setSelectedMinute(0);
                                    setPickerStep("hour");
                                }}
                            >
                                Clear
                            </button>
                            {pickerStep === "hour" && (
                                <button
                                    className="border border-green-600 text-green-600 px-3 py-1 rounded"
                                    onClick={() => setPickerStep("minute")}
                                >
                                    Next
                                </button>
                            )}
                            {pickerStep === "minute" && (
                                <button
                                    className="bg-[#00427c] text-white px-3 py-1 rounded"
                                    onClick={handleSetTimeFromPicker}
                                >
                                    Set
                                </button>
                            )}
                            <button
                                className="border border-red-600 text-red-600 px-3 py-1 rounded"
                                onClick={() => {
                                    setShowTimePicker(false);
                                    setPickerStep("hour");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" autoClose={2000} />
        </AuthenticatedLayout>
    );
}
