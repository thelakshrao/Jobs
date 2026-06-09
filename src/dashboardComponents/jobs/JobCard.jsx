"use client";
import {
  Bookmark,
  BookmarkCheck,
  ThumbsDown,
  MapPin,
  Clock,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

function formatSalary(job) {
  const sym = job.currencies?.[0] || "₹";
  if (job.payStructure === "Negotiable") return "Negotiable";
  if (job.payStructure === "Salary Range" && job.salaryMin && job.salaryMax)
    return `${sym} ${Number(job.salaryMin).toLocaleString()} – ${Number(job.salaryMax).toLocaleString()}`;
  if (job.payStructure === "Fixed" && job.fixedSalary)
    return `${sym} ${Number(job.fixedSalary).toLocaleString()} / yr`;
  if (job.payStructure === "Hourly" && job.hourlyRate)
    return `${sym} ${job.hourlyRate} / hr`;
  return null;
}

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
  if (diff < 1) return "Today";
  if (diff < 2) return "1 day ago";
  if (diff < 7) return `${Math.floor(diff)} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
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
        borderColor: isSelected ? "#60a5fa" : "#e2e8f0",
        boxShadow: isSelected
          ? "0 0 0 2px #bfdbfe"
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {job.urgency === "High" && (
            <span
              className="inline-block mb-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: "#eff6ff", color: "#60a5fa" }}
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
            {salary && !job.perks?.length && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                style={{ borderColor: "#e2e8f0", color: "#475569" }}
              >
                {salary}
              </span>
            )}
          </div>

          {posted && (
            <p className="text-[11px] text-slate-400 mt-2">{posted}</p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 shrink-0">
          <button
            onClick={handleSave}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isSaved ? (
              <BookmarkCheck size={16} style={{ color: "#60a5fa" }} />
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
