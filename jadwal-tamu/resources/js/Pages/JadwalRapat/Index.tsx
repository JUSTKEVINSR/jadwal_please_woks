import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
//import DatePicker from "react-datepicker";
//import "react-datepicker/dist/react-datepicker.css";
import {
    FaCalendarAlt,
    FaClock,
    FaPlus,
    FaTrash,
    FaEdit,
    FaUndo,
    FaTimes,
} from "react-icons/fa";
import { GoChecklist } from "react-icons/go";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { router, usePage } from "@inertiajs/react";
import CircularDatePicker from "@/Components/CircularDatePicker";

interface JadwalRapat {
    id?: number;
    tanggal: Date;
    jam_mulai: string;
    jam_selesai: string;
    judul: string;
    keterangan: string;
    lokasi: number;
    status: "Belum" | "Proses" | "Selesai";
    gunakan_zoom: "yes" | "no";
    nama_pic: string;
    nomor_pic: string;
    kasubak: "pending" | "rejected" | "approve";
    ula: "pending" | "rejected" | "approve";
}



export default function Index() {
    const { jadwal, statusFilter, rooms, auth, autoApproveStatus } = usePage().props as any;
    const [filter, setFilter] = useState(statusFilter);

    // Check if the user has the required role to edit or delete any jadwal rapat
    const canEditAnyJadwal = auth.user && ['admin', 'ula', 'kasubak', 'pic'].includes(auth.user.role);

    // Check if the user has the required role to interact with Kasubak dropdown
    const canInteractWithKasubak = auth.user && ['admin', 'kasubak', 'pic'].includes(auth.user.role);

    // Check if the user has the required role to interact with Ula dropdown
    const canInteractWithUla = auth.user && ['admin', 'ula', 'pic'].includes(auth.user.role);

    // Check if the user has the required role to interact with only Admin
    const canInteractWithOnlyAdmin = auth.user && ['admin', 'pic'].includes(auth.user.role);



    const [statusDropdown, setStatusDropdown] = useState<number | null>(null);
    const [kasubakDropdown, setKasubakDropdown] = useState<number | null>(null);
    const [ulaDropdown, setUlaDropdown] = useState<number | null>(null);
    useEffect(() => {
        const listener = () => {
            setStatusDropdown(null);
            setKasubakDropdown(null);
            setUlaDropdown(null);
        };
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
        lokasi: 1,
        status: "Belum",
        gunakan_zoom: "no",
        nama_pic: "",
        nomor_pic: "",
        kasubak: "pending",
        ula: "pending",
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
    const [bookedTimes, setBookedTimes] = useState<{ start: string; end: string; status: string; kasubak: string; ula: string }[]>([]);
    const [bookedDates, setBookedDates] = useState<{ date: string; status: string; kasubak: string; ula: string }[]>([]);


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

    // ✅ State for Auto Approve (Synced with Backend Prop)
    const [isAutoApprove, setIsAutoApprove] = useState(autoApproveStatus || false);

    useEffect(() => {
        setIsAutoApprove(autoApproveStatus);
    }, [autoApproveStatus]);

    const handleToggleAutoApprove = () => {
        router.post('/jadwal-rapat/toggle-auto-approve', {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Toast handled by backend flash message ideally, but we can add one here too if needed
                // Based on user request "dont forget the tosaster"
                toast.success(`Auto Approve is now ${!isAutoApprove ? 'ON' : 'OFF'}`);
            },
            onError: () => {
                toast.error("Failed to toggle Auto Approve");
            }
        });
    };

    const handleAdd = () => {
        setForm({
            tanggal: new Date(),
            jam_mulai: "",
            jam_selesai: "",
            judul: "",
            keterangan: "",
            lokasi: 1,
            status: "Belum",
            gunakan_zoom: "no",
            nama_pic: "",
            nomor_pic: "",
            kasubak: isAutoApprove ? "approve" : "pending",
            ula: isAutoApprove ? "approve" : "pending",
        });
        setModalMode("add");
        setShowModal(true);
    };

    const handleEdit = (item: any) => {
        setForm({
            id: item.id,
            tanggal: new Date(item.tanggal),
            jam_mulai: formatTime(item.jam_mulai),
            jam_selesai: formatTime(item.jam_selesai),
            judul: item.judul,
            keterangan: item.keterangan,
            lokasi: parseInt(item.lokasi),
            status: item.status,
            gunakan_zoom: item.gunakan_zoom,
            nama_pic: item.nama_pic || "",
            nomor_pic: item.nomor_pic || "",
            kasubak: item.kasubak || "pending",
            ula: item.ula || "pending",
        });
        setModalMode("edit");
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            // Fix: Use local date string to prevent timezone shifts
            tanggal: `${form.tanggal.getFullYear()}-${String(form.tanggal.getMonth() + 1).padStart(2, '0')}-${String(form.tanggal.getDate()).padStart(2, '0')}`,
            jam_mulai: form.jam_mulai,
            jam_selesai: form.jam_selesai,
            judul: form.judul,
            keterangan: form.keterangan,
            lokasi: form.lokasi,
            status: form.status || "Belum",
            gunakan_zoom: form.gunakan_zoom,
            nama_pic: form.nama_pic,
            nomor_pic: form.nomor_pic,
            kasubak: form.kasubak,
            ula: form.ula,
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


    // Handle status change
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

    const handleRestore = (id: number) => {
        router.post(`/jadwal-rapat/${id}/restore`, {}, {
            onSuccess: () => {
                toast.success("✅ Jadwal berhasil dipulihkan!");
                router.reload({ only: ["jadwal"] });
            },
            onError: () => toast.error("❌ Gagal memulihkan jadwal!"),
        });
    };

    const handleForceDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus jadwal ini secara permanen?")) {
            router.delete(`/jadwal-rapat/${id}/force-delete`, {
                onSuccess: () => {
                    toast.success("🗑️ Jadwal dihapus secara permanen!");
                    router.reload({ only: ["jadwal"] });
                },
                onError: () => toast.error("❌ Gagal menghapus jadwal!"),
            });
        }
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

    const fetchBookedTimes = async (tanggal: Date, lokasi: number, excludeId?: number) => {
        try {
            // Fix: Use local date instead of UTC (toISOString)
            const year = tanggal.getFullYear();
            const month = String(tanggal.getMonth() + 1).padStart(2, '0');
            const day = String(tanggal.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const url = `/jadwal-rapat/booked-times?tanggal=${dateStr}&lokasi=${lokasi}&exclude_id=${excludeId || ''}`;
            console.log('Fetching booked times:', url);
            const response = await fetch(url);
            const data = await response.json();
            console.log('Booked times data:', data);
            setBookedTimes(data.booked || []);
        } catch (error) {
            console.error('Failed to fetch booked times:', error);
            setBookedTimes([]);
        }
    };

    const fetchBookedDates = async (month: string, lokasi: number) => {
        try {
            const url = `/jadwal-rapat/booked-dates?month=${month}&lokasi=${lokasi}`;

            console.log('Fetching booked dates:', url);
            const response = await fetch(url);
            const data = await response.json();
            console.log('Booked dates data:', data);
            setBookedDates(data.booked || []);
        } catch (error) {
            console.error('Failed to fetch booked dates:', error);
            setBookedDates([]);
        }
    };

    const isTimeBooked = (hour24: number, minute: number) => {
        const time = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
        const overlapping = bookedTimes.find(({ start, end }) => time >= start && time < end);

        if (overlapping) {
            // Rule 1: If ANY is rejected, it's available (pickable)
            if (overlapping.kasubak === 'rejected' || overlapping.ula === 'rejected') {
                return false;
            }

            // Rule 2: Only booked (unpickable) if BOTH are approved
            if (overlapping.kasubak === 'approve' && overlapping.ula === 'approve') {
                return true;
            }

            // Rule 3: Otherwise (pending, or one approved one pending) it's pickable
            return false;
        }

        return false;
    };

    // Fetch booked data when location changes
    useEffect(() => {
        // Fetch booked times for current date and new location
        if (form.tanggal && form.lokasi) {
            fetchBookedTimes(form.tanggal, form.lokasi, modalMode === "edit" ? form.id : undefined);
        }

        // Fetch booked dates for current month and new location
        const currentMonth = `${form.tanggal.getFullYear()}-${String(form.tanggal.getMonth() + 1).padStart(2, '0')}`;
        fetchBookedDates(currentMonth, form.lokasi);
    }, [form.lokasi, form.tanggal, modalMode, form.id]);

    // Real-time updates for jadwal rapat table
    useEffect(() => {
        console.log('🔌 JadwalRapat: Setting up broadcasting listeners...');

        if (typeof window !== 'undefined' && window.Echo) {
            console.log('✅ JadwalRapat: Echo is available');
            const channel = window.Echo.channel('public-jadwal-rapat');
            console.log('📡 JadwalRapat: Created channel:', channel);

            // Add connection debugging
            channel.on('pusher:subscription_succeeded', (members) => {
                console.log('🎉 JadwalRapat: Successfully subscribed to channel', members);
            });

            channel.on('pusher:subscription_error', (status) => {
                console.error('❌ JadwalRapat: Subscription error', status);
            });

            channel.on('pusher:ping', () => {
                console.log('🏓 JadwalRapat: Ping received');
            });

            channel.listen('.jadwal-rapat.created', (data: any) => {
                console.log('🎉 JadwalRapat: New jadwal created:', data);
                toast.success(data.message || 'Jadwal rapat baru telah ditambahkan');
                // Reload the jadwal data to show new entry
                router.reload({ only: ["jadwal"] });
            });

            channel.listen('.jadwal-rapat.updated', (data: any) => {
                console.log('🔄 JadwalRapat: Jadwal updated:', data);
                toast.info(data.message || 'Jadwal rapat telah diperbarui');
                // Reload the jadwal data to reflect changes
                router.reload({ only: ["jadwal"] });
            });

            channel.listen('.jadwal-rapat.deleted', (data: any) => {
                console.log('🗑️ JadwalRapat: Jadwal deleted:', data);
                toast.info(data.message || 'Jadwal rapat telah dihapus');
                // Reload the jadwal data to remove deleted entry
                router.reload({ only: ["jadwal"] });
            });

            console.log('✅ JadwalRapat: Broadcasting listeners set up successfully');

            return () => {
                console.log('🧹 JadwalRapat: Cleaning up broadcasting listeners');
                channel.stopListening('.jadwal-rapat.created');
                channel.stopListening('.jadwal-rapat.updated');
                channel.stopListening('.jadwal-rapat.deleted');
            };
        } else {
            console.error('❌ JadwalRapat: Echo is not available');
        }
    }, []);

    const isHourBooked = (hour: number) => {
        const hour24 = ampm === 'AM' ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
        console.log(`Checking if hour ${hour} (${hour24}) is booked`);
        for (let min = 0; min < 60; min += 5) {
            if (isTimeBooked(hour24, min)) return true;
        }
        return false;
    };

    const isMinuteBooked = (minute: number) => {
        const hour24 = ampm === 'AM' ? (selectedHour === 12 ? 0 : selectedHour) : (selectedHour === 12 ? 12 : selectedHour + 12);
        console.log(`Checking if minute ${minute} for hour ${selectedHour} (${hour24}) is booked`);
        return isTimeBooked(hour24, minute);
    };

    const getTimeColor = (hour24: number, minute: number) => {
        const time = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
        const overlapping = bookedTimes.find(({ start, end }) => time >= start && time < end) as { start: string; end: string; status: string; kasubak: string; ula: string } | undefined;

        if (overlapping) {
            // Rule 1: If ANY is rejected, it's available (Green)
            if (overlapping.kasubak === 'rejected' || overlapping.ula === 'rejected') {
                return '#16a34a';
            }

            // Rule 2: Only Red if BOTH are approved
            if (overlapping.kasubak === 'approve' && overlapping.ula === 'approve') {
                return '#dc2626';
            }

            // Rule 3: Otherwise (pending mixed with approved/pending) -> Yellow
            return '#eab308';
        }

        return '#16a34a'; // Green for available
    };

    const getDateColor = (date: Date) => {
        // Fix: Use local date instead of UTC (toISOString)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const bookingsOnDate = bookedDates.filter(booking => booking.date === dateStr);

        if (bookingsOnDate.length === 0) {
            return '#16a34a'; // Green: No bookings
        }

        // Filter active bookings (not rejected)
        // If a booking is rejected by either kasubak or ula, it's considered available/green
        const activeBookings = bookingsOnDate.filter(booking =>
            booking.kasubak !== 'rejected' && booking.ula !== 'rejected'
        );

        if (activeBookings.length === 0) {
            return '#16a34a'; // Green: All bookings are rejected
        }

        // Check if any booking is fully approved (Red)
        const hasFullyApproved = activeBookings.some(booking =>
            booking.kasubak === 'approve' && booking.ula === 'approve'
        );

        if (hasFullyApproved) {
            return '#dc2626'; // Red: Has fully approved booking
        }

        // Otherwise, it must be pending (Yellow)
        return '#eab308'; // Yellow: Has pending bookings
    };

    const changeStatus = (
        id: number,
        newStatus: "Belum" | "Proses" | "Selesai"
    ) => {
        handleStatusChange(id, newStatus);
        setStatusDropdown(null);
    };

    const handleKasubakChange = (
        id: number,
        newKasubak: "pending" | "rejected" | "approve"
    ) => {
        router.put(
            `/jadwal-rapat/${id}`,
            { kasubak: newKasubak },
            {
                onSuccess: () => {
                    toast.info(`📌 Kasubak diubah menjadi ${newKasubak}`);
                    router.reload({ only: ["jadwal"] });
                },
                onError: () => toast.error("❌ Gagal mengubah kasubak!"),
            }
        );
    };

    const handleUlaChange = (
        id: number,
        newUla: "pending" | "rejected" | "approve"
    ) => {
        router.put(
            `/jadwal-rapat/${id}`,
            { ula: newUla },
            {
                onSuccess: () => {
                    toast.info(`📌 ULA diubah menjadi ${newUla}`);
                    router.reload({ only: ["jadwal"] });
                },
                onError: () => toast.error("❌ Gagal mengubah ULA!"),
            }
        );
    };

    const changeKasubak = (
        id: number,
        newKasubak: "pending" | "rejected" | "approve"
    ) => {
        handleKasubakChange(id, newKasubak);
        setKasubakDropdown(null);
    };

    const changeUla = (
        id: number,
        newUla: "pending" | "rejected" | "approve"
    ) => {
        handleUlaChange(id, newUla);
        setUlaDropdown(null);
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
                        {["Belum", "Proses", "Selesai", "Trashed"].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setFilter(
                                        status as "Belum" | "Proses" | "Selesai" | "Trashed"
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
                                className={`px-4 md:px-6 py-2 rounded-lg text-sm md:text-base font-semibold transition-all ${filter === status
                                    ? "bg-[#0B3D91] text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {status === "Trashed" ? "Kotak Sampah" : status}
                            </button>
                        ))}
                    </div>

                    {/* Button Auto Approve - Visible ONLY to Role Code 1945 */}
                    {Number(auth.user?.role_code) === 1945 && (
                        <button
                            onClick={handleToggleAutoApprove}
                            className={`font-medium px-3 md:px-4 py-2 text-sm md:text-base rounded-md flex items-center gap-2 shadow-md transition-all ${isAutoApprove
                                ? "bg-green-600 hover:bg-green-700 text-white ring-2 ring-green-300" // Active User State
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700" // Inactive State
                                }`}
                        >
                            <GoChecklist className={isAutoApprove ? "text-xl" : ""} />
                            {isAutoApprove ? "Auto Approve ON" : "Auto Approve OFF"}
                        </button>
                    )}

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
                                <th className="px-1 md:px-2 py-2 md:py-3 border text-center">
                                    Tanggal
                                </th>
                                <th className="px-1 md:px-2 py-2 border">
                                    Pukul
                                </th>
                                <th className="px-1 md:px-2 py-2 border">
                                    Judul
                                </th>
                                <th className="px-1 md:px-2 py-2 border">
                                    Keterangan
                                </th>
                                <th className="px-1 md:px-2 py-2 border">
                                    Lokasi
                                </th>

                                <th className="w-24 px-1 md:px-2 py-2 border">
                                    Gunakan Zoom
                                </th>
                                <th className="px-1 md:px-2 py-2 border">
                                    Nama PIC
                                </th>
                                <th className="px-1 md:px-2 py-2 border">
                                    Nomor PIC
                                </th>

                                <th className="px-1 md:px-2 py-2 border">
                                    Kasubag
                                </th>

                                <th className="px-1 md:px-2 py-2 border">
                                    ULA
                                </th>

                                <th className="px-1 md:px-2 py-2 text-center border">
                                    Status
                                </th>
                                <th className="px-1 md:px-2 py-2 text-center border">
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
                                            className="px-2 py-2 text-center font-semibold border border-gray-300"
                                        >
                                            {formatDateIndo(row.tanggal)}
                                        </td>
                                    )}

                                    <td className="px-1 py-2 border border-gray-300">
                                        {formatTime(row.data.jam_mulai)} –{" "}
                                        {formatTime(row.data.jam_selesai)}
                                    </td>

                                    <td className="px-1 py-2 border border-gray-300">
                                        {row.data.judul}
                                    </td>

                                    <td className="px-1 py-2 border border-gray-300">
                                        {row.data.keterangan || "-"}
                                    </td>

                                    <td className="px-1 py-2 border border-gray-300">
                                        {row.data.room?.name || 'Unknown'}
                                    </td>

                                    <td className="px-1 py-2 border border-gray-300">
                                        {row.data.gunakan_zoom === 'yes' ? 'Ya' : 'Tidak'}
                                    </td>

                                    <td className="px-1 py-2 border border-gray-300">
                                        {row.data.nama_pic || "-"}
                                    </td>

                                    <td className="px-1 py-2 border border-gray-300">
                                        {row.data.nomor_pic || "-"}
                                    </td>

                                    <td className="px-1 py-2 text-center border border-gray-300 relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // ✅ penting!
                                                if (canInteractWithKasubak) {
                                                    setKasubakDropdown((prev) =>
                                                        prev === row.data.id
                                                            ? null
                                                            : row.data.id
                                                    );
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-md text-xs font-semibold block mx-auto
                                            ${row.data.kasubak === "approve"
                                                    ? "bg-green-600 text-white"
                                                    : row.data.kasubak === "pending"
                                                        ? "bg-yellow-400 text-gray-800"
                                                        : "bg-red-500 text-white"
                                                }
                                            ${!canInteractWithKasubak ? "cursor-not-allowed opacity-100" : ""}
                                            `}
                                            disabled={!canInteractWithKasubak}
                                        >
                                            {row.data.kasubak}
                                        </button>

                                        {/* ✅ Kasubak Dropdown custom */}
                                        {kasubakDropdown === row.data.id && canInteractWithKasubak && (
                                            <div
                                                className="absolute z-50 bg-white border rounded-lg shadow-md w-28 text-xs text-gray-700 left-1/2 -translate-x-1/2 mt-1 overflow-hidden"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <div
                                                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        changeKasubak(
                                                            row.data.id,
                                                            "pending"
                                                        )
                                                    }
                                                >
                                                    Pending
                                                </div>
                                                <div
                                                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        changeKasubak(
                                                            row.data.id,
                                                            "rejected"
                                                        )
                                                    }
                                                >
                                                    Rejected
                                                </div>
                                                <div
                                                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        changeKasubak(
                                                            row.data.id,
                                                            "approve"
                                                        )
                                                    }
                                                >
                                                    Approve
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-1 py-2 text-center border border-gray-300 relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // ✅ penting!
                                                if (canInteractWithUla) {
                                                    setUlaDropdown((prev) =>
                                                        prev === row.data.id
                                                            ? null
                                                            : row.data.id
                                                    );
                                                }

                                            }}
                                            className={`px-3 py-1 rounded-md text-xs font-semibold block mx-auto
                                            ${row.data.ula === "approve"
                                                    ? "bg-green-600 text-white"
                                                    : row.data.ula === "pending"
                                                        ? "bg-yellow-400 text-gray-800"
                                                        : "bg-red-500 text-white"
                                                }
                                            ${!canInteractWithUla ? "cursor-not-allowed opacity-100" : ""}
                                            `}
                                            disabled={!canInteractWithUla}
                                        >
                                            {row.data.ula}
                                        </button>

                                        {/* ✅ ULA Dropdown custom */}
                                        {ulaDropdown === row.data.id && canInteractWithUla && (
                                            <div
                                                className="absolute z-50 bg-white border rounded-lg shadow-md w-28 text-xs text-gray-700 left-1/2 -translate-x-1/2 mt-1 overflow-hidden"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <div
                                                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        changeUla(
                                                            row.data.id,
                                                            "pending"
                                                        )
                                                    }
                                                >
                                                    Pending
                                                </div>
                                                <div
                                                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        changeUla(
                                                            row.data.id,
                                                            "rejected"
                                                        )
                                                    }
                                                >
                                                    Rejected
                                                </div>
                                                <div
                                                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        changeUla(
                                                            row.data.id,
                                                            "approve"
                                                        )
                                                    }
                                                >
                                                    Approve
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-1 py-2 text-center border border-gray-300 relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // ✅ penting!
                                                if (canInteractWithOnlyAdmin || row.data.user_id === auth.user.id) {
                                                    setStatusDropdown((prev) =>
                                                        prev === row.data.id
                                                            ? null
                                                            : row.data.id
                                                    );
                                                }

                                            }}
                                            className={`px-3 py-1 rounded-md text-xs font-semibold block mx-auto
                                            ${row.data.status === "Selesai"
                                                    ? "bg-green-600 text-white"
                                                    : row.data.status === "Proses"
                                                        ? "bg-yellow-400 text-gray-800"
                                                        : "bg-red-500 text-white"
                                                }
                                            ${!(canInteractWithOnlyAdmin || row.data.user_id === auth.user.id) ? "cursor-not-allowed opacity-100" : ""}
                                            `}
                                            disabled={!(canInteractWithOnlyAdmin || row.data.user_id === auth.user.id)}
                                        >
                                            {row.data.status}
                                        </button>

                                        {/* ✅ Dropdown custom */}
                                        {statusDropdown === row.data.id && (canInteractWithOnlyAdmin || row.data.user_id === auth.user.id) && (
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
                                        {filter === "Trashed" ? (
                                            <>
                                                <button
                                                    onClick={() => handleRestore(row.data.id)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                    title="Restore"
                                                >
                                                    <FaUndo size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleForceDelete(row.data.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                    title="Delete Permanently"
                                                >
                                                    <FaTimes size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {(canEditAnyJadwal || row.data.user_id === auth.user.id) && (
                                                    <button
                                                        onClick={() => handleEdit(row.data)}
                                                        className="text-yellow-500 hover:text-yellow-600"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                )}
                                                {(canEditAnyJadwal || row.data.user_id === auth.user.id) && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm("Pindahkan jadwal ini ke kotak sampah?")) {
                                                                router.delete(`/jadwal-rapat/${row.data.id}`, {
                                                                    onSuccess: () => {
                                                                        toast.success("🗑️ Jadwal dipindahkan ke kotak sampah");
                                                                        router.reload({ only: ["jadwal"] });
                                                                    },
                                                                    onError: () => toast.error("❌ Gagal menghapus"),
                                                                });
                                                            }
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </>
                                        )}
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
                                    `/jadwal-rapat?status=${filter}&page=${page - 1
                                    }`,
                                    {},
                                    { preserveScroll: true }
                                )
                            }
                            className={`
        px-4 py-2 rounded-lg border font-semibold transition-all duration-200
        ${page === 1
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
                                    `/jadwal-rapat?status=${filter}&page=${page + 1
                                    }`,
                                    {},
                                    { preserveScroll: true }
                                )
                            }
                            className={`
        px-4 py-2 rounded-lg border font-semibold transition-all duration-200
        ${page === totalPages
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
                            <div className="grid grid-cols-3 gap-3">

                                {/* Lokasi Select Dropdown */}
                                <div className="col-span-3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Lokasi</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                        value={form.lokasi}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                lokasi: parseInt(e.target.value),
                                            })
                                        }
                                        required
                                    >
                                        {rooms.map((room: any) => (
                                            <option key={room.room_code} value={room.room_code}>
                                                {room.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* tanggal */}
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Tanggal
                                    </label>
                                    <div className="relative">
                                        {/*<DatePicker
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
                                        />*/}

                                        <CircularDatePicker
                                            selectedDate={form.tanggal}
                                            onDateChange={(date: Date) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    tanggal: date,
                                                }))
                                            }
                                            getDateColor={getDateColor}
                                            onMonthChange={(date) => {
                                                const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                                                fetchBookedDates(month, form.lokasi);
                                            }}
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
                                                console.log('Opening time picker for jam_mulai', { tanggal: form.tanggal, lokasi: form.lokasi, modalMode });
                                                setPickerTarget("jam_mulai");
                                                fetchBookedTimes(form.tanggal, form.lokasi, modalMode === "edit" ? form.id : undefined);
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
                                                fetchBookedTimes(form.tanggal, form.lokasi, modalMode === "edit" ? form.id : undefined);
                                                setShowTimePicker(true);
                                            }}
                                            className="w-full border border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 cursor-pointer text-gray-800"
                                        />
                                        <FaClock className="absolute right-3 top-3 text-[#0B3D91]" />
                                    </div>
                                </div>


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
                                        placeholder="Keterangan tambahan (Wajib Hukumnya)"
                                    />
                                </div>

                                {/* lokasi 
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
                                */}

                                {/* Lokasi Select Dropdown 
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Lokasi</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                        value={form.lokasi}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                lokasi: parseInt(e.target.value),
                                            })
                                        }
                                        required
                                    >
                                        {rooms.map((room: any) => (
                                            <option key={room.room_code} value={room.room_code}>
                                                {room.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>*/}

                                {/* Zoom Select Dropdown 
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Gunakan Zoom</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                        value={form.gunakan_zoom}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                gunakan_zoom: e.target.value as "yes" | "no",
                                            })
                                        }
                                        required
                                    >
                                        <option value="yes">Ya</option>
                                        <option value="no">Tidak</option>
                                    </select>
                                </div>*/}

                                {/* Kasubak Select Dropdown 
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kasubak</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                        value={form.kasubak}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                kasubak: e.target.value as "pending" | "rejected" | "approve",
                                            })
                                        }
                                        required
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="approve">Approve</option>
                                    </select>
                                </div>*/}

                                {/* Nama PIC */}
                                <div className="col-span-3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Nama PIC
                                    </label>
                                    <input
                                        type="text"
                                        value={form.nama_pic}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                nama_pic: e.target.value,
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                        placeholder="Nama PIC"
                                    />
                                </div>

                                {/* Nomor PIC */}
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Nomor PIC
                                    </label>
                                    <input
                                        type="text"
                                        value={form.nomor_pic}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                nomor_pic: e.target.value,
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                        placeholder="Nomor PIC"
                                    />
                                </div>

                                {/* Zoom Select Dropdown */}
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Gunakan Zoom</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                        value={form.gunakan_zoom}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                gunakan_zoom: e.target.value as "yes" | "no",
                                            })
                                        }
                                        required
                                    >
                                        <option value="yes">Ya</option>
                                        <option value="no">Tidak</option>
                                    </select>
                                </div>

                                {/* tombol */}
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-[#ffffff] mb-1">
                                        TOMBOL HERE
                                    </label>
                                    <button
                                        type="submit"
                                        className="bg-[#0B3D91] hover:bg-[#001f45] text-white font-semibold px-6 py-2.5 rounded-md text-sm shadow-md transition-transform active:scale-[0.97]"
                                    >
                                        {modalMode === "add"
                                            ? "Tambah Jadwal"
                                            : "Simpan Perubahan"}
                                    </button>
                                </div>

                            </div>

                            {/* tombol 
                            <div className="flex justify-end mt-6">
                                <button
                                    type="submit"
                                    className="bg-[#0B3D91] hover:bg-[#001f45] text-white font-semibold px-6 py-2.5 rounded-md text-sm shadow-md transition-transform active:scale-[0.97]"
                                >
                                    {modalMode === "add"
                                        ? "Tambah Jadwal"
                                        : "Simpan Perubahan"}
                                </button>
                            </div>*/}
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
                                    const hour24 = ampm === 'AM' ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
                                    const isBooked = isHourBooked(hour);
                                    const angle = (hour / 12) * 2 * Math.PI;
                                    const x = 110 + 80 * Math.sin(angle);
                                    const y = 110 - 80 * Math.cos(angle);
                                    return (
                                        <div
                                            key={hour}
                                            onClick={() => !isBooked && setSelectedHour(hour)}
                                            style={{
                                                position: "absolute",
                                                top: y,
                                                left: x,
                                                transform: "translate(-50%, -50%)",
                                                cursor: isBooked ? "not-allowed" : "pointer",
                                                pointerEvents: isBooked ? "none" : "auto",
                                                opacity: isBooked ? 1 : 1,
                                                fontWeight: selectedHour === hour ? "bold" : "normal",
                                                color: selectedHour === hour ? "#00427c" : getTimeColor(hour24, 0),
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
                                    const isBooked = isMinuteBooked(minute);
                                    const angle = (minute / 60) * 2 * Math.PI;
                                    const x = 110 + 80 * Math.sin(angle);
                                    const y = 110 - 80 * Math.cos(angle);
                                    return (
                                        <div
                                            key={minute}
                                            onClick={() => !isBooked && setSelectedMinute(minute)}
                                            style={{
                                                position: "absolute",
                                                top: y,
                                                left: x,
                                                transform: "translate(-50%, -50%)",
                                                cursor: isBooked ? "not-allowed" : "pointer",
                                                pointerEvents: isBooked ? "none" : "auto",
                                                opacity: isBooked ? 1 : 1,
                                                fontWeight: selectedMinute === minute ? "bold" : "normal",
                                                color: selectedMinute === minute ? "#00427c" : getTimeColor(ampm === 'AM' ? (selectedHour === 12 ? 0 : selectedHour) : (selectedHour === 12 ? 12 : selectedHour + 12), minute),
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
                                    transform: `rotate(${pickerStep === "hour"
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
                                className={`px-3 py-1 rounded mr-2 ${ampm === "AM"
                                    ? "bg-[#00427c] text-white"
                                    : "border border-[#00427c] text-[#00427c]"
                                    }`}
                                onClick={() => setAmpm("AM")}
                            >
                                AM
                            </button>
                            <button
                                className={`px-3 py-1 rounded ${ampm === "PM"
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
