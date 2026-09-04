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
  orderBy,
  getDocs,
} from "firebase/firestore";
import AdminSidebar, {
  getStoredSidebarCollapsed,
  TOGGLE_EVENT,
} from "@/adminComponents/AdminSidebar";
import { Country } from "country-state-city";
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
  Mail,
  ExternalLink,
} from "lucide-react";

function profileSlug(applicant) {
  if (applicant.username) return applicant.username;
  if (applicant.email) return applicant.email.split("@")[0];
  return applicant.uid || applicant.id;
}

const BRAND = "#003882";
const PAGE_SIZE = 8;

const STATUS_PILL = {
  Active: "bg-emerald-50 text-emerald-700",
  Blocked: "bg-rose-50 text-rose-600",
};

const STATUS_OPTIONS = ["All Status", "Active", "Blocked"];

const AVATAR_COLORS = [
  "#2f6fed",
  "#16a34a",
  "#ea580c",
  "#7c3aed",
  "#b45309",
  "#dc2626",
  "#0d9488",
  "#4338ca",
];

function avatarColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const APPLICATION_STATUS_PILL = {
  Applied: "bg-indigo-50 text-indigo-700",
  "Under Review": "bg-amber-50 text-amber-700",
  Shortlisted: "bg-blue-50 text-blue-700",
  Hired: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-600",
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

function applicantName(applicant) {
  return (
    applicant.name ||
    [applicant.firstName, applicant.lastName].filter(Boolean).join(" ") ||
    "Unnamed"
  );
}

function applicantStatus(applicant) {
  return applicant.blocked ? "Blocked" : "Active";
}
function getApplicantRoles(a) {
  const looking = Array.isArray(a.about?.lookingForRoles)
    ? a.about.lookingForRoles
    : [];
  if (looking.length > 0) return looking;
  const fallback = a.title || a.about?.currentRole || a.about?.freelanceRole;
  return fallback ? [fallback] : [];
}
const ALL_COUNTRY_NAMES = Country.getAllCountries().map((c) => c.name);

function guessCountryFromLocation(location) {
  if (!location) return "";
  const trimmed = location.trim();
  const match = ALL_COUNTRY_NAMES.find(
    (name) => name.toLowerCase() === trimmed.toLowerCase(),
  );
  return match || "";
}

function getApplicantCountry(a) {
  if (a.country) return a.country;
  return guessCountryFromLocation(a.location);
}
function getApplicantState(a) {
  return a.state || "";
}
function getApplicantCity(a) {
  if (a.city) return a.city;
  if (a.location && !guessCountryFromLocation(a.location)) {
    return a.location.trim();
  }
  return "";
}

function parseExperienceYears(str) {
  if (!str) return 0;
  const match = String(str).match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function getExperienceType(a) {
  if (a.about?.isFresher) {
    return a.about?.hasFreelanceExp
      ? "Freelance/Part-time Experience"
      : "Fresher";
  }
  return "Professional Experience";
}

function getExperienceYears(a) {
  if (a.about?.isFresher) {
    return a.about?.hasFreelanceExp
      ? parseExperienceYears(a.about.freelanceExperience)
      : 0;
  }
  return parseExperienceYears(a.about?.experience);
}

const EXPERIENCE_FILTER_OPTIONS = [
  { label: "Any Experience", type: null, min: 0, max: Infinity },
  { label: "Fresher", type: "Fresher", min: 0, max: Infinity },
  {
    label: "Professional · 0-1 yrs",
    type: "Professional Experience",
    min: 0,
    max: 1,
  },
  {
    label: "Professional · 1-2 yrs",
    type: "Professional Experience",
    min: 1,
    max: 2,
  },
  {
    label: "Professional · 2-3 yrs",
    type: "Professional Experience",
    min: 2,
    max: 3,
  },
  {
    label: "Professional · 3-4 yrs",
    type: "Professional Experience",
    min: 3,
    max: 4,
  },
  {
    label: "Professional · 4-5 yrs",
    type: "Professional Experience",
    min: 4,
    max: 5,
  },
  {
    label: "Professional · 5-6 yrs",
    type: "Professional Experience",
    min: 5,
    max: 6,
  },
  {
    label: "Professional · 6-7 yrs",
    type: "Professional Experience",
    min: 6,
    max: 7,
  },
  {
    label: "Professional · 7-8 yrs",
    type: "Professional Experience",
    min: 7,
    max: 8,
  },
  {
    label: "Professional · 8-9 yrs",
    type: "Professional Experience",
    min: 8,
    max: 9,
  },
  {
    label: "Professional · 9-10 yrs",
    type: "Professional Experience",
    min: 9,
    max: 10,
  },
  {
    label: "Professional · 10+ yrs",
    type: "Professional Experience",
    min: 10,
    max: Infinity,
  },
  {
    label: "Freelance/Part-time · 0-1 yrs",
    type: "Freelance/Part-time Experience",
    min: 0,
    max: 1,
  },
  {
    label: "Freelance/Part-time · 1-2 yrs",
    type: "Freelance/Part-time Experience",
    min: 1,
    max: 2,
  },
  {
    label: "Freelance/Part-time · 2-3 yrs",
    type: "Freelance/Part-time Experience",
    min: 2,
    max: 3,
  },
];

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
        className={`flex items-center gap-2.5 uppercase tracking-wide font-bold text-[11px] hover:text-slate-600 transition cursor-pointer ${
          active ? "text-slate-700" : "text-slate-400"
        }`}
      >
        {label}
        <Icon size={12} />
      </button>
    </th>
  );
}

export default function AdminApplicantsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(new Set());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [expFilter, setExpFilter] = useState("Any Experience");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [locCountry, setLocCountry] = useState("");
  const [locState, setLocState] = useState("");
  const [locCity, setLocCity] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
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
      const [usersSnap, applicationsSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"))),
        getDocs(
          query(collection(db, "applications"), orderBy("appliedAt", "desc")),
        ),
      ]);
      setApplicants(usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setApplications(
        applicationsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      );
    } catch (err) {
      console.error("Error loading applicants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checking) return;
    loadData();
  }, [checking]);

  const applicationsByApplicant = useMemo(() => {
    const map = new Map();
    for (const app of applications) {
      const key = app.applicantUid || app.applicantId;
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(app);
    }
    return map;
  }, [applications]);

  const rows = useMemo(() => {
    return applicants.map((applicant) => {
      const apps =
        applicationsByApplicant.get(applicant.uid || applicant.id) || [];
      return {
        ...applicant,
        displayName: applicantName(applicant),
        status: applicantStatus(applicant),
        applicationsCount: apps.length,
        applicationsList: apps,
        profileSlug: profileSlug(applicant),
        country: getApplicantCountry(applicant),
        roles: getApplicantRoles(applicant),
        state: getApplicantState(applicant),
        city: getApplicantCity(applicant),
        experienceType: getExperienceType(applicant),
        experienceYears: getExperienceYears(applicant),
      };
    });
  }, [applicants, applicationsByApplicant]);

  const countryOptions = useMemo(() => {
    const counts = new Map();
    rows.forEach((r) => {
      if (r.country) counts.set(r.country, (counts.get(r.country) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const roleOptions = useMemo(() => {
    const counts = new Map();
    rows.forEach((r) => {
      r.roles.forEach((role) => {
        counts.set(role, (counts.get(role) || 0) + 1);
      });
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const stateOptions = useMemo(() => {
    const counts = new Map();
    rows.forEach((r) => {
      if (!r.state) return;
      if (locCountry && r.country !== locCountry) return;
      counts.set(r.state, (counts.get(r.state) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [rows, locCountry]);

  const cityOptions = useMemo(() => {
    const counts = new Map();
    rows.forEach((r) => {
      if (!r.city) return;
      if (locCountry && r.country !== locCountry) return;
      if (locState && r.state !== locState) return;
      counts.set(r.city, (counts.get(r.city) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [rows, locCountry, locState]);

  const activeLocationCount = [locCountry, locState, locCity].filter(
    Boolean,
  ).length;

  const filtered = useMemo(() => {
    let out = [...rows];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (a) =>
          a.displayName.toLowerCase().includes(q) ||
          (a.email || "").toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "All Status") {
      out = out.filter((a) => a.status === statusFilter);
    }

    if (expFilter !== "Any Experience") {
      const opt = EXPERIENCE_FILTER_OPTIONS.find((o) => o.label === expFilter);
      if (opt) {
        out = out.filter((a) => {
          if (opt.type === "Fresher") return a.experienceType === "Fresher";
          return (
            a.experienceType === opt.type &&
            a.experienceYears >= opt.min &&
            a.experienceYears < opt.max
          );
        });
      }
    }

    if (roleFilter !== "All Roles") {
      out = out.filter((a) => a.roles.includes(roleFilter));
    }

    if (locCountry) out = out.filter((a) => a.country === locCountry);
    if (locState) out = out.filter((a) => a.state === locState);
    if (locCity) out = out.filter((a) => a.city === locCity);

    out.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.displayName.localeCompare(b.displayName);
          break;
        case "applicationsCount":
          cmp = (a.applicationsCount || 0) - (b.applicationsCount || 0);
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
  }, [
    rows,
    search,
    statusFilter,
    roleFilter,
    expFilter,
    locCountry,
    locState,
    locCity,
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
    roleFilter,
    expFilter,
    locCountry,
    locState,
    locCity,
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
    if (pageRows.every((a) => selected.has(a.id))) {
      setSelected((prev) => {
        const next = new Set(prev);
        pageRows.forEach((a) => next.delete(a.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        pageRows.forEach((a) => next.add(a.id));
        return next;
      });
    }
  };

  const handleBlock = async (id) => {
    if (
      !window.confirm(
        "Block this applicant? They won't be able to apply to jobs.",
      )
    ) {
      return;
    }
    try {
      await updateDoc(doc(db, "users", id), { blocked: true });
      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? { ...a, blocked: true } : a)),
      );
    } catch (err) {
      console.error("Error blocking applicant:", err);
    }
  };

  const handleUnblock = async (id) => {
    try {
      await updateDoc(doc(db, "users", id), { blocked: false });
      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? { ...a, blocked: false } : a)),
      );
    } catch (err) {
      console.error("Error unblocking applicant:", err);
    }
  };

  const selectedIds = Array.from(selected);

  const handleBulkBlock = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Block ${selectedIds.length} applicant(s)?`)) return;
    setBulkWorking(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateDoc(doc(db, "users", id), { blocked: true }),
        ),
      );
      setApplicants((prev) =>
        prev.map((a) => (selected.has(a.id) ? { ...a, blocked: true } : a)),
      );
      setSelected(new Set());
    } catch (err) {
      console.error("Error bulk blocking applicants:", err);
    } finally {
      setBulkWorking(false);
    }
  };

  const handleBulkUnblock = async () => {
    if (selectedIds.length === 0) return;
    setBulkWorking(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateDoc(doc(db, "users", id), { blocked: false }),
        ),
      );
      setApplicants((prev) =>
        prev.map((a) => (selected.has(a.id) ? { ...a, blocked: false } : a)),
      );
      setSelected(new Set());
    } catch (err) {
      console.error("Error bulk unblocking applicants:", err);
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
    pageRows.length > 0 && pageRows.every((a) => selected.has(a.id));

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
              Applicants
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              {loading
                ? "Loading…"
                : `${filtered.length} applicant${filtered.length === 1 ? "" : "s"} registered`}
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
                placeholder="Search by name or email..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003882]/20 focus:border-[#003882]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003882]/20 focus:border-[#003882] cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003882]/20 focus:border-[#003882] cursor-pointer"
            >
              <option value="All Roles">All Roles ({rows.length})</option>
              {roleOptions.map(([role, count]) => (
                <option key={role} value={role}>
                  {role} ({count})
                </option>
              ))}
            </select>

            <select
              value={expFilter}
              onChange={(e) => setExpFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003882]/20 focus:border-[#003882] cursor-pointer"
            >
              {EXPERIENCE_FILTER_OPTIONS.map((o) => (
                <option key={o.label} value={o.label}>
                  {o.label}
                </option>
              ))}
            </select>

            <div className="relative">
              <button
                onClick={() => setShowLocationPicker((v) => !v)}
                className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003882]/20 hover:border-[#003882] cursor-pointer whitespace-nowrap"
              >
                Location
                {activeLocationCount > 0 && (
                  <span
                    className="text-[10px] font-bold text-white rounded-full w-4 h-4 flex items-center justify-center"
                    style={{ backgroundColor: BRAND }}
                  >
                    {activeLocationCount}
                  </span>
                )}
              </button>

              {showLocationPicker && (
                <div
                  className="absolute right-0 z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-slate-200 shadow-lg p-4 flex flex-col gap-3"
                  onMouseLeave={() => setShowLocationPicker(false)}
                >
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Country
                    </p>
                    <select
                      value={locCountry}
                      onChange={(e) => {
                        setLocCountry(e.target.value);
                        setLocState("");
                        setLocCity("");
                      }}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-medium cursor-pointer"
                    >
                      <option value="">All Countries ({rows.length})</option>
                      {countryOptions.map(([c, count]) => (
                        <option key={c} value={c}>
                          {c} ({count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {stateOptions.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                        State
                      </p>
                      <select
                        value={locState}
                        onChange={(e) => {
                          setLocState(e.target.value);
                          setLocCity("");
                        }}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-medium cursor-pointer"
                      >
                        <option value="">All States</option>
                        {stateOptions.map(([s, count]) => (
                          <option key={s} value={s}>
                            {s} ({count})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                      City
                    </p>
                    <select
                      value={locCity}
                      onChange={(e) => setLocCity(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-medium cursor-pointer"
                    >
                      <option value="">All Cities</option>
                      {cityOptions.map(([c, count]) => (
                        <option key={c} value={c}>
                          {c} ({count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeLocationCount > 0 && (
                    <button
                      onClick={() => {
                        setLocCountry("");
                        setLocState("");
                        setLocCity("");
                      }}
                      className="text-xs font-bold text-rose-600 self-start cursor-pointer"
                    >
                      Clear location filter
                    </button>
                  )}
                </div>
              )}
            </div>
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
                  onClick={handleBulkUnblock}
                  disabled={bulkWorking}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <ShieldCheck size={13} />
                  Unblock
                </button>
                <button
                  onClick={handleBulkBlock}
                  disabled={bulkWorking}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <Ban size={13} />
                  Block
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  disabled={bulkWorking}
                  title="Clear selection"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
                No applicants match your filters.
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
                          className="w-4 h-4 rounded border-slate-300 accent-[#003882] cursor-pointer"
                        />
                      </th>
                      <SortHeader
                        label="Applicant"
                        field="name"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        Email
                      </th>
                      <SortHeader
                        label="Applications"
                        field="applicationsCount"
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
                    {pageRows.map((applicant) => (
                      <tr key={applicant.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={selected.has(applicant.id)}
                            onChange={() => toggleSelect(applicant.id)}
                            className="w-4 h-4 rounded border-slate-300 accent-[#003882] cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: avatarColor(
                                  applicant.displayName,
                                ),
                              }}
                            >
                              {initials(applicant.displayName)}
                            </div>
                            <span className="font-bold text-slate-800">
                              {applicant.displayName}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">
                          {applicant.email || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">
                          {applicant.applicationsCount}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              STATUS_PILL[applicant.status] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {applicant.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">
                          {formatDate(applicant.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setViewing(applicant)}
                              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                            >
                              <Eye size={13} />
                              View
                            </button>
                            <a
                              href={`/dashboard/${applicant.profileSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View public profile"
                              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
                            >
                              <ExternalLink size={13} />
                              Profile
                            </a>
                            {applicant.status === "Blocked" ? (
                              <button
                                onClick={() => handleUnblock(applicant.id)}
                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
                              >
                                <ShieldCheck size={13} />
                                Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlock(applicant.id)}
                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
                              >
                                <Ban size={13} />
                                Block
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
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
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
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition cursor-pointer ${
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
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
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
        <ApplicantViewModal
          applicant={viewing}
          onClose={() => setViewing(null)}
          onBlock={() => {
            handleBlock(viewing.id);
            setViewing((v) =>
              v ? { ...v, blocked: true, status: "Blocked" } : v,
            );
          }}
          onUnblock={() => {
            handleUnblock(viewing.id);
            setViewing((v) =>
              v ? { ...v, blocked: false, status: "Active" } : v,
            );
          }}
        />
      )}
    </>
  );
}

function ApplicantViewModal({ applicant, onClose, onBlock, onUnblock }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-extrabold text-slate-800">
            {applicant.displayName}'s Applications
          </h2>
          <div className="flex items-center gap-2">
            <a
              href={`/dashboard/${applicant.profileSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
            >
              <ExternalLink size={13} />
              View profile
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center shrink-0"
                style={{ backgroundColor: avatarColor(applicant.displayName) }}
              >
                {initials(applicant.displayName)}
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  {applicant.displayName}
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Mail size={12} className="text-slate-400" />
                  {applicant.email || "—"}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                STATUS_PILL[applicant.status] || "bg-slate-100 text-slate-600"
              }`}
            >
              {applicant.status}
            </span>
          </div>

          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mt-6 mb-2.5">
            Applications ({applicant.applicationsList?.length || 0})
          </p>

          {applicant.applicationsList &&
          applicant.applicationsList.length > 0 ? (
            <div className="space-y-2">
              {applicant.applicationsList.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {app.jobTitle || "Untitled role"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {app.companyName || "—"} · {formatDate(app.appliedAt)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      APPLICATION_STATUS_PILL[app.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {app.status || "Applied"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No applications yet.</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          {applicant.status === "Blocked" ? (
            <button
              onClick={onUnblock}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
            >
              <ShieldCheck size={14} />
              Unblock applicant
            </button>
          ) : (
            <button
              onClick={onBlock}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
            >
              <Ban size={14} />
              Block applicant
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
