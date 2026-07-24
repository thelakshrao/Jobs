"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import sideimage from "@/images/projectpage2.webp";
import { MapPin, Zap, ChevronDown, X, Check, CalendarX } from "lucide-react";

const PROJECT_TYPES = [
  "All",
  "Commercial Building",
  "High-rise Residential",
  "Industrial & Factory",
  "Infrastructure",
  "Interior Fit-out",
  "Renovation & Repair",
  "Warehousing & Logistics",
  "Last-Mile Delivery",
  "Facility Management",
  "Residential Household",
];
const WORK_TYPES = [
  "All",
  "Labour Supply",
  "Task-Based Service",
  "Measurement Basis (Bill of Quantities)",
  "Fixed Price Contract",
  "AMC (Annual Maintenance)",
  "Retainer/Subscription",
];
const WORKS = [
  "All",
  "Alumina/Shuttering Carpenter",
  "Barbender/Steel Fixer",
  "Mason",
  "Welder",
  "Electrician",
  "Plumber",
  "Painter",
  "Concrete/Casting Crew",
  "General Construction Labour",
  "Delivery Executive",
  "Warehouse Operations",
  "Loading & Unloading",
  "Logistics Driver",
  "Housekeeping/Cleaning",
  "Cook/Chef",
  "Security Guard",
  "Driver",
  "Gardener/Landscaper",
  "Appliance Repair Tech",
  "Personal Assistant/Helper",
  "Caregiver/Nursing Help",
];

export default function ApplicantProjectsPage() {
  return (
    <Suspense fallback={<ProjectsPageFallback />}>
      <ApplicantProjectsPageInner />
    </Suspense>
  );
}

function ProjectsPageFallback() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
      <div
        className="w-7 h-7 border-[3px] border-slate-200 rounded-full animate-spin"
        style={{ borderTopColor: "#fb923c" }}
      />
    </div>
  );
}

function ApplicantProjectsPageInner() {
  const searchParams = useSearchParams();
  const targetProjectId = searchParams.get("projectId");
  const cardRefs = useRef({});

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [hasAppliedDeepLink, setHasAppliedDeepLink] = useState(false);
  const [filters, setFilters] = useState({
    projectType: "All",
    workType: "All",
    work: "All",
    company: "All",
    state: "All",
  });
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
  });
  const [profileInfo, setProfileInfo] = useState({
    photoURL: "",
    slug: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setFormData((f) => ({ ...f, email: user.email || "" }));

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const userData = userSnap.exists() ? userSnap.data() : {};

        let slug = "";
        try {
          const slugSnap = await getDocs(
            query(collection(db, "slugs"), where("uid", "==", user.uid)),
          );
          if (!slugSnap.empty) slug = slugSnap.docs[0].id;
        } catch (slugErr) {
          console.error("Slug lookup error:", slugErr);
        }

        setProfileInfo({
          photoURL: userData.photoURL || "",
          slug,
        });
      } catch (err) {
        console.error("User profile fetch error:", err);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "projects"), orderBy("createdAt", "desc")),
        );

        const today = new Date().toISOString().split("T")[0];

        const visible = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => !p.deadline || p.deadline >= today);

        setProjects(visible);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (loading || !targetProjectId || hasAppliedDeepLink) return;
    const exists = projects.some((p) => p.id === targetProjectId);
    if (!exists) return;

    setSelected((prev) =>
      prev.includes(targetProjectId) ? prev : [...prev, targetProjectId],
    );
    setHasAppliedDeepLink(true);

    requestAnimationFrame(() => {
      cardRefs.current[targetProjectId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [loading, targetProjectId, projects, hasAppliedDeepLink]);

  const companies = [
    "All",
    ...new Set(projects.map((p) => p.company).filter(Boolean)),
  ];
  const states = [
    "All",
    ...new Set(projects.map((p) => p.state).filter(Boolean)),
  ];

  const filtered = projects.filter((p) => {
    if (
      filters.projectType !== "All" &&
      p.projectType?.toLowerCase() !== filters.projectType.toLowerCase()
    )
      return false;
    if (
      filters.workType !== "All" &&
      p.workType?.toLowerCase() !== filters.workType.toLowerCase()
    )
      return false;
    if (filters.work !== "All" && p.work !== filters.work) return false;
    if (filters.company !== "All" && p.company !== filters.company)
      return false;
    if (filters.state !== "All" && p.state !== filters.state) return false;
    return true;
  });

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const selectedProjects = projects.filter((p) => selected.includes(p.id));
  const setF = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const setForm = (key, val) => setFormData((f) => ({ ...f, [key]: val }));
  const hasFilters = Object.values(filters).some((v) => v !== "All");

  const handleApply = async () => {
    if (!formData.fullName.trim()) {
      setFormError("Full name is required");
      return;
    }
    if (!formData.mobile.trim()) {
      setFormError("Mobile number is required");
      return;
    }
    if (!formData.email.trim()) {
      setFormError("Email is required");
      return;
    }
    if (selected.length === 0) {
      setFormError("Select at least one project");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      const user = auth.currentUser;

      const dupChecks = await Promise.all(
        selectedProjects.map((p) =>
          getDocs(
            query(
              collection(db, "applications"),
              where("projectId", "==", p.id),
              where("applicantUid", "==", user?.uid || ""),
            ),
          ),
        ),
      );
      const alreadyApplied = selectedProjects.filter(
        (_, i) => !dupChecks[i].empty,
      );
      if (alreadyApplied.length > 0) {
        setFormError(
          `Already applied to: ${alreadyApplied.map((p) => p.title).join(", ")}`,
        );
        setSubmitting(false);
        return;
      }

      await Promise.all(
        selectedProjects.map((p) =>
          addDoc(collection(db, "applications"), {
            type: "project",
            projectId: p.id,
            projectTitle: p.title,
            employerUid: p.employerUid || null,
            applicantUid: user?.uid || null,
            applicantName: formData.fullName,
            applicantEmail: formData.email,
            applicantPhone: formData.mobile,
            applicantLocation: p.state
              ? `${p.location}, ${p.state}`
              : p.location || "",
            applicantPhotoURL: profileInfo.photoURL || "",
            applicantSlug: profileInfo.slug || "",
            status: "Applied",
            appliedAt: serverTimestamp(),
          }),
        ),
      );

      await Promise.all(
        selectedProjects.map((p) =>
          updateDoc(doc(db, "projects", p.id), {
            applicants: increment(1),
          }),
        ),
      );

      await fetch("https://formspree.io/f/your-form-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          projects: selectedProjects
            .map((p) => `${p.title} — ${p.company} (${p.location}, ${p.state})`)
            .join(", "),
        }),
      });

      setSubmitted(true);
      setSelected([]);
    } catch (err) {
      console.error(err);
      setFormError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    return new Date(deadline).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const daysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const diff = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] pt-3 md:pt-5">
      <div className="relative bg-white border border-slate-200 rounded-3xl mx-3 md:mx-6 mb-4 md:mb-6 overflow-hidden shadow-sm">
        <div className="absolute inset-0">
          <Image
            src={sideimage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover blur-sm scale-105"
            priority
          />
          <div className="absolute inset-0 bg-white/10" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 pt-16 pb-12 md:pt-20 md:pb-16 flex items-start gap-10">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
              Where Skilled Contractors
              <br />
              Meet Live Construction Sites
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed mb-6 max-w-lg">
              Jobs Abroad lists verified, ongoing construction projects from
              across India in one place. Filter by your trade, location, and
              crew size to find work that fits — then apply in minutes and let
              our team handle the introduction.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-black text-slate-700 mb-2">
                How to Apply (Step-by-Step):
              </p>
              <ul className="space-y-1.5">
                {[
                  "Filter projects by the trade and region you work in",
                  "Check pay rate, site location, and manpower needed for each project",
                  "Shortlist the projects you'd like to take up",
                  "Send your details and we'll introduce you to the project's point of contact",
                ].map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs font-semibold text-slate-600"
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl mx-3 md:mx-6 mb-4 md:mb-6 px-6 md:px-10 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:flex-wrap gap-3 md:items-center">
          <span className="text-xs font-black text-slate-700">Filters</span>
          {[
            {
              label: "Project type",
              key: "projectType",
              options: PROJECT_TYPES,
            },
            { label: "Work type", key: "workType", options: WORK_TYPES },
            { label: "Company", key: "company", options: companies },
            { label: "Work", key: "work", options: WORKS },
            { label: "State", key: "state", options: states },
          ].map(({ label, key, options }) => (
            <div key={key} className="flex flex-col gap-0.5 w-full md:w-auto">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {label}
              </label>
              <div className="relative">
                <select
                  value={filters[key]}
                  onChange={(e) => setF(key, e.target.value)}
                  className={`appearance-none border border-slate-200 rounded-xl px-3 py-1.5 pr-7 bg-slate-50 outline-none cursor-pointer w-full md:w-auto ${
                    key === "company"
                      ? "text-sm font-black text-slate-900 md:min-w-32.5"
                      : "text-xs font-bold text-slate-700 md:min-w-27.5"
                  }`}
                >
                  {options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          ))}
          {hasFilters && (
            <button
              onClick={() =>
                setFilters({
                  projectType: "All",
                  workType: "All",
                  work: "All",
                  company: "All",
                  state: "All",
                })
              }
              className="w-full md:w-auto justify-center md:justify-start self-stretch md:self-end flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 border border-slate-200 rounded-xl px-2.5 py-1.5"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="mx-3 md:mx-6">
        <div className="mx-3 md:mx-6 px-6 md:px-10 py-8 pb-32">
          <p className="text-xs font-black text-slate-400 mb-4 uppercase tracking-widest">
            {loading
              ? "Loading projects…"
              : `${filtered.length} project${filtered.length !== 1 ? "s" : ""} found`}
            {selected.length > 0 && (
              <span className="ml-3 text-slate-700 normal-case">
                · {selected.length} selected
              </span>
            )}
          </p>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div
                className="w-7 h-7 border-[3px] border-slate-200 rounded-full animate-spin"
                style={{ borderTopColor: "#fb923c" }}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-black text-slate-800 mb-1">
                No projects found
              </p>
              <p className="text-sm font-semibold text-slate-400">
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((project) => {
                const isSelected = selected.includes(project.id);
                const isDeepLinked = project.id === targetProjectId;
                const deadlineDays = daysUntilDeadline(project.deadline);
                const isClosingSoon =
                  deadlineDays !== null && deadlineDays <= 3;

                return (
                  <div
                    key={project.id}
                    ref={(el) => (cardRefs.current[project.id] = el)}
                    onClick={() => toggleSelect(project.id)}
                    className="cursor-pointer rounded-2xl border-2 p-5 flex flex-col gap-3 transition-all"
                    style={{
                      backgroundColor: isSelected ? "#fff7ed" : "#fff",
                      borderColor: isSelected ? "#fb923c" : "#e2e8f0",
                      boxShadow: isDeepLinked
                        ? "0 0 0 4px rgba(251,146,60,0.35)"
                        : isSelected
                          ? "0 0 0 3px rgba(251,146,60,0.18)"
                          : "0 1px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <MapPin size={11} />
                        {project.location}
                        {project.state ? `, ${project.state}` : ""}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {project.urgent && (
                          <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                            Urgent hiring
                          </span>
                        )}
                        {isClosingSoon && (
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CalendarX size={9} />
                            {deadlineDays === 0
                              ? "Last day"
                              : `${deadlineDays}d left`}
                          </span>
                        )}
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                          style={{
                            borderColor: isSelected ? "#fb923c" : "#cbd5e1",
                            backgroundColor: isSelected
                              ? "#fb923c"
                              : "transparent",
                          }}
                        >
                          {isSelected && (
                            <Check size={11} color="white" strokeWidth={3} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-0.5">
                        {project.company}
                      </p>
                      <h3 className="text-xl font-black text-slate-900">
                        {project.title}
                      </h3>
                    </div>

                    <div className="text-xs font-semibold text-slate-500">
                      <span>
                        <strong className="text-slate-700">Rate:</strong>{" "}
                        {project.rateType === "On Discussion"
                          ? "On Discussion"
                          : `₹${project.rateAmount} ${project.rateType}`}
                      </span>
                      <span className="mx-2">·</span>
                      <span>
                        <strong className="text-slate-700">
                          Workers Required:
                        </strong>{" "}
                        {project.workersRequired}
                      </span>
                    </div>

                    {project.deadline && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <CalendarX size={11} className="text-slate-400" />
                        <span>
                          <strong className="text-slate-700">Deadline:</strong>{" "}
                          {formatDeadline(project.deadline)}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <span className="border border-slate-800 text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full">
                        Project Type: {project.projectType}
                      </span>
                      <span className="border border-red-400 text-red-500 text-[11px] font-bold px-3 py-1 rounded-full">
                        Work Type: {project.workType}
                      </span>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                          {project.company?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-700 max-w-35 truncate">
                          {project.company}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(project.id);
                        }}
                        className="text-xs font-black px-3 py-1.5 rounded-xl border transition-colors"
                        style={{
                          borderColor: isSelected ? "#fb923c" : "#cbd5e1",
                          color: isSelected ? "#c2410c" : "#475569",
                          backgroundColor: isSelected
                            ? "#ffedd5"
                            : "transparent",
                        }}
                      >
                        {isSelected ? "Selected ✓" : "Select"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 md:left-20 z-50 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between gap-4"
          style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Zap size={15} className="shrink-0" style={{ color: "#fb923c" }} />
            <span className="text-sm font-black text-slate-800 truncate">
              {selected.length} project{selected.length > 1 ? "s" : ""} selected
            </span>
            <div className="hidden sm:flex gap-1.5 flex-wrap">
              {selectedProjects.slice(0, 3).map((p) => (
                <span
                  key={p.id}
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#ffedd5", color: "#fb923c" }}
                >
                  {p.title}
                </span>
              ))}
              {selected.length > 3 && (
                <span className="text-xs font-bold text-slate-400">
                  +{selected.length - 3} more
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelected([])}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 border border-slate-200 px-3 py-2 rounded-xl"
            >
              Clear
            </button>
            <button
              onClick={() => {
                setShowApplyModal(true);
                setSubmitted(false);
                setFormError("");
              }}
              className="text-xs font-black text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
              style={{ backgroundColor: "#fb923c" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f97316")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#fb923c")
              }
            >
              Apply for projects →
            </button>
          </div>
        </div>
      )}

      {showApplyModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Apply for Projects
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  {selected.length} project{selected.length > 1 ? "s" : ""}{" "}
                  selected
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              {submitted ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#fb923c" }}
                  >
                    <Check size={24} className="text-white" strokeWidth={3} />
                  </div>
                  <p className="text-lg font-black text-slate-900">
                    Application Sent!
                  </p>
                  <p className="text-sm font-semibold text-slate-400">
                    Our team will connect you with the respective project's PoC
                    shortly.
                  </p>
                  <button
                    onClick={() => {
                      setShowApplyModal(false);
                      setSubmitted(false);
                    }}
                    className="text-xs font-bold text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div
                    className="border rounded-xl p-3"
                    style={{
                      backgroundColor: "#fff7ed",
                      borderColor: "#fed7aa",
                    }}
                  >
                    <p
                      className="text-xs font-black mb-1.5"
                      style={{ color: "#fb923c" }}
                    >
                      Applying for:
                    </p>
                    <div className="flex flex-col gap-1">
                      {selectedProjects.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span
                            className="text-xs font-bold truncate"
                            style={{ color: "#fb923c" }}
                          >
                            {p.title} — {p.company}
                          </span>
                          <button onClick={() => toggleSelect(p.id)}>
                            <X
                              size={11}
                              style={{ color: "#fb923c" }}
                              className="hover:opacity-70"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                    After submitting, you'll be contacted by the respective
                    project's PoC. You'll also be redirected to the DLC
                    Contractor Onboarding Form.
                  </p>

                  {[
                    {
                      label: "Full name",
                      key: "fullName",
                      type: "text",
                      placeholder: "Your full name",
                    },
                    {
                      label: "Mobile number",
                      key: "mobile",
                      type: "tel",
                      placeholder: "Your phone number",
                    },
                    {
                      label: "Email address",
                      key: "email",
                      type: "email",
                      placeholder: "you@example.com",
                    },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        {label} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={formData[key]}
                        onChange={(e) => setForm(key, e.target.value)}
                        className={fInputCls}
                      />
                    </div>
                  ))}

                  {formError && (
                    <p className="text-xs font-bold text-red-500">
                      {formError}
                    </p>
                  )}

                  <button
                    onClick={handleApply}
                    disabled={submitting}
                    className="w-full text-white text-sm font-black py-3.5 rounded-xl transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#fb923c" }}
                    onMouseEnter={(e) => {
                      if (!submitting)
                        e.currentTarget.style.backgroundColor = "#f97316";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fb923c";
                    }}
                  >
                    {submitting ? "Submitting…" : "Apply for projects"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const fInputCls =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 outline-none focus:border-slate-400 transition-colors box-border";
