import React, { useEffect, useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import JadwalRapatTable from "@/Components/JadwalRapatTable";

// Import Laravel Echo for real-time updates
declare global {
    interface Window {
        Echo: any;
    }
}

interface Jadwal {
    id: number;
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
    judul: string;
    lokasi: string;
    keterangan?: string;
    status: string;
    gunakan_zoom: string;
    kasubak?: string;
    ula?: string;
}

interface Video {
    id: number;
    judul: string;
    url: string;
    source_type: 'local' | 'youtube';
}

interface VideoSetting {
    cycle_duration: number;
    is_shuffle: boolean;
    is_muted: boolean;
    show_youtube_hud: boolean;
}

interface Props {
    canLogin: boolean;
    jadwal: Jadwal[];
    videos: Video[];
    settings: VideoSetting;
}

type DeviceType = 'mobile' | 'desktop' | 'tv-small' | 'tv-large';

export default function Home({ canLogin, jadwal, videos, settings }: Props) {
    const { auth } = usePage().props as any;
    const [time, setTime] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
    const [jadwalData, setJadwalData] = useState<Jadwal[]>(jadwal);

    // ✅ Video Cycling State
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [orderedVideos, setOrderedVideos] = useState<Video[]>([]);

    useEffect(() => {
        if (!videos || videos.length === 0) {
            setOrderedVideos([]);
            return;
        }

        let processedVideos = [...videos];
        if (settings.is_shuffle) {
            // Fisher-Yates shuffle
            for (let i = processedVideos.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [processedVideos[i], processedVideos[j]] = [processedVideos[j], processedVideos[i]];
            }
        }
        setOrderedVideos(processedVideos);
        setCurrentVideoIndex(0);
    }, [videos, settings.is_shuffle]);

    // ✅ Auto Cycle Logic
    useEffect(() => {
        if (settings.cycle_duration > 0 && orderedVideos.length > 1) {
            const timer = setInterval(() => {
                setCurrentVideoIndex((prev) => (prev + 1) % orderedVideos.length);
            }, settings.cycle_duration * 1000); // ✅ settings.cycle_duration now in seconds

            return () => clearInterval(timer);
        }
    }, [settings.cycle_duration, orderedVideos, currentVideoIndex]); // ✅ Reset timer on slide change

    const handleVideoEnd = () => {
        if (orderedVideos.length > 1) {
            setCurrentVideoIndex((prev) => (prev + 1) % orderedVideos.length);
        }
    };

    const currentVideo = orderedVideos[currentVideoIndex];
    const { video } = usePage().props as any; // Keep this for Echo reload if needed, but we use props

    // Real-time updates for jadwal
    useEffect(() => {
        console.log('Home: Setting up Echo listeners...', {
            hasEcho: !!window.Echo,
            echoAvailable: window.Echo
        });

        if (window.Echo) {
            console.log('Home: Connecting to public-jadwal-rapat channel...');
            const channel = window.Echo.channel('public-jadwal-rapat');

            channel.listen('.jadwal-rapat.created', (data: any) => {
                console.log('Home: New jadwal created:', data);
                setJadwalData(prev => [...prev, data.jadwal_rapat]);
            });

            channel.listen('.jadwal-rapat.updated', (data: any) => {
                console.log('Home: Jadwal updated:', data);
                setJadwalData(prev =>
                    prev.map(item =>
                        item.id === data.jadwal_rapat.id ? data.jadwal_rapat : item
                    )
                );
            });

            channel.listen('.jadwal-rapat.deleted', (data: any) => {
                console.log('Home: Jadwal deleted:', data);
                setJadwalData(prev =>
                    prev.filter(item => item.id !== data.jadwal_rapat_id)
                );
            });

            // Video Channel
            console.log('Home: Connecting to public-videos channel...');
            const videoChannel = window.Echo.channel('public-videos');

            const handleVideoUpdate = (data: any) => {
                console.log('Home: Video update detected:', data);
                router.reload({ only: ['videos', 'settings'] });
            };

            videoChannel.listen('.video.created', handleVideoUpdate);
            videoChannel.listen('.video.updated', handleVideoUpdate);
            videoChannel.listen('.video.deleted', handleVideoUpdate);
            videoChannel.listen('.video.settings.updated', (data: any) => {
                console.log('Home: Video settings updated:', data);
                router.reload({ only: ['settings'] });
            });

            console.log('Home: Echo listeners set up successfully');

            return () => {
                channel.stopListening('.jadwal-rapat.created');
                channel.stopListening('.jadwal-rapat.updated');
                channel.stopListening('.jadwal-rapat.deleted');

                videoChannel.stopListening('.video.created');
                videoChannel.stopListening('.video.updated');
                videoChannel.stopListening('.video.deleted');
            };
        } else {
            console.error('Home: window.Echo is not available!');
        }
    }, []);

    // ✅ Deteksi device type
    useEffect(() => {
        const detectDevice = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            // Mobile Detection (phone & tablet dengan touch)
            if (width < 1024 && isTouchDevice) {
                setDeviceType('mobile');
                return;
            }

            // TV Detection berdasarkan ukuran layar
            if (!isTouchDevice && height >= 720) {
                // TV kecil (20"-32" biasanya 720p-1080p, width 1280-1920)
                if (width >= 1280 && width <= 1920) {
                    setDeviceType('tv-small');
                    return;
                }
                // TV besar (>32" biasanya >1920px)
                else if (width > 1920) {
                    setDeviceType('tv-large');
                    return;
                }
            }

            // Default Desktop
            setDeviceType('desktop');
        };

        detectDevice();
        window.addEventListener('resize', detectDevice);
        return () => window.removeEventListener('resize', detectDevice);
    }, []);

    const handlePageChange = (current: number, total: number) => {
        setCurrentPage(current);
        setTotalPages(total);
    };

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
    ];
    const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];

    const day = days[time.getDay()];
    const date = time.getDate();
    const month = months[time.getMonth()];
    const year = time.getFullYear();

    const hour = time.getHours().toString().padStart(2, "0");
    const minute = time.getMinutes().toString().padStart(2, "0");
    const second = time.getSeconds().toString().padStart(2, "0");

    // ✅ Helper to convert YouTube URL to Embed URL
    const getYoutubeEmbedUrl = (url: string) => {
        let videoId = "";

        // Match standard watch URLs, short URLs, embeds, shorts, and live streams
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(regex);

        if (match && match[1]) {
            videoId = match[1];
        }

        if (!videoId) return "";

        // Tambahkan rel=0 dan enablejsapi=1 agar bisa handle end event jika memakai API YouTube (tapi di sini simple logic)
        const muteParam = settings.is_muted ? '1' : '0';
        const controlsParam = settings.show_youtube_hud ? '1' : '0';
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muteParam}&controls=${controlsParam}&loop=${orderedVideos.length === 1 ? '1' : '0'}&playlist=${videoId}`;
    };

    // ✅ Tentukan apakah bisa scroll (hanya mobile)
    const canScroll = deviceType === 'mobile';

    return (
        <>
            <Head title="Home - Manajemen Jadwal Rapat & Daftar Tamu" />
            <style>
                {`
          html, body {
            overflow: ${canScroll ? 'auto' : 'hidden'};
            ${!canScroll ? 'height: 100vh;' : ''}
          }

          /* Custom scrollbar untuk mobile */
          ${canScroll ? `
            ::-webkit-scrollbar {
              width: 6px;
            }
            ::-webkit-scrollbar-track {
              background: #f1f1f1;
            }
            ::-webkit-scrollbar-thumb {
              background: #0B3D91;
              border-radius: 3px;
            }
          ` : ''}

          /* TV Scaling */
          ${deviceType === 'tv-small' ? `
            .tv-scale {
              font-size: 16px !important;
            }
            .tv-scale h1 {
              font-size: 1.5rem !important;
            }
            .tv-scale .clock-time {
              font-size: 4.5rem !important;
            }
            .tv-scale .clock-date {
              font-size: 1.25rem !important;
            }
            .tv-scale .table-header {
              font-size: 1.75rem !important;
            }
          ` : ''}

          ${deviceType === 'tv-large' ? `
            .tv-scale {
              font-size: 20px !important;
            }
            .tv-scale h1 {
              font-size: 2rem !important;
            }
            .tv-scale .clock-time {
              font-size: 6rem !important;
            }
            .tv-scale .clock-date {
              font-size: 1.5rem !important;
            }
            .tv-scale .table-header {
              font-size: 2.25rem !important;
            }
          ` : ''}
        `}
            </style>
            {/* Background putih dengan padding */}
            <div className={`bg-white px-2 md:px-3 py-1 md:py-0 flex justify-center tv-scale ${canScroll ? 'min-h-screen' : 'h-screen overflow-hidden'}`}>
                {/* Container biru rounded */}
                <div className={`relative w-full max-w-[1920px] bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl shadow-xl flex flex-col p-3 md:p-4 ${canScroll ? 'min-h-screen' : 'h-[95vh]'}`}>
                    {/* Navbar */}
                    <div
                        className="bg-gradient-to-r from-[#0B3D91] to-[#1E5BB8] rounded-xl px-4 py-2 md:px-6 md:py-3 
              flex justify-between items-center shadow-lg"
                    >
                        <div className="flex items-center gap-2 md:gap-3">
                            <img
                                src="/images/logo-kemendagri.png"
                                alt="Logo"
                                className="w-8 h-8 md:w-12 md:h-12 object-contain drop-shadow-lg"
                            />
                            <div>
                                <h1 className="text-white text-sm md:text-xl font-bold tracking-wide">
                                    INSPEKTORAT JENDERAL
                                </h1>
                                <p className="text-blue-200 text-xs md:text-sm font-medium">
                                    Kementerian Dalam Negeri RI
                                </p>
                            </div>
                        </div>

                        {canLogin && auth?.user && (
                            <Link
                                href={route("dashboard")}
                                className="px-3 py-1 md:px-5 md:py-2 rounded-lg border-2 border-white bg-white/10
                text-white font-semibold hover:bg-white/20 text-xs md:text-sm backdrop-blur-sm
                transition-all duration-300"
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>
                    {/* Konten Utama - Layout 2 Kolom */}
                    <div className={`flex-1 flex flex-col md:flex-row gap-3 md:gap-4 mt-3 md:mt-4 ${canScroll ? '' : 'min-h-0'}`}>
                        {/* Kolom Kiri: Jam (atas) + Video (bawah) */}
                        <div className="w-full md:w-1/3 flex flex-col gap-3 md:gap-4">
                            {/* Jam Digital */}
                            <div
                                className="bg-gradient-to-br from-[#0B3D91] to-[#1E5BB8] rounded-2xl 
                                            text-white flex flex-col items-center justify-center 
                                            shadow-xl relative overflow-hidden h-[165px] "
                            >
                                {/* Dekorasi background */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-white rounded-full -mr-16 md:-mr-20 -mt-16 md:-mt-20"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 md:w-60 md:h-60 bg-white rounded-full -ml-24 md:-ml-30 -mb-24 md:-mb-30"></div>
                                </div>

                                <div className="relative z-10 text-center px-4">
                                    <div className="clock-time text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider mb-1 drop-shadow-lg">
                                        {hour}
                                        <span className="animate-pulse">:</span>
                                        {minute}
                                        <span className="text-xl md:text-2xl lg:text-3xl ml-2">
                                            {second}
                                        </span>
                                    </div>
                                    <div className="clock-date mt-2 text-base md:text-lg lg:text-xl font-medium">
                                        {day}, {date} {month} {year}
                                    </div>
                                </div>
                            </div>

                            {/* jadwal Player - DENGAN BORDER FULL */}
                            <div className="bg-gradient-to-br from-[#c4cfe2] to-[#4d8be9] rounded-2xl shadow-xl p-1 overflow-hidden h-[180px] md:flex-1">
                                {/* Tabel */}
                                <div className={`rounded-xl bg-blue shadow-inner ${canScroll ? 'overflow-visible' : 'flex-1 overflow-hidden min-h-0'}`}>
                                    <div className={`${canScroll ? 'overflow-visible' : 'h-full overflow-hidden'}`}>
                                        <JadwalRapatTable
                                            jadwal={jadwalData.filter(item =>
                                                item.kasubak === 'approve' &&
                                                item.ula === 'approve'

                                            )}
                                            onPageChange={handlePageChange}
                                            deviceType={deviceType}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>


                        {/* Kolom Kanan: Tabel Jadwal - Background BIRU MUDA */}
                        <div
                            className={`flex-1 bg-[#0B3D91] rounded-2xl shadow-xl p-3 md:p-4 flex flex-col border border-[#A0C4FF] ${canScroll ? 'mb-4' : 'min-h-0'}`}
                        >
                            <div className="bg-gradient-to-br from-[#072355] to-[#072355] rounded-2xl shadow-xl p-1 overflow-hidden h-[180px] md:flex-1">
                                <div className="w-full h-full bg-black rounded-lg overflow-hidden">
                                    {currentVideo && currentVideo.url ? (
                                        currentVideo.source_type === 'youtube' ? (
                                            getYoutubeEmbedUrl(currentVideo.url) ? (
                                                <div className="w-full h-full relative group">
                                                    <iframe
                                                        key={`${currentVideo.id}-${settings.is_muted}-${settings.show_youtube_hud}`} // ✅ Force reload on cycle OR settings change
                                                        src={getYoutubeEmbedUrl(currentVideo.url)}
                                                        className="w-full h-full border-0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                    <a
                                                        href={currentVideo.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Tonton di YouTube
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 rounded-lg p-4 text-center">
                                                    <p className="text-red-400 font-bold mb-2">Link YouTube Tidak Valid</p>
                                                    <p className="text-white text-xs mb-4">{currentVideo.url}</p>
                                                </div>
                                            )
                                        ) : (
                                            <video
                                                key={`${currentVideo.id}-${settings.is_muted}`} // ✅ Force reload on cycle OR mute change
                                                src={currentVideo.url}
                                                autoPlay
                                                muted={settings.is_muted}
                                                loop={orderedVideos.length === 1}
                                                onEnded={handleVideoEnd}
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
                                            <div className="text-center">
                                                <div className="text-3xl md:text-4xl mb-2">
                                                    📹
                                                </div>
                                                <p className="text-white text-base md:text-lg font-semibold">
                                                    Video Display
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>



                            {/* Header Tabel 
                            <div
                                className="table-header bg-gradient-to-r from-[#0B3D91] to-[#1E5BB8] text-white 
                                 text-center text-lg md:text-2xl font-bold py-3 md:py-4 rounded-xl shadow-lg mb-3 md:mb-4"
                            >
                                JADWAL KEGIATAN HARI INI

                            
                            </div>
*/}
                            {/* Tabel 
                            <div className={`rounded-xl bg-blue shadow-inner ${canScroll ? 'overflow-visible' : 'flex-1 overflow-hidden min-h-0'}`}>
                                <div className={`${canScroll ? 'overflow-visible' : 'h-full overflow-hidden'}`}>
                                    <JadwalRapatTable
                                        jadwal={jadwal}
                                        onPageChange={handlePageChange}
                                        deviceType={deviceType}
                                    />
                                </div>
                            </div>
                            */}



                            {/* ✅ Pagination dots - hanya tampil untuk desktop & TV 
                            {totalPages > 1 && !canScroll && (
                                <div className="flex justify-center mt-3 md:mt-4 gap-2">
                                    {Array.from({ length: totalPages }).map(
                                        (_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${i === currentPage
                                                    ? "bg-[#0B3D91] scale-125"
                                                    : "bg-gray-400"
                                                    }`}
                                            />
                                        )
                                    )}
                                </div>
                            )}*/}

                        </div>
                    </div>{" "}
                    {/* penutup konten utama */}
                </div>{" "}
                {/* penutup container biru */}
            </div>{" "}
            {/* penutup background putih */}
        </>
    );
}