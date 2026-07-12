"use client";
import { Bookmark, BookmarkCheck, ThumbsDown, MapPin } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { CURRENCIES } from "@/app/employer/dashboard/create-job/constants";

const BLUE = "#004aac";
const LIGHT_BLUE = "#e8f0fb";

function getSymbol(code) {
  return CURRENCIES.find((c) => c.code === code)?.symbol || code || "";
}

function formatSalary(job) {
  const code = job.currencies?.[0] || "INR";
  const sym = getSymbol(code);
  if (job.payStructure === "Negotiable") return "Negotiable";
  if (job.payStructure === "Salary Range" && job.salaryMin && job.salaryMax)
    return `${sym} ${Number(job.salaryMin).toLocaleString()} – ${sym} ${Number(job.salaryMax).toLocaleString()} ${job.salaryUnit || ""}`.trim();
  if (job.payStructure === "Fixed" && job.fixedSalary)
    return `${sym} ${Number(job.fixedSalary).toLocaleString()} ${job.salaryUnit || ""}`.trim();
  if (job.payStructure === "Hourly" && job.hourlyRate)
    return `${sym} ${job.hourlyRate} / hr`;
  return null;
}

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = new Date() - new Date(dateStr);
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  if (weeks === 1) return "1 week ago";
  if (weeks < 4) return `${weeks} weeks ago`;
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

export default function JobCard({
  job,
  isSelected,
  isSaved,
  onClick,
  onSaveToggle,
}) {
  const salary = formatSalary(job);
  const posted = timeAgo(job.publishedAt || job.createdAt);
  const location = [job.location, job.targetCountry].filter(Boolean).join(", ");

  const handleSave = async (e) => {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, "savedJobs", `${user.uid}_${job.id}`);
    if (isSaved) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        applicantUid: user.uid,
        jobId: job.id,
        savedAt: new Date().toISOString(),
      });
    }
    onSaveToggle(job.id);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border p-4 cursor-pointer transition-all"
      style={{
        borderColor: isSelected ? BLUE : "#e2e8f0",
        boxShadow: isSelected
          ? `0 0 0 2px ${LIGHT_BLUE}`
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {job.urgency === "High" && (
            <span
              className="inline-block mb-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: LIGHT_BLUE, color: BLUE }}
            >
              Easily apply
            </span>
          )}
          <h3 className="text-base font-bold text-slate-900 leading-tight">
            {job.title}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {job.companyName || "Company"}
          </p>
          {salary && (
            <p className="text-sm font-bold mt-0.5" style={{ color: BLUE }}>
              {salary}
            </p>
          )}
          {location && (
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin size={11} className="shrink-0 text-slate-400" />
              {location}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {job.perks?.slice(0, 3).map((p) => (
              <span
                key={p}
                className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                style={{ borderColor: "#e2e8f0", color: "#475569" }}
              >
                {p}
              </span>
            ))}
          </div>

          {posted && (
            <span
              className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-2"
              style={{ color: BLUE, backgroundColor: LIGHT_BLUE }}
            >
              {posted}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 shrink-0">
          <button
            onClick={handleSave}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isSaved ? (
              <BookmarkCheck size={16} style={{ color: BLUE }} />
            ) : (
              <Bookmark size={16} className="text-slate-400" />
            )}
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ThumbsDown size={16} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
