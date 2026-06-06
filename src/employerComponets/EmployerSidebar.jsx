"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import LogoEmp from "@/images/logoemp.png";
import {
  PlusCircle,
  Briefcase,
  Users,
  BookmarkCheck,
  MessageSquare,
  LogOut,
  X,
  Menu,
  User,
  Pencil,
  Check,
  Building2,
} from "lucide-react";

const navItems = [
  { href: "/employer/dashboard", icon: Briefcase, label: "Posted Jobs" },
  {
    href: "/employer/dashboard/create-job",
    icon: PlusCircle,
    label: "Create New Job",
  },
  { href: "/employer/dashboard/applicants", icon: Users, label: "Applicants" },
  {
    href: "/employer/dashboard/shortlisted",
    icon: BookmarkCheck,
    label: "Shortlisted",
  },
  {
    href: "/employer/dashboard/messages",
    icon: MessageSquare,
    label: "Messages",
  },
];

export default function EmployerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [employerData, setEmployerData] = useState(null);
  const [editingCompany, setEditingCompany] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setEmployerData(null);
        setNewCompany("");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "employers", user.uid));
        if (snap.exists()) {
          setEmployerData(snap.data());
          setNewCompany(snap.data().company || "");
        }
      } catch (err) {
        console.error("Error fetching employer data:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveCompany = async () => {
    if (!newCompany.trim()) return;
    setSaving(true);
    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, "employers", user.uid), {
        company: newCompany.trim(),
      });
      setEmployerData((prev) => ({ ...prev, company: newCompany.trim() }));
      setEditingCompany(false);
    } catch (err) {
      console.error("Error updating company:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
  sessionStorage.setItem("empLoggedOut", "true");
  router.replace("/employer/onboarding?mode=switch");
};

  const handleProfileClick = () => {
    const user = auth.currentUser;
    if (!user) router.push("/employer/onboarding");
  };

  const isActive = (href) =>
    href === "/employer/dashboard"
      ? pathname === "/employer/dashboard"
      : pathname.startsWith(href);

  const ProfileCard = () => (
    <div className="px-4 py-4 border-b border-slate-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
          <User size={16} strokeWidth={2.5} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {employerData
              ? `${employerData.firstName} ${employerData.lastName}`
              : "Loading..."}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {employerData?.email || ""}
          </p>
        </div>
      </div>
      <div className="bg-slate-50 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <Building2 size={13} className="text-slate-400 shrink-0" />
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            Company
          </span>
        </div>
        {editingCompany ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveCompany()}
              className="flex-1 text-sm font-semibold text-slate-900 bg-white border border-blue-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-200"
              autoFocus
            />
            <button
              onClick={handleSaveCompany}
              disabled={saving}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors shrink-0"
            >
              <Check size={13} />
            </button>
            <button
              onClick={() => {
                setEditingCompany(false);
                setNewCompany(employerData?.company || "");
              }}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-900 truncate">
              {employerData?.company || "—"}
            </span>
            <button
              onClick={() => setEditingCompany(true)}
              className="flex items-center justify-center w-6 h-6 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors shrink-0"
            >
              <Pencil size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-white border-r border-slate-100 z-40">
        <div className="flex items-center px-6 h-14 border-b border-slate-100 shrink-0">
          <a href="/employer">
            <img src={LogoEmp.src} alt="Logo" className="h-9 w-auto block" />
          </a>
        </div>
        <ProfileCard />
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 no-underline
                ${isActive(href) ? "bg-blue-50 text-blue-500" : "text-slate-800 hover:bg-slate-50 hover:text-slate:900"}`}
            >
              <Icon size={18} className="shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 pb-5 pt-3 border-t border-slate-100 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 bg-white border-b border-slate-100">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors mr-3"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <a href="/employer">
          <img src={LogoEmp.src} alt="Logo" className="h-8 w-auto block" />
        </a>
        <div className="flex-1" />
        <button
          onClick={handleProfileClick}
          aria-label="Profile"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white hover:scale-105 transition-transform"
        >
          <User size={15} strokeWidth={2.5} />
        </button>
      </div>

      <div
        className={`md:hidden fixed inset-0 z-60 bg-black/50 transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-70 w-72 flex flex-col bg-white border-r border-slate-100
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-slate-100 shrink-0">
          <a href="/employer">
            <img src={LogoEmp.src} alt="Logo" className="h-8 w-auto block" />
          </a>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <ProfileCard />
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 no-underline
                ${isActive(href) ? "bg-blue-50 text-blue-500" : "text-slate-800 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <Icon size={18} className="shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 pb-6 pt-3 border-t border-slate-100 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
