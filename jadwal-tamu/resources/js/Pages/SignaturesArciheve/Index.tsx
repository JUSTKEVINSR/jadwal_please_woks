import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

interface Signature {
    id: number;
    code: string;
    name: string | null;
    signature: string;
    created_at: string;
}

interface Props {
    signatures: Signature[];
    auth: {
        user: any;
    };
}

export default function Index({ auth, signatures }: Readonly<Props>) {

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this signature?")) {
            router.delete(`/form-signatures/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Signature Archive</h2>}
        >
            <Head title="Signature Archive" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {signatures.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-gray-500">
                                    No signatures have been created yet.
                                </div>
                            ) : (
                                signatures.map((sig) => (
                                    <div key={sig.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition bg-gray-50 flex flex-col">
                                        <div className="h-48 border-b border-gray-200 bg-white flex items-center justify-center p-2">
                                            {/* We use an img tag since the signature is stored as a base64 dataURL */}
                                            <img
                                                src={sig.signature}
                                                alt={`Signature ${sig.code}`}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>
                                        <div className="p-4 flex-grow flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-semibold text-gray-500">Code</span>
                                                    <span className="font-mono bg-blue-100 text-[#0B3D91] px-2 py-1 rounded text-sm font-bold">
                                                        {sig.code}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 mb-4">
                                                    <span className="font-semibold">Date:</span> {new Date(sig.created_at).toLocaleDateString()} {new Date(sig.created_at).toLocaleTimeString()}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDelete(sig.id)}
                                                className="w-full text-center py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-semibold rounded-lg transition-colors text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
