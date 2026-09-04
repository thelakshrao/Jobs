"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";
import AdminSidebar, {
  getStoredSidebarCollapsed,
  TOGGLE_EVENT,
} from "@/adminComponents/AdminSidebar";
import {
  Briefcase,
  Users,
  Building2,
  FileEdit,
  UserPlus,
  Plus,
  Clock,
  X,
  ArrowRight,
  Search,
  CalendarDays,
  SearchX,
} from "lucide-react";

const BRAND = "#003882";
const BRAND_TINT = "#eaf1fb";

const STATUS_PILL = {
  Open: "bg-emerald-50 text-emerald-700",
  Active: "bg-emerald-50 text-emerald-700",
  Paused: "bg-amber-50 text-amber-700",
  Closed: "bg-rose-50 text-rose-600",
  Draft: "bg-slate-100 text-slate-600",
};

const ACTIVITY_FETCH_LIMIT = 30;
const ACTIVITY_CARD_LIMIT = 10;

function timeAgo(dateInput) {
  if (!dateInput) return "";
  const date =
    typeof dateInput?.toDate === "function"
      ? dateInput.toDate()
      : new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function eventTimeMs(time) {
  return typeof time?.toDate === "function"
    ? time.toDate().getTime()
    : new Date(time).getTime();
}

function ActivityIcon({ type }) {
  const isJob = type === "job";
  return (
    <div
      className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 z-10 bg-white"
      style={{ boxShadow: `0 0 0 1px ${BRAND_TINT}` }}
    >
      <div
        className="w-full h-full rounded-xl flex items-center justify-center"
        style={{ backgroundColor: BRAND_TINT }}
      >
        {isJob ? (
          <Briefcase size={14} style={{ color: BRAND }} />
        ) : (
          <UserPlus size={14} style={{ color: BRAND }} />
        )}
      </div>
      {isJob && (
        <span
          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center ring-2 ring-white"
          style={{ backgroundColor: BRAND }}
        >
          <Plus size={8} strokeWidth={3} className="text-white" />
        </span>
      )}
    </div>
  );
}

function ActivityRow({ event, showConnector }) {
  return (
    <div className="relative px-5 py-4 flex gap-3">
      {showConnector && (
        <span
          className="absolute left-9.5 top-13 bottom-0 w-px"
          style={{ backgroundColor: "#e2e8f0" }}
        />
      )}
      <ActivityIcon type={event.type} />
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-slate-700 leading-snug">
          {event.text}
        </p>
        <p className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
          <Clock size={10} />
          {timeAgo(event.time)}
        </p>
      </div>
    </div>
  );
}

function ActivityModal({ events, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-extrabold text-slate-900">
            All Activity
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="divide-y divide-slate-100 overflow-y-auto">
          {events.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 font-medium">
              No activity yet.
            </div>
          ) : (
            events.map((event, i) => (
              <ActivityRow
                key={`${event.type}-${event.id}`}
                event={event}
                showConnector={i < events.length - 1}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [staffData, setStaffData] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    totalEmployers: 0,
    draftJobs: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setCollapsed(getStoredSidebarCollapsed());
    const handler = () => setCollapsed(getStoredSidebarCollapsed());
    window.addEventListener(TOGGLE_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_EVENT, handler);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/admin");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "admin_staff", user.uid));
        if (!snap.exists() || snap.data().status !== "active") {
          await signOut(auth);
          router.replace("/admin");
          return;
        }
        setStaffData(snap.data());
        setChecking(false);
      } catch (err) {
        console.error(err);
        router.replace("/admin");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (checking) return;

    const loadData = async () => {
      setLoadingStats(true);
      try {
        const jobsCol = collection(db, "jobs");
        const employersCol = collection(db, "employers");
        const applicationsCol = collection(db, "applications");

        const [
          jobsCountSnap,
          employersCountSnap,
          applicantsCountSnap,
          draftCountSnap,
        ] = await Promise.all([
          getCountFromServer(jobsCol),
          getCountFromServer(employersCol),
          getCountFromServer(applicationsCol),
          getCountFromServer(query(jobsCol, where("status", "==", "Draft"))),
        ]);

        setStats({
          totalJobs: jobsCountSnap.data().count,
          totalEmployers: employersCountSnap.data().count,
          totalApplicants: applicantsCountSnap.data().count,
          draftJobs: draftCountSnap.data().count,
        });

        const recentJobsQ = query(
          jobsCol,
          orderBy("createdAt", "desc"),
          limit(8),
        );
        const recentJobsSnap = await getDocs(recentJobsQ);
        const recentJobsLoaded = recentJobsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const today = new Date().toISOString().split("T")[0];
        const expiredRecent = recentJobsLoaded.filter(
          (job) =>
            job.status === "Open" &&
            job.applicationDeadline &&
            job.applicationDeadline < today,
        );
        if (expiredRecent.length > 0) {
          await Promise.all(
            expiredRecent.map((job) =>
              updateDoc(doc(db, "jobs", job.id), {
                status: "Closed",
                updatedAt: new Date().toISOString(),
              }),
            ),
          );
        }
        setRecentJobs(
          recentJobsLoaded.map((job) =>
            expiredRecent.some((ej) => ej.id === job.id)
              ? { ...job, status: "Closed" }
              : job,
          ),
        );

        const recentAppsQ = query(
          applicationsCol,
          orderBy("appliedAt", "desc"),
          limit(ACTIVITY_FETCH_LIMIT),
        );
        const recentAppsSnap = await getDocs(recentAppsQ);
        const appEvents = recentAppsSnap.docs.map((d) => {
          const data = d.data();
          return {
            type: "application",
            id: d.id,
            text: `${data.applicantName || "Someone"} applied to ${
              data.jobTitle || "a job"
            } at ${data.companyName || "a company"}`,
            time: data.appliedAt,
          };
        });

        const jobPostEventsQ = query(
          jobsCol,
          orderBy("createdAt", "desc"),
          limit(ACTIVITY_FETCH_LIMIT),
        );
        const jobPostSnap = await getDocs(jobPostEventsQ);
        const jobEvents = jobPostSnap.docs.map((d) => {
          const data = d.data();
          return {
            type: "job",
            id: d.id,
            text: `${data.companyName || "An employer"} posted a new job: ${
              data.title || "Untitled"
            }`,
            time: data.createdAt,
          };
        });

        const merged = [...appEvents, ...jobEvents]
          .filter((e) => e.time)
          .sort((a, b) => eventTimeMs(b.time) - eventTimeMs(a.time))
          .slice(0, ACTIVITY_FETCH_LIMIT);

        setRecentActivity(merged);
      } catch (err) {
        console.error("Error loading admin dashboard data:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadData();
  }, [checking]);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [],
  );

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return recentJobs;
    return recentJobs.filter((job) =>
      [job.title, job.companyName, job.department]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term)),
    );
  }, [recentJobs, search]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Jobs",
      value: stats.totalJobs,
      icon: Briefcase,
      note: "across all employers",
    },
    {
      label: "Total Applicants",
      value: stats.totalApplicants,
      icon: Users,
      note: "all applications",
    },
    {
      label: "Total Employers",
      value: stats.totalEmployers,
      icon: Building2,
      note: "registered companies",
    },
    {
      label: "Draft Jobs",
      value: stats.draftJobs,
      icon: FileEdit,
      note: "not yet published",
    },
  ];

  const activityForCard = recentActivity.slice(0, ACTIVITY_CARD_LIMIT);

  return (
    <>
      <AdminSidebar />
      <main
        className={`pt-14 md:pt-0 min-h-screen bg-[#e8eaed] transition-all duration-200 ${
          collapsed ? "md:ml-20" : "md:ml-60"
        }`}
      >
        <div className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recent jobs..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition"
                style={{ "--tw-ring-color": `${BRAND}33` }}
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2.5 whitespace-nowrap">
                <CalendarDays size={14} />
                {todayLabel}
              </div>
            </div>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-[#003882] tracking-tight">
              Welcome back, {staffData?.name?.split(" ")[0] || "Admin"}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              Here's what's happening with your job portal today.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {statCards.map(({ label, value, icon: Icon, note }) => (
              <div
                key={label}
                className="bg-white rounded-2xl px-4 sm:px-5 py-4 sm:py-5 border border-slate-200/80 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: BRAND_TINT }}
                  >
                    <Icon size={16} style={{ color: BRAND }} />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
                  {loadingStats ? "—" : value.toLocaleString()}
                </p>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {label}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">{note}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <h2 className="text-sm font-extrabold text-slate-900 whitespace-nowrap">
                  Recent Job Listings
                </h2>
                {search && (
                  <span className="text-[11px] font-semibold text-slate-400 truncate">
                    {filteredJobs.length} match
                    {filteredJobs.length === 1 ? "" : "es"} for "{search}"
                  </span>
                )}
              </div>
              {loadingStats ? (
                <div className="p-8 text-center text-sm text-slate-400 font-medium">
                  Loading…
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400 font-medium">
                  No jobs posted yet.
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="p-8 flex flex-col items-center text-center gap-2">
                  <SearchX size={20} className="text-slate-300" />
                  <p className="text-sm text-slate-400 font-medium">
                    No jobs match "{search}".
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        <th className="px-5 py-3">Job Title</th>
                        <th className="px-5 py-3">Employer</th>
                        <th className="px-5 py-3 hidden sm:table-cell">
                          Department
                        </th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Applicants</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredJobs.map((job) => (
                        <tr
                          key={job.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                            {job.title || "Untitled"}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 font-medium whitespace-nowrap">
                            {job.companyName || "—"}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 font-medium hidden sm:table-cell whitespace-nowrap">
                            {job.department || "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                                STATUS_PILL[job.status] ||
                                "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {job.status || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 font-medium">
                            {job.applicants || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-auto px-5 py-3 border-t border-slate-100">
                <button
                  onClick={() => router.push("/admin/dashboard/jobs")}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                  style={{ color: BRAND }}
                >
                  See all jobs
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-extrabold text-slate-900">
                  Recent Activity
                </h2>
              </div>
              {loadingStats ? (
                <div className="p-8 text-center text-sm text-slate-400 font-medium">
                  Loading…
                </div>
              ) : activityForCard.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400 font-medium">
                  No recent activity.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-105 overflow-y-auto">
                  {activityForCard.map((event, i) => (
                    <ActivityRow
                      key={`${event.type}-${event.id}`}
                      event={event}
                      showConnector={i < activityForCard.length - 1}
                    />
                  ))}
                </div>
              )}
              <div className="mt-auto px-5 py-3 border-t border-slate-100">
                <button
                  onClick={() => setShowActivityModal(true)}
                  disabled={recentActivity.length === 0}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: BRAND }}
                >
                  See all activity
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showActivityModal && (
        <ActivityModal
          events={recentActivity}
          onClose={() => setShowActivityModal(false)}
        />
      )}
    </>
  );
}
