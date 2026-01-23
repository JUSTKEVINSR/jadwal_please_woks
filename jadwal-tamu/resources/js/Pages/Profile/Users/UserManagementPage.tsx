import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Create from './Create'; // Your form component
import { toast } from 'react-toastify';
import { FaPlus } from "react-icons/fa";

// Define the type for the data being submitted
interface UserDataPayload {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin' | 'ula' | 'kasubak' | 'pic';
}

const UserManagementPage = () => {

    const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility

    // --- 1. DEFINITION OF INERTIA SUBMISSION HANDLER ---
    const handleCreateUser = async (userData: UserDataPayload): Promise<void> => {
        return new Promise((resolve, reject) => {
            // Cast the specific payload type to a generic record type for Inertia
            router.post('/users_plus', userData as Record<string, any>, {
                onSuccess: () => {
                    toast.success('User created successfully!');
                    setIsModalOpen(false); // 🔑 Close the modal on success
                    resolve();
                },
                onError: (errors) => {
                    console.error('Inertia Errors:', errors);
                    const firstError = Object.values(errors)[0];
                    toast.error(`Error creating user: ${firstError || 'Please check form data.'}`);
                    reject(new Error(firstError as string));
                },
                preserveScroll: true,
            });
        });
    };
    // ---------------------------------------------------

    return (
        <div>
            {/* ... Your main layout and table ... */}

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#0B3D91]">User list</h3>

                {/* Button that opens the modal */}
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)} // Opens the modal
                    className="bg-[#0B3D91] hover:bg-[#001f45] text-white font-medium px-4 py-2 rounded-md flex items-center gap-2 shadow-md"
                >
                    <FaPlus /> Create User
                </button>
            </div>

            {/* 2. CONDITIONAL RENDERING OF THE CREATE FORM/MODAL */}
            {isModalOpen && (
                <Create
                    onSubmit={handleCreateUser} // Pass the API submission handler
                    onCancel={() => setIsModalOpen(false)} // Pass the function to close the modal manually
                />
            )}

            {/* ... rest of your component's content ... */}
        </div>
    );
};

export default UserManagementPage;