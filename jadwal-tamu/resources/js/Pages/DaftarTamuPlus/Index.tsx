import React, { useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { FaUser, FaFileExcel, FaFilePdf, FaTimes, FaDownload, FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  const [previewMeta, setPreviewMeta] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [page, setPage] = useState(1);

  const pdfTableRef = useRef<HTMLDivElement>(null);

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
  const start = (page - 1) * MAX_ROWS;
  const currentRows = (daftarTamuPluses || []).slice(start, start + MAX_ROWS);

  /* ─── Excel Export ────────────────────────────────────────────── */
  const exportToExcel = () => {
    if (!daftarTamuPluses || daftarTamuPluses.length === 0) {
      toast.warn("Tidak ada data untuk diexport!");
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
    toast.success("Excel berhasil diexport!");
  };

  /* ─── PDF Export ──────────────────────────────────────────────── */
  const exportToPDF = async () => {
    if (!daftarTamuPluses || daftarTamuPluses.length === 0) {
      toast.warn("Tidak ada data untuk diexport!");
      return;
    }

    setPdfLoading(true);
    toast.info("Membuat PDF, mohon tunggu...", { autoClose: 3000 });

    try {
      // Build a hidden full-table element
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "-99999px";
      container.style.left = "0";
      container.style.width = "1100px";
      container.style.fontFamily = "Arial, sans-serif";
      container.style.fontSize = "11px";
      container.style.background = "#ffffff";
      container.style.padding = "24px";

      const now = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      container.innerHTML = `
        <div style="text-align:center;margin-bottom:16px;">
          <div style="font-size:18px;font-weight:700;color:#0B3D91;margin-bottom:4px;">DAFTAR TAMU PLUS</div>
          <div style="font-size:11px;color:#555;">Dicetak pada: ${now}</div>
          <div style="height:2px;background:linear-gradient(90deg,#0B3D91,#4da3ff);margin-top:10px;border-radius:2px;"></div>
        </div>
        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <thead>
            <tr style="background:#0B3D91;color:#fff;">
              <th style="padding:8px 6px;border:1px solid #ccc;text-align:center;width:40px;">No</th>
              <th style="padding:8px 6px;border:1px solid #ccc;text-align:left;width:200px;">Nama &amp; Instansi</th>
              <th style="padding:8px 6px;border:1px solid #ccc;text-align:left;">Tujuan (Rapat)</th>
              <th style="padding:8px 6px;border:1px solid #ccc;text-align:center;width:160px;">Tanggal</th>
              <th style="padding:8px 6px;border:1px solid #ccc;text-align:center;width:130px;">Waktu Kunjungan</th>
              <th style="padding:8px 6px;border:1px solid #ccc;text-align:center;width:110px;">Sig / Photo Code</th>
            </tr>
          </thead>
          <tbody>
            ${(daftarTamuPluses || [])
              .map(
                (item, i) => `
              <tr style="background:${i % 2 === 0 ? "#f8faff" : "#ffffff"};">
                <td style="padding:7px 6px;border:1px solid #ddd;text-align:center;font-weight:700;color:#0B3D91;">${i + 1}</td>
                <td style="padding:7px 6px;border:1px solid #ddd;">
                  <div style="font-weight:600;color:#111;">${item.nama}</div>
                  <div style="color:#666;font-size:10px;">${item.instansi || "-"} | ${item.jabatan || "-"}</div>
                </td>
                <td style="padding:7px 6px;border:1px solid #ddd;">
                  <div style="font-weight:500;">${item.tujuan_judul || item.tujuan}</div>
                  <div style="color:#999;font-size:9px;">Kode: ${item.tujuan}</div>
                </td>
                <td style="padding:7px 6px;border:1px solid #ddd;text-align:center;">${formatDateIndo(item.tanggal_kunjungan)}</td>
                <td style="padding:7px 6px;border:1px solid #ddd;text-align:center;white-space:nowrap;">${formatTime(item.jam_mulai)} – ${formatTime(item.jam_selesai)}</td>
                <td style="padding:7px 6px;border:1px solid #ddd;text-align:center;">
                  <div>✍️ ${item.signature_code || "N/A"}</div>
                  <div>📸 ${item.photo_code || "N/A"}</div>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div style="margin-top:12px;font-size:10px;color:#888;text-align:right;">
          Total: ${daftarTamuPluses?.length || 0} tamu
        </div>
      `;

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // 10mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let yOffset = 10;
      let remainingHeight = imgHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const sliceHeight = Math.min(remainingHeight, pageHeight - 20);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceHeight * canvas.width) / imgWidth;

        const ctx = sliceCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sliceCanvas.height,
            0,
            0,
            canvas.width,
            sliceCanvas.height
          );
        }

        const sliceData = sliceCanvas.toDataURL("image/png");
        if (sourceY > 0) {
          pdf.addPage();
          yOffset = 10;
        }
        pdf.addImage(sliceData, "PNG", 10, yOffset, imgWidth, sliceHeight);

        sourceY += sliceCanvas.height;
        remainingHeight -= sliceHeight;
      }

      pdf.save(`Daftar_Tamu_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF berhasil diexport!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat PDF. Coba lagi.");
    } finally {
      setPdfLoading(false);
    }
  };

  /* ─── Preview helpers ─────────────────────────────────────────── */
  const openPreview = (url: string, title: string, meta: string) => {
    setPreviewImage(url);
    setPreviewTitle(title);
    setPreviewMeta(meta);
  };

  const downloadPreviewImage = () => {
    if (!previewImage) return;
    const a = document.createElement("a");
    a.href = previewImage;
    a.download = previewTitle.replace(/\s+/g, "_") + ".png";
    a.click();
  };

  /* ─── Render ──────────────────────────────────────────────────── */
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

        {/* ── Action Buttons ───────────────────────────────────── */}
        <div className="flex justify-end gap-3 mb-4 flex-wrap">
          {/* Excel */}
          <button
            id="btn-export-excel"
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm transition"
          >
            <FaFileExcel className="text-lg" /> Export Excel
          </button>

          {/* PDF */}
          <button
            id="btn-export-pdf"
            onClick={exportToPDF}
            disabled={pdfLoading}
            className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm transition ${
              pdfLoading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <FaFilePdf className="text-lg" />
            {pdfLoading ? "Membuat PDF..." : "Export PDF"}
          </button>
        </div>

        {/* ── Table ────────────────────────────────────────────── */}
        <div
          ref={pdfTableRef}
          className="bg-white overflow-x-auto rounded-lg border border-gray-200 shadow-sm"
        >
          <table className="min-w-full text-xs md:text-sm text-gray-700 border border-gray-300 border-collapse">
            <thead className="bg-[#0B3D91] text-white">
              <tr>
                <th className="px-2 md:px-4 py-2 md:py-3 border text-center">No</th>
                <th className="px-2 md:px-4 py-2 border">Nama &amp; Instansi</th>
                <th className="px-2 md:px-4 py-2 border">Tujuan (Rapat)</th>
                <th className="px-2 md:px-4 py-2 border text-center">Tanggal</th>
                <th className="px-2 md:px-4 py-2 border text-center">Waktu Kunjungan</th>
                <th className="px-2 md:px-4 py-2 border text-center">Signature / Photo</th>
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
                      <div className="text-gray-500">
                        {item.instansi || "-"} | {item.jabatan || "-"}
                      </div>
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

                    {/* Signature & Photo preview buttons */}
                    <td className="px-2 md:px-4 py-2 border text-center">
                      <div className="flex flex-col gap-1.5 text-sm items-center">

                        {/* Signature */}
                        <button
                          id={`btn-sig-${item.id}`}
                          title="Lihat Tanda Tangan"
                          onClick={() => {
                            if (item.signature_url) {
                              openPreview(
                                item.signature_url,
                                "Tanda Tangan",
                                `${item.nama} — Kode: ${item.signature_code}`
                              );
                            } else {
                              toast.warn("Tanda tangan tidak tersedia");
                            }
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition ${
                            item.signature_url
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          ✍️
                          <span>{item.signature_code ? `#${item.signature_code}` : "N/A"}</span>
                          {item.signature_url && <FaSearch className="text-[10px]" />}
                        </button>

                        {/* Photo */}
                        <button
                          id={`btn-photo-${item.id}`}
                          title="Lihat Foto"
                          onClick={() => {
                            if (item.photo_url) {
                              openPreview(
                                item.photo_url,
                                "Foto Tamu",
                                `${item.nama} — Kode: ${item.photo_code}`
                              );
                            } else {
                              toast.warn("Foto tidak tersedia");
                            }
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition ${
                            item.photo_url
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          📸
                          <span>{item.photo_code ? `#${item.photo_code}` : "N/A"}</span>
                          {item.photo_url && <FaSearch className="text-[10px]" />}
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ───────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-3 items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 rounded-lg border bg-white shadow-sm ${
                page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
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
              className={`px-4 py-2 rounded-lg border bg-white shadow-sm ${
                page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
              }`}
            >
              Berikutnya »
            </button>
          </div>
        )}
      </div>

      {/* ── Image Preview Modal ───────────────────────────────── */}
      {previewImage && (
        <div
          id="modal-preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl flex flex-col"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0B3D91] to-[#1a5bbf] px-6 py-4 flex justify-between items-start text-white flex-shrink-0">
              <div>
                <h3 className="font-bold text-lg leading-tight">{previewTitle}</h3>
                {previewMeta && (
                  <p className="text-blue-200 text-xs mt-0.5">{previewMeta}</p>
                )}
              </div>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                {/* Download */}
                <button
                  id="btn-download-preview"
                  onClick={downloadPreviewImage}
                  title="Download gambar"
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition flex items-center gap-1.5 text-sm font-semibold"
                >
                  <FaDownload /> Download
                </button>
                {/* Close */}
                <button
                  id="btn-close-preview"
                  onClick={() => setPreviewImage(null)}
                  title="Tutup"
                  className="bg-white/20 hover:bg-red-500 text-white p-2 rounded-lg transition"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex justify-center items-center overflow-auto bg-gray-50 flex-1">
              <img
                src={previewImage}
                alt={previewTitle}
                className="max-w-full max-h-full object-contain rounded-lg border border-gray-200 shadow"
                style={{ maxHeight: "60vh" }}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-100 text-xs text-gray-500 text-center flex-shrink-0">
              Klik di luar gambar atau tekan tombol × untuk menutup
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={2000} />
    </AuthenticatedLayout>
  );
}