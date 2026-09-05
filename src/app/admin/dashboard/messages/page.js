"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Inbox,
  MessageCircleHeart,
  Mail,
  Reply,
  CheckCircle2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { listenToHelpMessages, markHelpMessageStatus } from "@/lib/Helpqueries";
import { getOrCreateConversation } from "@/lib/messaging";
import AdminSidebar, {
  getStoredSidebarCollapsed,
  TOGGLE_EVENT,
} from "@/adminComponents/AdminSidebar";

function cls(...args) {
  return args.filter(Boolean).join(" ");
}

function formatDate(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusPill({ status }) {
  const resolved = status === "resolved";
  return (
    <span
      className={cls(
        "text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0",
        resolved
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700",
      )}
    >
      {resolved ? "Resolved" : "Open"}
    </span>
  );
}

function MessageCard({ item, onReply, replying }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const toggleStatus = async () => {
    setUpdating(true);
    try {
      await markHelpMessageStatus(
        item.id,
        item.status === "resolved" ? "open" : "resolved",
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">
            {item.subject}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {item.name} · {item.role} · {formatDate(item.createdAt)}
          </p>
        </div>
        <StatusPill status={item.status} />
      </div>

      <p
        className={cls(
          "text-sm text-slate-600 leading-relaxed whitespace-pre-line",
          !expanded && "line-clamp-3",
        )}
      >
        {item.message}
      </p>
      {item.message?.length > 160 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold text-[#004AAC] mt-1.5 hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
        <button
          onClick={toggleStatus}
          disabled={updating}
          className={cls(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50",
            item.status === "resolved"
              ? "text-slate-600 border-slate-200 hover:bg-slate-50"
              : "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100",
          )}
        >
          {updating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : item.status === "resolved" ? (
            <RotateCcw size={12} />
          ) : (
            <CheckCircle2 size={12} />
          )}
          {item.status === "resolved" ? "Reopen" : "Mark Resolved"}
        </button>
        <button
          onClick={() => onReply(item)}
          disabled={replying === item.id}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#004AAC] text-white hover:bg-[#003882] transition-colors disabled:opacity-60 ml-auto"
        >
          {replying === item.id ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Reply size={12} />
          )}
          Reply
        </button>
      </div>
    </div>
  );
}

export default function AdminHelpInbox() {
  const router = useRouter();
  const [tab, setTab] = useState("query");
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [replying, setReplying] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setCollapsed(getStoredSidebarCollapsed());
    const handler = () => setCollapsed(getStoredSidebarCollapsed());
    window.addEventListener(TOGGLE_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_EVENT, handler);
  }, []);

  useEffect(() => {
    const unsub = listenToHelpMessages(tab, setItems);
    return () => unsub();
  }, [tab]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          i.subject?.toLowerCase().includes(q) ||
          i.message?.toLowerCase().includes(q) ||
          i.name?.toLowerCase().includes(q) ||
          i.email?.toLowerCase().includes(q) ||
          i.role?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, statusFilter, search]);

  const openCount = items.filter((i) => i.status !== "resolved").length;

  const handleReply = async (item) => {
    const admin = auth.currentUser;
    if (!admin) return;
    setReplying(item.id);
    try {
      const convId = await getOrCreateConversation(
        admin.uid,
        "admin",
        item.uid,
        item.role,
      );
      router.push(`/admin/dashboard/messages?chat=${convId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setReplying(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <main
        className={cls(
          "pt-16 md:pt-0 transition-all duration-200",
          collapsed ? "md:ml-20" : "md:ml-60",
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10 py-6 md:py-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">Help Inbox</h1>
            <p className="text-sm text-slate-500 mt-1">
              Queries and feedback submitted by applicants and employers.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => {
                setTab("query");
                setStatusFilter("all");
              }}
              className={cls(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all",
                tab === "query"
                  ? "bg-[#004AAC] text-white border-[#004AAC] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
              )}
            >
              <Inbox size={15} /> Queries
            </button>
            <button
              onClick={() => {
                setTab("feedback");
                setStatusFilter("all");
              }}
              className={cls(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all",
                tab === "feedback"
                  ? "bg-[#004AAC] text-white border-[#004AAC] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
              )}
            >
              <MessageCircleHeart size={15} /> Feedback
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search subject, message, name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004AAC]/30 focus:border-transparent"
              />
            </div>
            <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1 w-fit">
              {[
                { key: "all", label: `All (${items.length})` },
                { key: "open", label: `Open (${openCount})` },
                { key: "resolved", label: "Resolved" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={cls(
                    "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                    statusFilter === f.key
                      ? "bg-white text-[#004AAC] shadow-sm"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
              <Mail size={28} className="text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500">
                No {tab === "query" ? "queries" : "feedback"} here yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <MessageCard
                  key={item.id}
                  item={item}
                  onReply={handleReply}
                  replying={replying}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}