"use client";

import { useRouter } from "next/navigation";
import { Bell, MessageSquare, HelpCircle, User } from "lucide-react";
import { auth } from "@/lib/firebase";
import LogoEmp from "@/images/logoemp.png";

export default function DashboardNavbar() {
  const router = useRouter();

  const handleProfileClick = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/employer/login");
      return;
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 bg-white border-b border-slate-100">
        <a href="/employer" className="flex items-center shrink-0">
          <img src={LogoEmp.src} alt="Logo" className="h-10 w-auto block" />
        </a>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Bell size={16} />
            <span>Notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
          </button>

          <button
            aria-label="Messages"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MessageSquare size={16} />
            <span>Messages</span>
          </button>

          <button
            aria-label="Help"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <HelpCircle size={16} />
            <span>Help</span>
          </button>

          <div className="w-px h-5 bg-slate-200" />

          <button
            onClick={handleProfileClick}
            aria-label="Profile"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white hover:scale-105 transition-transform"
          >
            <User size={15} strokeWidth={2.5} />
          </button>
        </div>

        <button
          onClick={handleProfileClick}
          aria-label="Profile"
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white hover:scale-105 transition-transform"
        >
          <User size={15} strokeWidth={2.5} />
        </button>
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-around bg-white border-t border-slate-100">
        <button
          aria-label="Notifications"
          className="relative flex flex-col items-center gap-0.5 px-4 py-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Bell size={20} />
          <span className="text-[10px] font-medium">Notifications</span>
          <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>

        <button
          aria-label="Messages"
          className="flex flex-col items-center gap-0.5 px-4 py-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-medium">Messages</span>
        </button>

        <button
          aria-label="Help"
          className="flex flex-col items-center gap-0.5 px-4 py-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <HelpCircle size={20} />
          <span className="text-[10px] font-medium">Help</span>
        </button>
      </div>
    </>
  );
}