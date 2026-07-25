"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import logoFull from "@/images/logo3.png";
import logoIcon from "@/images/logo.png";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  BarChart3,
  Settings,
  UserCog,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const BRAND = "#003882";
const ACTIVE_BG = "#eaf1fb";
const STORAGE_KEY = "adminSidebarCollapsed";
export const TOGGLE_EVENT = "admin-sidebar-toggle";

const navItems = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    permission: null,
  },
  {
    href: "/admin/dashboard/jobs",
    icon: Briefcase,
    label: "Jobs",
    permission: "view_jobs",
  },
  {
    href: "/admin/dashboard/employers",
    icon: Building2,
    label: "Employers",
    permission: "manage_employers",
  },
  {
    href: "/admin/dashboard/applicants",
    icon: Users,
    label: "Applicants",
    permission: "view_applicants",
  },
  {
    href: "/admin/dashboard/reports",
    icon: BarChart3,
    label: "Reports",
    permission: "view_reports",
  },
  {
    href: "/admin/dashboard/staff",
    icon: UserCog,
    label: "Manage Staff",
    permission: "manage_staff",
  },
  {
    href: "/admin/dashboard/settings",
    icon: Settings,
    label: "Settings",
    permission: null,
  },
];

export function getStoredSidebarCollapsed() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [staffData, setStaffData] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(getStoredSidebarCollapsed());
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setStaffData(null);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "admin_staff", user.uid));
        if (snap.exists()) setStaffData(snap.data());
      } catch (err) {
        console.error("Error fetching admin staff data:", err);
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

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    window.dispatchEvent(new Event(TOGGLE_EVENT));
  };

  const canSee = (permission) => {
    if (!permission) return true;
    if (!staffData) return false;
    if (staffData.role === "super_admin") return true;
    return (staffData.permissions || []).includes(permission);
  };

  const isActive = (href) =>
    href === "/admin/dashboard"
      ? pathname === "/admin/dashboard"
      : pathname === href || pathname.startsWith(href + "/");

  const LogoMark = () => (
    <div className="flex items-center">
      {collapsed ? (
        <Image
          src={logoIcon}
          alt="Jobs Abroad"
          width={28}
          height={28}
          className="rounded-lg shrink-0 object-contain"
          priority
        />
      ) : (
        <Image
          src={logoFull}
          alt="the Jobs Abroad"
          width={120}
          height={28}
          className="object-contain h-7 w-auto"
          priority
        />
      )}
    </div>
  );

  const NavList = ({ onClick }) => (
    <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
      {navItems
        .filter((item) => canSee(item.permission))
        .map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClick}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors no-underline ${
                collapsed ? "justify-center" : ""
              }`}
              style={{
                backgroundColor: active ? ACTIVE_BG : "transparent",
                color: active ? BRAND : "#64748b",
              }}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
    </nav>
  );

  return (
    <>
      <aside
        className={`hidden md:flex fixed left-0 top-0 bottom-0 flex-col z-40 bg-white border-r border-slate-200 transition-all duration-200 ${
          collapsed ? "w-20" : "w-60"
        }`}
      >
        <div className="flex items-center px-4 h-14 shrink-0 border-b border-slate-100">
          <LogoMark />
        </div>

        <NavList />

        <div className="px-3 pb-4 pt-3 shrink-0 border-t border-slate-100">
          <button
            onClick={toggleCollapse}
            className={`flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 bg-white border-b border-slate-200">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors mr-3"
        >
          <Menu size={22} />
        </button>
        <LogoMark />
      </div>

      <div
        className={`md:hidden fixed inset-0 z-60 bg-black/40 transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-70 w-64 flex flex-col bg-white border-r border-slate-200
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-slate-100">
          <LogoMark />
          <button
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <NavList onClick={() => setMobileOpen(false)} />
      </div>
    </>
  );
}
