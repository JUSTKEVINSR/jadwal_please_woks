import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (

        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div className="flex min-h-screen flex-col items-center bg-[#B0DAFF] p-7 rounded-2xl shadow-md border border-[#7FB8E5]">
                <div>
                    <Link href="/">

                        <div className="tenor-gif-embed" data-postid="11906233869012621764" data-share-method="host" data-aspect-ratio="0.903614" data-width="100%"><a href="https://tenor.com/view/owowowo-round-cute-gif-11906233869012621764">Owowowo Round Sticker</a>from <a href="https://tenor.com/search/owowowo-stickers">Owowowo Stickers</a>
                        </div> <script type="text/javascript" async src="https://tenor.com/embed.js"></script>

                        <img
                            src="/images/Logo Itjen Hebat-01.png"
                            alt="Logo"
                            className="h-20 w-20 object-contain drop-shadow-lg"
                        />


                    </Link>
                </div>

                <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}
