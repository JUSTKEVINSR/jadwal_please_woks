import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import "react-datepicker/dist/react-datepicker.css";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaUser,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { router, usePage } from "@inertiajs/react";


// Define the shape of the user data for type safety
interface UserData {
    id?: number;
    name: string;
    email: string;
    // State property names match the 'name' attribute in the inputs
    password: string;
    passwordConfirm: string;
    role: 'user' | 'admin' | 'ula' | 'kasubak' | 'pic';
}

// Define props for the component
interface NewUserFormProps {
    // 🔑 Parent passes the Inertia submission logic here
    onSubmit?: (userData: Omit<UserData, 'passwordConfirm'>) => Promise<void>;
    // 🔑 Parent passes the modal closure logic here
    onCancel: () => void;
}

// Default onSubmit handler for page usage
const defaultOnSubmit = async (userData: Omit<UserData, 'passwordConfirm'>) => {
    router.post('/users_plus', userData, {
        onSuccess: () => {
            toast.success('User created successfully!');
        },
        onError: (errors) => {
            const firstError = Object.values(errors)[0];
            toast.error(`Error creating user: ${firstError || 'Please check form data.'}`);
        },
        preserveScroll: true,
    });
};

const Create: React.FC<NewUserFormProps> = (props: NewUserFormProps) => {

    // 1. State Initialization using useState
    const { onSubmit = defaultOnSubmit, onCancel } = props;
    const { users, auth } = usePage().props as any;

    useEffect(() => {
        if (auth.user.role !== 'admin' && auth.user.role !== 'pic') {
            router.visit('/');
        }
    }, [auth.user.role]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [formData, setFormData] = useState<UserData>({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        role: 'user',
    });

    // PAGING — 7 DATA PER HALAMAN
    const MAX_ROWS = 7;
    const totalPages = Math.ceil(users?.length / MAX_ROWS) || 1;
    const [page, setPage] = useState(1);
    const start = (page - 1) * MAX_ROWS;
    const currentRows = users?.slice(start, start + MAX_ROWS) || [];

    // 2. Generic Change Handler
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        // ❌ Removed: setModalMode("edit"); and setShowModal(true);
        // This component is always in 'add' mode, and visibility is managed by the parent.
    };

    // 3. Submission Handler
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // --- VALIDATION CHECKS ---
        if (formData.name.trim() === '' || formData.email.trim() === '') {
            alert('User Name and Email are required.');
            return;
        }
        if (modalMode === "add" || formData.password !== '') {
            if (formData.password !== formData.passwordConfirm) {
                alert('Error: Passwords do not match!');
                return;
            }
            if (formData.password.length < 8) {
                alert('Error: Password must be at least 8 characters long.');
                return;
            }
        }
        // --- END VALIDATION ---

        // 🔑 Prepare data for submission: Omit passwordConfirm
        const { passwordConfirm, ...dataToSubmit } = formData;

        // Removed check for default onSubmit as it's always passed

        try {
            if (modalMode === "edit") {
                // For edit, use router.put
                router.put(`/users_plus/${formData.id}`, dataToSubmit, {
                    onSuccess: () => {
                        toast.success("✏️ Data user berhasil diperbarui!");
                        setShowModal(false);
                    },
                    onError: (errors) => {
                        console.error(errors);
                        toast.error("❌ Gagal menyimpan data!");
                    },
                });
            } else {
                // 🔑 Await the API call (handled by the PARENT's onSubmit prop, which uses Inertia)
                await onSubmit(dataToSubmit as Omit<UserData, 'passwordConfirm'>);

                // Reset the form data after successful submission
                setFormData({
                    id: undefined,
                    name: '',
                    email: '',
                    password: '',
                    passwordConfirm: '',
                    role: 'user',
                });

                // Close the modal after successful submission
                setShowModal(false);
            }

        } catch (err) {
            // Error handling (toast) is done by the parent component that threw this error
            console.error('Create component: onSubmit threw an error:', err);
            // Re-throw or just catch, but let the parent handle the notification.
        }
    };

    const handleEdit = (item: any) => {
        setFormData({
            id: item.id,
            name: item.name,
            email: item.email,
            password: '',
            passwordConfirm: '',
            role: item.role,
        });
        setModalMode("edit");
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Yakin ingin menghapus user ini?")) {
            router.delete(`/users_plus/${id}`, {
                onSuccess: () => toast.info("🗑️ Data user dihapus!"),
                onError: () => toast.error("❌ Gagal menghapus data!"),
            });
        }
    };

    // KOMPONEN WABSITE DI SINI
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-[#0B3D91] flex items-center gap-2">
                        Buat Pengguna Baru
                    </h2>
                </div>
            }
        >
            {/* 🔑 MODAL STRUCTURE: Renders conditionally based on showModal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 transition-opacity">
                    <form id="user-form" onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-[620px] relative p-8 border border-gray-100 animate-fadeIn">
                        <div className="grid grid-cols-3 gap-3">

                            {/* Form close button */}
                            <button
                                type="button"
                                onClick={() => { setShowModal(false); if (onCancel) onCancel(); }} // 🔑 Use the onCancel prop to close the modal
                                className="absolute -top-4 -right-4 bg-[#0B3D91] hover:bg-[#001f45] text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl shadow-md transition"
                            >
                                ✕
                            </button>

                            <h3 className="text-center text-[#0B3D91] font-bold text-xl mb-6 border-b pb-2 col-span-3">
                                {modalMode === "add" ? "Tambah Data User" : "Edit Data User"}
                            </h3>

                            {/* User Name Input */}
                            <div className="col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">User Name</label>
                                <input
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                    placeholder="Masukkan User Name"
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* User Email Input */}
                            <div className="col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                <input
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                    placeholder="Masukkan Email"
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* User Password Input */}
                            <div className="col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                                <input
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                    placeholder={modalMode === "edit" ? "Leave blank to keep current" : "Masukkan password"}
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={modalMode === "add"}
                                />
                            </div>

                            {/* User Confirm Password Input */}
                            <div className="col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                    placeholder={modalMode === "edit" ? "Leave blank to keep current" : "Masukkan password"}
                                    type="password"
                                    id="passwordConfirm"
                                    name="passwordConfirm"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    required={modalMode === "add"}
                                />
                            </div>

                            {/* Role Select Dropdown */}
                            <div className="col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                                <select
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 text-gray-800"
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="ula">ULA</option>
                                    <option value="kasubak">Kasubak</option>
                                    <option value="pic">PIC</option>
                                </select>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-start items-center mb-6 col-span-3">
                                <button
                                    type="submit"
                                    className="bg-[#0B3D91] hover:bg-[#001f45] text-white font-medium px-4 py-2 rounded-md flex items-center gap-2 shadow-md"
                                >
                                    <FaPlus /> {modalMode === "add" ? "Tambah User" : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* The rest of the component's original rendering structure for the user list */}
            <div className="bg-[#B0DAFF] p-4 md:p-7 rounded-2xl shadow-md border border-[#7FB8E5] w-full overflow-hidden">
                {/* Header with button positioned top right */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#0B3D91]">User list</h3>
                    {/* The Create User button should be moved to the PARENT component */
                        <button
                            type="button"
                            onClick={() => { setModalMode("add"); setShowModal(true); }} // 🔑 Use the onCancel prop to close the modal
                            className="bg-[#0B3D91] hover:bg-[#001f45] text-white font-medium px-4 py-2 rounded-md flex items-center gap-2 shadow-md">
                            Add New User
                        </button>
                    }
                </div>

                {/* ✅ TABLE RESPONSIVE */}
                <div className="bg-white overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full text-xs md:text-sm text-gray-700 border border-gray-300 border-collapse">
                        <thead className="bg-[#0B3D91] text-white">
                            <tr>
                                <th className="px-2 md:px-4 py-2 md:py-3 border text-center">Nama</th>
                                <th className="px-2 md:px-4 py-2 border">Email</th>
                                <th className="px-2 md:px-4 py-2 border">Role</th>
                                <th className="px-2 md:px-4 py-2 border text-center">Edit</th>

                            </tr>
                        </thead>

                        <tbody>
                            {currentRows.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-gray-500 py-6 italic">
                                        Belum ada data user 📭
                                    </td>
                                </tr>
                            ) : (
                                currentRows.map((item: any) => (
                                    <tr key={item.id} className="border-t hover:bg-blue-50/50 transition">
                                        <td className="px-2 md:px-4 py-2 border font-semibold text-[#0B3D91]">
                                            {item.name}
                                        </td>
                                        <td className="px-2 md:px-4 py-2 border">{item.email}</td>
                                        <td className="px-2 md:px-4 py-2 border">{item.role || "-"}</td>
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
            </div>
            <ToastContainer position="top-right" autoClose={2000} />
        </AuthenticatedLayout>
    );
};

export default Create;