import React from "react";
import FormLayout from "@/Layouts/FormLayout";
import { Head, useForm } from "@inertiajs/react";

interface JadwalRapat {
    id: number;
    judul: string;
    rapat_code: string | null;
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
}

interface Props {
    jadwalRapats: JadwalRapat[];
    initialTujuan?: string;
    initialPhotoRequired?: boolean;
    isClosed?: boolean;
}

export default function Index({ jadwalRapats, initialTujuan = "", initialPhotoRequired = true, isClosed = false }: Props) {
    const matchedJadwal = initialTujuan ? jadwalRapats.find(j => j.rapat_code === initialTujuan) : null;
    const formatTime = (time: string | undefined) => time ? time.substring(0, 5) : '';

    const { data, setData, post, processing, errors } = useForm({
        nama: "",
        jabatan: "",
        instansi: "",
        tujuan: initialTujuan || "",
        tanggal_kunjungan: matchedJadwal ? matchedJadwal.tanggal : "",
        jam_mulai: matchedJadwal ? formatTime(matchedJadwal.jam_mulai) : "",
        jam_selesai: matchedJadwal ? formatTime(matchedJadwal.jam_selesai) : "",
        signature_code: null as number | null,
        photo_code: null as number | null,
    });
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [selectedPhoto, setSelectedPhoto] = React.useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        // Only run canvas logic if the form is not closed
        if (isClosed) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size to match display size
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            ctx.lineCap = "round";
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#0B3D91";
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        return () => window.removeEventListener("resize", resizeCanvas);
    }, [isClosed]);

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ("touches" in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const saveSignature = async (): Promise<number | null> => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        // Check if canvas is empty
        const ctx = canvas.getContext("2d");
        const pixelBuffer = new Uint32Array(
            ctx!.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        );
        const isEmpty = !pixelBuffer.some((color) => color !== 0);
        if (isEmpty) return null;

        // Get signature as base64 string
        const signatureData = canvas.toDataURL("image/png");

        try {
            const response = await window.axios.post('/form-signatures', {
                signature: signatureData
            });
            return response.data.code;
        } catch (error) {
            console.error("Error saving signature:", error);
            alert("Failed to save signature.");
            return null;
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedPhoto(file);
            setPhotoPreviewUrl(URL.createObjectURL(file));
        }
    };

    const savePhoto = async (): Promise<number | null> => {
        if (!selectedPhoto) {
            return null;
        }

        const formData = new FormData();
        formData.append("photo", selectedPhoto);

        try {
            const response = await window.axios.post('/form-photos', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data.code;
        } catch (error) {
            console.error("Error saving photo:", error);
            alert("Failed to save photo.");
            return null;
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Save Signature First
        const sigCode = await saveSignature();

        // 2. Save Photo
        const pCode = await savePhoto();

        // Update data state before posting (Note: Inertia post uses the snapshot of data when called,
        // so we need to use the transform approach or send it directly. Let's use standard post with new data)
        const submitData = {
            ...data,
            signature_code: sigCode,
            photo_code: pCode
        };

        window.axios.post('/form-absen-rapat', submitData).then(() => {
            alert('Form Berhasil Disimpan!');
            window.location.href = '/';
        }).catch(err => {
            console.error(err.response?.data?.errors || err);
            const errorData = err.response?.data?.errors;
            const messages = errorData ? Object.values(errorData).flat().join('\n') : err.message;
            alert('Gagal menyimpan form. Silakan cek isian Anda.\n\nDetail:\n' + messages);
        });
    };

    if (isClosed) {
        return (
            <FormLayout>
                <Head title="Form Closed" />
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">

                    {/* <svg className="w-24 h-24 text-red-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg> */}

                    <div className="tenor-gif-embed" data-postid="25172881" data-share-method="host" data-aspect-ratio="1.39738" data-width="100%"><a href="https://tenor.com/view/minecraft-boat-smol-ame-gura-gif-25172881">Minecraft Boat GIF</a>from <a href="https://tenor.com/search/minecraft-gifs">Minecraft GIFs</a>
                    </div> <script type="text/javascript" async src="https://tenor.com/embed.js"></script>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Oh Nyo the fowm is awweady cwosed</h1>
                    <p className="text-lg text-gray-600 max-w-lg">
                        We awe so sowwy-worry, but we can't take any mowe entries wight now!! The fowm is stuffed full like a fluffy mawshmallow!! nuzzles uw hand aggwessively XP RAWR!! 🦖
                        Dun be sad, k? Just wait fow next time!! glitchesw-w-w
                        NYA~ ICHI NI SAN... BYE BYE!! XD ✌️🌈💕
                    </p>
                </div>
            </FormLayout>
        );
    }

    return (
        <FormLayout>
            <Head title="Form Absen Rapat" />



            <form onSubmit={submit} className="space-y-4 mt-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama</label>
                    <input
                        type="text"
                        value={data.nama}
                        onChange={e => setData('nama', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#0B3D91]/50"
                        required
                    />
                    {errors.nama && <div className="text-red-500 text-sm">{errors.nama}</div>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Jabatan</label>
                    <input
                        type="text"
                        value={data.jabatan}
                        onChange={e => setData('jabatan', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#0B3D91]/50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Instansi</label>
                    <input
                        type="text"
                        value={data.instansi}
                        onChange={e => setData('instansi', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#0B3D91]/50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tujuan (Pilih Jadwal Rapat)</label>
                    <select
                        value={data.tujuan}
                        onChange={e => {
                            const code = e.target.value;
                            setData('tujuan', code);
                            const selected = jadwalRapats.find(j => j.rapat_code === code);
                            if (selected) {
                                // Extract HH:mm from HH:mm:ss if necessary
                                const formatTime = (time: string) => time ? time.substring(0, 5) : '';

                                setData(prev => ({
                                    ...prev,
                                    tujuan: code,
                                    tanggal_kunjungan: selected.tanggal,
                                    jam_mulai: formatTime(selected.jam_mulai),
                                    jam_selesai: formatTime(selected.jam_selesai)
                                }));
                            }
                        }}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                        required
                    >
                        <option value="">Pilih Jadwal</option>
                        {jadwalRapats.map(jadwal => (
                            <option key={jadwal.id} value={jadwal.rapat_code || ''}>
                                {jadwal.judul} {/*({jadwal.tanggal} {jadwal.jam_mulai}-{jadwal.jam_selesai}) - Kode: {jadwal.rapat_code || 'N/A'}*/}
                            </option>
                        ))}
                    </select>
                </div>


                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Kunjungan</label>
                    <input
                        type="date"
                        value={data.tanggal_kunjungan}
                        onChange={e => setData('tanggal_kunjungan', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#0B3D91]/50 bg-gray-50"
                        required
                        readOnly
                    />
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Jam Mulai</label>
                        <input
                            type="time"
                            value={data.jam_mulai}
                            onChange={e => setData('jam_mulai', e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#0B3D91]/50 bg-gray-50"
                            required
                            readOnly
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Jam Selesai</label>
                        <input
                            type="time"
                            value={data.jam_selesai}
                            onChange={e => setData('jam_selesai', e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#0B3D91]/50 bg-gray-50"
                            required
                            readOnly
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 italic">Digital Signature</h2>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 mb-4 flex justify-center items-center bg-gray-50 overflow-hidden">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full h-full cursor-crosshair touch-none"
                        ></canvas>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={clearSignature}
                            className="px-5 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        >
                            Clear Signature
                        </button>
                    </div>
                </div>

                {initialPhotoRequired && (
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 italic">Photo Upload</h2>

                        {photoPreviewUrl ? (
                            <div className="border-2 border-gray-300 rounded-lg mb-4 flex justify-center items-center bg-gray-50 overflow-hidden relative group">
                                <img src={photoPreviewUrl} alt="Preview" className="max-h-64 object-contain" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                    <label className="cursor-pointer text-white flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Change Photo
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full mb-4">
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                </label>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedPhoto(null);
                                    setPhotoPreviewUrl(null);
                                }}
                                className="px-5 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                            >
                                Clear Photo
                            </button>

                        </div>
                    </div>
                )}



                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full px-5 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
                    >
                        Submit Form Absen
                    </button>
                </div>
            </form>
        </FormLayout>
    );
}

