"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import logo from "@/images/logo.png";
import {
  IoBriefcaseOutline,
  IoFolderOpenOutline,
  IoNotificationsOutline,
  IoChatbubbleOutline,
  IoPersonCircleOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoHomeOutline,
  IoBookmarkOutline,
  IoSearchOutline,
} from "react-icons/io5";

const navItems = [
  { href: "/dashboard", icon: IoHomeOutline, label: "Home" },
  { href: "/dashboard/profile", icon: IoPersonCircleOutline, label: "Profile" },
  { href: "/dashboard/jobs", icon: IoBriefcaseOutline, label: "Jobs" },
  { href: "/dashboard/saved-jobs", icon: IoBookmarkOutline, label: "Saved" },
  { href: "/dashboard/projects", icon: IoFolderOpenOutline, label: "Projects" },
  {
    href: "/dashboard/notifications",
    icon: IoNotificationsOutline,
    label: "Alerts",
  },
  { href: "/dashboard/messages", icon: IoChatbubbleOutline, label: "Messages" },
];

export default function DashNavbar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const isActive = (href) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname === href;

  const toggleSearch = () => {
    const next = !searchOpen;
    setSearchOpen(next);
    window.dispatchEvent(new CustomEvent("searchToggle", { detail: next }));
  };

  return (
    <>
      {settingsOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setSettingsOpen(false)}
        />
      )}

      <aside
        className="hidden md:flex fixed left-4 top-4 bottom-4 w-17 flex-col items-center py-5 z-40"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <Link
          href="/dashboard"
          className="mb-8 flex items-center justify-center"
        >
          <Image
            src={logo}
            alt="Jobs Abroad"
            width={38}
            height={38}
            className="object-contain"
          />
        </Link>

        <nav className="flex flex-col items-center gap-3 flex-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200"
              style={{
                backgroundColor: isActive(href) ? "#EFF6FF" : "transparent",
                color: isActive(href) ? "#60a5fa" : "#0f172a",
              }}
              onMouseEnter={(e) => {
                if (!isActive(href)) {
                  e.currentTarget.style.backgroundColor = "#EFF6FF";
                  e.currentTarget.style.color = "#60a5fa";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(href)) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#0f172a";
                }
              }}
            >
              <Icon size={23} />
              <span className="pointer-events-none absolute left-13 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                {label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="relative">
          <button
            onClick={() => setSettingsOpen((p) => !p)}
            className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200"
            style={{
              backgroundColor: settingsOpen ? "#EFF6FF" : "transparent",
              color: "#0f172a",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#EFF6FF";
              e.currentTarget.style.color = "#60a5fa";
            }}
            onMouseLeave={(e) => {
              if (!settingsOpen) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#0f172a";
              }
            }}
          >
            <IoSettingsOutline size={23} />
          </button>
          {settingsOpen && (
            <div
              className="absolute bottom-0 left-14 bg-white rounded-xl p-1.5 min-w-35 z-50"
              style={{
                boxShadow:
                  "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <IoLogOutOutline size={17} /> Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{
          height: "56px",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Link href="/dashboard">
          <Image
            src={logo}
            alt="Jobs Abroad"
            width={32}
            height={32}
            className="object-contain"
          />
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSearch}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{
              backgroundColor: searchOpen ? "#EFF6FF" : "transparent",
              color: searchOpen ? "#60a5fa" : "#0f172a",
            }}
          >
            <IoSearchOutline size={22} />
          </button>
          <Link
            href="/dashboard/notifications"
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{
              color: isActive("/dashboard/notifications")
                ? "#60a5fa"
                : "#0f172a",
            }}
          >
            <IoNotificationsOutline size={22} />
          </Link>
          <Link
            href="/dashboard/messages"
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{
              color: isActive("/dashboard/messages") ? "#60a5fa" : "#0f172a",
            }}
          >
            <IoChatbubbleOutline size={22} />
          </Link>
        </div>
      </div>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: "0 -1px 8px rgba(0,0,0,0.08)",
        }}
      >
        <div
          className="flex items-center justify-around px-2"
          style={{ height: "60px" }}
        >
          {[
            { href: "/dashboard", icon: IoHomeOutline, label: "Home" },
            {
              href: "/dashboard/profile",
              icon: IoPersonCircleOutline,
              label: "Profile",
            },
            {
              href: "/dashboard/jobs",
              icon: IoBriefcaseOutline,
              label: "Jobs",
            },
            {
              href: "/dashboard/saved-jobs",
              icon: IoBookmarkOutline,
              label: "Saved",
            },
            {
              href: "/dashboard/projects",
              icon: IoFolderOpenOutline,
              label: "Projects",
            },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all"
              style={{ color: isActive(href) ? "#60a5fa" : "#0f172a" }}
            >
              <Icon size={22} />
              <span className="text-xs font-semibold">{label}</span>
            </Link>
          ))}
        </div>
        <div className="flex justify-end px-4 pb-2">
          <Link
            href="/employer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: "#e61212" }}
          >
            <IoBriefcaseOutline size={13} /> Post a Job
          </Link>
        </div>
      </nav>
    </>
  );
}
