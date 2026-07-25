"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
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
  Eye,
  Ban,
  ShieldCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  Mail,
  Calendar,
} from "lucide-react";

const BRAND = "#003882";
const PAGE_SIZE = 6;

const STATUS_PILL = {
  Verified: "bg-blue-50 text-[#004aac]",
  Unverified: "bg-amber-50 text-amber-700",
  Banned: "bg-rose-50 text-rose-600",
};

const STATUS_OPTIONS = ["All Status", "Verified", "Unverified", "Banned"];

const JOB_STATUS_PILL = {
  Open: "bg-emerald-50 text-emerald-700",
  Active: "bg-emerald-50 text-emerald-700",
  Paused: "bg-amber-50 text-amber-700",
  Closed: "bg-rose-50 text-rose-600",
  Draft: "bg-slate-100 text-slate-600",
};

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

function employerStatus(emp) {
  if (emp.banned) return "Banned";
  if (emp.verified) return "Verified";
  return "Unverified";
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

export default function AdminEmployersPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [employers, setEmployers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(new Set());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const [viewing, setViewing] = useState(null); 
  const [bulkWorking, setBulkWorking] = useState(false);

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [empSnap, jobsSnap] = await Promise.all([
        getDocs(
          query(collection(db, "employers"), orderBy("createdAt", "desc")),
        ),
        getDocs(query(collection(db, "jobs"), orderBy("createdAt", "desc"))),
      ]);
      setEmployers(empSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setJobs(jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading employers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checking) return;
    loadData();
  }, [checking]);

  const jobsByEmployer = useMemo(() => {
    const map = new Map();
    for (const job of jobs) {
      const key = job.employerUid || job.employerId;
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(job);
    }
    return map;
  }, [jobs]);

  const rows = useMemo(() => {
    return employers.map((emp) => {
      const empJobs = jobsByEmployer.get(emp.uid || emp.id) || [];
      return {
        ...emp,
        status: employerStatus(emp),
        jobsPosted: empJobs.length,
        jobsList: empJobs,
      };
    });
  }, [employers, jobsByEmployer]);

  const filtered = useMemo(() => {
    let out = [...rows];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (e) =>
          (e.company || "").toLowerCase().includes(q) ||
          (e.email || "").toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "All Status") {
      out = out.filter((e) => e.status === statusFilter);
    }

    out.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "company":
          cmp = (a.company || "").localeCompare(b.company || "");
          break;
        case "jobsPosted":
          cmp = (a.jobsPosted || 0) - (b.jobsPosted || 0);
          break;
        case "status":
          cmp = (a.status || "").localeCompare(b.status || "");
          break;
        case "createdAt":
        default:
          cmp = dateMs(a.createdAt) - dateMs(b.createdAt);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return out;
  }, [rows, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(
    (page - 1) * PAGE_SIZE,
    (page - 1) * PAGE_SIZE + PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

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
    if (pageRows.every((e) => selected.has(e.id))) {
      setSelected((prev) => {
        const next = new Set(prev);
        pageRows.forEach((e) => next.delete(e.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        pageRows.forEach((e) => next.add(e.id));
        return next;
      });
    }
  };

  const handleVerify = async (empId) => {
    try {
      await updateDoc(doc(db, "employers", empId), {
        verified: true,
        banned: false,
      });
      setEmployers((prev) =>
        prev.map((e) =>
          e.id === empId ? { ...e, verified: true, banned: false } : e,
        ),
      );
    } catch (err) {
      console.error("Error verifying employer:", err);
    }
  };

  const handleBan = async (empId) => {
    if (
      !window.confirm(
        "Ban this employer? They won't be able to post or manage jobs.",
      )
    ) {
      return;
    }
    try {
      await updateDoc(doc(db, "employers", empId), { banned: true });
      setEmployers((prev) =>
        prev.map((e) => (e.id === empId ? { ...e, banned: true } : e)),
      );
    } catch (err) {
      console.error("Error banning employer:", err);
    }
  };

  const handleUnban = async (empId) => {
    try {
      await updateDoc(doc(db, "employers", empId), { banned: false });
      setEmployers((prev) =>
        prev.map((e) => (e.id === empId ? { ...e, banned: false } : e)),
      );
    } catch (err) {
      console.error("Error unbanning employer:", err);
    }
  };

  const handleDelete = async (empId) => {
    if (
      !window.confirm("Delete this employer account? This cannot be undone.")
    ) {
      return;
    }
    try {
      await deleteDoc(doc(db, "employers", empId));
      setEmployers((prev) => prev.filter((e) => e.id !== empId));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(empId);
        return next;
      });
    } catch (err) {
      console.error("Error deleting employer:", err);
    }
  };

  const selectedIds = Array.from(selected);

  const handleBulkVerify = async () => {
    if (selectedIds.length === 0) return;
    setBulkWorking(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateDoc(doc(db, "employers", id), {
            verified: true,
            banned: false,
          }),
        ),
      );
      setEmployers((prev) =>
        prev.map((e) =>
          selected.has(e.id) ? { ...e, verified: true, banned: false } : e,
        ),
      );
      setSelected(new Set());
    } catch (err) {
      console.error("Error bulk verifying employers:", err);
    } finally {
      setBulkWorking(false);
    }
  };

  const handleBulkBan = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Ban ${selectedIds.length} employer(s)?`)) return;
    setBulkWorking(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateDoc(doc(db, "employers", id), { banned: true }),
        ),
      );
      setEmployers((prev) =>
        prev.map((e) => (selected.has(e.id) ? { ...e, banned: true } : e)),
      );
      setSelected(new Set());
    } catch (err) {
      console.error("Error bulk banning employers:", err);
    } finally {
      setBulkWorking(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedIds.length} employer account${
          selectedIds.length > 1 ? "s" : ""
        }? This cannot be undone.`,
      )
    ) {
      return;
    }
    setBulkWorking(true);
    try {
      await Promise.all(
        selectedIds.map((id) => deleteDoc(doc(db, "employers", id))),
      );
      setEmployers((prev) => prev.filter((e) => !selected.has(e.id)));
      setSelected(new Set());
    } catch (err) {
      console.error("Error bulk deleting employers:", err);
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
    pageRows.length > 0 && pageRows.every((e) => selected.has(e.id));

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
              Employers
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              {loading
                ? "Loading…"
                : `${filtered.length} employer${filtered.length === 1 ? "" : "s"} registered`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by company or email..."
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
                  onClick={handleBulkVerify}
                  disabled={bulkWorking}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 disabled:opacity-50 transition"
                >
                  <ShieldCheck size={13} />
                  Verify
                </button>
                <button
                  onClick={handleBulkBan}
                  disabled={bulkWorking}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 disabled:opacity-50 transition"
                >
                  <Ban size={13} />
                  Ban
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
                No employers match your filters.
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
                        label="Company Name"
                        field="company"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        Email
                      </th>
                      <SortHeader
                        label="Jobs Posted"
                        field="jobsPosted"
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
                        label="Joined Date"
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
                    {pageRows.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={selected.has(emp.id)}
                            onChange={() => toggleSelect(emp.id)}
                            className="w-4 h-4 rounded border-slate-300 accent-[#003882]"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#eaf1fb] text-[#004aac] font-bold text-xs flex items-center justify-center shrink-0">
                              {(emp.company || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800">
                              {emp.company || "Untitled"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">
                          {emp.email || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">
                          {emp.jobsPosted}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              STATUS_PILL[emp.status] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">
                          {formatDate(emp.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setViewing(emp)}
                              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                            >
                              <Eye size={13} />
                              View
                            </button>
                            {emp.status === "Unverified" && (
                              <button
                                onClick={() => handleVerify(emp.id)}
                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                              >
                                <ShieldCheck size={13} />
                                Verify
                              </button>
                            )}
                            {emp.status === "Banned" ? (
                              <button
                                onClick={() => handleUnban(emp.id)}
                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                              >
                                <ShieldCheck size={13} />
                                Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBan(emp.id)}
                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
                              >
                                <Ban size={13} />
                                Ban
                              </button>
                            )}
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

      {viewing && (
        <EmployerViewModal
          employer={viewing}
          onClose={() => setViewing(null)}
          onVerify={() => {
            handleVerify(viewing.id);
            setViewing((v) =>
              v
                ? { ...v, verified: true, banned: false, status: "Verified" }
                : v,
            );
          }}
          onBan={() => {
            handleBan(viewing.id);
            setViewing((v) =>
              v ? { ...v, banned: true, status: "Banned" } : v,
            );
          }}
          onUnban={() => {
            handleUnban(viewing.id);
            setViewing((v) =>
              v
                ? {
                    ...v,
                    banned: false,
                    status: employerStatus({ ...v, banned: false }),
                  }
                : v,
            );
          }}
        />
      )}
    </>
  );
}

function EmployerViewModal({ employer, onClose, onVerify, onBan, onUnban }) {
  const initial = (employer.company || "?").charAt(0).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-800">
            {employer.company || "Untitled"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#eaf1fb] text-[#004aac] font-extrabold text-lg flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div>
              <p className="font-bold text-slate-800">
                {employer.company || "—"}
              </p>
              {employer.description && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {employer.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Mail size={13} className="text-slate-400" />
              <span className="text-slate-400 font-medium">Email</span>
              <span className="font-semibold text-slate-700">
                {employer.email || "—"}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Globe size={13} className="text-slate-400" />
              <span className="text-slate-400 font-medium">Website</span>
              {employer.website ? (
                <a
                  href={`https://${employer.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#004aac] hover:underline"
                >
                  {employer.website}
                </a>
              ) : (
                <span className="font-semibold text-slate-700">—</span>
              )}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Calendar size={13} className="text-slate-400" />
              <span className="text-slate-400 font-medium">Joined</span>
              <span className="font-semibold text-slate-700">
                {formatDate(employer.createdAt)}
              </span>
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-slate-400 font-medium">Status</span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                STATUS_PILL[employer.status] || "bg-slate-100 text-slate-600"
              }`}
            >
              {employer.status}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2.5">
              Posted Jobs ({employer.jobsList?.length || 0})
            </p>
            {employer.jobsList && employer.jobsList.length > 0 ? (
              <div className="space-y-2">
                {employer.jobsList.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {job.title || "Untitled"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(job.createdAt)} · {job.applicants || 0}{" "}
                        applicants
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        JOB_STATUS_PILL[job.status] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {job.status || "—"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No jobs posted yet.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          {employer.status === "Unverified" && (
            <button
              onClick={onVerify}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
            >
              <ShieldCheck size={14} />
              Verify company
            </button>
          )}
          {employer.status === "Banned" ? (
            <button
              onClick={onUnban}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
            >
              <ShieldCheck size={14} />
              Unban
            </button>
          ) : (
            <button
              onClick={onBan}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
            >
              <Ban size={14} />
              Ban employer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
