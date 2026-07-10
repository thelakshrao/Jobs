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

const SIDEBAR_BG = "#003882";
const BRAND = "#003882";

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
    href: "/employer/dashboard/empmessages",
    icon: MessageSquare,
    label: "Messages",
  },
  {
    href: "/employer/dashboard/projects",
    icon: Briefcase,
    label: "All Projects",
  },
  {
    href: "/employer/dashboard/create-project",
    icon: PlusCircle,
    label: "Add New Project",
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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
      : pathname === href ||
        pathname.startsWith(href + "/") ||
        pathname.startsWith(href + "?");

  const ProfileCard = () => (
    <div className="px-4 py-4 border-b border-white/25">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
          <User size={16} strokeWidth={2.5} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {employerData
              ? `${employerData.firstName} ${employerData.lastName}`
              : "Loading..."}
          </p>
          <p className="text-xs text-white/40 truncate">
            {employerData?.email || ""}
          </p>
        </div>
      </div>
      <div className="bg-white/8 rounded-xl px-3 py-2.5 border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Building2 size={13} className="text-white/40 shrink-0" />
          <span className="text-[11px] font-medium text-white/40 uppercase tracking-wide">
            Company
          </span>
        </div>
        {editingCompany ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveCompany()}
              className="flex-1 text-sm font-semibold text-white bg-white/10 border border-white/30 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-white/20 placeholder:text-white/30"
              autoFocus
            />
            <button
              onClick={handleSaveCompany}
              disabled={saving}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors shrink-0"
            >
              <Check size={13} />
            </button>
            <button
              onClick={() => {
                setEditingCompany(false);
                setNewCompany(employerData?.company || "");
              }}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-colors shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white truncate">
              {employerData?.company || "—"}
            </span>
            <button
              onClick={() => setEditingCompany(true)}
              className="flex items-center justify-center w-6 h-6 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
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
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col z-40 border-r border-white/10"
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        <div className="flex items-center px-6 h-14 shrink-0 border-b border-white/25">
          <a href="/employer">
            <img
              src={LogoEmp.src}
              alt="Logo"
              className="h-9 w-auto block brightness-0 invert"
            />
          </a>
        </div>

        <ProfileCard />

        <nav className="flex flex-col gap-2 px-3 py-4 flex-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 no-underline"
                style={{
                  backgroundColor: active
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
                  color: "#ffffff",
                  border: active
                    ? "2px solid #ffffff"
                    : "2px solid transparent",
                }}
              >
                <Icon size={18} className="shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-5 pt-3 shrink-0 border-t border-white/25">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 border-b border-white/25"
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-colors mr-3"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <a href="/employer">
          <img
            src={LogoEmp.src}
            alt="Logo"
            className="h-8 w-auto block brightness-0 invert"
          />
        </a>
        <div className="flex-1" />
        <button
          onClick={handleProfileClick}
          aria-label="Profile"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:scale-105 transition-transform"
          style={{ backgroundColor: BRAND, color: "#ffffff" }}
        >
          <User size={15} strokeWidth={2.5} />
        </button>
      </div>

      <div
        className={`md:hidden fixed inset-0 z-60 bg-black/60 transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-70 w-72 flex flex-col border-r border-white/10
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        <div className="flex items-center justify-between px-5 h-14 shrink-0 border-b border-white/25">
          <a href="/employer">
            <img
              src={LogoEmp.src}
              alt="Logo"
              className="h-8 w-auto block brightness-0 invert"
            />
          </a>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <ProfileCard />

        <nav className="flex flex-col gap-2 px-3 py-4 flex-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 no-underline"
                style={{
                  backgroundColor: active
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
                  color: "#ffffff",
                  border: active
                    ? "2px solid #ffffff"
                    : "2px solid transparent",
                }}
              >
                <Icon size={18} className="shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 pt-3 shrink-0 border-t border-white/25">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
