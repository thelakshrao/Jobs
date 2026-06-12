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
} from "lucide-react";

const STATUS_COLORS = {
  Applied: { bg: "#f1f5f9", text: "#0f172a", border: "#cbd5e1" },
  Shortlisted: { bg: "#f1f5f9", text: "#0f172a", border: "#cbd5e1" },
  Rejected: { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" },
  Hired: { bg: "#0f172a", text: "#ffffff", border: "#0f172a" },
};

export default function EmployerApplicantsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
          ),
        );
        let apps = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (apps.length === 0) {
          const companyName = empDoc.data().company || "";
          if (companyName) {
            const snap2 = await getDocs(
              query(
                collection(db, "applications"),
                where("companyName", "==", companyName),
              ),
            );
            apps = snap2.docs.map((d) => ({ id: d.id, ...d.data() }));
          }
        }
        apps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setApplications(apps);
        // group by job, select first job
        if (apps.length > 0) {
          const firstJob = apps[0].jobTitle;
          setSelectedJob(firstJob);
          setSelectedApp(apps[0]);
        }
      } catch (err) {
        console.error("Applicants fetch error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const updateStatus = async (appId, status) => {
    setUpdatingStatus(true);
    try {
      await updateDoc(doc(db, "applications", appId), { status });
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
    const diff = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
    if (diff < 1) return "Today";
    if (diff < 2) return "1d ago";
    if (diff < 7) return `${Math.floor(diff)}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  // unique jobs
  const jobs = [...new Map(applications.map((a) => [a.jobTitle, a])).values()];
  const jobApplicants = applications.filter((a) => a.jobTitle === selectedJob);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <EmployerSidebar />
      <DashboardNavbar />
      <main className="md:ml-64 pt-14 pb-16 md:pb-0 min-h-screen bg-[#f8fafc]">
        <div className="pt-5 pb-10 px-4 sm:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900">Applicants</h1>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">
              {loading
                ? "Loading…"
                : `${applications.length} application${applications.length !== 1 ? "s" : ""} received`}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-7 h-7 border-[3px] border-slate-300 border-t-slate-800 rounded-full animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-24 px-6 text-center">
              <User size={40} className="text-slate-200 mb-4" />
              <p className="text-lg font-black text-slate-800 mb-1">
                No applicants yet
              </p>
              <p className="text-sm font-semibold text-slate-400">
                Applications will appear here when candidates apply.
              </p>
            </div>
          ) : (
            <div className="flex gap-0 items-start h-[calc(100vh-140px)]">
              {/* Col 1 — Jobs */}
              <div className="w-56 shrink-0 flex flex-col gap-1 h-full overflow-y-auto pr-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Jobs
                </p>
                {jobs.map((job) => {
                  const count = applications.filter(
                    (a) => a.jobTitle === job.jobTitle,
                  ).length;
                  const active = selectedJob === job.jobTitle;
                  return (
                    <button
                      key={job.jobTitle}
                      onClick={() => {
                        setSelectedJob(job.jobTitle);
                        setSelectedApp(null);
                      }}
                      className="w-full text-left px-3 py-3 rounded-xl transition-all"
                      style={{
                        backgroundColor: active ? "#0f172a" : "#ffffff",
                        border: `1.5px solid ${active ? "#0f172a" : "#e2e8f0"}`,
                      }}
                    >
                      <p
                        className={`text-sm font-black truncate ${active ? "text-white" : "text-slate-900"}`}
                      >
                        {job.jobTitle}
                      </p>
                      <p
                        className={`text-xs font-bold mt-0.5 ${active ? "text-slate-300" : "text-slate-400"}`}
                      >
                        {count} applicant{count !== 1 ? "s" : ""}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Col 2 — Applicants for selected job */}
              <div className="w-64 shrink-0 flex flex-col gap-1 h-full overflow-y-auto px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  {selectedJob || "Select a job"}
                </p>
                {jobApplicants.map((app) => {
                  const sc = STATUS_COLORS[app.status] || STATUS_COLORS.Applied;
                  const active = selectedApp?.id === app.id;
                  return (
                    <button
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="w-full text-left px-3 py-3 rounded-xl transition-all"
                      style={{
                        backgroundColor: active ? "#f1f5f9" : "#ffffff",
                        border: `1.5px solid ${active ? "#94a3b8" : "#e2e8f0"}`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-black text-slate-900 truncate">
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
                          {app.status}
                        </span>
                      </div>
                      {app.applicantLocation && (
                        <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-1 truncate">
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

              {/* Col 3 — Detail */}
              <div className="flex-1 min-w-0 h-full overflow-y-auto pl-2">
                {selectedApp ? (
                  <div
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                    style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}
                  >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-2xl font-black text-slate-900">
                            {selectedApp.applicantName || "Applicant"}
                          </h2>
                          <p className="text-sm font-bold text-slate-500 mt-0.5">
                            Applied for{" "}
                            <span className="text-slate-900">
                              {selectedApp.jobTitle}
                            </span>
                          </p>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">
                            {timeAgo(selectedApp.appliedAt)}
                          </p>
                        </div>
                        {selectedApp.applicantSlug && (
                          <a
                            href={`/dashboard/${selectedApp.applicantSlug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                          >
                            View Profile <ExternalLink size={11} />
                          </a>
                        )}
                      </div>

                      {/* Status buttons */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {["Applied", "Shortlisted", "Rejected", "Hired"].map(
                          (s) => {
                            const active = selectedApp.status === s;
                            return (
                              <button
                                key={s}
                                onClick={() => updateStatus(selectedApp.id, s)}
                                disabled={updatingStatus}
                                className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl border transition-all disabled:opacity-50"
                                style={{
                                  backgroundColor: active
                                    ? "#0f172a"
                                    : "#f8fafc",
                                  color: active ? "#ffffff" : "#475569",
                                  borderColor: active ? "#0f172a" : "#e2e8f0",
                                }}
                              >
                                {active && <Check size={11} />}
                                {s}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* Body — compact horizontal layout */}
                    <div className="px-6 py-4 grid grid-cols-2 gap-4">
                      {/* Contact */}
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Contact
                        </p>
                        <div className="flex flex-col gap-1.5">
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
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100"
                              >
                                <span className="text-slate-400 shrink-0">
                                  {icon}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                                    {label}
                                  </p>
                                  <p className="text-sm font-black text-slate-900 truncate">
                                    {value}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Resume + Experience */}
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
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <FileText
                                  size={16}
                                  className="text-slate-600"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900">
                                  View Resume
                                </p>
                                <p className="text-xs font-semibold text-slate-400">
                                  Click to open
                                </p>
                              </div>
                              <ExternalLink
                                size={13}
                                className="text-slate-400"
                              />
                            </a>
                          </div>
                        )}

                        {(selectedApp.lastCompany ||
                          selectedApp.lastJobTitle) && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                              Experience
                            </p>
                            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                                <Briefcase
                                  size={15}
                                  className="text-slate-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900">
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
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm font-bold text-slate-400">
                      Select an applicant to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
