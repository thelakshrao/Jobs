"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Bookmark,
  Briefcase,
  MapPin,
  ChevronRight,
  Search,
  HardHat,
  Lock,
  Check,
} from "lucide-react";
import ProfileStrength from "@/profileComponents/ProfileStrength";
import { computeCompletedItems } from "@/lib/Computecompleteditems";
import { DEFAULT_PROFILE, DEFAULT_ABOUT } from "@/profileComponents/shared";
const BLUE = "#004aac";
function timeAgo(dateVal) {
  if (!dateVal) return null;
  const date = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
  if (isNaN(date.getTime())) return null;
  const diff = new Date() - date;
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
const TABS = ["Saved", "Applied"];
const PIPELINE_STAGES = [
  { key: "applied", label: "Applied" },
  { key: "viewed", label: "Application\nViewed" },
  { key: "shortlist", label: "Shortlisted" },
  { key: "interview", label: "Hiring\nProcess" },
  { key: "hired", label: "Hired" },
];
function computeStageStates(app) {
  const status = app.status || "Applied";
  const hasViewed = !!(
    app.applicationViewedAt ||
    app.resumeViewedAt ||
    app.profileViewedAt
  );
  let currentIdx = 0;
  let rejectedIdx = null;
  if (status === "Hired") {
    currentIdx = 4;
  } else if (status === "Interviewing") {
    currentIdx = 3;
  } else if (status === "Shortlisted") {
    currentIdx = 2;
  } else if (status === "Rejected") {
    if (app.interviewingAt) {
      currentIdx = 3;
      rejectedIdx = 3;
    } else if (app.shortlistedAt) {
      currentIdx = 2;
      rejectedIdx = 2;
    } else {
      currentIdx = 2;
      rejectedIdx = 2;
    } 
  } else {
    currentIdx = hasViewed ? 1 : 0;
  }
  return PIPELINE_STAGES.map((stage, i) => {
    if (rejectedIdx !== null && i === rejectedIdx) return "rejected";
    if (i < currentIdx) return "done";
    if (i === currentIdx) return rejectedIdx !== null ? "done" : "active";
    return "pending";
  });
}
function getStageDate(app, key) {
  switch (key) {
    case "applied":
      return app.appliedAt;
    case "viewed":
      return (
        app.applicationViewedAt || app.resumeViewedAt || app.profileViewedAt
      );
    case "shortlist":
      return (
        app.shortlistedAt ||
        (app.status === "Shortlisted" ||
        app.status === "Interviewing" ||
        app.status === "Hired"
          ? app.statusUpdatedAt
          : null)
      );
    case "interview":
      return (
        app.interviewingAt ||
        (app.status === "Interviewing" || app.status === "Hired"
          ? app.statusUpdatedAt
          : null)
      );
    case "hired":
      return (
        app.hiredAt || (app.status === "Hired" ? app.statusUpdatedAt : null)
      );
    default:
      return null;
  }
}
function getStageLabel(app, key, state) {
  if (key === "shortlist" && state === "rejected") return "Not\nShortlisted";
  if (key === "interview" && state === "rejected") return "Did Not\nAdvance";
  if (key === "hired" && app.status !== "Hired") return "Hired";
  return PIPELINE_STAGES.find((s) => s.key === key)?.label || "";
}
function fmtDate(dateVal) {
  if (!dateVal) return null;
  const d = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}
function PipelineTracker({ app }) {
  const states = computeStageStates(app);
  const dotStyle = (state) => ({
    bg:
      state === "done"
        ? "#22c55e"
        : state === "active"
          ? "#ffffff"
          : state === "rejected"
            ? "#ef4444"
            : "#f1f5f9",
    border:
      state === "done"
        ? "#16a34a"
        : state === "active"
          ? "#22c55e"
          : state === "rejected"
            ? "#dc2626"
            : "#cbd5e1",
    ring: state === "active",
  });
  const lineColor = (i) => {
    const next = states[i + 1];
    if (next === "rejected") return "#ef4444";
    if (states[i] === "done" && (next === "done" || next === "active"))
      return "#22c55e";
    return "#e2e8f0";
  };
  return (
    <div
      className="w-full overflow-x-auto"
      style={{
        paddingLeft: 6,
        paddingRight: 6,
        paddingTop: 10,
        paddingBottom: 4,
      }}
    >
      <div style={{ minWidth: 360, display: "flex", alignItems: "flex-start" }}>
        {PIPELINE_STAGES.map((stage, i) => {
          const state = states[i];
          const d = dotStyle(state);
          const isLast = i === PIPELINE_STAGES.length - 1;
          const label = getStageLabel(app, stage.key, state);
          const date = fmtDate(getStageDate(app, stage.key));
          const labelColor =
            state === "rejected"
              ? "#dc2626"
              : state === "done" || state === "active"
                ? "#0f172a"
                : "#94a3b8";
          return (
            <div
              key={stage.key}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: i === 0 ? "transparent" : lineColor(i - 1),
                    borderRadius: 999,
                  }}
                />
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {d.ring && (
                    <div
                      className="animate-ping"
                      style={{
                        position: "absolute",
                        inset: -4,
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        opacity: 0.25,
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `2px solid ${d.border}`,
                      backgroundColor: d.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: d.ring ? "0 0 0 3px #dcfce7" : "none",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {state === "done" && (
                      <Check size={10} color="#fff" strokeWidth={3.5} />
                    )}
                    {state === "active" && (
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: "#22c55e",
                        }}
                      />
                    )}
                    {state === "rejected" && (
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 2l6 6M8 2l-6 6"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: isLast ? "transparent" : lineColor(i),
                    borderRadius: 999,
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 6,
                  textAlign: "center",
                  paddingLeft: 2,
                  paddingRight: 2,
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: 9,
                    fontWeight: 900,
                    color: labelColor,
                    lineHeight: 1.25,
                    whiteSpace: "pre-line",
                  }}
                >
                  {label}
                </span>
                {date && (
                  <span
                    style={{
                      display: "block",
                      fontSize: 8,
                      fontWeight: 600,
                      color: "#94a3b8",
                      marginTop: 1,
                    }}
                  >
                    {date}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default function MyJobsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Applied");
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [resumeURL, setResumeURL] = useState("");
  const [profileSlug, setProfileSlug] = useState(null);
  const isGraduate = about.educationLevel === "graduate";
  const isSimple = profile.profileType === "simple";
  const completedItems = computeCompletedItems({
    profile,
    about,
    experiences,
    educations,
    resumeURL,
  });
  const showStrength = isGraduate && !isSimple;
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/dashboard/login");
        return;
      }
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfile({ ...DEFAULT_PROFILE, ...data });
          setAbout({ ...DEFAULT_ABOUT, ...(data.about || {}) });
          setExperiences(data.experiences || []);
          setEducations(data.educations || []);
          setResumeURL(data.resumeURL || data.resume?.url || "");
          setProfileSlug(data.slug || null);
        }
        const savedSnap = await getDocs(
          query(
            collection(db, "savedJobs"),
            where("applicantUid", "==", user.uid),
          ),
        );
        const savedJobIds = savedSnap.docs.map((d) => d.data().jobId);
        const savedJobDetails = await Promise.all(
          savedJobIds.map(async (jobId) => {
            const jobDoc = await getDoc(doc(db, "jobs", jobId));
            if (!jobDoc.exists()) return null;
            return { id: jobDoc.id, ...jobDoc.data() };
          }),
        );
        const today = new Date().toISOString().split("T")[0];
        setSavedJobs(
          savedJobDetails.filter(Boolean).map((job) => ({
            ...job,
            isClosed:
              job.status === "closed" ||
              job.status === "draft" ||
              (job.applicationDeadline && job.applicationDeadline < today),
          })),
        );
        const savedProjSnap = await getDocs(
          query(
            collection(db, "savedProjects"),
            where("applicantUid", "==", user.uid),
          ),
        );
        const savedProjIds = savedProjSnap.docs.map((d) => d.data().projectId);
        const savedProjDetails = await Promise.all(
          savedProjIds.map(async (projId) => {
            const projDoc = await getDoc(doc(db, "projects", projId));
            if (!projDoc.exists()) return null;
            return { id: projDoc.id, ...projDoc.data() };
          }),
        );
        setSavedProjects(
          savedProjDetails.filter(Boolean).map((proj) => ({
            ...proj,
            isClosed: proj.deadline && proj.deadline < today,
          })),
        );
        const appliedSnap = await getDocs(
          query(
            collection(db, "applications"),
            where("applicantUid", "==", user.uid),
          ),
        );
        const apps = appliedSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const dateA = a.appliedAt?.toDate
              ? a.appliedAt.toDate()
              : new Date(a.appliedAt || 0);
            const dateB = b.appliedAt?.toDate
              ? b.appliedAt.toDate()
              : new Date(b.appliedAt || 0);
            return dateB - dateA;
          });
        setAppliedJobs(apps);
      } catch (err) {
        console.error("My jobs fetch error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);
  const counts = {
    Saved: savedJobs.length + savedProjects.length,
    Applied: appliedJobs.length,
  };
  const now = new Date();
  const recentApplied = appliedJobs.filter((a) => {
    const d = a.appliedAt?.toDate
      ? a.appliedAt.toDate()
      : new Date(a.appliedAt);
    return (now - d) / (1000 * 60 * 60 * 24) <= 14;
  });
  const olderApplied = appliedJobs.filter((a) => {
    const d = a.appliedAt?.toDate
      ? a.appliedAt.toDate()
      : new Date(a.appliedAt);
    return (now - d) / (1000 * 60 * 60 * 24) > 14;
  });
  const isEmpty =
    (activeTab === "Saved" &&
      savedJobs.length === 0 &&
      savedProjects.length === 0) ||
    (activeTab === "Applied" && appliedJobs.length === 0);
  const goToProfile = () =>
    profileSlug
      ? router.push(`/dashboard/${profileSlug}`)
      : router.push("/dashboard/profile");
    return (
    <main className="md:min-h-screen bg-[#ffffff] pb-16 md:pb-0">
      <div className="w-full max-w-6xl mx-auto pt-3 md:pt-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 w-full">
            {showStrength && (
              <div className="lg:hidden mb-3 px-3 sm:px-6">
                <ProfileStrength
                  completedItems={completedItems}
                  isGraduate={isGraduate}
                  mobileOnly={true}
                  onImprove={goToProfile}
                />
              </div>
            )}

            <div
              className="sticky top-0 z-20 bg-[#ffffff] px-3 sm:px-6 pt-1 pb-0"
              style={{ boxShadow: "0 1px 0 0 rgba(0,0,0,0.02)" }}
            >
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">
                My jobs
              </h1>
              <div className="flex border-b border-slate-200 gap-6">
                {TABS.map((tab) => {
                  const active = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="pb-3 text-sm md:text-base font-black flex items-center gap-1.5 transition-colors"
                      style={{
                        color: active ? BLUE : "#94a3b8",
                        borderBottom: active
                          ? `2px solid ${BLUE}`
                          : "2px solid transparent",
                        marginBottom: "-1px",
                      }}
                    >
                      <span className="text-sm md:text-base font-black">
                        {counts[tab]}
                      </span>
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-3 sm:px-6 pt-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div
                    className="w-7 h-7 border-[3px] rounded-full animate-spin"
                    style={{ borderColor: "#bfdbfe", borderTopColor: BLUE }}
                  />
                </div>
              ) : isEmpty ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "#eff6ff" }}
                  >
                    {activeTab === "Saved" ? (
                      <Bookmark size={28} style={{ color: BLUE }} />
                    ) : (
                      <Briefcase size={28} style={{ color: BLUE }} />
                    )}
                  </div>
                  <p className="text-lg font-black text-slate-800 mb-1">
                    {activeTab === "Saved"
                      ? "No saved jobs yet"
                      : "No applications yet"}
                  </p>
                  <p className="text-sm font-semibold text-slate-400 mb-6 max-w-xs">
                    {activeTab === "Saved"
                      ? "Save jobs you're interested in and find them here."
                      : "Jobs you apply to will appear here."}
                  </p>
                  <Link
                    href="/dashboard/jobs"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                    style={{ backgroundColor: BLUE }}
                  >
                    <Search size={14} />
                    Browse jobs
                  </Link>
                </div>
              ) : activeTab === "Saved" ? (
                <div className="flex flex-col gap-5">
                  {savedJobs.length > 0 && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        Jobs
                      </p>
                      <div className="flex flex-col gap-2">
                        {savedJobs.map((job) => (
                          <Link
                            key={job.id}
                            href={`/dashboard/jobs?jobId=${job.id}`}
                            className="bg-white rounded-xl border px-4 py-3 flex items-center gap-3 transition-all group"
                            style={{
                              borderColor: "#e2e8f0",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                              opacity: job.isClosed ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) =>
                              !job.isClosed &&
                              (e.currentTarget.style.borderColor = BLUE)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.borderColor = "#e2e8f0")
                            }
                          >
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: job.isClosed
                                  ? "#f1f5f9"
                                  : "#eff6ff",
                              }}
                            >
                              {job.isClosed ? (
                                <Lock size={16} className="text-slate-400" />
                              ) : (
                                <Briefcase size={16} style={{ color: BLUE }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm md:text-base font-black text-slate-900 leading-tight truncate">
                                  {job.title}
                                </p>
                                {job.isClosed && (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                                    Closed
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-500 truncate">
                                {job.companyName || "Company"}
                              </p>
                              {(job.location || job.targetCountry) && (
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                  <MapPin size={9} className="shrink-0" />
                                  {[job.location, job.targetCountry]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              )}
                            </div>
                            <ChevronRight
                              size={15}
                              className="shrink-0"
                              style={{ color: "#bfdbfe" }}
                            />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {savedProjects.length > 0 && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <HardHat size={12} />
                        Projects
                      </p>
                      <div className="flex flex-col gap-2">
                        {savedProjects.map((proj) => (
                          <Link
                            key={proj.id}
                            href={`/dashboard/projects?projectId=${proj.id}`}
                            className="bg-white rounded-xl border px-4 py-3 flex items-center gap-3 transition-all group"
                            style={{
                              borderColor: "#e2e8f0",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                              opacity: proj.isClosed ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) =>
                              !proj.isClosed &&
                              (e.currentTarget.style.borderColor = BLUE)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.borderColor = "#e2e8f0")
                            }
                          >
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: proj.isClosed
                                  ? "#f1f5f9"
                                  : "#fff7ed",
                              }}
                            >
                              {proj.isClosed ? (
                                <Lock size={16} className="text-slate-400" />
                              ) : (
                                <HardHat
                                  size={16}
                                  style={{ color: "#f97316" }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm md:text-base font-black text-slate-900 leading-tight truncate">
                                  {proj.title}
                                </p>
                                {proj.isClosed && (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                                    Closed
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-500 truncate">
                                {proj.company || "Company"}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap mt-1">
                                {proj.projectType && (
                                  <span className="border border-slate-300 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                    {proj.projectType}
                                  </span>
                                )}
                                {proj.workType && (
                                  <span className="border border-red-300 text-red-500 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                    {proj.workType}
                                  </span>
                                )}
                                {(proj.location || proj.state) && (
                                  <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                                    <MapPin size={9} className="shrink-0" />
                                    {[proj.location, proj.state]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>
                            <ChevronRight
                              size={15}
                              className="shrink-0"
                              style={{ color: "#bfdbfe" }}
                            />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {recentApplied.length > 0 && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        Last 14 days
                      </p>
                      <div className="flex flex-col gap-2">
                        {recentApplied.map((app) => (
                          <AppliedCard key={app.id} app={app} />
                        ))}
                      </div>
                    </div>
                  )}
                  {olderApplied.length > 0 && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        Older
                      </p>
                      <div className="flex flex-col gap-2">
                        {olderApplied.map((app) => (
                          <AppliedCard key={app.id} app={app} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {showStrength && (
            <div className="hidden lg:block shrink-0 w-72 sticky top-6 self-start">
              <ProfileStrength
                completedItems={completedItems}
                isGraduate={isGraduate}
                onImprove={goToProfile}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
function AppliedCard({ app }) {
  const when = timeAgo(app.appliedAt);
  const isProject = app.type === "project";
  const title = app.jobTitle || app.projectTitle || "Untitled";
  const company = app.companyName || app.company || "";
  const linkHref = isProject
    ? `/dashboard/projects?projectId=${app.projectId}`
    : `/dashboard/jobs?jobId=${app.jobId}`;
  const isRejected = app.status === "Rejected";
  const isHired = app.status === "Hired";
  return (
    <div
      className="bg-white rounded-xl border px-4 py-3"
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        borderColor: isRejected ? "#fca5a5" : isHired ? "#86efac" : "#e2e8f0",
        backgroundColor: isRejected
          ? "#fff5f5"
          : isHired
            ? "#f0fdf4"
            : "#ffffff",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: isProject ? "#fff7ed" : "#eff6ff" }}
        >
          {isProject ? (
            <HardHat size={16} style={{ color: "#f97316" }} />
          ) : (
            <Briefcase size={16} style={{ color: BLUE }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={linkHref}
            className="block text-sm md:text-base font-black text-slate-900 leading-tight hover:underline underline-offset-2 truncate"
          >
            {title}
          </Link>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <p className="text-xs font-bold text-slate-500 truncate">
              {company}
            </p>
            {app.applicantLocation && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                <MapPin size={9} className="shrink-0" />
                {app.applicantLocation}
              </p>
            )}
            {when && (
              <p className="text-[11px] text-slate-400 shrink-0">
                Applied {when}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-100">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
          Application status
        </p>
        <PipelineTracker app={app} />
      </div>
    </div>
  );
}