"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Plus,
  MapPin,
  Clock,
  Users,
  ChevronDown,
  X,
  Star,
  Trash2,
  FileEdit,
  Pencil,
  Search,
  Briefcase,
  TrendingUp,
  Eye,
  Filter,
  Globe,
  Building2,
  DollarSign,
  Zap,
  Hash,
  Languages,
  CalendarCheck,
  CalendarX,
} from "lucide-react";

const STATUS_OPTIONS = ["Draft", "Open", "Paused", "Closed"];
const STATUS_CONFIG = {
  Draft: {
    dot: "bg-slate-400",
    text: "text-slate-500",
    pill: "bg-slate-100 text-slate-600",
  },
  Open: {
    dot: "bg-emerald-400",
    text: "text-emerald-600",
    pill: "bg-emerald-50 text-emerald-700",
  },
  Paused: {
    dot: "bg-amber-400",
    text: "text-amber-600",
    pill: "bg-amber-50 text-amber-700",
  },
  Closed: {
    dot: "bg-rose-400",
    text: "text-rose-500",
    pill: "bg-rose-50 text-rose-600",
  },
};
const TABS = ["All", "Open", "Paused", "Closed", "Draft"];

const getInfoFields = (job, salary) => {
  const location = job.location || "—";
  return [
    { label: "Location", value: location, icon: MapPin },
    { label: "Job Type", value: job.type || job.jobType || "—", icon: Clock },
    { label: "Work Type", value: job.workType || "—", icon: Building2 },
    { label: "Applicants", value: job.applicants || 0, icon: Users },
    { label: "Vacancies", value: job.vacancies || "—", icon: Hash },
    {
      label: "Experience",
      value: job.experienceLevel || "—",
      icon: Briefcase,
    },
    { label: "Department", value: job.department || "—", icon: Building2 },
    { label: "Industry", value: job.industry || "—", icon: TrendingUp },
    { label: "Urgency", value: job.urgency || "—", icon: Zap },
    {
      label: "Target Country",
      value: job.targetCountry || "—",
      icon: Globe,
    },
    { label: "Language", value: job.language || "—", icon: Languages },
    { label: "Compensation", value: salary, icon: DollarSign },
    {
      label: "Posted",
      value: job.createdAt
        ? new Date(job.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "—",
      icon: TrendingUp,
    },
    ...(job.applicationDeadline
      ? [
          {
            label: "Deadline",
            value: new Date(job.applicationDeadline).toLocaleDateString(
              "en-IN",
              { day: "numeric", month: "short", year: "numeric" },
            ),
            icon: CalendarX,
          },
        ]
      : []),
    ...(job.jobStartDate
      ? [
          {
            label: "Start Date",
            value: new Date(job.jobStartDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            icon: CalendarCheck,
          },
        ]
      : []),
  ];
};

export default function PostedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [titleSearch, setTitleSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [sheetJob, setSheetJob] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "jobs"),
          where("employerUid", "==", user.uid),
        );
        const snap = await getDocs(q);
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setJobs(loaded);
        if (loaded.length > 0) setSelectedJob(loaded[0]);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
  document.body.style.overflow = sheetJob ? "hidden" : "";
  return () => {
    document.body.style.overflow = "";
  };
}, [sheetJob]);

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "jobs", deleteConfirm));
      setJobs((prev) => prev.filter((j) => j.id !== deleteConfirm));
      if (selectedJob?.id === deleteConfirm) setSelectedJob(null);
      if (sheetJob?.id === deleteConfirm) setSheetJob(null);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await updateDoc(doc(db, "jobs", jobId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(newStatus === "Open"
          ? { publishedAt: new Date().toISOString() }
          : {}),
      });
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)),
      );
      if (selectedJob?.id === jobId)
        setSelectedJob((p) => ({ ...p, status: newStatus }));
      if (sheetJob?.id === jobId)
        setSheetJob((p) => ({ ...p, status: newStatus }));
      setStatusDropdown(null);
    } catch (err) {
      console.error(err);
    }
  };

  const countByStatus = (status) =>
    jobs.filter((j) => j.status === status).length;

  const filtered = jobs.filter((job) => {
    const matchTab = activeTab === "All" || job.status === activeTab;
    const matchTitle = job.title
      ?.toLowerCase()
      .includes(titleSearch.toLowerCase());
    const matchLocation = job.location
      ?.toLowerCase()
      .includes(locationSearch.toLowerCase());
    const matchStarred = !starredOnly || job.starred === true;
    const matchDate = (() => {
      if (!dateFilter || !job.createdAt) return true;
      const diff =
        (new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24);
      if (dateFilter === "Today") return diff < 1;
      if (dateFilter === "Last 7 days") return diff <= 7;
      if (dateFilter === "Last 30 days") return diff <= 30;
      return true;
    })();
    return matchTab && matchTitle && matchLocation && matchStarred && matchDate;
  });

  const handleFilterOpen = (name, btnEl, dropdownWidth) => {
    if (openFilter === name) {
      setOpenFilter(null);
      return;
    }
    if (btnEl) {
      const rect = btnEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const spaceRight = viewportWidth - rect.left;
      setDropdownStyle(
        spaceRight < dropdownWidth
          ? {
              position: "fixed",
              top: rect.bottom + 8,
              right: viewportWidth - rect.right,
              left: "auto",
            }
          : {
              position: "fixed",
              top: rect.bottom + 8,
              left: rect.left,
              right: "auto",
            },
      );
    }
    setOpenFilter(name);
  };

  const closeAll = () => setOpenFilter(null);
  const clearFilters = () => {
    setTitleSearch("");
    setLocationSearch("");
    setDateFilter("");
    setStarredOnly(false);
  };

  const hasFilters = titleSearch || locationSearch || dateFilter || starredOnly;
  const openCount = countByStatus("Open");
  const totalApplicants = jobs.reduce((s, j) => s + (j.applicants || 0), 0);
  const draftCount = countByStatus("Draft");

  const formatSalary = (job) => {
    const sym = job.currencies?.[0] || "₹";
    if (job.payStructure === "Negotiable") return "Negotiable";
    if (job.payStructure === "Salary Range" && job.salaryMin && job.salaryMax)
      return `${sym} ${Number(job.salaryMin).toLocaleString()} – ${Number(job.salaryMax).toLocaleString()}`;
    if (job.payStructure === "Fixed" && job.fixedSalary)
      return `${sym} ${Number(job.fixedSalary).toLocaleString()} / yr`;
    if (job.payStructure === "Hourly" && job.hourlyRate)
      return `${sym} ${job.hourlyRate} / hr`;
    return "—";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#e8eaed]">
        <div className="w-7 h-7 border-[3px] border-slate-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="px-4 sm:px-8 py-8 bg-[#e8eaed] min-h-screen"
      style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}
    >
      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Posted Jobs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            {jobs.length > 0
              ? `${filtered.length} of ${jobs.length} jobs`
              : "No jobs posted yet"}
          </p>
        </div>
        <Link
          href="/employer/dashboard/create-job"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-slate-400/30 no-underline"
        >
          <Plus size={15} strokeWidth={2.5} />
          Post a Job
        </Link>
      </div>

      {jobs.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-7">
          {[
            { label: "Active Jobs", value: openCount, icon: Briefcase },
            {
              label: "Total Applicants",
              value: totalApplicants,
              icon: Users,
            },
            { label: "Drafts", value: draftCount, icon: FileEdit },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-white rounded-2xl px-4 py-4 border border-slate-200/80 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">
                  {label}
                </span>
                <Icon size={15} className="text-slate-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div
        className="flex items-center gap-0.5 mb-6 border-b border-slate-300 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count = tab === "All" ? jobs.length : countByStatus(tab);
          const cfg = STATUS_CONFIG[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all -mb-px ${
                isActive
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {cfg?.dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              )}
              {tab}
              {count > 0 && (
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        className="flex items-center gap-3 mb-6 overflow-x-auto pb-0.5"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="relative shrink-0">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search title…"
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400 w-44 placeholder:font-normal placeholder:text-slate-400"
          />
        </div>
        <div className="relative shrink-0">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Location…"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400 w-40 placeholder:font-normal placeholder:text-slate-400"
          />
        </div>
        <button
          onClick={(e) => handleFilterOpen("date", e.currentTarget, 176)}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-bold transition-all ${
            openFilter === "date" || !!dateFilter
              ? "border-slate-700 text-slate-900 bg-slate-200"
              : "border-slate-200 text-slate-600 bg-white hover:border-slate-300"
          }`}
        >
          <Filter size={12} />
          {dateFilter || "Date"}
          <ChevronDown
            size={12}
            className={
              openFilter === "date"
                ? "rotate-180 transition-transform"
                : "transition-transform"
            }
          />
        </button>
        <button
          onClick={() => setStarredOnly((p) => !p)}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-bold transition-all ${
            starredOnly
              ? "border-yellow-400 text-yellow-600 bg-yellow-50"
              : "border-slate-200 text-slate-600 bg-white hover:border-slate-300"
          }`}
        >
          <Star
            size={12}
            className={
              starredOnly ? "fill-yellow-400 text-yellow-400" : "text-slate-400"
            }
          />
          Starred
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}
        <span className="shrink-0 text-sm font-semibold text-slate-400 ml-auto">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {openFilter === "date" && (
        <div
          className="z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-2 w-44"
          style={dropdownStyle}
        >
          {["Today", "Last 7 days", "Last 30 days"].map((d) => (
            <label
              key={d}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="radio"
                name="date"
                checked={dateFilter === d}
                onChange={() => {
                  setDateFilter(d);
                  closeAll();
                }}
                className="w-3.5 h-3.5 accent-slate-800"
              />
              <span className="text-sm font-semibold text-slate-700">{d}</span>
            </label>
          ))}
          {dateFilter && (
            <button
              onClick={() => {
                setDateFilter("");
                closeAll();
              }}
              className="w-full mt-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Clear date filter
            </button>
          )}
        </div>
      )}

      {(openFilter || statusDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            closeAll();
            setStatusDropdown(null);
          }}
        />
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-24 px-6 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
            <Briefcase size={28} className="text-slate-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
            Post your first job
          </h2>
          <p className="text-sm text-slate-500 max-w-xs mb-7 leading-relaxed font-medium">
            Reach thousands of qualified candidates. Post a job and start
            receiving applications today.
          </p>
          <Link
            href="/employer/dashboard/create-job"
            className="inline-flex items-center gap-2 px-7 py-3 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-slate-400/30 no-underline"
          >
            <Plus size={16} /> Post a Job
          </Link>
        </div>
      ) : (
        <div className="flex gap-4 lg:h-[calc(100vh-320px)] lg:min-h-96">
          <div className="w-full lg:w-90 shrink-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Jobs
              </span>
              <span className="text-xs font-bold text-slate-400">
                {filtered.length} shown
              </span>
            </div>
            {filtered.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center px-6 py-16">
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-1">
                    No jobs found
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    Try clearing your filters
                  </p>
                </div>
              </div>
            ) : (
              <div className="lg:flex-1 lg:overflow-y-auto divide-y divide-slate-100">
                {filtered.map((job) => {
                  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Draft;
                  const isSelected = selectedJob?.id === job.id;
                  return (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job);
                        setSheetJob(job);
                      }}
                      className={`px-4 py-4 cursor-pointer transition-all group border-l-2 ${
                        isSelected
                          ? "bg-slate-100 border-l-slate-900"
                          : "hover:bg-slate-50 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-slate-200"
                                : "bg-slate-100 group-hover:bg-slate-200"
                            }`}
                          >
                            <Briefcase size={15} className="text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold truncate leading-tight text-slate-900">
                              {job.title || (
                                <span className="italic font-normal text-slate-400">
                                  Untitled
                                </span>
                              )}
                            </h3>
                            {job.location && (
                              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-0.5 mt-0.5">
                                <MapPin size={9} />
                                {job.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {job.starred && (
                            <Star
                              size={11}
                              className="fill-yellow-400 text-yellow-400"
                            />
                          )}
                          <span
                            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.pill}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                            />
                            {job.status}
                          </span>
                        </div>
                      </div>
                      <div className="lg:hidden flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                        {job.status === "Draft" ? (
                          <Link
                            href={`/employer/dashboard/create-job?draftId=${job.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-black transition-colors no-underline shadow-sm"
                          >
                            <FileEdit size={13} /> Continue Editing
                          </Link>
                        ) : (
                          <Link
                            href={`/employer/dashboard/create-job?draftId=${job.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors no-underline"
                          >
                            <Pencil size={13} /> Edit Job
                          </Link>
                        )}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (statusDropdown === job.id) {
                                setStatusDropdown(null);
                                return;
                              }
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              setDropdownStyle({
                                position: "fixed",
                                bottom: window.innerHeight - rect.top + 8,
                                left: rect.left,
                                right: "auto",
                                top: "auto",
                              });
                              setStatusDropdown(job.id);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${cfg.pill}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                            />
                            {job.status}
                            <ChevronDown
                              size={10}
                              className={
                                statusDropdown === job.id
                                  ? "rotate-180 transition-transform"
                                  : "transition-transform"
                              }
                            />
                          </button>
                          {statusDropdown === job.id && (
                            <div
                              className="z-999 bg-white rounded-xl shadow-2xl border border-slate-200 p-1.5 min-w-36"
                              style={dropdownStyle}
                            >
                              {STATUS_OPTIONS.filter(
                                (s) => s !== job.status,
                              ).map((s) => {
                                const sc = STATUS_CONFIG[s];
                                return (
                                  <button
                                    key={s}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(job.id, s);
                                    }}
                                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold rounded-lg transition-colors mb-0.5 ${sc.pill} hover:opacity-80`}
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${sc.dot}`}
                                    />
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(job.id);
                          }}
                          className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors border border-slate-200"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 font-medium ml-12 mt-1">
                        {job.type && (
                          <span className="flex items-center gap-0.5">
                            <Clock size={9} />
                            {job.type}
                          </span>
                        )}
                        {job.applicants > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Users size={9} />
                            {job.applicants} applicants
                          </span>
                        )}
                        {job.createdAt && (
                          <span>
                            {new Date(job.createdAt).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short" },
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden lg:flex flex-1 flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {!selectedJob ? (
              <div className="flex-1 flex items-center justify-center text-center px-6">
                <div>
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Eye size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">
                    Select a job to view details
                  </p>
                </div>
              </div>
            ) : (
              (() => {
                const job = selectedJob;
                const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Draft;
                const location = job.location || "—";
                const salary = formatSalary(job);
                const infoFields = getInfoFields(job, salary);
                return (
                  <>
                    <div className="px-6 py-5 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                            <Briefcase size={22} className="text-slate-500" />
                          </div>
                          <div>
                            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                              {job.title || (
                                <span className="italic font-normal text-slate-400">
                                  Untitled Draft
                                </span>
                              )}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium mt-0.5">
                              {[job.type || job.jobType, location]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusDropdown(
                                  statusDropdown === job.id ? null : job.id,
                                );
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${cfg.pill}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                              />
                              {job.status}
                              <ChevronDown
                                size={11}
                                className={
                                  statusDropdown === job.id
                                    ? "rotate-180 transition-transform"
                                    : "transition-transform"
                                }
                              />
                            </button>
                            {statusDropdown === job.id && (
                              <div className="absolute right-0 top-10 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 min-w-32">
                                {STATUS_OPTIONS.filter(
                                  (s) => s !== job.status,
                                ).map((s) => {
                                  const sc = STATUS_CONFIG[s];
                                  return (
                                    <button
                                      key={s}
                                      onClick={() =>
                                        handleStatusChange(job.id, s)
                                      }
                                      className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors mb-0.5 ${sc.pill} hover:opacity-80`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                                      />
                                      {s}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          {job.status === "Draft" ? (
                            <Link
                              href={`/employer/dashboard/create-job?draftId=${job.id}`}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-black transition-colors no-underline shadow-sm"
                            >
                              <FileEdit size={13} /> Continue
                            </Link>
                          ) : (
                            <Link
                              href={`/employer/dashboard/create-job?draftId=${job.id}`}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors no-underline"
                            >
                              <Pencil size={13} /> Edit
                            </Link>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(job.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors border border-slate-200"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {infoFields.map(({ label, value, icon: Icon }) => (
                          <div
                            key={label}
                            className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <Icon size={11} className="text-slate-400" />
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                                {label}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-800">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                      {job.perks?.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Perks & Benefits
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {job.perks.map((p) => (
                              <span
                                key={p}
                                className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {job.description && (
                        <div className="mb-5">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Description
                          </h4>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                            {job.description}
                          </p>
                        </div>
                      )}
                      {job.requirements && (
                        <div className="mb-5">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Requirements
                          </h4>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                            {job.requirements}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
              <Trash2 size={18} className="text-rose-500" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">
              Delete this job?
            </h2>
            <p className="text-sm font-medium text-slate-500 mb-5 leading-relaxed">
              This is permanent and cannot be undone. All applicant data will
              also be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirmed}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-60 shadow-sm shadow-rose-200"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {sheetJob && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSheetJob(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>
            <div className="px-5 pb-3 flex items-start justify-between border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {sheetJob.title || (
                    <span className="italic font-normal text-slate-400">
                      Untitled
                    </span>
                  )}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                  <MapPin size={11} />
                  {sheetJob.location || "—"}
                </p>
              </div>
              <button
                onClick={() => setSheetJob(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 shrink-0"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3 mb-5">
                {getInfoFields(sheetJob, formatSalary(sheetJob)).map(
                  ({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={11} className="text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                          {label}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {value}
                      </p>
                    </div>
                  ),
                )}
              </div>
              {sheetJob.perks?.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Perks & Benefits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sheetJob.perks.map((p) => (
                      <span
                        key={p}
                        className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {sheetJob.description && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                    {sheetJob.description}
                  </p>
                </div>
              )}
              {sheetJob.requirements && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Requirements
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                    {sheetJob.requirements}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {sheetJob.status === "Draft" ? (
                  <Link
                    href={`/employer/dashboard/create-job?draftId=${sheetJob.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black transition-colors no-underline shadow-sm"
                  >
                    <FileEdit size={14} /> Continue Editing
                  </Link>
                ) : (
                  <Link
                    href={`/employer/dashboard/create-job?draftId=${sheetJob.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors no-underline"
                  >
                    <Pencil size={14} /> Edit Job
                  </Link>
                )}
                <button
                  onClick={() => {
                    setDeleteConfirm(sheetJob.id);
                    setSheetJob(null);
                  }}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors border border-slate-200 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
