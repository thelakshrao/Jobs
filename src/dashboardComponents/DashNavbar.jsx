"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
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
  IoSearchOutline,
  IoMailOutline,
} from "react-icons/io5";
const navItems = [
  { href: "/dashboard", icon: IoHomeOutline, label: "Home" },
  { href: "/dashboard/profile", icon: IoPersonCircleOutline, label: "Profile" },
  { href: "/dashboard/jobs", icon: IoBriefcaseOutline, label: "Jobs" },
  {
    href: "/dashboard/saved-jobs",
    icon: IoBookmarkOutline,
    label: "Saved / Applied",
  },
  { href: "/dashboard/projects", icon: IoFolderOpenOutline, label: "Projects" },
  {
    href: "/dashboard/notifications",
    icon: IoNotificationsOutline,
    label: "Alerts",
  },
  { href: "/dashboard/messages", icon: IoChatbubbleOutline, label: "Messages" },
];
function timeAgo(ts) {
  if (!ts) return "";
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
function AlertsPanel({ notifications, onClose, onNotifClick }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="absolute left-18 top-0 w-75 bg-white rounded-2xl shadow-2xl border border-gray-100 z-9999 overflow-hidden"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.13)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-[14px] font-bold text-gray-900">Alerts</span>
        {notifications.length > 0 && (
          <span className="text-[11px] text-gray-400 font-medium">
            {notifications.length} unread
          </span>
        )}
      </div>
      <div className="max-h-100 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <IoNotificationsOutline size={28} className="text-gray-200" />
            <p className="text-[12px] text-gray-400">No new alerts</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.convId}
              onClick={() => {
                onNotifClick(n.convId);
                onClose();
              }}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#EAF1FC] border-none bg-transparent cursor-pointer text-left border-b border-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#D6E3F7] flex items-center justify-center shrink-0 mt-0.5">
                <IoMailOutline size={15} className="text-[#004AAC]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">
                  {n.senderName || "Employer"}
                  {n.company ? (
                    <span className="text-[11px] font-normal text-emerald-600 ml-1">
                      · {n.company}
                    </span>
                  ) : null}
                </p>
                <p className="text-[12px] text-gray-500 truncate mt-0.5">
                  {n.lastMessage || "Sent you a message"}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {timeAgo(n.lastMessageAt)}
                </p>
              </div>
              {n.unread > 0 && (
                <span className="shrink-0 min-w-4.5 h-4.5 px-1 rounded-full bg-[#004AAC] text-white text-[9px] font-bold flex items-center justify-center mt-0.5">
                  {n.unread > 9 ? "9+" : n.unread}
                </span>
              )}
            </button>
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-100">
          <Link
            href="/dashboard/messages"
            onClick={onClose}
            className="text-[12px] font-semibold text-[#004AAC] hover:text-[#003785]"
          >
            View all messages →
          </Link>
        </div>
      )}
    </div>
  );
}
export default function DashNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertsRef, setAlertsRef] = useState(null);
  const [msgNotifs, setMsgNotifs] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const senderCache = useRef({});
  useEffect(() => {
    let unsubConvs = null;
    const unsub = auth.onAuthStateChanged((user) => {
      if (unsubConvs) {
        unsubConvs();
        unsubConvs = null;
      }
      if (!user) {
        setMsgNotifs([]);
        setTotalUnread(0);
        return;
      }
      const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", user.uid),
      );
      unsubConvs = onSnapshot(q, async (snap) => {
        const convs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter(
            (c) =>
              c.participantRoles?.[user.uid] === "applicant" ||
              !c.participantRoles,
          );
        const unreadConvs = convs.filter(
          (c) => (c.unreadCount?.[user.uid] || 0) > 0,
        );
        const notifs = await Promise.all(
          unreadConvs.map(async (c) => {
            const otherUid = c.participants?.find((p) => p !== user.uid);
            if (!otherUid) return null;
            if (!senderCache.current[otherUid]) {
              try {
                const empSnap = await getDoc(doc(db, "employers", otherUid));
                if (empSnap.exists()) {
                  const d = empSnap.data();
                  senderCache.current[otherUid] = {
                    name:
                      `${d.firstName || ""} ${d.lastName || ""}`.trim() ||
                      d.companyName ||
                      "Employer",
                    company: d.company || d.companyName || "",
                  };
                } else {
                  const userSnap = await getDoc(doc(db, "users", otherUid));
                  if (userSnap.exists()) {
                    const d = userSnap.data();
                    senderCache.current[otherUid] = {
                      name:
                        `${d.firstName || ""} ${d.lastName || ""}`.trim() ||
                        "User",
                      company: "",
                    };
                  }
                }
              } catch (e) {}
            }
            const sender = senderCache.current[otherUid] || {};
            return {
              convId: c.id,
              senderName: sender.name || "Employer",
              company: sender.company || "",
              lastMessage: c.lastMessage || "",
              lastMessageAt: c.lastMessageAt,
              unread: c.unreadCount?.[user.uid] || 0,
            };
          }),
        );
        const validNotifs = notifs.filter(Boolean).sort((a, b) => {
          const aTime = a.lastMessageAt?.toDate?.() || new Date(0);
          const bTime = b.lastMessageAt?.toDate?.() || new Date(0);
          return bTime - aTime;
        });
        setMsgNotifs(validNotifs);
        setTotalUnread(validNotifs.reduce((s, n) => s + n.unread, 0));
      });
    });
    return () => {
      if (unsubConvs) unsubConvs();
      unsub();
    };
  }, []);
  const handleNotifClick = (convId) => {
    router.push(`/dashboard/messages?conv=${convId}`);
  };
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };
  const isActive = (href) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname === href;
  const toggleSearch = () => {
    const next = !searchOpen;
    setSearchOpen(next);
    window.dispatchEvent(new CustomEvent("searchToggle", { detail: next }));
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
        className="hidden md:flex w-17 flex-col items-center py-5 z-40 h-[calc(100vh-2rem)]"
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
            const isAlerts = label === "Alerts";
            const active = isActive(href);
            return (
              <div key={href} className="relative">
                {isAlerts ? (
                  <button
                    ref={(el) => {
                      if (el && !alertsRef) setAlertsRef(el);
                    }}
                    onClick={() => setAlertsOpen((p) => !p)}
                    className="group relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 border-none cursor-pointer"
                    style={{
                      backgroundColor:
                        alertsOpen || active ? "#EAF1FC" : "transparent",
                      color: alertsOpen || active ? "#004AAC" : "#0A0E17",
                    }}
                    onMouseEnter={(e) => {
                      if (!alertsOpen && !active) {
                        e.currentTarget.style.backgroundColor = "#EAF1FC";
                        e.currentTarget.style.color = "#004AAC";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!alertsOpen && !active) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#0A0E17";
                      }
                    }}
                  >
                    <Icon size={23} />
                    {totalUnread > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center border-2 border-white">
                        {totalUnread > 9 ? "9+" : totalUnread}
                      </span>
                    )}
                    <span className="pointer-events-none absolute left-13 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                      {label}
                    </span>
                  </button>
                ) : (
                  <Link
                    href={href}
                    className="group relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200"
                    style={{
                      backgroundColor: active ? "#EAF1FC" : "transparent",
                      color: active ? "#004AAC" : "#0A0E17",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = "#EAF1FC";
                        e.currentTarget.style.color = "#004AAC";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#0A0E17";
                      }
                    }}
                  >
                    <Icon size={23} />
                    <span className="pointer-events-none absolute left-13 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                      {label}
                    </span>
                  </Link>
                )}
                {isAlerts && alertsOpen && (
                  <AlertsPanel
                    notifications={msgNotifs}
                    onClose={() => setAlertsOpen(false)}
                    onNotifClick={handleNotifClick}
                  />
                )}
              </div>
            );
          })}
        </nav>
        <div className="relative">
          <button
            onClick={() => setSettingsOpen((p) => !p)}
            className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 border-none cursor-pointer"
            style={{
              backgroundColor: settingsOpen ? "#EAF1FC" : "transparent",
              color: "#0A0E17",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#EAF1FC";
              e.currentTarget.style.color = "#004AAC";
            }}
            onMouseLeave={(e) => {
              if (!settingsOpen) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#0A0E17";
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
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
              >
                <IoLogOutOutline size={17} /> Logout
              </button>
            </div>
          )}
        </div>
      </aside>
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{
          height: "56px",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Link href="/dashboard">
          <Image
            src={logo}
            alt="Jobs Abroad"
            width={32}
            height={32}
            className="object-contain"
          />
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSearch}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{
              backgroundColor: searchOpen ? "#EAF1FC" : "transparent",
              color: searchOpen ? "#004AAC" : "#0A0E17",
            }}
          >
            <IoSearchOutline size={22} />
          </button>
          <Link
            href="/dashboard/notifications"
            className="relative flex items-center justify-center w-9 h-9 rounded-xl"
            style={{
              color: isActive("/dashboard/notifications")
                ? "#004AAC"
                : "#0A0E17",
            }}
          >
            <IoNotificationsOutline size={22} />
            {totalUnread > 0 && (
              <span className="absolute top-1 right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center border-2 border-white">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </Link>
          <Link
            href="/dashboard/messages"
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{
              color: isActive("/dashboard/messages") ? "#004AAC" : "#0A0E17",
            }}
          >
            <IoChatbubbleOutline size={22} />
          </Link>
        </div>
      </div>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: "0 -1px 8px rgba(0,0,0,0.08)",
        }}
      >
        <div
          className="flex items-center justify-around px-2"
          style={{ height: "60px" }}
        >
          {[
            { href: "/dashboard", icon: IoHomeOutline, label: "Home" },
            {
              href: "/dashboard/profile",
              icon: IoPersonCircleOutline,
              label: "Profile",
            },
            {
              href: "/dashboard/jobs",
              icon: IoBriefcaseOutline,
              label: "Jobs",
            },
            {
              href: "/dashboard/saved-jobs",
              icon: IoBookmarkOutline,
              label: "Saved / Applied",
            },
            {
              href: "/dashboard/projects",
              icon: IoFolderOpenOutline,
              label: "Projects",
            },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all"
              style={{ color: isActive(href) ? "#004AAC" : "#0A0E17" }}
            >
              <Icon size={22} />
              <span className="text-xs font-semibold">{label}</span>
            </Link>
          ))}
        </div>
        <div className="flex justify-end px-4 pb-2">
          <Link
            href="/employer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: "#004AAC" }}
          >
            <IoBriefcaseOutline size={13} /> Post a Job
          </Link>
        </div>
      </nav>
    </>
  );
}
