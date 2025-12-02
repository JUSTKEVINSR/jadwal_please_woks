import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface DashboardProps extends PageProps {
  totalJadwal: number;
  rapatSelesai: number;
  rapatTertunda: number;
}

export default function Dashboard() {
  const { auth, totalJadwal, rapatSelesai, rapatTertunda } =
  usePage().props as unknown as DashboardProps;

  return (
    <AuthenticatedLayout
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
    >
      <Head title="Dashboard" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
