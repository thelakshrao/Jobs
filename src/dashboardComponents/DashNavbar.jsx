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
} from "react-icons/io5";

const navItems = [
  { href: "/dashboard", icon: IoHomeOutline, label: "Home" },
  { href: "/dashboard/profile", icon: IoPersonCircleOutline, label: "Profile" },
  { href: "/dashboard/jobs", icon: IoBriefcaseOutline, label: "Jobs" },
  { href: "/dashboard/saved-jobs", icon: IoBookmarkOutline, label: "Saved Jobs" },
  { href: "/dashboard/projects", icon: IoFolderOpenOutline, label: "Projects" },
  {
    href: "/dashboard/notifications",
    icon: IoNotificationsOutline,
    label: "Notifications",
  },
  { href: "/dashboard/messages", icon: IoChatbubbleOutline, label: "Messages" },
];

export default function DashNavbar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
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
        className="fixed left-4 top-4 bottom-4 w-17 flex flex-col items-center py-5 z-40"
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
          {navItems.map(({ href, icon: Icon, label }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="group relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200"
                style={{
                  backgroundColor: active ? "#EFF6FF" : "transparent",
                  color: active ? "#60a5fa" : "#0f172a",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "#EFF6FF";
                    e.currentTarget.style.color = "#60a5fa";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
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
            );
          })}
        </nav>

        <div className="relative">
          <button
            onClick={() => setSettingsOpen((prev) => !prev)}
            className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200"
            style={{
              backgroundColor: settingsOpen ? "#EFF6FF" : "transparent",
              color: settingsOpen ? "##60a5fa" : "#0f172a",
            }}
            onMouseEnter={(e) => {
              if (!settingsOpen) {
                e.currentTarget.style.backgroundColor = "#EFF6FF";
                e.currentTarget.style.color = "#60a5fa";
              }
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
                <IoLogOutOutline size={17} />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}