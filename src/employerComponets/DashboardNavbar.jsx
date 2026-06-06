"use client";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, HelpCircle, User } from "lucide-react";
import { auth } from "@/lib/firebase";
const BORDER = "1.5px solid #cbd5e1";
export default function DashboardNavbar() {
  const router = useRouter();
  const handleProfileClick = () => {
    const user = auth.currentUser;
    if (!user) router.push("/employer/login");
  };
  return (
    <>
      <nav
        className="hidden md:flex fixed top-0 left-64 right-0 z-40 h-14 items-center px-6 bg-white"
        style={{ borderBottom: BORDER }}
      >
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Bell size={16} />
            <span>Notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
          </button>
          <button
            aria-label="Messages"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <MessageSquare size={16} />
            <span>Messages</span>
          </button>
          <button
            aria-label="Help"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <HelpCircle size={16} />
            <span>Help</span>
          </button>
          <div className="w-px h-5 bg-slate-300" />
          <button
            onClick={handleProfileClick}
            aria-label="Profile"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white hover:scale-105 transition-transform"
          >
            <User size={15} strokeWidth={2.5} />
          </button>
        </div>
      </nav>
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center bg-white"
        style={{ borderTop: BORDER }}
      >
        <button
          aria-label="Notifications"
          className="relative flex flex-col items-center gap-0.5 py-2 text-slate-700 hover:text-slate-900 transition-colors flex-1"
        >
          <Bell size={20} />
          <span className="text-[10px] font-semibold">Notifications</span>
          <span className="absolute top-1 right-6 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>
        <button
          aria-label="Messages"
          className="flex flex-col items-center gap-0.5 py-2 text-slate-700 hover:text-slate-900 transition-colors flex-1"
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-semibold">Messages</span>
        </button>
        <button
          aria-label="Help"
          className="flex flex-col items-center gap-0.5 py-2 text-slate-700 hover:text-slate-900 transition-colors flex-1"
        >
          <HelpCircle size={20} />
          <span className="text-[10px] font-semibold">Help</span>
        </button>
      </div>
    </>
  );
}