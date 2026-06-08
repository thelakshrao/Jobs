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

export default function EmpNavbar() {
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
      router.push("/employer/onboarding");
      return;
    }
    const empLoggedOut = sessionStorage.getItem("empLoggedOut");
    if (empLoggedOut === "true") {
      router.push("/employer/onboarding?mode=switch");
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

  const handleDashboardClick = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/employer/onboarding");
      return;
    }
    const empLoggedOut = sessionStorage.getItem("empLoggedOut");
    if (empLoggedOut === "true") {
      router.push("/employer/onboarding?mode=switch");
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
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-15 pt-4 pb-0 pointer-events-none">
        <div className="pointer-events-auto">
          <a href="/employer" className="flex items-center">
            <img
              src={LogoEmp.src}
              alt="Logo"
              className="h-8 w-auto block invert"
            />
          </a>
        </div>

        <nav className="pointer-events-auto hidden md:flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.10)] border border-black/6">
          <a
            href="/employer"
            className="px-4 py-1.5 rounded-lg text-[13.5px] font-semibold text-white bg-[#1a1a1a] no-underline"
          >
            Home
          </a>
          <a
            href="/employer/dashboard/create-job"
            className="px-4 py-1.5 rounded-lg text-[13.5px] font-medium text-[#1a1a1a] hover:bg-black/6 transition-colors no-underline"
          >
            Post a Job
          </a>
          <button
            onClick={handleDashboardClick}
            className="px-4 py-1.5 rounded-lg text-[13.5px] font-medium text-[#1a1a1a] hover:bg-black/6 transition-colors bg-transparent border-none cursor-pointer"
          >
            Dashboard
          </button>
          <button className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-[13.5px] font-medium text-[#1a1a1a] hover:bg-black/6 transition-colors bg-transparent border-none cursor-pointer">
            Help? 
          </button>
        </nav>

        <div className="pointer-events-auto hidden md:flex items-center gap-2">
          <button
            aria-label="Notifications"
            className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-black/6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] cursor-pointer text-[#444] hover:bg-white transition-colors"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-[1.5px] border-white" />
          </button>
          <button
            title="Profile"
            onClick={handleProfileClick}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-black/6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-[#444] cursor-pointer hover:bg-white hover:scale-105 transition-all"
          >
            <User size={15} strokeWidth={2.5} />
          </button>
        </div>

        <button
          className="pointer-events-auto md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-black/6 shadow-sm cursor-pointer text-[#1a1a1a] hover:bg-white transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-[60vw] max-w-xs flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-black/[0.07] shrink-0">
          <a href="/employer" className="flex items-center">
            <img
              src={LogoEmp.src}
              alt="Logo"
              className="h-7 w-auto block invert"
            />
          </a>
          <button
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#1a1a1a] hover:bg-black/6 bg-transparent border-none cursor-pointer transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-col px-3 py-5 flex-1 overflow-y-auto gap-0.5">
          <a
            href="/employer"
            className="flex items-center px-4 py-3.5 rounded-xl text-[15px] font-semibold text-white bg-[#1a1a1a] no-underline"
          >
            Home
          </a>
          <a
           href="/employer/dashboard/create-job"
            onClick={() => setMobileOpen(false)}
            className="flex items-center px-4 py-3.5 rounded-xl text-[15px] font-medium text-[#1a1a1a] hover:bg-black/5 transition-colors no-underline"
          >
            Post a Job
          </a>
          <button
            onClick={() => {
              setMobileOpen(false);
              handleDashboardClick();
            }}
            className="flex items-center px-4 py-3.5 rounded-xl text-[15px] font-medium text-[#1a1a1a] hover:bg-black/5 transition-colors bg-transparent border-none cursor-pointer text-left w-full"
          >
            Dashboard
          </button>
          <button className="flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-medium text-[#1a1a1a] hover:bg-black/5 transition-colors bg-transparent border-none cursor-pointer w-full text-left">
            Help? 
          </button>
        </nav>

        <div className="px-4 pb-8 pt-4 border-t border-black/[0.07] shrink-0 flex flex-col gap-3">
          <div className="flex items-center gap-3 mb-1">
            <button
              aria-label="Notifications"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full text-[#444] border border-black/10 bg-transparent cursor-pointer hover:bg-black/5 transition-colors"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-[1.5px] border-white" />
            </button>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleProfileClick();
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a] text-white cursor-pointer hover:scale-105 transition-transform border-none"
            >
              <User size={16} strokeWidth={2.5} />
            </button>
            <span className="text-[14px] font-medium text-[#555]">
              My Account
            </span>
          </div>
          <a
            href="/employer/dashboard/create-job"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center px-3 py-3.5 rounded-xl bg-[#1a1a1a] text-white text-[14px] font-semibold no-underline hover:bg-[#333] transition-colors"
          >
            + Post a Job
          </a>
        </div>
      </div>
    </>
  );
}
