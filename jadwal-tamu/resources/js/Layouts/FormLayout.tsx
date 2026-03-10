import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (

        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div className="flex min-h-screen flex-col items-center bg-[#B0DAFF] p-7 rounded-2xl shadow-md border border-[#7FB8E5]">
                <div>
                    <Link href="/">

                        <img
                            src="/images/Logo Itjen Hebat-01.png"
                            alt="Logo"
                            className="h-20 w-20 object-contain drop-shadow-lg"
                        />

                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />

                    </Link>
                </div>

                <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}
