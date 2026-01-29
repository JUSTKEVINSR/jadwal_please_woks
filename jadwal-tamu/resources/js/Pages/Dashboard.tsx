import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import JadwalRapatTable from '@/Components/JadwalRapatTable';

interface RunningText {
  id: number;
  text: string;
  is_active: boolean;
}

interface DashboardProps extends PageProps {
  totalJadwal: number;
  rapatSelesai: number;
  rapatTertunda: number;
  jadwal: any[];
  runningTexts: RunningText[];
}

export default function Dashboard() {
  const { auth, totalJadwal, rapatSelesai, rapatTertunda, jadwal, runningTexts } =
    usePage().props as unknown as DashboardProps;

  const [stats, setStats] = useState({
    totalJadwal,
    rapatSelesai,
    rapatTertunda
  });

  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop' | 'tv-small' | 'tv-large'>('desktop');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Form for adding new running text
  const { data, setData, post, processing, reset, errors } = useForm({
    text: '',
  });

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      if (width < 1024 && isTouchDevice) {
        setDeviceType('mobile');
        return;
      }

      if (!isTouchDevice && height >= 720) {
        if (width >= 1280 && width <= 1920) {
          setDeviceType('tv-small');
          return;
        }
        else if (width > 1920) {
          setDeviceType('tv-large');
          return;
        }
      }

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

  const handleAddRunningText = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('running-text.store'), {
      onSuccess: () => reset('text'),
      preserveScroll: true,
    });
  };

  const handleDeleteRunningText = (id: number) => {
    if (confirm('Apakah anda yakin ingin menghapus text ini?')) {
      router.delete(route('running-text.destroy', id), {
        preserveScroll: true,
      });
    }
  };

  const handleToggleRunningText = (id: number) => {
    router.put(route('running-text.toggle', id), {}, {
      preserveScroll: true,
    });
  };


  // Real-time updates for dashboard statistics
  useEffect(() => {
    if (window.Echo) {
      const channel = window.Echo.channel('public-jadwal-rapat');

      channel.listen('.jadwal-rapat.created', (data: any) => {
        console.log('Dashboard: New jadwal created:', data);
        router.reload({ only: ['totalJadwal', 'rapatSelesai', 'rapatTertunda', 'jadwal'] });
      });

      channel.listen('.jadwal-rapat.updated', (data: any) => {
        console.log('Dashboard: Jadwal updated:', data);
        router.reload({ only: ['totalJadwal', 'rapatSelesai', 'rapatTertunda', 'jadwal'] });
      });

      channel.listen('.jadwal-rapat.deleted', (data: any) => {
        console.log('Dashboard: Jadwal deleted:', data);
        router.reload({ only: ['totalJadwal', 'rapatSelesai', 'rapatTertunda', 'jadwal'] });
      });

      return () => {
        channel.stopListening('.jadwal-rapat.created');
        channel.stopListening('.jadwal-rapat.updated');
        channel.stopListening('.jadwal-rapat.deleted');
      };
    }
  }, []);

  return (
    <AuthenticatedLayout
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
    >
      <Head title="Dashboard" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
          {/* Stats Section */}
          <div className="bg-[#B0DAFF] p-7 rounded-2xl shadow-md border border-[#7FB8E5]">
            <div className="p-6 text-blue-900">
              <h1 className="text-2xl font-bold mb-2">
                Selamat Datang, {auth?.user?.name ?? 'User'} 🎉
              </h1>
              <p className="text-gray-600 mb-6">
                Ini adalah halaman Dashboard kamu.
                Gunakan menu di samping untuk mengelola jadwal rapat, daftar tamu, dan manajemen video.
              </p>

              {/* Statistik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-blue-700">Total Jadwal</h3>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{totalJadwal}</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-100 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-green-700">Rapat Selesai</h3>
                  <p className="text-3xl font-bold text-green-900 mt-2">{rapatSelesai}</p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-yellow-700">Rapat Tertunda</h3>
                  <p className="text-3xl font-bold text-yellow-900 mt-2">{rapatTertunda}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Running Text Management Section */}
          <div className="bg-white p-7 rounded-2xl shadow-md border border-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Manajemen Informasi (Running Text)</h2>

              {/* Form */}
              <form onSubmit={handleAddRunningText} className="mb-6 flex gap-4">
                <input
                  type="text"
                  value={data.text}
                  onChange={e => setData('text', e.target.value)}
                  placeholder="Masukkan teks informasi..."
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Tambah
                </button>
              </form>
              {errors.text && <div className="text-red-500 text-sm mb-4">{errors.text}</div>}

              {/* List */}
              <div className="space-y-3">
                {runningTexts && runningTexts.length > 0 ? (
                  runningTexts.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className={`flex-1 font-medium ${!item.is_active ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {item.text}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRunningText(item.id)}
                          className={`px-3 py-1 rounded text-sm ${item.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                        >
                          {item.is_active ? 'Aktif' : 'Non-Aktif'}
                        </button>
                        <button
                          onClick={() => handleDeleteRunningText(item.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Belum ada running text.</p>
                )}
              </div>
            </div>
          </div>


          <div className="bg-[#B0DAFF] p-7 rounded-2xl shadow-md border border-[#7FB8E5]">
            <div className="p-6 text-blue-900">
              <h1 className="text-2xl font-bold mb-4">
                Daftar Jadwal Rapat
              </h1>

              <div className="rounded-xl bg-white shadow-inner overflow-hidden min-h-[400px]">
                <JadwalRapatTable
                  jadwal={jadwal}
                  onPageChange={handlePageChange}
                  deviceType={deviceType}
                  showExtraColumns={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
