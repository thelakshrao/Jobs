"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import AdminSidebar, {
  getStoredSidebarCollapsed,
  TOGGLE_EVENT,
} from "@/adminComponents/AdminSidebar";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const BRAND = "#003882";
const PAGE_SIZE = 8;

const STATUS_PILL = {
  Open: "bg-emerald-50 text-emerald-700",
  Active: "bg-emerald-50 text-emerald-700",
  Paused: "bg-amber-50 text-amber-700",
  Closed: "bg-rose-50 text-rose-600",
  Draft: "bg-slate-100 text-slate-600",
};

const STATUS_OPTIONS = ["All Status", "Open", "Draft", "Paused", "Closed"];

function formatDate(dateInput) {
  if (!dateInput) return "—";
  const date =
    typeof dateInput?.toDate === "function"
      ? dateInput.toDate()
      : new Date(dateInput);
  if (isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 10);
}

function dateMs(dateInput) {
  if (!dateInput) return 0;
  const date =
    typeof dateInput?.toDate === "function"
      ? dateInput.toDate()
      : new Date(dateInput);
  return isNaN(date.getTime()) ? 0 : date.getTime();
}

function SortHeader({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field;
  const Icon = !active
    ? ChevronsUpDown
    : sortDir === "asc"
      ? ChevronUp
      : ChevronDown;
  return (
    <th className="px-5 py-3">
      <button
        onClick={() => onSort(field)}
        className={`flex items-center gap-2.5 uppercase tracking-wide font-bold text-[11px] hover:text-slate-600 transition ${
          active ? "text-slate-700" : "text-slate-400"
        }`}
      >
        {label}
        <Icon size={12} />
      </button>
    </th>
  );
}

export default function AdminJobsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [deptFilter, setDeptFilter] = useState("All Categories");
  const [locationQuery, setLocationQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("All Job Types");
  const [workTypeFilter, setWorkTypeFilter] = useState("All Work Types");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

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
        setChecking(false);
      } catch (err) {
        console.error(err);
        router.replace("/admin");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const jobsQ = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
      const snap = await getDocs(jobsQ);
      const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const today = new Date().toISOString().split("T")[0];
      const expiredJobs = loaded.filter(
        (job) =>
          job.status === "Open" &&
          job.applicationDeadline &&
          job.applicationDeadline < today,
      );

      if (expiredJobs.length > 0) {
        await Promise.all(
          expiredJobs.map((job) =>
            updateDoc(doc(db, "jobs", job.id), {
              status: "Closed",
              updatedAt: new Date().toISOString(),
            }),
          ),
        );
      }

      const finalLoaded = loaded.map((job) =>
        expiredJobs.some((ej) => ej.id === job.id)
          ? { ...job, status: "Closed" }
          : job,
      );

      setJobs(finalLoaded);
    } catch (err) {
      console.error("Error loading jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checking) return;
    loadJobs();
  }, [checking]);

  const departments = useMemo(() => {
    const set = new Set(
      jobs.map((j) => j.department).filter((d) => d && d.trim()),
    );
    return ["All Categories", ...Array.from(set).sort()];
  }, [jobs]);

  const jobTypes = useMemo(() => {
    const set = new Set(
      jobs.map((j) => j.jobType).filter((v) => v && v.trim()),
    );
    return ["All Job Types", ...Array.from(set).sort()];
  }, [jobs]);

  const workTypes = useMemo(() => {
    const set = new Set(
      jobs.map((j) => j.workType).filter((v) => v && v.trim()),
    );
    return ["All Work Types", ...Array.from(set).sort()];
  }, [jobs]);

  const filtered = useMemo(() => {
    let rows = [...jobs];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (j) =>
          (j.title || "").toLowerCase().includes(q) ||
          (j.companyName || "").toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "All Status") {
      rows = rows.filter((j) => j.status === statusFilter);
    }

    if (deptFilter !== "All Categories") {
      rows = rows.filter((j) => j.department === deptFilter);
    }

    if (locationQuery.trim()) {
      const q = locationQuery.trim().toLowerCase();
      rows = rows.filter((j) => {
        const loc = (j.location || "").toLowerCase();
        const country = (j.targetCountry || "").toLowerCase();
        return loc.includes(q) || country.includes(q);
      });
    }

    if (jobTypeFilter !== "All Job Types") {
      rows = rows.filter((j) => j.jobType === jobTypeFilter);
    }

    if (workTypeFilter !== "All Work Types") {
      rows = rows.filter((j) => j.workType === workTypeFilter);
    }

    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = (a.title || "").localeCompare(b.title || "");
          break;
        case "companyName":
          cmp = (a.companyName || "").localeCompare(b.companyName || "");
          break;
        case "department":
          cmp = (a.department || "").localeCompare(b.department || "");
          break;
        case "status":
          cmp = (a.status || "").localeCompare(b.status || "");
          break;
        case "applicants":
          cmp = (a.applicants || 0) - (b.applicants || 0);
          break;
        case "createdAt":
        default:
          cmp = dateMs(a.createdAt) - dateMs(b.createdAt);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [
    jobs,
    search,
    statusFilter,
    deptFilter,
    locationQuery,
    jobTypeFilter,
    workTypeFilter,
    sortField,
    sortDir,
  ]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(
    (page - 1) * PAGE_SIZE,
    (page - 1) * PAGE_SIZE + PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    deptFilter,
    locationQuery,
    jobTypeFilter,
    workTypeFilter,
  ]);
  
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (pageRows.every((j) => selected.has(j.id))) {
      setSelected((prev) => {
        const next = new Set(prev);
        pageRows.forEach((j) => next.delete(j.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        pageRows.forEach((j) => next.add(j.id));
        return next;
      });
    }
  };

  const updateStatus = async (jobId, status) => {
    try {
      await updateDoc(doc(db, "jobs", jobId), { status });
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status } : j)),
      );
    } catch (err) {
      console.error("Error updating job status:", err);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job listing? This cannot be undone.")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "jobs", jobId));
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const [bulkWorking, setBulkWorking] = useState(false);
  const selectedIds = Array.from(selected);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedIds.length} job listing${
          selectedIds.length > 1 ? "s" : ""
        }? This cannot be undone.`,
      )
    ) {
      return;
    }
    setBulkWorking(true);
    try {
      await Promise.all(
        selectedIds.map((id) => deleteDoc(doc(db, "jobs", id))),
      );
      setJobs((prev) => prev.filter((j) => !selected.has(j.id)));
      setSelected(new Set());
    } catch (err) {
      console.error("Error bulk deleting jobs:", err);
    } finally {
      setBulkWorking(false);
    }
  };

  const handleBulkStatus = async (status) => {
    if (selectedIds.length === 0) return;
    setBulkWorking(true);
    try {
      await Promise.all(
        selectedIds.map((id) => updateDoc(doc(db, "jobs", id), { status })),
      );
      setJobs((prev) =>
        prev.map((j) => (selected.has(j.id) ? { ...j, status } : j)),
      );
      setSelected(new Set());
    } catch (err) {
      console.error("Error bulk updating job status:", err);
    } finally {
      setBulkWorking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allOnPageSelected =
    pageRows.length > 0 && pageRows.every((j) => selected.has(j.id));

  return (
    <>
      <AdminSidebar />
      <main
        className={`pt-14 md:pt-0 min-h-screen bg-[#e8eaed] transition-all duration-200 ${
          collapsed ? "md:ml-20" : "md:ml-60"
        }`}
      >
        <div className="px-4 sm:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-[#003882] tracking-tight">
              Job Listings
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              {loading
                ? "Loading…"
                : `${filtered.length} job${filtered.length === 1 ? "" : "s"} found`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs or employers..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003882]/20 focus:border-[#003882]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003882]/20 focus:border-[#003882]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
            <div className="relative w-full sm:w-100 shrink-0">
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Search city, state, or country..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-[#003882]/20 focus:border-[#003882]"
              />
            </div>
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="flex-1 min-w-30 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003882]/20 focus:border-[#003882]"
            >
              {jobTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={workTypeFilter}
              onChange={(e) => setWorkTypeFilter(e.target.value)}
              className="flex-1 min-w-40 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003882]/20 focus:border-[#003882]"
            >
              {workTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="flex-1 min-w-40 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003882]/20 focus:border-[#003882]"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {selected.size > 0 && (
            <div
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 mb-4 border"
              style={{ backgroundColor: "#eaf1fb", borderColor: "#c7d9f2" }}
            >
              <p className="text-xs font-bold" style={{ color: BRAND }}>
                {selected.size} selected
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkStatus("Open")}
                  disabled={bulkWorking}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 disabled:opacity-50 transition"
                >
                  <CheckCircle2 size={13} />
                  Approve
                </button>
                <button
                  onClick={() => handleBulkStatus("Closed")}
                  disabled={bulkWorking}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 disabled:opacity-50 transition"
                >
                  <XCircle size={13} />
                  Close
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkWorking}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  disabled={bulkWorking}
                  title="Clear selection"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white transition disabled:opacity-50"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-sm text-slate-400 font-medium">
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400 font-medium">
                No jobs match your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-100">
                      <th className="px-5 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={allOnPageSelected}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 accent-[#003882]"
                        />
                      </th>
                      <SortHeader
                        label="Job Title"
                        field="title"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Employer"
                        field="companyName"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Department"
                        field="department"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Status"
                        field="status"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Applicants"
                        field="applicants"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Posted"
                        field="createdAt"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageRows.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={selected.has(job.id)}
                            onChange={() => toggleSelect(job.id)}
                            className="w-4 h-4 rounded border-slate-300 accent-[#003882]"
                          />
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-800">
                          {job.title || "Untitled"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">
                          {job.companyName || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">
                          {job.department || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
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
                        <td className="px-5 py-3.5 text-slate-500 font-medium">
                          {formatDate(job.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/dashboard/jobs/${job.id}/edit`,
                                )
                              }
                              title="Edit"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                            >
                              <Pencil size={13} />
                            </button>
                            {job.status === "Draft" && (
                              <>
                                <button
                                  onClick={() => updateStatus(job.id, "Open")}
                                  title="Approve"
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition"
                                >
                                  <CheckCircle2 size={13} />
                                </button>
                                <button
                                  onClick={() => updateStatus(job.id, "Closed")}
                                  title="Reject"
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
                                >
                                  <XCircle size={13} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(job.id)}
                              title="Delete"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">
                  {(page - 1) * PAGE_SIZE + 1}-
                  {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                    )
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === "…" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-bold"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                            p === page
                              ? "text-white"
                              : "text-slate-500 border border-slate-200 hover:bg-slate-50"
                          }`}
                          style={p === page ? { backgroundColor: BRAND } : {}}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
