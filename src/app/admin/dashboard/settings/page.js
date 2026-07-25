"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AdminSidebar, {
  getStoredSidebarCollapsed,
  TOGGLE_EVENT,
} from "@/adminComponents/AdminSidebar";
import { User, Mail, Hash, ShieldCheck, LogOut } from "lucide-react";

const BRAND = "#003882";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [staffData, setStaffData] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setCollapsed(getStoredSidebarCollapsed());
    const handler = () => setCollapsed(getStoredSidebarCollapsed());
    window.addEventListener(TOGGLE_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_EVENT, handler);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/admin");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "admin_staff", user.uid));
        if (!snap.exists() || snap.data().status !== "active") {
          await signOut(auth);
          router.replace("/admin");
          return;
        }
        setStaffData(snap.data());
        setChecking(false);
      } catch (err) {
        console.error(err);
        router.replace("/admin");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut(auth);
    router.replace("/admin");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const infoRows = [
    { label: "Name", value: staffData?.name, icon: User },
    { label: "Email", value: staffData?.email, icon: Mail },
    { label: "Employee ID", value: staffData?.employee_id, icon: Hash },
    {
      label: "Role",
      value: staffData?.role?.replace("_", " "),
      icon: ShieldCheck,
      capitalize: true,
    },
  ];

  return (
    <>
      <AdminSidebar />
      <main
        className={`pt-14 md:pt-0 min-h-screen bg-[#e8eaed] transition-all duration-200 ${
          collapsed ? "md:ml-20" : "md:ml-60"
        }`}
      >
        <div className="px-4 sm:px-8 py-8 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-[#003882] tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              Manage your admin account.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900">Profile</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {infoRows.map(({ label, value, icon: Icon, capitalize }) => (
                <div key={label} className="px-5 py-4 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#eaf1fb" }}
                  >
                    <Icon size={15} style={{ color: BRAND }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {label}
                    </p>
                    <p
                      className={`text-sm font-bold text-slate-800 ${
                        capitalize ? "capitalize" : ""
                      }`}
                    >
                      {value || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-extrabold text-slate-900 mb-1">
              Session
            </h2>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Sign out of the admin panel on this device.
            </p>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <LogOut size={15} />
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
