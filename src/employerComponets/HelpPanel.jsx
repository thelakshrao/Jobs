"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Mail,
  Phone,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  MessageSquareText,
  Sparkles,
  Plus,
  LogIn,
} from "lucide-react";
import helpImg from "@/images/help.webp";
import {
  submitHelpMessage,
  listenToMyHelpMessages,
} from "@/lib/Helpqueries";
import { auth } from "@/lib/firebase";

const CONTACT = {
  email: "support@jobsabroad.com",
  phone: "+91 98765 43210",
  hours: "Mon–Sat, 10am–7pm IST",
};

const QUERY_SUBJECTS = [
  "Account & Login",
  "Job Posting Issue",
  "Application Issue",
  "Payments & Billing",
  "Technical Problem",
];

const FEEDBACK_SUBJECTS = [
  "Feature Request",
  "Something I Loved",
  "Something That Frustrated Me",
  "General Feedback",
];

function cls(...args) {
  return args.filter(Boolean).join(" ");
}

function timeAgo(ts) {
  if (!ts?.toDate) return "";
  const d = ts.toDate();
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function StatusBadge({ status }) {
  const resolved = status === "resolved";
  return (
    <span
      className={cls(
        "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full",
        resolved
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700",
      )}
    >
      {resolved ? "Resolved" : "Open"}
    </span>
  );
}

export default function HelpPanel({
  open,
  onClose,
  role = "employer",
  onRequireAuth,
}) {
  const [mode, setMode] = useState("query");
  const [subjectText, setSubjectText] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [mine, setMine] = useState([]);
  const [authed, setAuthed] = useState(!!auth.currentUser);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setAuthed(!!u));
    return () => unsub();
  }, []);

  const subjects = mode === "query" ? QUERY_SUBJECTS : FEEDBACK_SUBJECTS;

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!open || !uid) return;
    const unsub = listenToMyHelpMessages(uid, setMine);
    return () => unsub();
  }, [open]);

  const resetForm = () => {
    setSubjectText("");
    setMessage("");
    setSubmitted(false);
    setError("");
  };

  const switchMode = (m) => {
    setMode(m);
    setSubjectText("");
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    const finalSubject = subjectText.trim();
    if (!finalSubject) {
      setError("Please choose or type a subject.");
      return;
    }
    if (!message.trim()) {
      setError("Please write a message.");
      return;
    }
    setSubmitting(true);
    try {
      await submitHelpMessage({
        type: mode,
        subject: finalSubject,
        message: message.trim(),
        role,
      });
      setSubmitted(true);
      setMessage("");
      setSubjectText("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        className={cls(
          "fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] z-9999 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      <div
        className={cls(
          "fixed top-0 right-0 h-full z-10000 bg-white shadow-2xl flex flex-col",
          "w-full lg:w-[33%] lg:min-w-105 lg:max-w-xl",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="relative h-48 sm:h-56 shrink-0 overflow-hidden">
          <Image
            src={helpImg}
            alt=""
            fill
            sizes="480px"
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,26,69,0.15) 0%, rgba(0,74,172,0.55) 55%, #004AAC 100%)",
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/15 text-white mb-2">
              <Sparkles size={11} /> We're here to help
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Need Help?
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-5 py-4 border-b border-slate-100 shrink-0">
          <a
            href={`mailto:${CONTACT.email}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 transition-colors"
          >
            <Mail size={13} className="text-[#004AAC]" /> {CONTACT.email}
          </a>
          <a
            href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 transition-colors"
          >
            <Phone size={13} className="text-[#004AAC]" /> {CONTACT.phone}
          </a>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
            <Clock size={13} className="text-[#004AAC]" /> {CONTACT.hours}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!authed ? (
            <div className="flex flex-col items-center text-center py-10 px-4">
              <div className="w-14 h-14 rounded-full bg-[#004AAC]/10 flex items-center justify-center mb-4">
                <LogIn size={24} className="text-[#004AAC]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Sign in to reach us
              </h3>
              <p className="text-sm text-slate-500 mb-5 max-w-xs">
                Sign in or create an account so we know where to send our
                reply.
              </p>
              <button
                onClick={() => (onRequireAuth ? onRequireAuth() : onClose?.())}
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#004AAC] hover:bg-[#003882] rounded-xl transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => switchMode("query")}
              className={cls(
                "py-2.5 rounded-xl text-sm font-bold transition-all border",
                mode === "query"
                  ? "bg-[#004AAC] text-white border-[#004AAC] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
              )}
            >
              Send a Query
            </button>
            <button
              type="button"
              onClick={() => switchMode("feedback")}
              className={cls(
                "py-2.5 rounded-xl text-sm font-bold transition-all border",
                mode === "feedback"
                  ? "bg-[#004AAC] text-white border-[#004AAC] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
              )}
            >
              Share Feedback
            </button>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center text-center py-10 px-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {mode === "query" ? "Query sent" : "Thanks for the feedback"}
              </h3>
              <p className="text-sm text-slate-500 mb-5 max-w-xs">
                {mode === "query"
                  ? "We've got it — our team usually replies within 24 hours."
                  : "We read every note. Really appreciate you taking the time."}
              </p>
              <button
                onClick={resetForm}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#004AAC] bg-[#004AAC]/10 hover:bg-[#004AAC]/15 rounded-xl transition-colors"
              >
                <Plus size={14} /> Send another
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Subject
                </label>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {subjects.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubjectText(s)}
                      className={cls(
                        "px-3 py-1.5 text-xs font-semibold rounded-full border transition-all",
                        subjectText === s
                          ? "bg-[#004AAC] text-white border-[#004AAC]"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type your own subject..."
                  value={subjectText}
                  onChange={(e) => setSubjectText(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004AAC]/40 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder={
                    mode === "query"
                      ? "Tell us what's going on — the more detail, the faster we can help."
                      : "What's working well? What could be better?"
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl resize-none placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004AAC]/40 focus:border-transparent transition-all"
                />
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-500">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-[#004AAC] hover:bg-[#003882] rounded-xl transition-colors shadow-sm disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {submitting
                  ? "Sending…"
                  : mode === "query"
                    ? "Send Query"
                    : "Send Feedback"}
              </button>
            </div>
          )}

          {mine.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                <MessageSquareText size={13} /> Your recent messages
              </p>
              <div className="space-y-2">
                {mine.slice(0, 6).map((m) => (
                  <div
                    key={m.id}
                    className="border border-slate-200 rounded-xl px-3.5 py-3"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {m.subject}
                      </span>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-1">
                      {m.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {m.type === "query" ? "Query" : "Feedback"} ·{" "}
                      {timeAgo(m.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}