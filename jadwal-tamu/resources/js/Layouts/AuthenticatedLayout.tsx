import { PropsWithChildren, ReactNode } from "react";
import { Link, usePage } from "@inertiajs/react";
import { User } from "@/types";
import Dropdown from "@/Components/Dropdown";
import {
  FaCalendarAlt,
  FaUsers,
  FaVideo,
  FaHome,
  FaUserCircle,
} from "react-icons/fa";

interface Props {
  header?: ReactNode;
}

export default function AuthenticatedLayout({
  header,
  children,
}: PropsWithChildren<Props>) {

  const { auth } = usePage().props as { auth: { user: User | null } };
  const url = usePage().url;

  const user = auth?.user;

  const menu = [
    { name: "Dashboard", href: "/dashboard", icon: <FaHome /> },
    { name: "Jadwal Rapat", href: "/jadwal-rapat", icon: <FaCalendarAlt /> },
    { name: "Daftar Tamu", href: "/daftar-tamu", icon: <FaUsers /> },
    { name: "Manajemen Video", href: "/manajemen-video", icon: <FaVideo /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#E9F3FF] text-gray-800">

      {/* ✅ SIDEBAR DESKTOP */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-[84px] bg-[#0B3D91] flex-col items-center py-6 space-y-6 shadow-xl rounded-r-3xl z-30 overflow-visible">

        {/* Tombol home */}
        <Link
          href="/"
          className="w-10 h-10 bg-[#B0DAFF] rounded-2xl flex items-center justify-center text-[#0B3D91] font-bold text-xl hover:bg-white transition"
          title="Home"
        >
          I
        </Link>

        {/* ✅ MENU WITH TOOLTIP DISCORD STYLE */}
        <div className="flex flex-col gap-6 text-white mt-6">
          {menu.map((item) => {
            const isActive = url.startsWith(item.href);
            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition
                    ${
                      isActive
                        ? "bg-white text-[#0B3D91]"
                        : "hover:bg-[#B0DAFF] hover:text-[#0B3D91]"
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                </Link>

                {/* ✅ Tooltip ala Discord (slide + fade + triangle) */}
                <span
                  className="
                    absolute left-[60px] top-1/2 -translate-y-1/2
                    bg-white text-[#0B3D91] font-semibold text-[11px]
                    py-1.5 px-3 rounded-xl shadow-lg whitespace-nowrap
                    opacity-0 translate-x-[-10px] scale-95
                    group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0
                    transition-all duration-200 ease-out

                    before:content-[''] before:absolute before:-left-[6px] before:top-1/2 before:-translate-y-1/2
                    before:w-2 before:h-2 before:bg-white before:rotate-45
                    before:shadow-md
                  "
                >
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ✅ MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-[84px]">

        {/* Navbar */}
        <nav className="bg-white shadow-sm h-12 flex items-center justify-end px-6 border-b sticky top-0 z-20">
          <Dropdown>
            <Dropdown.Trigger>
              <button className="flex items-center text-blue-700 hover:text-gray-900 font-semibold">
                {user?.profile_photo_url ? (
                  <img src={user.profile_photo_url} className="h-8 w-8 rounded-full mr-2" />
                ) : (
                  <FaUserCircle className="h-7 w-7 mr-2 text-blue-800" />
                )}
                {user?.name ?? "Guest"}
              </button>
            </Dropdown.Trigger>

            <Dropdown.Content>
              <Dropdown.Link href={route("profile.edit")}>Profile</Dropdown.Link>
              <Dropdown.Link href={route("logout")} method="post" as="button">
                Log Out
              </Dropdown.Link>
            </Dropdown.Content>
          </Dropdown>
        </nav>

        {/* Header */}
        {header && (
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto py-4 px-6">{header}</div>
          </header>
        )}

        {/* Content area */}
        <main
          className="
            p-6
            w-full 
            max-w-[480px] mx-auto
            sm:max-w-none sm:mx-0
          "
        >
          {children}
        </main>
      </div>

      {/* ✅ BOTTOM NAV FOR MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B3D91] text-white flex justify-around py-3 rounded-t-2xl shadow-lg z-50">
        {menu.map((item) => {
          const isActive = url.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center text-[10px] ${
                isActive ? "text-[#B0DAFF]" : "opacity-70"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
