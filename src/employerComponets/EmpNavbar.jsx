"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import LogoEmp from "@/images/logoemp.png";
import { Bell, User } from "lucide-react";

function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleProfileClick = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const empDoc = await getDoc(doc(db, "employers", user.uid));
      router.push(
        empDoc.exists() ? "/employer/dashboard" : "/employer/onboarding",
      );
    } catch (error) {
      console.error("Firestore error:", error.message);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-15 flex items-center px-7 bg-black/70 backdrop-blur-md border-b border-white/10">
        <a href="/employer" className="flex items-center shrink-0">
          <img src={LogoEmp.src} alt="Logo" className="h-10 w-auto block" />
        </a>

        <div className="flex-1" />

        <ul className="hidden md:flex items-center gap-5 list-none">
          <li>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13.5px] font-semibold bg-white text-black hover:bg-white/90 transition-all duration-150"
            >
              + Post a Job
            </a>
          </li>
          <li>
            <a
              href="/employer/dashboard"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13.5px] font-medium text-white hover:bg-white/10 transition-all duration-150"
            >
              Dashboard
            </a>
          </li>
          <li>
            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13.5px] font-medium text-white bg-transparent border-none cursor-pointer hover:bg-white/10 transition-all duration-150">
              Help? <ChevronIcon />
            </button>
          </li>
        </ul>

        <div className="hidden md:block w-px h-5 mx-5 shrink-0 bg-white/20" />

        <button
          aria-label="Notifications"
          className="hidden md:inline-flex relative items-center justify-center w-9 h-9 rounded-full border-none bg-transparent cursor-pointer mr-3 text-white hover:bg-white/10 transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-[1.5px] border-black" />
        </button>

        <button
          title="Profile"
          onClick={handleProfileClick}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white text-black cursor-pointer shrink-0 hover:scale-105 transition-all"
        >
          <User size={16} strokeWidth={2.5} />
        </button>

        <button
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-transparent border-none cursor-pointer text-white hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col bg-black/90 backdrop-blur-md border-r border-white/10 transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 h-15 border-b border-white/10 shrink-0">
          <a href="/employer" className="flex items-center">
            <img src={LogoEmp.src} alt="Logo" className="h-9 w-auto block" />
          </a>
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white hover:bg-white/10 bg-transparent border-none cursor-pointer transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          <a
            href="/employer/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium text-white no-underline hover:bg-white/10 transition-colors"
          >
            Dashboard
          </a>
          <button className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium text-white bg-transparent border-none cursor-pointer hover:bg-white/10 transition-colors">
            Help? <ChevronIcon />
          </button>
        </nav>

        <div className="px-4 pb-6 pt-3 border-t border-white/10 shrink-0 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-full text-white border border-white/20 bg-transparent cursor-pointer hover:bg-white/10 transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-[1.5px] border-black" />
            </button>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleProfileClick();
              }}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-black cursor-pointer hover:scale-105 transition-transform"
            >
              <User size={16} strokeWidth={2.5} />
            </button>
            <span className="text-sm font-medium text-white/70 ml-1">
              My Account
            </span>
          </div>
          <a
            href="#"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center px-3 py-3 rounded-full bg-white text-black text-sm font-semibold no-underline hover:bg-white/90 transition-colors"
          >
            + Post a Job
          </a>
        </div>
      </div>
    </>
  );
}
