"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import EmployerSidebar from "@/employerComponets/EmployerSidebar";
import DashboardNavbar from "@/employerComponets/DashboardNavbar";
import {
  User,
  MapPin,
  Mail,
  Phone,
  FileText,
  Briefcase,
  ExternalLink,
  Check,
  ChevronLeft,
  Info,
  X,
  Calendar,
  Globe,
  Users,
  Banknote,
  Clock,
  Building2 as Building2Icon,
  Star,
  XCircle,
} from "lucide-react";
const BRAND = "#003882";
const BRAND_DARK = "#002a63";
const PIPELINE_STAGES = ["Shortlisted", "Interviewing", "Hired"];
const STAGE_COLORS = {
  Shortlisted: { bg: "#fefce8", text: "#854d0e", border: "#fde047" },
  Interviewing: { bg: "#eff6ff", text: "#1e40af", border: "#93c5fd" },
  Hired: { bg: "#f0fdf4", text: "#166534", border: "#86efac" },
  Rejected: { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" },
};
function formatSalary(job) {
  const currency = job.currencies?.[0] || "INR";
  if (job.payStructure === "Negotiable") return "Negotiable";
  if (job.payStructure === "Salary Range" && job.salaryMin && job.salaryMax)
    return `${currency} ${Number(job.salaryMin).toLocaleString()} – ${Number(job.salaryMax).toLocaleString()}`;
  if (job.payStructure === "Fixed" && job.fixedSalary)
    return `${currency} ${Number(job.fixedSalary).toLocaleString()} / yr`;
  if (job.payStructure === "Hourly" && job.hourlyRate)
    return `${currency} ${job.hourlyRate} / hr`;
  return "";
}
function getTitle(app) {
  return app.type === "project" ? app.projectTitle : app.jobTitle;
}
function getRefId(app) {
  return app.type === "project" ? app.projectId : app.jobId;
}
export default function EmployerShortlistedPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [applications, setApplications] = useState([]);
  const [viewType, setViewType] = useState("job");
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [mobileView, setMobileView] = useState("jobs");
  const [jobDetail, setJobDetail] = useState(null);
  const [loadingJobDetail, setLoadingJobDetail] = useState(false);
  const openJobDetail = async (id, type = "job") => {
    if (!id) return;
    setLoadingJobDetail(true);
    try {
      const colName = type === "project" ? "projects" : "jobs";
      const snap = await getDoc(doc(db, colName, id));
      if (snap.exists()) setJobDetail({ id: snap.id, ...snap.data() });
    } catch (err) {
      console.error("Detail fetch error:", err);
    } finally {
      setLoadingJobDetail(false);
    }
  };
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/employer/onboarding");
        return;
      }
      const empDoc = await getDoc(doc(db, "employers", user.uid));
      if (!empDoc.exists()) {
        router.replace("/employer/onboarding");
        return;
      }
      setChecking(false);
      try {
        const snap = await getDocs(
          query(
            collection(db, "applications"),
            where("employerUid", "==", user.uid),
            where("status", "in", [
              "Shortlisted",
              "Interviewing",
              "Hired",
              "Rejected",
            ]),
          ),
        );
        let apps = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        apps.sort((a, b) => {
          const dateA = a.appliedAt?.toDate
            ? a.appliedAt.toDate()
            : new Date(a.appliedAt || 0);
          const dateB = b.appliedAt?.toDate
            ? b.appliedAt.toDate()
            : new Date(b.appliedAt || 0);
          return dateA - dateB;
        });
        setApplications(apps);
        const firstJobApp = apps.find((a) => (a.type || "job") === "job");
        if (firstJobApp) {
          setSelectedJob(getTitle(firstJobApp));
          setSelectedApp(firstJobApp);
        } else if (apps.length > 0) {
          setViewType("project");
          setSelectedJob(getTitle(apps[0]));
          setSelectedApp(apps[0]);
        }
      } catch (err) {
        console.error("Shortlisted fetch error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);
  const updateStatus = async (appId, status) => {
    setUpdatingStatus(true);
    try {
      const timestampField =
        status === "Shortlisted"
          ? "shortlistedAt"
          : status === "Interviewing"
            ? "interviewingAt"
            : status === "Hired"
              ? "hiredAt"
              : status === "Rejected"
                ? "rejectedAt"
                : null;
      const updatePayload = { status, statusUpdatedAt: serverTimestamp() };
      if (timestampField) updatePayload[timestampField] = serverTimestamp();
      await updateDoc(doc(db, "applications", appId), updatePayload);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a)),
      );
      setSelectedApp((prev) =>
        prev?.id === appId ? { ...prev, status } : prev,
      );
    } catch (e) {
      console.error(e);
    }
    setUpdatingStatus(false);
  };
  function timeAgo(dateStr) {
    if (!dateStr) return "";
    const d = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const diff = (new Date() - d) / (1000 * 60 * 60 * 24);
    if (diff < 1) return "Today";
    if (diff < 2) return "Yesterday";
    if (diff < 7) return `${Math.floor(diff)}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }
  const typedApplications = applications.filter(
    (a) => (a.type || "job") === viewType,
  );
  const jobs = [
    ...new Map(typedApplications.map((a) => [getTitle(a), a])).values(),
  ];
  const jobApplicants = typedApplications.filter(
    (a) => getTitle(a) === selectedJob,
  );
  const switchView = (type) => {
    setViewType(type);
    setSelectedJob(null);
    setSelectedApp(null);
    setMobileView("jobs");
  };
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: BRAND, borderTopColor: "transparent" }}
        />
      </div>
    );
  }
  const ViewToggle = () => (
    <div className="flex gap-1.5 mb-3 px-1">
      {["job", "project"].map((t) => (
        <button
          key={t}
          onClick={() => switchView(t)}
          className="flex-1 text-xs font-black px-3 py-2 rounded-xl border transition-colors"
          style={{
            backgroundColor: viewType === t ? BRAND : "#ffffff",
            color: viewType === t ? "#fff" : "#475569",
            borderColor: viewType === t ? BRAND : "#e2e8f0",
          }}
        >
          {t === "job" ? "Jobs" : "Projects"}
        </button>
      ))}
    </div>
  );
  const PipelineBar = ({ currentStatus }) => {
    const isRejected = currentStatus === "Rejected";
    const currentIdx = PIPELINE_STAGES.indexOf(currentStatus);
    return (
      <div className="mt-4">
        <div className="flex items-center gap-0 mb-3">
          {PIPELINE_STAGES.map((stage, i) => {
            const done = !isRejected && i <= currentIdx;
            const isActive = !isRejected && i === currentIdx;
            return (
              <div
                key={stage}
                className="flex items-center flex-1 last:flex-none"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 border-2 transition-all"
                  style={{
                    backgroundColor: done ? "#22c55e" : "#e2e8f0",
                    borderColor: done ? "#16a34a" : "#e2e8f0",
                    transform: isActive ? "scale(1.3)" : "scale(1)",
                  }}
                />
                {i < PIPELINE_STAGES.length - 1 && (
                  <div
                    className="h-0.5 flex-1 transition-all"
                    style={{
                      backgroundColor:
                        !isRejected && i < currentIdx ? "#22c55e" : "#e2e8f0",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {PIPELINE_STAGES.map((s) => {
            const active = currentStatus === s;
            return (
              <button
                key={s}
                onClick={() => updateStatus(selectedApp.id, s)}
                disabled={updatingStatus || isRejected}
                className="flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all disabled:opacity-40"
                style={{
                  backgroundColor: active ? BRAND : "#f8fafc",
                  color: active ? "#ffffff" : "#475569",
                  borderColor: active ? BRAND_DARK : "#e2e8f0",
                }}
              >
                {active && <Check size={11} />}
                {s === "Shortlisted"
                  ? "Shortlisted"
                  : s === "Interviewing"
                    ? "In Hiring Process"
                    : "Hired 🎉"}
              </button>
            );
          })}
          <button
            onClick={() => updateStatus(selectedApp.id, "Rejected")}
            disabled={updatingStatus}
            className="flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all disabled:opacity-40 ml-auto"
            style={{
              backgroundColor:
                currentStatus === "Rejected" ? "#ef4444" : "#fff5f5",
              color: currentStatus === "Rejected" ? "#ffffff" : "#dc2626",
              borderColor: currentStatus === "Rejected" ? "#dc2626" : "#fca5a5",
            }}
          >
            {currentStatus === "Rejected" ? (
              <>
                <XCircle size={11} /> Not a Fit
              </>
            ) : (
              <>
                <XCircle size={11} /> Reject
              </>
            )}
          </button>
        </div>
        {currentStatus === "Rejected" && (
          <p className="text-xs font-semibold text-red-400 mt-2">
            This candidate has been marked as not a fit. You can re-shortlist
            them using the stage buttons above.
          </p>
        )}
      </div>
    );
  };
  const DetailPanel = () => {
    const sc = STAGE_COLORS[selectedApp.status] || STAGE_COLORS.Shortlisted;
    const isRejected = selectedApp.status === "Rejected";
    return (
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: isRejected ? "#fff5f5" : "#ffffff",
          borderColor: isRejected
            ? "#fca5a5"
            : selectedApp.status === "Hired"
              ? "#86efac"
              : "#e2e8f0",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}
      >
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-start gap-4">
            {selectedApp.applicantPhotoURL ? (
              <img
                src={selectedApp.applicantPhotoURL}
                alt={selectedApp.applicantName}
                className="w-14 h-14 rounded-xl object-cover shrink-0 border-2 border-slate-100"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: BRAND }}
              >
                <span className="text-white text-xl font-black">
                  {selectedApp.applicantName?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-black leading-tight">
                  {selectedApp.applicantName || "Applicant"}
                </h2>
                <span
                  className="text-[9px] font-black px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: sc.bg,
                    color: sc.text,
                    border: `1px solid ${sc.border}`,
                  }}
                >
                  {selectedApp.status === "Rejected"
                    ? "Not a Fit"
                    : selectedApp.status}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-500 mt-0.5">
                Applied for{" "}
                <span className="text-black">{getTitle(selectedApp)}</span>
              </p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {timeAgo(selectedApp.appliedAt)}
              </p>
            </div>
          </div>
          <PipelineBar currentStatus={selectedApp.status} />
        </div>
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Contact
            </p>
            <div className="flex flex-col gap-2">
              {[
                {
                  icon: <Mail size={13} />,
                  label: "Email",
                  value: selectedApp.applicantEmail,
                },
                {
                  icon: <Phone size={13} />,
                  label: "Phone",
                  value: selectedApp.applicantPhone,
                },
                {
                  icon: <MapPin size={13} />,
                  label: "Location",
                  value: selectedApp.applicantLocation,
                },
              ]
                .filter((i) => i.value)
                .map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <span className="text-slate-400 shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                        {label}
                      </p>
                      <p className="text-sm font-black text-black truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {selectedApp.resumeURL && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Resume
                </p>
                <a
                  href={selectedApp.resumeURL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-black">View Resume</p>
                    <p className="text-xs font-semibold text-slate-400">
                      Click to open
                    </p>
                  </div>
                  <ExternalLink size={13} className="text-slate-400" />
                </a>
              </div>
            )}
            {selectedApp.applicantSlug && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Profile
                </p>
                <a
                  href={`/dashboard/${selectedApp.applicantSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: BRAND }}
                  >
                    <User size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-black">
                      View Profile
                    </p>
                    <p className="text-xs font-semibold text-slate-400">
                      Open full profile
                    </p>
                  </div>
                  <ExternalLink size={13} className="text-slate-400" />
                </a>
              </div>
            )}
            {(selectedApp.lastCompany || selectedApp.lastJobTitle) && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Experience
                </p>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                    <Briefcase size={15} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-black">
                      {selectedApp.lastJobTitle || "—"}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      {selectedApp.lastCompany || "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      <EmployerSidebar />
      <DashboardNavbar />
      <main className="md:ml-64 pt-14 pb-16 md:pb-0 min-h-screen bg-[#e8eaed]">
        <div className="pt-5 pb-10 px-4 sm:px-6 h-[calc(100vh-56px)] flex flex-col">
          <div className="mb-5 shrink-0">
            <div className="flex items-center gap-2">
              <Star size={20} style={{ color: BRAND }} />
              <h1 className="text-2xl font-black text-[#003882]">Shortlisted</h1>
            </div>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">
              {loading
                ? "Loading…"
                : `${applications.length} candidate${applications.length !== 1 ? "s" : ""} in pipeline`}
            </p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div
                className="w-7 h-7 border-[3px] border-slate-300 rounded-full animate-spin"
                style={{ borderTopColor: BRAND }}
              />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-24 px-6 text-center">
              <Star size={40} className="text-slate-200 mb-4" />
              <p className="text-lg font-black text-black mb-1">
                No shortlisted candidates yet
              </p>
              <p className="text-sm font-semibold text-slate-400">
                Shortlist applicants from the Applicants page to see them here.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:flex gap-3 items-stretch flex-1 min-h-0">
                <div className="w-52 shrink-0 flex flex-col gap-1.5 h-full overflow-y-auto pr-1">
                  <div className="sticky top-0 bg-[#e8eaed] z-10 pb-1">
                    <ViewToggle />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">
                      {viewType === "job" ? "Jobs" : "Projects"}
                    </p>
                  </div>
                  {jobs.length === 0 && (
                    <p className="text-xs font-semibold text-slate-400 px-1 py-3">
                      No shortlisted {viewType === "job" ? "job" : "project"}{" "}
                      candidates yet.
                    </p>
                  )}
                  {jobs.map((job) => {
                    const title = getTitle(job);
                    const count = typedApplications.filter(
                      (a) => getTitle(a) === title,
                    ).length;
                    const active = selectedJob === title;
                    return (
                      <div
                        key={title}
                        className="w-full rounded-xl transition-all shrink-0 overflow-hidden"
                        style={{
                          backgroundColor: active ? BRAND : "#ffffff",
                          border: `1.5px solid ${active ? BRAND_DARK : "#e2e8f0"}`,
                        }}
                      >
                        <button
                          onClick={() => {
                            setSelectedJob(title);
                            setSelectedApp(null);
                          }}
                          className="w-full text-left px-3.5 py-3"
                        >
                          <p
                            className={`text-sm font-black truncate ${active ? "text-white" : "text-black"}`}
                          >
                            {title}
                          </p>
                          <p
                            className={`text-xs font-bold mt-0.5 ${active ? "text-slate-300" : "text-slate-400"}`}
                          >
                            {count} candidate{count !== 1 ? "s" : ""}
                          </p>
                        </button>
                        <button
                          onClick={() => openJobDetail(getRefId(job), viewType)}
                          className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2 border-t transition-colors ${
                            active
                              ? "text-slate-300 border-white/10 hover:bg-white/5 hover:text-white"
                              : "text-slate-500 border-slate-100 hover:bg-slate-50 hover:text-black"
                          }`}
                        >
                          <Info size={12} />
                          {viewType === "job"
                            ? "Job details"
                            : "Project details"}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="w-px self-stretch shrink-0"
                  style={{ backgroundColor: "#cbd1db" }}
                />
                <div className="w-60 shrink-0 flex flex-col gap-1.5 h-full overflow-y-auto pr-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1 truncate sticky top-0 bg-[#e8eaed] z-10 py-1">
                    {selectedJob || `Select a ${viewType}`}
                  </p>
                  {jobApplicants.map((app) => {
                    const sc =
                      STAGE_COLORS[app.status] || STAGE_COLORS.Shortlisted;
                    const active = selectedApp?.id === app.id;
                    const isRejected = app.status === "Rejected";
                    return (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className="w-full text-left px-3.5 py-3 rounded-xl transition-all shrink-0"
                        style={{
                          backgroundColor: isRejected
                            ? "#fff5f5"
                            : active
                              ? "#eaf1fb"
                              : "#ffffff",
                          border: `1.5px solid ${isRejected ? "#fca5a5" : active ? BRAND : "#e2e8f0"}`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {app.applicantPhotoURL ? (
                            <img
                              src={app.applicantPhotoURL}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: BRAND }}
                            >
                              <span className="text-white text-[9px] font-black">
                                {app.applicantName?.[0]?.toUpperCase() || "?"}
                              </span>
                            </div>
                          )}
                          <p className="text-sm font-black text-black truncate flex-1">
                            {app.applicantName || "Applicant"}
                          </p>
                          <span
                            className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: sc.bg,
                              color: sc.text,
                              border: `1px solid ${sc.border}`,
                            }}
                          >
                            {isRejected ? "Not a Fit" : app.status}
                          </span>
                        </div>
                        {app.applicantLocation && (
                          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 truncate">
                            <MapPin size={9} /> {app.applicantLocation}
                          </p>
                        )}
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          {timeAgo(app.appliedAt)}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div
                  className="w-px self-stretch shrink-0"
                  style={{ backgroundColor: "#cbd1db" }}
                />
                <div className="flex-1 min-w-0 h-full overflow-y-auto pr-1">
                  {selectedApp ? (
                    <DetailPanel />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm font-bold text-slate-400">
                        Select a candidate to view details
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:hidden flex-1 min-h-0 overflow-y-auto">
                {mobileView === "jobs" && (
                  <div className="flex flex-col gap-2">
                    <ViewToggle />
                    {jobs.length === 0 && (
                      <p className="text-xs font-semibold text-slate-400 px-1 py-3">
                        No shortlisted {viewType === "job" ? "job" : "project"}{" "}
                        candidates yet.
                      </p>
                    )}
                    {jobs.map((job) => {
                      const title = getTitle(job);
                      const count = typedApplications.filter(
                        (a) => getTitle(a) === title,
                      ).length;
                      return (
                        <div
                          key={title}
                          className="w-full rounded-2xl bg-white border border-slate-200 overflow-hidden"
                          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                        >
                          <button
                            onClick={() => {
                              setSelectedJob(title);
                              setSelectedApp(null);
                              setMobileView("applicants");
                            }}
                            className="w-full text-left px-4 py-4 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-base font-black text-black">
                                {title}
                              </p>
                              <p className="text-sm font-bold text-slate-400 mt-0.5">
                                {count} candidate{count !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: BRAND }}
                            >
                              <ChevronLeft
                                size={16}
                                className="text-white rotate-180"
                              />
                            </div>
                          </button>
                          <button
                            onClick={() =>
                              openJobDetail(getRefId(job), viewType)
                            }
                            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 border-t border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-black transition-colors"
                          >
                            <Info size={12} />
                            {viewType === "job"
                              ? "Job details"
                              : "Project details"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {mobileView === "applicants" && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setMobileView("jobs")}
                      className="flex items-center gap-1.5 text-sm font-black text-slate-600 mb-1"
                    >
                      <ChevronLeft size={16} /> All{" "}
                      {viewType === "job" ? "Jobs" : "Projects"}
                    </button>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      {selectedJob}
                    </p>
                    {jobApplicants.map((app) => {
                      const sc =
                        STAGE_COLORS[app.status] || STAGE_COLORS.Shortlisted;
                      const isRejected = app.status === "Rejected";
                      return (
                        <button
                          key={app.id}
                          onClick={() => {
                            setSelectedApp(app);
                            setMobileView("detail");
                          }}
                          className="w-full text-left px-4 py-3.5 rounded-2xl border flex items-center gap-3"
                          style={{
                            backgroundColor: isRejected ? "#fff5f5" : "#ffffff",
                            borderColor: isRejected ? "#fca5a5" : "#e2e8f0",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                          }}
                        >
                          {app.applicantPhotoURL ? (
                            <img
                              src={app.applicantPhotoURL}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: BRAND }}
                            >
                              <span className="text-white text-sm font-black">
                                {app.applicantName?.[0]?.toUpperCase() || "?"}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-black text-black truncate">
                                {app.applicantName || "Applicant"}
                              </p>
                              <span
                                className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: sc.bg,
                                  color: sc.text,
                                  border: `1px solid ${sc.border}`,
                                }}
                              >
                                {isRejected ? "Not a Fit" : app.status}
                              </span>
                            </div>
                            {app.applicantLocation && (
                              <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={9} /> {app.applicantLocation}
                              </p>
                            )}
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                              {timeAgo(app.appliedAt)}
                            </p>
                          </div>
                          <ChevronLeft
                            size={14}
                            className="text-slate-300 rotate-180 shrink-0"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
                {mobileView === "detail" && selectedApp && (
                  <div>
                    <button
                      onClick={() => setMobileView("applicants")}
                      className="flex items-center gap-1.5 text-sm font-black text-slate-600 mb-3"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                    <DetailPanel />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      {(jobDetail || loadingJobDetail) && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={() => setJobDetail(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-100 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {loadingJobDetail && !jobDetail ? (
              <div className="flex items-center justify-center py-24">
                <div
                  className="w-7 h-7 border-[3px] border-slate-300 rounded-full animate-spin"
                  style={{ borderTopColor: BRAND }}
                />
              </div>
            ) : jobDetail ? (
              <>
                <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
                  <div>
                    <p
                      className="text-[10px] font-black uppercase tracking-widest mb-1"
                      style={{
                        color:
                          jobDetail.status === "Open" ? "#166534" : "#64748b",
                      }}
                    >
                      {jobDetail.status || "Draft"}
                    </p>
                    <h2 className="text-xl font-black text-black leading-tight">
                      {jobDetail.title || "Untitled Role"}
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-0.5">
                      {jobDetail.companyName || jobDetail.company || "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => setJobDetail(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <MapPin size={13} />,
                      label: "Location",
                      value: jobDetail.location,
                    },
                    {
                      icon: <Globe size={13} />,
                      label: "Target Market",
                      value: jobDetail.targetCountry,
                    },
                    {
                      icon: <Briefcase size={13} />,
                      label: "Job Type",
                      value: jobDetail.type || jobDetail.jobType,
                    },
                    {
                      icon: <Users size={13} />,
                      label: "Experience Level",
                      value: jobDetail.experienceLevel,
                    },
                    {
                      icon: <Building2Icon size={13} />,
                      label: "Department",
                      value: jobDetail.department,
                    },
                    {
                      icon: <Building2Icon size={13} />,
                      label: "Industry",
                      value: jobDetail.industry,
                    },
                    {
                      icon: <Users size={13} />,
                      label: "Vacancies",
                      value: jobDetail.vacancies,
                    },
                    {
                      icon: <Clock size={13} />,
                      label: "Hiring Urgency",
                      value: jobDetail.urgency,
                    },
                    {
                      icon: <Calendar size={13} />,
                      label: "Job Start Date",
                      value: jobDetail.jobStartDate,
                    },
                    {
                      icon: <Calendar size={13} />,
                      label: "Application Deadline",
                      value: jobDetail.applicationDeadline,
                    },
                    {
                      icon: <Banknote size={13} />,
                      label: "Compensation",
                      value: formatSalary(jobDetail),
                    },
                    {
                      icon: <Globe size={13} />,
                      label: "Posting Language",
                      value: jobDetail.language,
                    },
                  ]
                    .filter((i) => i.value !== undefined && i.value !== "")
                    .map(({ icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <span className="text-slate-400 shrink-0">{icon}</span>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                            {label}
                          </p>
                          <p className="text-sm font-black text-black truncate">
                            {String(value)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
                {jobDetail.perks?.length > 0 && (
                  <div className="px-6 pb-5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Perks & Benefits
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {jobDetail.perks.map((p) => (
                        <span
                          key={p}
                          className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {jobDetail.description && (
                  <div className="px-6 pb-5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Description
                    </p>
                    <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {jobDetail.description}
                    </p>
                  </div>
                )}
                {jobDetail.requirements && (
                  <div className="px-6 pb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Requirements
                    </p>
                    <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {jobDetail.requirements}
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
