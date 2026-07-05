"use client";
import { useState } from "react";
import {
  MapPin,
  Briefcase,
  Building2,
  TrendingUp,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Share2,
  ThumbsDown,
  ExternalLink,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import JobApplyModal from "@/dashboardComponents/jobs/Jobapplymodal";

const BLUE = "#004aac";
const BLUE_HOVER = "#003a8c";

function formatSalary(job) {
  const sym = job.currencies?.[0] || "₹";
  if (job.payStructure === "Negotiable") return "Negotiable";
  if (job.payStructure === "Salary Range" && job.salaryMin && job.salaryMax)
    return `${sym} ${Number(job.salaryMin).toLocaleString()} – ${Number(job.salaryMax).toLocaleString()} ${job.salaryUnit || "/ yr"}`;
  if (job.payStructure === "Fixed" && job.fixedSalary)
    return `${sym} ${Number(job.fixedSalary).toLocaleString()} ${job.salaryUnit || "/ yr"}`;
  if (job.payStructure === "Hourly" && job.hourlyRate)
    return `${sym} ${job.hourlyRate} / hr`;
  return "Not disclosed";
}

export default function JobDetail({ job, isSaved, onSaveToggle }) {
  const [applied, setApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const salary = formatSalary(job);
  const location = [job.location, job.targetCountry].filter(Boolean).join(", ");

  const isExternal = job.postingMode === "external" && job.externalCareerUrl;
  const isReferral = job.postingMode === "referral";

  const handleSave = async () => {
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

  const detailFields = [
    { label: "Pay", value: salary, icon: DollarSign },
    {
      label: "Job Type",
      value: job.type || job.jobType || "—",
      icon: Briefcase,
    },
    { label: "Work Type", value: job.workType || "—", icon: Building2 },
    {
      label: "Experience",
      value: job.experienceLevel || "—",
      icon: TrendingUp,
    },
  ];

  const ApplyButton = ({ fullWidth = false }) => {
    if (isExternal) {
      return (
        <a
          href={job.externalCareerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${fullWidth ? "w-full py-3" : "px-6 py-2.5"}`}
          style={{ backgroundColor: BLUE, color: "#ffffff" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = BLUE_HOVER)
          }
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BLUE)}
        >
          Apply Now
          <ExternalLink size={14} />
        </a>
      );
    }

    return (
      <button
        onClick={() => setShowApplyModal(true)}
        disabled={applied}
        className={`flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-70 ${fullWidth ? "w-full py-3" : "px-6 py-2.5"}`}
        style={{
          backgroundColor: applied ? "#22c55e" : BLUE,
          color: "#ffffff",
        }}
        onMouseEnter={(e) => {
          if (!applied) e.currentTarget.style.backgroundColor = BLUE_HOVER;
        }}
        onMouseLeave={(e) => {
          if (!applied)
            e.currentTarget.style.backgroundColor = applied ? "#22c55e" : BLUE;
        }}
      >
        {applied ? "Applied!" : "Apply Now"}
      </button>
    );
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <div className="px-6 py-5 border-b border-slate-100">
        <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
          {job.title}
          {job.companyName && (
            <span className="font-normal text-slate-500">
              {" "}
              at {job.companyName}
            </span>
          )}
        </h1>
        {location && (
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            {location}
          </p>
        )}
        <p className="text-base font-bold text-slate-800 mt-1">{salary}</p>

        {isReferral && job.referralContactName && (
          <div className="mt-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
            Referred by {job.referralContactName} · {job.companyName}
          </div>
        )}

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <ApplyButton />
          <button
            onClick={handleSave}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isSaved ? (
              <BookmarkCheck size={17} style={{ color: BLUE }} />
            ) : (
              <Bookmark size={17} className="text-slate-400" />
            )}
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
            <ThumbsDown size={17} className="text-slate-400" />
          </button>
          <button
            onClick={() =>
              navigator.share?.({ title: job.title, url: window.location.href })
            }
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Share2 size={17} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Job details
          </h2>
          <p className="text-xs text-slate-400 mb-3">
            Here's how the job details align with your profile.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {detailFields.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl px-4 py-3 border"
                style={{ backgroundColor: "#f8fafc", borderColor: "#f1f5f9" }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    {label}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {location && (
          <div className="mb-6 pb-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-2">
              Location
            </h2>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" />
              {location}
            </p>
          </div>
        )}

        {job.perks?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              Benefits & Perks
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.perks.map((p) => (
                <span
                  key={p}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                  style={{ borderColor: "#e2e8f0", color: "#475569" }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.description && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              Full job description
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>
        )}

        {job.requirements && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              Requirements
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.requirements}
            </p>
          </div>
        )}

        {job.benefits && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              Benefits
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.benefits}
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100">
          <ApplyButton fullWidth />
        </div>
      </div>

      {showApplyModal && !isExternal && (
        <JobApplyModal
          job={job}
          onClose={() => setShowApplyModal(false)}
          onApplied={() => {
            setApplied(true);
            setShowApplyModal(false);
          }}
        />
      )}
    </div>
  );
}
