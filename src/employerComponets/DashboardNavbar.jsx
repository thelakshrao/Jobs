"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, HelpCircle, User, X } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import HelpPanel from "@/employerComponets/HelpPanel";

const BORDER = "1.5px solid #cbd5e1";
const BRAND = "#004aac";

function timeAgo(ts) {
  if (!ts) return "";
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotifDropdown({ notifications, totalUnread, onClose, onNotifClick }) {
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
      className="absolute right-0 top-full mt-2 w-85 bg-white rounded-2xl z-9999 overflow-hidden"
      style={{
        boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 1px 6px rgba(0,0,0,0.06)",
        border: BORDER,
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-slate-900">
            Notifications
          </span>
          {totalUnread > 0 && (
            <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 border-none bg-transparent cursor-pointer text-slate-400"
        >
          <X size={14} />
        </button>
      </div>

      <div className="max-h-95 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Bell size={28} className="text-slate-200" />
            <p className="text-[12px] text-slate-400">No new notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.convId}
              onClick={() => {
                onNotifClick(n.convId);
                onClose();
              }}
              className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 border-none bg-transparent cursor-pointer text-left border-b border-slate-50 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: "#eaf1fb" }}
              >
                <MessageSquare size={16} style={{ color: BRAND }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 truncate">
                  New message from {n.senderName || "Applicant"}
                </p>
                <p className="text-[12px] text-slate-500 truncate mt-0.5 leading-snug">
                  "{n.lastMessage || "Sent you a message"}"
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {timeAgo(n.lastMessageAt)}
                </p>
              </div>
              {n.unread > 0 && (
                <span className="shrink-0 min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center mt-0.5">
                  {n.unread > 9 ? "9+" : n.unread}
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              onNotifClick(null);
              onClose();
            }}
            className="text-[12px] font-semibold border-none bg-transparent cursor-pointer"
            style={{ color: BRAND }}
          >
            View all messages →
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardNavbar() {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifBtnRef = useRef(null);
  const [msgNotifs, setMsgNotifs] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
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
              c.participantRoles?.[user.uid] === "employer" ||
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
                const userSnap = await getDoc(doc(db, "users", otherUid));
                if (userSnap.exists()) {
                  const d = userSnap.data();
                  senderCache.current[otherUid] = {
                    name:
                      `${d.firstName || ""} ${d.lastName || ""}`.trim() ||
                      d.name ||
                      "Applicant",
                  };
                }
              } catch (e) {}
            }

            const sender = senderCache.current[otherUid] || {};
            return {
              convId: c.id,
              senderName: sender.name || "Applicant",
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
    if (convId) {
      router.push(`/employer/dashboard/empmessages?conv=${convId}`);
    } else {
      router.push("/employer/dashboard/empmessages");
    }
  };

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
          <div className="relative" ref={notifBtnRef}>
            <button
              aria-label="Notifications"
              onClick={() => setNotifOpen((p) => !p)}
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Bell size={16} />
              <span>Notifications</span>
              {totalUnread > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center border-2 border-white">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </button>

            {notifOpen && (
              <NotifDropdown
                notifications={msgNotifs}
                totalUnread={totalUnread}
                onClose={() => setNotifOpen(false)}
                onNotifClick={handleNotifClick}
              />
            )}
          </div>

          <button
            aria-label="Messages"
            onClick={() => router.push("/employer/dashboard/empmessages")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <MessageSquare size={16} />
            <span>Messages</span>
          </button>

          <button
            aria-label="Help"
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <HelpCircle size={16} />
            <span>Help</span>
          </button>

          <div className="w-px h-5 bg-slate-300" />

          <button
            onClick={handleProfileClick}
            aria-label="Profile"
            className="flex items-center justify-center w-8 h-8 rounded-full text-white hover:scale-105 transition-transform"
            style={{ backgroundColor: BRAND }}
          >
            <User size={15} strokeWidth={2.5} />
          </button>
        </div>
      </nav>

      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center bg-white"
        style={{ borderTop: BORDER }}
      >
        <div className="relative flex-1">
          <button
            aria-label="Notifications"
            onClick={() => setNotifOpen((p) => !p)}
            className="relative flex flex-col items-center gap-0.5 py-2 text-slate-700 hover:text-slate-900 transition-colors w-full border-none bg-transparent cursor-pointer"
          >
            <Bell size={20} />
            <span className="text-[10px] font-semibold">Notifications</span>
            {totalUnread > 0 && (
              <span className="absolute top-1 right-4 min-w-4 h-4 px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center border-2 border-white">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </button>
        </div>

        <button
          aria-label="Messages"
          onClick={() => router.push("/employer/dashboard/empmessages")}
          className="flex flex-col items-center gap-0.5 py-2 text-slate-700 hover:text-slate-900 transition-colors flex-1 border-none bg-transparent cursor-pointer"
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-semibold">Messages</span>
        </button>

        <button
          aria-label="Help"
          onClick={() => setHelpOpen(true)}
          className="flex flex-col items-center gap-0.5 py-2 text-slate-700 hover:text-slate-900 transition-colors flex-1 border-none bg-transparent cursor-pointer"
        >
          <HelpCircle size={20} />
          <span className="text-[10px] font-semibold">Help</span>
        </button>
      </div>

      {notifOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 bg-black/40 z-9998"
            onClick={() => setNotifOpen(false)}
          />
          <div
            className="fixed bottom-16 left-0 right-0 z-9999 bg-white rounded-t-2xl overflow-hidden"
            style={{ boxShadow: "0 -4px 30px rgba(0,0,0,0.12)" }}
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-slate-900">
                  Notifications
                </span>
                {totalUnread > 0 && (
                  <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </div>
              <button
                onClick={() => setNotifOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 border-none cursor-pointer text-slate-500"
              >
                <X size={14} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {msgNotifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Bell size={28} className="text-slate-200" />
                  <p className="text-[13px] text-slate-400">
                    No new notifications
                  </p>
                </div>
              ) : (
                msgNotifs.map((n) => (
                  <button
                    key={n.convId}
                    onClick={() => {
                      handleNotifClick(n.convId);
                      setNotifOpen(false);
                    }}
                    className="w-full flex items-start gap-3 px-4 py-4 hover:bg-slate-50 border-none bg-transparent cursor-pointer text-left border-b border-slate-50"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "#eaf1fb" }}
                    >
                      <MessageSquare size={18} style={{ color: BRAND }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-slate-900">
                        New message from {n.senderName}
                      </p>
                      <p className="text-[13px] text-slate-500 truncate mt-0.5">
                        "{n.lastMessage}"
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {timeAgo(n.lastMessageAt)}
                      </p>
                    </div>
                    {n.unread > 0 && (
                      <span className="shrink-0 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {n.unread > 9 ? "9+" : n.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
            {msgNotifs.length > 0 && (
              <div className="px-4 py-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    router.push("/employer/dashboard/empmessages");
                    setNotifOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl text-white text-[13px] font-semibold border-none cursor-pointer"
                  style={{ backgroundColor: BRAND }}
                >
                  View all messages
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <HelpPanel
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        role="employer"
      />
    </>
  );
}
