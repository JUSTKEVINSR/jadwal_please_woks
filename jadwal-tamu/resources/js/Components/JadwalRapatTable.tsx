import React, { useEffect, useState } from "react";

interface JadwalItem {
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  judul: string;
  lokasi: string;
  room?: {
    name: string;
    room_code: number;
  };
  keterangan?: string;
  status: string;
  gunakan_zoom: string;
}

interface Props {
  jadwal: JadwalItem[];
  onPageChange?: (current: number, total: number) => void;
  deviceType?: 'mobile' | 'desktop' | 'tv-small' | 'tv-large';
  visibleLimit?: number; // optional: limit how many rows to render (e.g., top 5)
  showExtraColumns?: boolean;
}

const JadwalRapatTable: React.FC<Props> = ({ jadwal, onPageChange, deviceType = 'desktop', visibleLimit, showExtraColumns = false }) => {
  // ✅ Sesuaikan rows per page berdasarkan device
  const getMaxRows = () => {
    if (deviceType === 'mobile') return 20; // Mobile bisa scroll, tampilkan semua
    if (deviceType === 'tv-small') return 8; // TV kecil (20"-32")
    if (deviceType === 'tv-large') return 10; // TV besar (>32")
    return 10; // Desktop default
  };

  const MAX_ROWS = getMaxRows();

  const formatTime = (time: string) => {
    if (!time) return "-";
    const [hourStr, minuteStr] = time.split(":");
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    if (isNaN(hour)) return time;

    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;

    return `${String(formattedHour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )} ${ampm}`;
  };

  const formatDateIndo = (tanggal: string) => {
    const date = new Date(tanggal);
    if (isNaN(date.getTime())) return tanggal;

    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ✅ GROUP BY TANGGAL (total data)
  const allGrouped: Record<string, JadwalItem[]> = {};
  jadwal.forEach((item) => {
    if (!allGrouped[item.tanggal]) allGrouped[item.tanggal] = [];
    allGrouped[item.tanggal].push(item);
  });

  // ✅ FLATTEN DATA GLOBAL
  const flatRows: {
    tanggal: string;
    data: JadwalItem;
  }[] = [];

  Object.keys(allGrouped).forEach((tgl) => {
    allGrouped[tgl].forEach((data) => {
      flatRows.push({ tanggal: tgl, data });
    });
  });

  // ✅ BAGI DATA PER HALAMAN + HITUNG ROWSPAN PER HALAMAN
  const pages: {
    tanggal: string;
    data: JadwalItem;
    isFirstOfDate: boolean;
    tanggalCountInPage: number;
  }[][] = [];

  for (let i = 0; i < flatRows.length; i += MAX_ROWS) {
    const slice = flatRows.slice(i, i + MAX_ROWS);

    // hitung jumlah per tanggal dalam halaman ini
    const localGrouped: Record<string, number> = {};
    slice.forEach((row) => {
      localGrouped[row.tanggal] = (localGrouped[row.tanggal] || 0) + 1;
    });

    // tandai mana baris pertama untuk tanggalnya (di halaman ini)
    const pageData = slice.map((row, idx) => {
      const firstIndex = slice.findIndex((r) => r.tanggal === row.tanggal);
      return {
        ...row,
        isFirstOfDate: idx === firstIndex,
        tanggalCountInPage: localGrouped[row.tanggal],
      };
    });

    pages.push(pageData);
  }

  const [page, setPage] = useState(0);

  // ✅ Auto pagination - hanya untuk desktop & TV (tidak untuk mobile)
  useEffect(() => {
    if (pages.length <= 1 || deviceType === 'mobile') return;

    const interval = setInterval(() => {
      setPage((prev) => (prev + 1) % pages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [pages.length, deviceType]);

  // Notify parent component about page changes
  useEffect(() => {
    if (onPageChange) {
      onPageChange(page, pages.length);
    }
  }, [page, pages.length, onPageChange]);

  // ✅ Untuk mobile tampilkan semua data (bisa scroll), untuk yang lain pagination
  const displayRows = deviceType === 'mobile'
    ? flatRows.map((row, idx) => {
      const firstIndex = flatRows.findIndex((r) => r.tanggal === row.tanggal);
      const sameDate = flatRows.filter((r) => r.tanggal === row.tanggal);
      return {
        ...row,
        isFirstOfDate: idx === firstIndex,
        tanggalCountInPage: sameDate.length,
      };
    })
    : pages[page] || [];


  // Show only N rows at a time, auto-rotate every 10 seconds
  const VISIBLE_LIMIT = typeof visibleLimit === 'number' ? visibleLimit : 2;
  const [visibleGroup, setVisibleGroup] = useState(0);
  const totalGroups = Math.ceil(flatRows.length / VISIBLE_LIMIT);

  useEffect(() => {
    if (flatRows.length <= VISIBLE_LIMIT) return;
    const timer = setInterval(() => {
      setVisibleGroup((prev) => (prev + 1) % totalGroups);
    }, 10000);
    return () => clearInterval(timer);
  }, [flatRows.length, VISIBLE_LIMIT, totalGroups]);

  // Compute which rows to show for this group
  const startIdx = visibleGroup * VISIBLE_LIMIT;
  const rowsToRender = flatRows.slice(startIdx, startIdx + VISIBLE_LIMIT);

  // Component untuk teks berjalan
  const ScrollingText: React.FC<{ text: string; maxLength?: number }> = ({
    text,
    maxLength = 50
  }) => {
    const isLong = text.length > maxLength;

    if (!isLong) {
      return <span>{text}</span>;
    }

    return (
      <div className="overflow-hidden whitespace-nowrap relative">
        <div className="animate-marquee inline-block">
          {text}
          <span className="mx-8">•</span>
          {text}
        </div>
      </div>
    );
  };

  // ✅ Get responsive classes untuk TV
  const getTVTextSize = (baseClass: string) => {
    if (deviceType === 'tv-small') return `${baseClass} tv-text-sm`;
    if (deviceType === 'tv-large') return `${baseClass} tv-text-lg`;
    return baseClass;
  };

  return (
    <div className="h-full flex flex-col">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          
          .animate-marquee:hover {
            animation-play-state: paused;
          }

          /* TV Scaling untuk table */
          ${deviceType === 'tv-small' ? `
            .tv-text-sm {
              font-size: 0.95rem !important;
            }
            .tv-text-sm th,
            .tv-text-sm td {
              padding: 0.6rem !important;
            }
          ` : ''}

          ${deviceType === 'tv-large' ? `
            .tv-text-lg {
              font-size: 1.15rem !important;
            }
            .tv-text-lg th,
            .tv-text-lg td {
              padding: 0.75rem !important;
            }
          ` : ''}

          /* Mobile Responsive Table */
          ${deviceType === 'mobile' ? `
            .mobile-table {
              font-size: 11px !important;
            }
            .mobile-table th,
            .mobile-table td {
              padding: 0.4rem !important;
            }
            .mobile-table th {
              font-size: 10px !important;
            }
            .mobile-col-no { width: 30px !important; }
            .mobile-col-tanggal { width: 120px !important; }
            .mobile-col-pukul { width: 90px !important; }
            .mobile-col-judul { min-width: 140px !important; max-width: 140px !important; }
            .mobile-col-lokasi { width: 70px !important; }
            .mobile-col-keterangan { min-width: 130px !important; max-width: 130px !important; }
            .mobile-col-status { width: 65px !important; }
          ` : ''}
        `
      }} />

      <div className={deviceType === 'mobile' ? 'overflow-x-auto' : ''}>
        {!showExtraColumns && (
          <div className="bg-gradient-to-br from-[#3f6dc4] to-[#0a6cff] rounded-2xl text-white flex flex-col items-center justify-center 
           shadow-xl relative overflow-hidden h-[50px]">

            <h1 className={getTVTextSize("text-lg md:text-2xl font-bold z-10")}>
              Upcoming Meetings
            </h1>

          </div>
        )}
        <table className={`min-w-full border border-gray-300 text-black bg-white rounded-xl overflow-hidden ${deviceType === 'mobile' ? 'mobile-table' : getTVTextSize("text-xs md:text-sm")
          }`}>

          <thead className={getTVTextSize("bg-[#0B3D91] text-white text-sm md:text-base")}>
            <tr>
              {/*<th className={`border text-center ${deviceType === 'mobile' ? 'mobile-col-no p-1' : 'p-1.5 md:p-2 w-[40px] md:w-[50px]'}`}>No</th> */}

              {/* 
              {showExtraColumns && (
                <th className={`border ${deviceType === 'mobile' ? 'mobile-col-tanggal p-1' : 'p-1.5 md:p-2 w-[160px] md:w-[200px]'}`}>Tanggal</th>
              )}

              {!showExtraColumns && (
                <th className={`border text-center ${deviceType === 'mobile' ? 'mobile-col-pukul p-1' : 'p-1.5 md:p-2 w-[110px] md:w-[130px]'}`}>Pukul</th>
              )}*/}

              {/*<th className={`border ${deviceType === 'mobile' ? 'mobile-col-judul p-1' : 'p-1.5 md:p-2'}`}>Judul</th>*/}
              {/*th className={`border ${deviceType === 'mobile' ? 'mobile-col-judul p-1' : 'p-1.5 md:p-2 w-[200px] md:w-[380px]'}`}>AGENDA</th>*/}
              {/*<th className={`border text-center ${deviceType === 'mobile' ? 'mobile-col-lokasi p-1' : 'p-1.5 md:p-2 w-[90px] md:w-[110px]'}`}>Lokasi</th>*/}

              {/* 
              {showExtraColumns && (
                <th className={`border text-center ${deviceType === 'mobile' ? 'p-1' : 'p-1.5 md:p-2 w-[80px] md:w-[100px]'}`}>Gunakan Zoom</th>
              )}*/}

              {/*<th className={`border ${deviceType === 'mobile' ? 'mobile-col-keterangan p-1' : 'p-1.5 md:p-2'}`}>Keterangan</th>*/}
              {/*<th className={`border text-center ${deviceType === 'mobile' ? 'mobile-col-status p-1' : 'p-1.5 md:p-2 w-[80px] md:w-[100px]'}`}>Status</th>*/}
            </tr>
          </thead>

          <tbody>
            {rowsToRender.map((row, idx) => {
              // Sequential numbering: global index in flatRows
              const no = startIdx + idx + 1;

              // ✅ Fixed height untuk setiap row
              const rowHeight = deviceType === 'mobile' ? '50px' : deviceType === 'tv-small' ? '55px' : deviceType === 'tv-large' ? '60px' : '55px';

              return (

                <tr
                  key={`${row.tanggal}-${idx}`}
                  className="hover:bg-gray-50"
                  style={{ height: rowHeight }}
                >
                  {/*<td>{no}</td> ROWS */}

                  {showExtraColumns && (
                    <td
                      className={`border font-semibold text-black ${deviceType === 'mobile' ? 'p-1 text-[10px]' : deviceType === 'tv-small' ? 'p-2 text-sm' : deviceType === 'tv-large' ? 'p-3 text-base' : 'p-1.5 md:p-2 text-xs md:text-sm'
                        }`}
                      style={{
                        verticalAlign: 'middle',
                        height: rowHeight
                      }}
                    >
                      {deviceType === 'mobile'
                        ? new Date(row.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                        : formatDateIndo(row.tanggal)
                      }
                      <div>
                        {formatTime(row.data.jam_mulai)} – {formatTime(row.data.jam_selesai)}
                      </div>


                    </td>
                  )}

                  {/* {row.isFirstOfDate && (
                  <>
                    <td
                      rowSpan={row.tanggalCountInPage}
                      className={`border text-center font-bold text-[#002D62] ${
                        deviceType === 'mobile' ? 'p-1 text-sm' : deviceType === 'tv-small' ? 'p-2 text-lg' : deviceType === 'tv-large' ? 'p-3 text-xl' : 'p-1.5 md:p-2 text-base md:text-lg'
                      }`}
                      style={{ 
                        verticalAlign: 'middle',
                        height: rowHeight
                      }}
                    >
                      {no}
                    </td>

                    <td
                      rowSpan={row.tanggalCountInPage}
                      className={`border font-semibold text-black ${
                        deviceType === 'mobile' ? 'p-1 text-[10px]' : deviceType === 'tv-small' ? 'p-2 text-sm' : deviceType === 'tv-large' ? 'p-3 text-base' : 'p-1.5 md:p-2 text-xs md:text-sm'
                      }`}
                      style={{ 
                        verticalAlign: 'middle',
                        height: rowHeight
                      }}
                    >
                      {deviceType === 'mobile' 
                        ? new Date(row.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                        : formatDateIndo(row.tanggal)
                      }
                    </td>
                  </>
                )} */}

                  {!showExtraColumns && (
                    <td className={`border text-center font-semibold text-[#002D62] whitespace-nowrap ${deviceType === 'mobile' ? 'p-1 text-[9px]' : 'p-1.5 md:p-2 text-[10px] md:text-xs'
                      }`}>
                      {formatTime(row.data.jam_mulai)} – {formatTime(row.data.jam_selesai)}
                    </td>
                  )}

                  {/* JUDUL - dengan scrolling text */}
                  <td className={`border ${deviceType === 'mobile' ? 'p-1' : 'p-1.5 md:p-2'}`}>
                    <div className={`overflow-hidden whitespace-nowrap ${deviceType === 'mobile' ? 'w-[140px]' : 'w-[180px] md:w-[180px]'
                      }`}>
                      <ScrollingText text={row.data.judul} maxLength={deviceType === 'mobile' ? 15 : 25} />
                    </div>

                    {/* LOKASI - dengan scrolling text */}
                    <div className={`overflow-hidden whitespace-nowrap ${deviceType === 'mobile' ? 'text-[9px]' : 'text-xs md:text-sm'}`}>
                      <ScrollingText text={row.data.room?.name || row.data.lokasi} maxLength={deviceType === 'mobile' ? 8 : 15} />
                    </div>
                  </td>

                  {/* LOKASI - dengan scrolling text 
                <td className={`border text-center ${deviceType === 'mobile' ? 'p-1 max-w-[70px]' : 'p-1.5 md:p-2 max-w-[90px] md:max-w-[110px]'}`}>
                  <div className={deviceType === 'mobile' ? 'text-[9px]' : 'text-xs md:text-sm'}>
                    <ScrollingText text={row.data.lokasi} maxLength={deviceType === 'mobile' ? 8 : 15} />
                  </div>
                </td>*/}


                  {
                    showExtraColumns && (
                      <td className={`border text-center ${deviceType === 'mobile' ? 'p-1' : 'p-1.5 md:p-2'}`}>
                        <span className={`px-1.5 rounded-full font-semibold whitespace-nowrap ${deviceType === 'mobile' ? 'py-0.5 text-[8px]' : 'py-0.5 md:py-1 text-[10px] md:text-xs'
                          } ${row.data.gunakan_zoom === "yes"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 text-gray-800"
                          }`}>
                          {row.data.gunakan_zoom === "yes" ? "Ya" : "Tidak"}
                        </span>
                      </td>
                    )
                  }

                  {/* KETERANGAN - dengan scrolling text */}
                  {
                    showExtraColumns && (
                      <td className={`border ${deviceType === 'mobile' ? 'p-1 max-w-[130px]' : 'p-1.5 md:p-2 max-w-[180px] md:max-w-[250px]'}`}>
                        <div className={`leading-snug ${deviceType === 'mobile' ? 'text-[9px]' : 'text-xs md:text-sm'}`}>
                          <ScrollingText text={row.data.keterangan || "-"} maxLength={deviceType === 'mobile' ? 15 : 30} />
                        </div>
                      </td>
                    )
                  }

                  {/* STATUS 
                <td className={`border text-center ${deviceType === 'mobile' ? 'p-1' : 'p-1.5 md:p-2'}`}>
                  <span
                    className={`px-1.5 rounded-full font-semibold whitespace-nowrap ${
                      deviceType === 'mobile' ? 'py-0.5 text-[8px]' : 'py-0.5 md:py-1 text-[10px] md:text-xs'
                    } ${
                      row.data.status === "Selesai"
                        ? "bg-green-600 text-white"
                        : row.data.status === "Proses"
                        ? "bg-yellow-400 text-gray-800"
                        : "bg-gray-300 text-gray-800"
                    }`}
                  >
                    {row.data.status}
                  </span>
                </td>*/}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div >
  );
};

export default JadwalRapatTable;
