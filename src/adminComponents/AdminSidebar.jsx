"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import logoFull from "@/images/logo3.png";
import logoIcon from "@/images/logo.png";
import { canAdd } from "@/lib/adminRoles";
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
  ShieldCheck,
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
    requiresManage: false,
  },
  {
    href: "/admin/dashboard/jobs",
    icon: Briefcase,
    label: "Jobs",
    requiresManage: false,
  },
  {
    href: "/admin/dashboard/adminjobs",
    icon: ShieldCheck,
    label: "Admin Jobs",
    requiresManage: false,
  },
  {
    href: "/admin/dashboard/employers",
    icon: Building2,
    label: "Employers",
    requiresManage: false,
  },
  {
    href: "/admin/dashboard/applicants",
    icon: Users,
    label: "Applicants",
    requiresManage: false,
  },
  {
    href: "/admin/dashboard/admincreatejob",
    icon: Users,
    label: "Create Job",
    requiresManage: false,
  },
  {
    href: "/admin/dashboard/reports",
    icon: BarChart3,
    label: "Reports",
    requiresManage: false,
  },
  {
    href: "/admin/dashboard/staff",
    icon: UserCog,
    label: "Manage Staff",
    requiresManage: true,
  },
  {
    href: "/admin/dashboard/settings",
    icon: Settings,
    label: "Settings",
    requiresManage: false,
  },
];

export function getStoredSidebarCollapsed() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function initials(name) {
  if (!name) return "A";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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

  const canSee = (requiresManage) => {
    if (!requiresManage) return true;
    if (!staffData) return false;
    return canAdd(staffData.roles);
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
          width={40}
          height={40}
          className="rounded-lg shrink-0 object-contain"
          priority
        />
      ) : (
        <Image
          src={logoFull}
          alt="the Jobs Abroad"
          width={160}
          height={40}
          className="object-contain h-10 w-auto"
          priority
        />
      )}
    </div>
  );

  const NavList = ({ onClick }) => (
    <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1 overflow-y-auto">
      {navItems
        .filter((item) => canSee(item.requiresManage))
        .map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClick}
              title={collapsed ? label : undefined}
              className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors no-underline ${
                collapsed ? "justify-center" : ""
              } ${active ? "" : "hover:bg-slate-50"}`}
              style={{
                backgroundColor: active ? ACTIVE_BG : "transparent",
                color: active ? BRAND : "#64748b",
              }}
            >
              {active && !collapsed && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full"
                  style={{ backgroundColor: BRAND }}
                />
              )}
              <Icon
                size={18}
                className="shrink-0"
                strokeWidth={active ? 2.4 : 2}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
    </nav>
  );

  const ProfileBlock = () => {
    if (!staffData) return null;
    return (
      <div
        className={`flex items-center gap-2.5 px-2 py-2 rounded-xl bg-slate-50 ${
          collapsed ? "justify-center px-0" : ""
        }`}
        title={collapsed ? staffData.name : undefined}
      >
        <div
          className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ backgroundColor: BRAND }}
        >
          {initials(staffData.name)}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate">
              {staffData.name || "Admin"}
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {Array.isArray(staffData.roles)
                ? staffData.roles.join(", ")
                : "Admin"}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside
        className={`hidden md:flex fixed left-0 top-0 bottom-0 flex-col z-40 bg-white border-r border-slate-200 transition-all duration-200 ${
          collapsed ? "w-20" : "w-60"
        }`}
      >
        <div
          className={`flex items-center h-14 shrink-0 border-b border-slate-100 ${
            collapsed ? "justify-center px-2" : "px-4"
          }`}
        >
          <LogoMark />
        </div>
        <NavList />
        <div className="px-3 pb-3 shrink-0">
          <ProfileBlock />
        </div>
        <div className="px-3 pb-4 pt-2 shrink-0 border-t border-slate-100">
          <button
            onClick={toggleCollapse}
            className={`flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-white border-b border-slate-200">
        <div className="flex items-center">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-9 h-9 -ml-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors mr-3 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <LogoMark />
        </div>
        {staffData && (
          <div
            className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{ backgroundColor: BRAND }}
          >
            {initials(staffData.name)}
          </div>
        )}
      </div>

      <div
        className={`md:hidden fixed inset-0 z-60 bg-black/40 transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-70 w-72 max-w-[85vw] flex flex-col bg-white border-r border-slate-200
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-slate-100">
          <LogoMark />
          <button
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <NavList onClick={() => setMobileOpen(false)} />
        <div className="px-3 pb-4 shrink-0 border-t border-slate-100 pt-3">
          <ProfileBlock />
        </div>
      </div>
    </>
  );
}
