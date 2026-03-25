import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { FaUser, FaFileExcel } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { Head, usePage } from "@inertiajs/react";

interface DaftarTamuPlus {
  jabatan: string;
  id: number;
  nama: string;
  instansi: string | null;
  tujuan: string;
  tujuan_judul?: string;
  tanggal_kunjungan: string;
  jam_mulai: string;
  jam_selesai: string;
  signature_code: number | null;
  photo_code: number | null;
  signature_url?: string | null;
  photo_url?: string | null;
  created_at: string;
}

export default function Index() {
  const { daftarTamuPluses } = usePage().props as unknown as {
    daftarTamuPluses: DaftarTamuPlus[];
  };

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  const formatDateIndo = (date: string) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "-";
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const formattedHour = hourNum % 12 || 12;
    return `${String(formattedHour).padStart(2, "0")}:${minute} ${ampm}`;
  };

  const MAX_ROWS = 7;
  const totalPages = Math.ceil((daftarTamuPluses?.length || 0) / MAX_ROWS);

  const exportToExcel = () => {
    if (!daftarTamuPluses || daftarTamuPluses.length === 0) {
      alert("Tidak ada data untuk diexport!");
      return;
    }

    const dataToExport = daftarTamuPluses.map((item, index) => ({
      No: index + 1,
      Nama: item.nama,
      Instansi: item.instansi || "-",
      Jabatan: item.jabatan || "-",
      "Tujuan (Rapat)": item.tujuan_judul || item.tujuan,
      "Tanggal Kunjungan": formatDateIndo(item.tanggal_kunjungan),
      "Jam Mulai": formatTime(item.jam_mulai),
      "Jam Selesai": formatTime(item.jam_selesai),
      "Signature Code": item.signature_code || "N/A",
      "Photo Code": item.photo_code || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Tamu");

    XLSX.writeFile(workbook, "Daftar_Tamu_logs_.xlsx");
  };
  const [page, setPage] = useState(1);

  const start = (page - 1) * MAX_ROWS;
  const currentRows = (daftarTamuPluses || []).slice(start, start + MAX_ROWS);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-[#0B3D91] flex items-center gap-2">
            <FaUser /> Daftar Tamu Plus
          </h2>
        </div>
      }
    >
      <Head title="Daftar Tamu Plus" />

      <div className="bg-[#B0DAFF] p-7 rounded-2xl shadow-md border border-[#7FB8E5] m-6">
        <div className="flex justify-end">
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm transition"
          >
            <FaFileExcel className="text-lg" /> Export to Excel
          </button>
        </div>
        <div className="bg-white overflow-x-auto rounded-lg border border-gray-200 shadow-sm mt-4">
          <table className="min-w-full text-xs md:text-sm text-gray-700 border border-gray-300 border-collapse">
            <thead className="bg-[#0B3D91] text-white">
              <tr>
                <th className="px-2 md:px-4 py-2 md:py-3 border text-center">No</th>
                <th className="px-2 md:px-4 py-2 border">Nama & Instansi</th>
                <th className="px-2 md:px-4 py-2 border">Tujuan (Rapat)</th>
                <th className="px-2 md:px-4 py-2 border text-center">Tanggal</th>
                <th className="px-2 md:px-4 py-2 border text-center">Waktu Kunjungan</th>
                <th className="px-2 md:px-4 py-2 border text-center">Signature / Photo Code</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-6 italic">
                    Belum ada data tamu 📭
                  </td>
                </tr>
              ) : (
                currentRows.map((item, index) => (
                  <tr key={item.id} className="border-t hover:bg-blue-50/50 transition">
                    <td className="px-2 md:px-4 py-2 border text-center font-semibold text-[#0B3D91]">
                      {start + index + 1}
                    </td>
                    <td className="px-2 md:px-4 py-2 border">
                      <div className="font-semibold text-gray-900">{item.nama}</div>
                      <div className="text-gray-500">{item.instansi || "-"} || {item.jabatan || "-"}</div>
                    </td>
                    <td className="px-2 md:px-4 py-2 border font-medium text-gray-900">
                      {item.tujuan_judul || item.tujuan}
                      <div className="text-xs font-normal text-gray-400">Kode: {item.tujuan}</div>
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-center">
                      {formatDateIndo(item.tanggal_kunjungan)}
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-center whitespace-nowrap">
                      {formatTime(item.jam_mulai)} – {formatTime(item.jam_selesai)}
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-center">
                      <div className="flex flex-col gap-1 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">✍️</span>
                          <button
                            className="ml-1 hover:text-blue-600 hover:underline transition-colors"
                            onClick={() => {
                              if (item.signature_url) {
                                setPreviewImage(item.signature_url);
                                setPreviewTitle("Signature Preview");
                              } else {
                                alert("Signature not available");
                              }
                            }}
                          >
                            {item.signature_code || 'N/A'}
                          </button>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">📸</span>
                          <button
                            className="ml-1 hover:text-blue-600 hover:underline transition-colors"
                            onClick={() => {
                              if (item.photo_url) {
                                setPreviewImage(item.photo_url);
                                setPreviewTitle("Photo Preview");
                              } else {
                                alert("Photo not available");
                              }
                            }}
                          >
                            {item.photo_code || 'N/A'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-3 items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 rounded-lg border bg-white shadow-sm ${page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
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
              className={`px-4 py-2 rounded-lg border bg-white shadow-sm ${page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
                }`}
            >
              Berikutnya »
            </button>
          </div>
        )}

        {/* IMAGE PREVIEW MODAL */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#0B3D91] px-6 py-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg">{previewTitle}</h3>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="text-white hover:text-gray-200 text-2xl leading-none font-semibold transition-colors"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 flex justify-center items-center max-h-[70vh] overflow-auto bg-gray-50">
                <img
                  src={previewImage}
                  alt={previewTitle}
                  className="max-w-full max-h-full object-contain rounded border border-gray-200 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="bottom-right" autoClose={2000} />
      </div>
    </AuthenticatedLayout>
  );
}