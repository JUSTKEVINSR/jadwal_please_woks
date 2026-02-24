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

interface Gambar {
    id: number;
    judul: string;
    path: string;
}

interface VideoSetting {
    cycle_duration: number;
    is_shuffle: boolean;
    is_muted: boolean;
    is_looped: boolean;
    show_youtube_hud: boolean;
    display_mode: 'video' | 'image';
}

interface RunningText {
    id: number;
    text: string;
    is_active: boolean;
}

interface Props {
    canLogin: boolean;
    jadwal: Jadwal[];
    videos: Video[];
    gambars: Gambar[];
    runningTexts: RunningText[];
    settings: VideoSetting;
}

type DeviceType = 'mobile' | 'desktop' | 'tv-small' | 'tv-large';

export default function Home({ canLogin, jadwal, videos, gambars, runningTexts, settings }: Props) {
    const { auth } = usePage().props as any;
    const [time, setTime] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
    const [jadwalData, setJadwalData] = useState<Jadwal[]>(jadwal);

    // Combine all active running texts
    const fullRunningText = runningTexts?.map(t => t.text).join("  •  ") || "Selamat Datang di Inspektorat Jenderal Kementerian Dalam Negeri RI";










    // ✅ Video Cycling State
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [orderedVideos, setOrderedVideos] = useState<Video[]>([]);

    // ✅ Image Cycling State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [orderedImages, setOrderedImages] = useState<Gambar[]>([]);

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

    useEffect(() => {
        if (!gambars || gambars.length === 0) {
            setOrderedImages([]);
            return;
        }
        setOrderedImages(gambars);
        setCurrentImageIndex(0);
    }, [gambars]);

    // ✅ Auto Cycle Logic (Video & Image)
    useEffect(() => {
        // Video Cycle
        if (settings.display_mode === 'video' || !settings.display_mode) {
            if (settings.cycle_duration > 0 && orderedVideos.length > 1) {
                const timer = setInterval(() => {
                    setCurrentVideoIndex((prev) => (prev + 1) % orderedVideos.length);
                }, settings.cycle_duration * 1000);
                return () => clearInterval(timer);
            }
        }

        // Image Cycle
        if (settings.display_mode === 'image') {
            if (orderedImages.length > 1) {
                // Use cycle_duration if set, otherwise default to 10 seconds for images
                const duration = settings.cycle_duration > 0 ? settings.cycle_duration * 1000 : 10000;
                const timer = setInterval(() => {
                    setCurrentImageIndex((prev) => (prev + 1) % orderedImages.length);
                }, duration);
                return () => clearInterval(timer);
            }
        }

    }, [settings.cycle_duration, orderedVideos, currentVideoIndex, orderedImages, settings.display_mode]);

    const handleVideoEnd = () => {
        if (orderedVideos.length > 1) {
            setCurrentVideoIndex((prev) => (prev + 1) % orderedVideos.length);
        }
    };

    const currentVideo = orderedVideos[currentVideoIndex];
    const currentImage = orderedImages[currentImageIndex];
    const { video } = usePage().props as any; // Keep this for Echo reload if needed, but we use props

    // Real-time updates for jadwal
    useEffect(() => {
        console.log('Home: Setting up Echo listeners...', {
            hasEcho: !!window.Echo,
            echoAvailable: window.Echo
        });

        if (window.Echo) {
            // 1. Jadwal Rapat
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

            // 2. Videos
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

            // 3. Running Text
            console.log('Home: Connecting to public-running-text channel...');
            const runningTextChannel = window.Echo.channel('public-running-text');

            const handleRunningTextUpdate = (data: any) => {
                console.log('Home: Running Text update detected:', data);
                router.reload({ only: ['runningTexts'] });
            };

            runningTextChannel.listen('.running-text.created', handleRunningTextUpdate);
            runningTextChannel.listen('.running-text.updated', handleRunningTextUpdate);
            runningTextChannel.listen('.running-text.deleted', handleRunningTextUpdate);

            // 4. Gambars (Images)
            console.log('Home: Connecting to public-gambars channel...');
            const gambarChannel = window.Echo.channel('public-gambars');

            const handleGambarUpdate = (data: any) => {
                console.log('Home: Gambar update detected:', data);
                router.reload({ only: ['gambars'] });
            };

            gambarChannel.listen('.gambar.created', handleGambarUpdate);
            gambarChannel.listen('.gambar.updated', handleGambarUpdate);
            gambarChannel.listen('.gambar.deleted', handleGambarUpdate);

            console.log('Home: Echo listeners set up successfully');

            return () => {
                channel.stopListening('.jadwal-rapat.created');
                channel.stopListening('.jadwal-rapat.updated');
                channel.stopListening('.jadwal-rapat.deleted');

                videoChannel.stopListening('.video.created');
                videoChannel.stopListening('.video.updated');
                videoChannel.stopListening('.video.deleted');
                videoChannel.stopListening('.video.settings.updated');

                runningTextChannel.stopListening('.running-text.created');
                runningTextChannel.stopListening('.running-text.updated');
                runningTextChannel.stopListening('.running-text.deleted');

                gambarChannel.stopListening('.gambar.created');
                gambarChannel.stopListening('.gambar.updated');
                gambarChannel.stopListening('.gambar.deleted');
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
        const loopParam = (settings.is_looped || orderedVideos.length === 1) ? '1' : '0';
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muteParam}&controls=${controlsParam}&loop=${loopParam}&playlist=${videoId}`;
    };

    // ✅ Tentukan apakah bisa scroll (hanya mobile)
    const canScroll = deviceType === 'mobile';

    // Calculate duration based on text length (slower for better readability)
    const baseDuration = 25;
    const charDuration = 0.2; // seconds per char
    const calculatedDuration = Math.max(baseDuration, fullRunningText.length * charDuration);

    return (
        <>
            <Head title="Home - Manajemen Jadwal Rapat & Daftar Tamu" />
            <style>
                {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

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
                <div className={`relative w-full max-w-[1920px] bg-gradient-to-br from-blue-100 to-blue-100 rounded-3xl shadow-xl flex flex-col p-3 md:p-4 ${canScroll ? 'min-h-screen' : 'h-[95vh]'}`}>
                    {/* Navbar */}
                    <div
                        className="bg-gradient-to-r from-[#0B3D91] to-[#1E5BB8] rounded-xl px-4 py-10 md:px-6 md:py-3 
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
                                            shadow-xl relative overflow-hidden h-[200px] "
                            >
                                {/* Dekorasi background */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-white rounded-full -mr-16 md:-mr-20 -mt-16 md:-mt-20"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 md:w-60 md:h-60 bg-white rounded-full -ml-24 md:-ml-30 -mb-24 md:-mb-30"></div>
                                </div>

                                <div className="relative z-10 text-center px-4">
                                    <div className="clock-time text-7xl md:text-5xl lg:text-6xl font-bold tracking-wider mb-1 drop-shadow-lg">
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
                            <div className="bg-gradient-to-br from-[#3f6dc4] to-[#e1e4e9] rounded-2xl shadow-xl p-1 overflow-hidden h-[180px] md:flex-1">
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
                                <div className="w-full h-full bg-black rounded-lg overflow-hidden relative">
                                    {settings.display_mode === 'image' ? (
                                        // ✅ IMAGE DISPLAY MODE
                                        orderedImages.length > 0 ? (
                                            <div className="w-full h-full relative">
                                                {orderedImages.map((img, index) => (
                                                    <div
                                                        key={`${img.id}-${index}`}
                                                        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                                                            }`}
                                                    >
                                                        <img
                                                            src={`/storage/${img.path}`}
                                                            alt={img.judul}
                                                            className="w-full h-full object-contain"
                                                        />
                                                        {/* Caption - only visible for active slide */}
                                                        <div className={`absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-center transition-opacity duration-500 ${index === currentImageIndex ? "opacity-0 hover:opacity-100" : "opacity-0 pointer-events-none"
                                                            }`}>
                                                            {img.judul}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
                                                <div className="text-center">
                                                    <div className="text-3xl md:text-4xl mb-2">🖼️</div>
                                                    <p className="text-white text-base md:text-lg font-semibold">No Images Available</p>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        // ✅ VIDEO DISPLAY MODE
                                        currentVideo && currentVideo.url ? (
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
                                                    key={`${currentVideo.id}-${settings.is_muted}-${settings.is_looped}`} // ✅ Force reload on cycle OR mute change
                                                    src={currentVideo.url}
                                                    autoPlay
                                                    muted={settings.is_muted}
                                                    loop={settings.is_looped || orderedVideos.length === 1}
                                                    onEnded={handleVideoEnd}
                                                    playsInline
                                                    className="w-full h-full object-contain bg-black"
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
                                        )
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

                    {/* Wrapper Flex untuk handle width constraint */}
                    <div className="mt-3 md:mt-4 bg-gradient-to-r from-[#0B3D91] to-[#1E5BB8] rounded-xl px-4 py-2 md:px-6 md:py-3 
                    flex items-center shadow-lg overflow-hidden relative w-full">

                        <div className="w-full overflow-hidden">
                            <div
                                key={calculatedDuration}
                                className="inline-block whitespace-nowrap"
                                style={{
                                    animationName: 'marquee',
                                    animationDuration: `${calculatedDuration}s`,
                                    animationTimingFunction: 'linear',
                                    animationIterationCount: 'infinite',
                                    minWidth: '100%'
                                }}
                            >
                                <span className="text-white text-sm md:text-xl font-bold tracking-wide mr-16 inline-block">
                                    {fullRunningText.replace(/[\r\n]+/g, "  ")}
                                </span>
                                <span className="text-white text-sm md:text-xl font-bold tracking-wide mr-16 inline-block">
                                    {fullRunningText.replace(/[\r\n]+/g, "  ")}
                                </span>
                            </div>
                        </div>

                    </div>

                </div>{" "}
                {/* penutup container biru */}
            </div>{" "}
            {/* penutup background putih */}
        </>
    );
}