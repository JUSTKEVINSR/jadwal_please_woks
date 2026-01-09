import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
//import DatePicker from "react-datepicker";
//import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaClock, FaPlus, FaTrash, FaEdit, FaUser } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePage, router } from "@inertiajs/react";

interface DaftarTamu {
  id?: number;
  nama: string;
  jabatan: string;
  instansi: string;
  tujuan: string;
  tanggal_kunjungan: Date;
  jam_mulai: string;
  jam_selesai: string;
}

const CircularDatePicker = ({ selectedDate, onDateChange }: {
  selectedDate: Date;
  onDateChange: (date: Date) => void;


}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleDateClick = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateChange(selected);
    setShowDatePicker(false);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Generate calendar grid
  const generateCalendar = () => {
    const calendar = [];
    const totalCells = 42; // 6 weeks * 7 days
    let dayCounter = 1;

    for (let i = 0; i < totalCells; i++) {
      if (i < firstDayOfMonth || dayCounter > daysInMonth) {
        calendar.push(null); // Empty cell
      } else {
        calendar.push(dayCounter++);
      }
    }
    return calendar;
  };

  const calendarDays = generateCalendar();

  return (
    <div className="relative">
      <input
        type="text"
        readOnly
        value={selectedDate.toLocaleDateString('id-ID')}
        onClick={() => setShowDatePicker(true)}
        className="w-full border border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 cursor-pointer text-gray-800"
      />
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]" onClick={() => setShowDatePicker(false)}>

          <div className="bg-white border rounded-lg shadow-lg p-4 w-80"
            style={{
              width: 300,
              textAlign: "center",
              border: "3px solid #00427c",
            }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="text-[#0B3D91] font-bold text-lg hover:bg-gray-100 px-2 rounded">‹</button>
              <span className="font-semibold text-[#0B3D91]">
                {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={nextMonth} className="text-[#0B3D91] font-bold text-lg hover:bg-gray-100 px-2 rounded">›</button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isSelected = day && selectedDate.getDate() === day &&
                  selectedDate.getMonth() === currentDate.getMonth() &&
                  selectedDate.getFullYear() === currentDate.getFullYear();
                const isToday = day && new Date().getDate() === day &&
                  new Date().getMonth() === currentDate.getMonth() &&
                  new Date().getFullYear() === currentDate.getFullYear();
                const dateObj = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;


                return (
                  <button
                    key={index}
                    onClick={() => day && handleDateClick(day)}
                    disabled={!day}
                    className={`
                                            w-8 h-8 text-sm rounded-md transition-colors
                                            ${!day ? 'cursor-default' : 'cursor-pointer hover:bg-gray-100'}
                                            ${isSelected ? 'bg-[#0B3D91] text-white font-bold' :
                        isToday ? 'bg-blue-100 text-blue-600 font-semibold' :
                          day ? 'text-gray-700' : 'text-gray-300'}
                                        `}
                    style={{

                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDatePicker(false)}

                className="border border-red-600 text-red-600 px-3 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default function Index() {
  const { tamu } = (usePage().props as unknown) as { tamu: any };

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<DaftarTamu>({
    nama: "",
    jabatan: "",
    instansi: "",
    tujuan: "",
    tanggal_kunjungan: new Date(),
    jam_mulai: "",
    jam_selesai: "",
  });

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"jam_mulai" | "jam_selesai">("jam_mulai");
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [pickerStep, setPickerStep] = useState<"hour" | "minute">("hour");

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

  // ✅ Format display waktu (untuk tampilan tabel)
  const formatTime = (time: string) => {
    if (!time) return "-";
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const formattedHour = hourNum % 12 || 12;
    return `${String(formattedHour).padStart(2, "0")}:${minute} ${ampm}`;
  };

  // ✅ Convert AM/PM ke format 24 jam untuk database
  const convertTo24Hour = (time: string): string => {
    if (!time) return "";
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return time; // Jika sudah format 24 jam, return as is

    let hour = parseInt(match[1]);
    const minute = match[2];
    const meridiem = match[3].toUpperCase();

    if (meridiem === "PM" && hour !== 12) {
      hour += 12;
    } else if (meridiem === "AM" && hour === 12) {
      hour = 0;
    }

    return `${String(hour).padStart(2, "0")}:${minute}`;
  };

  const handleAdd = () => {
    setForm({
      nama: "",
      jabatan: "",
      instansi: "",
      tujuan: "",
      tanggal_kunjungan: new Date(),
      jam_mulai: "",
      jam_selesai: "",
    });
    setModalMode("add");
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setForm({
      id: item.id,
      nama: item.nama,
      jabatan: item.jabatan || "",
      instansi: item.instansi || "",
      tujuan: item.tujuan,
      tanggal_kunjungan: new Date(item.tanggal_kunjungan),
      jam_mulai: formatTime(item.jam_mulai), // Convert ke AM/PM untuk display
      jam_selesai: formatTime(item.jam_selesai),
    });
    setModalMode("edit");
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Convert waktu ke format 24 jam sebelum kirim ke backend
    const payload = {
      nama: form.nama,
      jabatan: form.jabatan,
      instansi: form.instansi,
      tujuan: form.tujuan,
      // Fix: Use local date string to prevent timezone shifts
      tanggal_kunjungan: `${form.tanggal_kunjungan.getFullYear()}-${String(form.tanggal_kunjungan.getMonth() + 1).padStart(2, '0')}-${String(form.tanggal_kunjungan.getDate()).padStart(2, '0')}`,
      jam_mulai: convertTo24Hour(form.jam_mulai),
      jam_selesai: convertTo24Hour(form.jam_selesai),
    };

    if (modalMode === "add") {
      router.post('/daftar-tamu', payload, {
        onSuccess: () => {
          toast.success("✅ Tamu berhasil ditambahkan!");
          setShowModal(false);
        },
        onError: (errors) => {
          console.error(errors);
          toast.error("❌ Gagal menyimpan data!");
        },
      });
    } else {
      router.put(`/daftar-tamu/${form.id}`, payload, {
        onSuccess: () => {
          toast.success("✏️ Data tamu berhasil diperbarui!");
          setShowModal(false);
        },
        onError: (errors) => {
          console.error(errors);
          toast.error("❌ Gagal menyimpan data!");
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus tamu ini?")) {
      router.delete(`/daftar-tamu/${id}`, {
        onSuccess: () => toast.info("🗑️ Data tamu dihapus!"),
        onError: () => toast.error("❌ Gagal menghapus data!"),
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

  // ✅ PAGING — 7 DATA PER HALAMAN
  const MAX_ROWS = 7;
  const totalPages = Math.ceil(tamu.data.length / MAX_ROWS);
  const [page, setPage] = useState(1);

  const start = (page - 1) * MAX_ROWS;
  const currentRows = tamu.data.slice(start, start + MAX_ROWS);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-[#0B3D91] flex items-center gap-2">
            <FaUser /> Daftar Tamu
          </h2>
        </div>
      }
    >
      <div className="bg-[#B0DAFF] p-7 rounded-2xl shadow-md border border-[#7FB8E5]">
        {/* Header Buttons */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleAdd}
            className="bg-[#0B3D91] hover:bg-[#001f45] text-white font-medium px-4 py-2 rounded-md flex items-center gap-2 shadow-md"
          >
            <FaPlus /> Tambah Tamu
          </button>
        </div>

        {/* Table */}
        <div className="bg-white overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full text-xs md:text-sm text-gray-700 border border-gray-300 border-collapse">
            <thead className="bg-[#0B3D91] text-white">
              <tr>
                <th className="px-2 md:px-4 py-2 md:py-3 border text-center">Nama</th>
                <th className="px-2 md:px-4 py-2 border">Jabatan</th>
                <th className="px-2 md:px-4 py-2 border">Instansi</th>
                <th className="px-2 md:px-4 py-2 border">Tujuan</th>
                <th className="px-2 md:px-4 py-2 border text-center">Tanggal</th>
                <th className="px-2 md:px-4 py-2 border text-center">Pukul</th>
                <th className="px-2 md:px-4 py-2 border text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-6 italic">
                    Belum ada data tamu 📭
                  </td>
                </tr>
              ) : (
                currentRows.map((item: any) => (
                  <tr key={item.id} className="border-t hover:bg-blue-50/50 transition">
                    <td className="px-2 md:px-4 py-2 border font-semibold text-[#0B3D91]">
                      {item.nama}
                    </td>
                    <td className="px-2 md:px-4 py-2 border">{item.jabatan || "-"}</td>
                    <td className="px-2 md:px-4 py-2 border">{item.instansi || "-"}</td>
                    <td className="px-2 md:px-4 py-2 border">{item.tujuan}</td>
                    <td className="px-2 md:px-4 py-2 border text-center">
                      {formatDateIndo(item.tanggal_kunjungan)}
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-center">
                      {formatTime(item.jam_mulai)} – {formatTime(item.jam_selesai)}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-center border space-x-2 md:space-x-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-3 items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 rounded-lg border ${page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
                }`}
            >
              « Sebelumnya
            </button>

            <span className="px-4 py-2 bg-[#0B3D91] text-white rounded-lg shadow-sm font-semibold">
              Halaman {page} dari {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 rounded-lg border ${page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
                }`}
            >
              Berikutnya »
            </button>
          </div>
        )}

        {/* MODAL TAMBAH / EDIT */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-[620px] relative p-8 border border-gray-100 animate-fadeIn">
              <button
                onClick={() => setShowModal(false)}
                className="absolute -top-4 -right-4 bg-[#0B3D91] hover:bg-[#001f45] text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl shadow-md transition"
              >
                ✕
              </button>

              <h3 className="text-center text-[#0B3D91] font-bold text-xl mb-6 border-b pb-2">
                {modalMode === "add" ? "Tambah Data Tamu" : "Edit Data Tamu"}
              </h3>

              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={form.jabatan}
                    onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#0B3D91]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Instansi</label>
                  <input
                    type="text"
                    value={form.instansi}
                    onChange={(e) => setForm({ ...form, instansi: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#0B3D91]/50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tujuan</label>
                  <input
                    type="text"
                    value={form.tujuan}
                    onChange={(e) => setForm({ ...form, tujuan: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#0B3D91]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
                  {/*<DatePicker
                    selected={form.tanggal_kunjungan}
                    onChange={(date: Date | null) => date && setForm({ ...form, tanggal_kunjungan: date })}
                    className="w-full border border-gray-300 rounded-md p-2 pr-10 focus:ring-2 focus:ring-[#0B3D91]/50"
                    dateFormat="yyyy-MM-dd"
                  />*/}
                  <CircularDatePicker
                    selectedDate={form.tanggal_kunjungan}
                    onDateChange={(date: Date) =>
                      setForm((prev) => ({
                        ...prev,
                        tanggal: date,
                      }))
                    }
                  />

                  <FaCalendarAlt className="absolute right-3 top-3 text-[#0B3D91]" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jam Mulai</label>
                  <input
                    readOnly
                    value={form.jam_mulai}
                    placeholder="Pilih waktu"
                    onClick={() => {
                      setPickerTarget("jam_mulai");
                      setShowTimePicker(true);
                    }}
                    className="w-full border border-gray-300 rounded-md p-2 cursor-pointer focus:ring-2 focus:ring-[#0B3D91]/50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jam Selesai</label>
                  <input
                    readOnly
                    value={form.jam_selesai}
                    placeholder="Pilih waktu"
                    onClick={() => {
                      setPickerTarget("jam_selesai");
                      setShowTimePicker(true);
                    }}
                    className="w-full border border-gray-300 rounded-md p-2 cursor-pointer focus:ring-2 focus:ring-[#0B3D91]/50"
                  />
                </div>

                <div className="col-span-2 flex justify-end mt-4">
                  <button
                    type="submit"
                    className="bg-[#0B3D91] hover:bg-[#001f45] text-white font-semibold px-6 py-2.5 rounded-md text-sm shadow-md"
                  >
                    {modalMode === "add" ? "Tambah Tamu" : "Simpan Perubahan"}
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
              style={{ width: 300, textAlign: "center", border: "3px solid #00427c" }}
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
                        onClick={() => setSelectedHour(hour)}
                        style={{
                          position: "absolute",
                          top: y,
                          left: x,
                          transform: "translate(-50%, -50%)",
                          cursor: "pointer",
                          fontWeight: selectedHour === hour ? "bold" : "normal",
                          color: selectedHour === hour ? "#00427c" : "#333",
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
                        onClick={() => setSelectedMinute(minute)}
                        style={{
                          position: "absolute",
                          top: y,
                          left: x,
                          transform: "translate(-50%, -50%)",
                          cursor: "pointer",
                          fontWeight:
                            selectedMinute === minute ? "bold" : "normal",
                          color: selectedMinute === minute ? "#00427c" : "#333",
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
      </div>
    </AuthenticatedLayout>
  );
}