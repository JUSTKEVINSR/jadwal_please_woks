import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">

                    {/* ✅ Left Side - Form */}
                    <div className="w-full md:w-1/2 p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Sign In
                        </h2>

                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    autoComplete="username"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="password" value="Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    autoComplete="current-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="mt-4 flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                />
                                <span className="ms-2 text-sm text-gray-600">
                                    Remember me
                                </span>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                {canResetPassword && (
                                    <a
                                        href={route("password.request")}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Forgot your password?
                                    </a>
                                )}

                                <PrimaryButton
                                className="ms-4 bg-[#0B3D91] hover:bg-[#092e6f] focus:bg-[#092e6f] focus:ring-[#0B3D91]"
                                disabled={processing}
                                >
                                Log in
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

                    {/* ✅ Right Side - Blue Panel */}
                    <div className="hidden md:flex w-1/2 bg-[#0B3D91] text-white items-center justify-center relative">
                        <a
                            href="/"
                            className="absolute top-3 right-3 bg-white text-[#0B3D91] font-bold w-10 h-10 flex items-center justify-center rounded-full text-2xl"
                        >
                            ✕
                        </a>

                        <div className="text-center">
                            <img
                                src="/images/logo-kemendagri.png"
                                className="w-28 mx-auto mb-4"
                            />
                            <h2 className="text-2xl font-bold">Selamat Datang</h2>
                            <p className="text-sm mt-1 opacity-90">
                                Login hanya untuk staff
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
