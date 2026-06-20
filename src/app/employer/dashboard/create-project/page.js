"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import sideimage from "@/images/projectpage1.webp";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import EmployerSidebar from "@/employerComponets/EmployerSidebar";
import DashboardNavbar from "@/employerComponets/DashboardNavbar";
import { ChevronLeft, Check } from "lucide-react";

const PROJECT_TYPES = [
  {
    group: "Construction",
    label: "Commercial Building",
    example: "Offices, malls, hospitals",
  },
  {
    group: "Construction",
    label: "High-rise Residential",
    example: "Apartment towers, gated communities",
  },
  {
    group: "Construction",
    label: "Industrial & Factory",
    example: "Manufacturing plants, warehouses",
  },
  {
    group: "Construction",
    label: "Infrastructure",
    example: "Roads, bridges, public utilities",
  },
  {
    group: "Interior",
    label: "Interior Fit-out",
    example: "Office interiors, showroom design",
  },
  {
    group: "Interior",
    label: "Renovation & Repair",
    example: "Home improvement, painting, plumbing",
  },
  {
    group: "Logistics",
    label: "Warehousing & Logistics",
    example: "Supply chain, inventory management",
  },
  {
    group: "Logistics",
    label: "Last-Mile Delivery",
    example: "E-commerce, food, courier services",
  },
  {
    group: "Services",
    label: "Facility Management",
    example: "Office cleaning, site security",
  },
  {
    group: "Services",
    label: "Residential Household",
    example: "Private home daily support",
  },
];

const WORK_TYPES = [
  { label: "Labour Supply", example: "Providing manpower for a set duration" },
  {
    label: "Task-Based Service",
    example: "Pay per completed task (e.g., one-time delivery)",
  },
  {
    label: "Measurement Basis (Bill of Quantities)",
    example: "Paid by output (e.g., per sq ft)",
  },
  {
    label: "Fixed Price Contract",
    example: "Total project fee for end-to-end delivery",
  },
  {
    label: "AMC (Annual Maintenance)",
    example: "Yearly contract for routine service",
  },
  { label: "Retainer/Subscription", example: "Recurring monthly service" },
];

const WORKS = [
  {
    label: "Alumina/Shuttering Carpenter",
    example: "Formwork and structural support",
  },
  { label: "Barbender/Steel Fixer", example: "Reinforcement steel work" },
  { label: "Mason", example: "Bricklaying, plastering, tiling, flooring" },
  { label: "Welder", example: "Metal fabrication, structural welding" },
  { label: "Electrician", example: "Wiring, installation, electrical repairs" },
  { label: "Plumber", example: "Piping, sanitary and water fittings" },
  { label: "Painter", example: "Interior/exterior wall painting, finishing" },
  {
    label: "Concrete/Casting Crew",
    example: "Foundation pouring, slab casting",
  },
  {
    label: "General Construction Labour",
    example: "Site clearing, general assistance",
  },

  {
    label: "Delivery Executive",
    example: "Food, parcel, or document delivery",
  },
  {
    label: "Warehouse Operations",
    example: "Inventory, picking, packing, sorting",
  },
  { label: "Loading & Unloading", example: "Material handling, moving goods" },
  {
    label: "Logistics Driver",
    example: "Delivery van/truck driver, logistics route",
  },
  {
    label: "Housekeeping/Cleaning",
    example: "Deep cleaning, daily domestic help",
  },
  { label: "Cook/Chef", example: "Daily meal prep, catering assistance" },
  { label: "Security Guard", example: "Site, office, or residential security" },
  { label: "Driver", example: "Personal driver, family transport" },
  { label: "Gardener/Landscaper", example: "Lawn care, plant maintenance" },
  {
    label: "Appliance Repair Tech",
    example: "AC, fridge, washing machine repairs",
  },
  {
    label: "Personal Assistant/Helper",
    example: "General household or office support",
  },
  { label: "Caregiver/Nursing Help", example: "Elderly or child care support" },
];

const RATE_TYPES = [
  { label: "On Discussion", example: "Negotiable scope" },
  { label: "Per Hour", example: "Hourly expert services" },
  { label: "Per Day", example: "Standard daily wages" },
  { label: "Per Week/Month", example: "Full-time assignment" },
  {
    label: "Per Unit/Measurement",
    example: "Based on quantity (e.g., per sq ft)",
  },
  { label: "Per Delivery/Trip", example: "Common for logistics" },
];

export default function CreateProjectPage() {
  return (
    <Suspense fallback={<CreateProjectFallback />}>
      <CreateProjectPageInner />
    </Suspense>
  );
}

function CreateProjectFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function CreateProjectPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [checking, setChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);

  const [form, setForm] = useState({
    company: "",
    companySearch: "",
    title: "",
    projectType: "",
    workType: "",
    work: "",
    rateType: "On Discussion",
    rateAmount: "",
    workersRequired: "",
    location: "",
    country: "",
    state: "",
    urgent: false,
  });

  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries/positions")
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) {
          const names = d.data
            .map((c) => c.name)
            .sort((a, b) => a.localeCompare(b));
          setCountries(names);
        }
      })
      .catch(() => {
        setCountries([
          "India",
          "United States",
          "United Kingdom",
          "Canada",
          "Australia",
          "Germany",
          "France",
          "UAE",
          "Singapore",
          "Saudi Arabia",
        ]);
      });
  }, []);

  useEffect(() => {
    if (!form.country) {
      setStates([]);
      return;
    }
    setLoadingStates(true);
    setForm((f) => ({ ...f, state: "" }));
    fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: form.country }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.states) {
          setStates(d.data.states.map((s) => s.name).sort());
        } else {
          setStates([]);
        }
      })
      .catch(() => setStates([]))
      .finally(() => setLoadingStates(false));
  }, [form.country]);

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
      setCurrentUser(user);

      try {
        const snap = await getDocs(
          query(
            collection(db, "projects"),
            where("employerUid", "==", user.uid),
          ),
        );
        const myProjects = snap.docs.map((d) => d.data());
        setCompanySuggestions([
          ...new Set(myProjects.map((p) => p.company).filter(Boolean)),
        ]);
      } catch (err) {
        console.error("Could not fetch company suggestions:", err);
      }

      if (editId) {
        try {
          const snap = await getDoc(doc(db, "projects", editId));
          if (snap.exists()) {
            const d = snap.data();
            setForm({
              company: d.company || "",
              companySearch: d.company || "",
              title: d.title || "",
              projectType: d.projectType || "",
              workType: d.workType || "",
              work: d.work || "",
              rateType: d.rateType || "On Discussion",
              rateAmount: d.rateAmount || "",
              workersRequired: d.workersRequired || "",
              location: d.location || "",
              country: d.country || "",
              state: d.state || "",
              urgent: d.urgent || false,
            });
          }
        } catch (err) {
          console.error(err);
        }
      }
      setChecking(false);
    });
    return () => unsub();
  }, [editId]);

  const filteredCompanies = companySuggestions.filter((c) =>
    c.toLowerCase().includes((form.companySearch || "").toLowerCase()),
  );

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.company.trim()) e.company = "Company name is required";
    if (!form.title.trim()) e.title = "Job title is required";
    if (!form.projectType) e.projectType = "Select a project type";
    if (!form.workType) e.workType = "Select a work type";
    if (!form.work) e.work = "Select the type of work";
    if (
      !form.workersRequired ||
      isNaN(form.workersRequired) ||
      Number(form.workersRequired) < 1
    )
      e.workersRequired = "Enter number of workers needed";
    if (!form.location.trim()) e.location = "Enter the project location";
    if (!form.country) e.country = "Select a country";
    if (!form.state) e.state = "Select a state";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        company: form.company.trim(),
        title: form.title.trim(),
        projectType: form.projectType,
        workType: form.workType,
        work: form.work,
        rateType: form.rateType,
        rateAmount:
          form.rateType !== "On Discussion" ? form.rateAmount.trim() : "",
        workersRequired: Number(form.workersRequired),
        location: form.location.trim(),
        country: form.country,
        state: form.state,
        urgent: form.urgent,
        employerUid: currentUser.uid,
        employerEmail: currentUser.email,
      };
      if (editId) {
        await updateDoc(doc(db, "projects", editId), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "projects"), payload);
      }
      setSuccess(true);
      setTimeout(() => router.push("/employer/dashboard/projects"), 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <>
        <EmployerSidebar />
        <DashboardNavbar />
        <main className="md:ml-64 pt-14 min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center">
              <Check size={28} className="text-white" strokeWidth={3} />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {editId ? "Project Updated!" : "Project Posted!"}
            </h2>
            <p className="text-sm font-semibold text-slate-400">
              Redirecting to All Projects…
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <EmployerSidebar />
      <DashboardNavbar />
      <main className="md:ml-64 pt-14 min-h-screen bg-[#f8fafc] pb-24 md:pb-8">
        <div className="px-4 md:px-6 py-8">
          <div className="mb-7">
            <Link
              href="/employer/dashboard/projects"
              className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors no-underline mb-3"
            >
              <ChevronLeft size={15} />
              All Projects
            </Link>
            <h1 className="text-2xl font-black text-slate-900">
              {editId ? "Edit Project" : "Add New Project"}
            </h1>
            <p className="text-sm font-semibold text-slate-400 mt-1">
              Post a project to find skilled construction workers.
            </p>
          </div>

          <div className="flex flex-col-reverse xl:flex-row gap-8 items-start">
            <div className="flex-1 min-w-0 max-w-2xl">
              <div
                className="bg-white rounded-2xl border border-slate-200 p-6 md:p-7"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              >
                <Field label="Company Name" required error={errors.company}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="company name…"
                      value={
                        form.companySearch !== undefined
                          ? form.companySearch
                          : form.company
                      }
                      onFocus={() => setShowCompanySuggestions(true)}
                      onBlur={() =>
                        setTimeout(() => setShowCompanySuggestions(false), 150)
                      }
                      onChange={(e) => {
                        set("companySearch", e.target.value);
                        set("company", e.target.value);
                      }}
                      className={inputCls(errors.company)}
                    />
                    {showCompanySuggestions && filteredCompanies.length > 0 && (
                      <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto p-1">
                        {filteredCompanies.map((c) => (
                          <li
                            key={c}
                            onMouseDown={() => {
                              set("company", c);
                              set("companySearch", c);
                              setShowCompanySuggestions(false);
                            }}
                            className="px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50"
                          >
                            {c}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Field>

                <Field label="Job Title" required error={errors.title}>
                  <input
                    type="text"
                    placeholder="e.g. Mason, Carpenter, Helper"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    className={inputCls(errors.title)}
                  />
                </Field>

                <Field label="Project Type" required error={errors.projectType}>
                  <select
                    value={form.projectType}
                    onChange={(e) => set("projectType", e.target.value)}
                    className={inputCls(errors.projectType)}
                  >
                    <option value="">Select project type</option>
                    {Object.entries(
                      PROJECT_TYPES.reduce((acc, t) => {
                        (acc[t.group] = acc[t.group] || []).push(t);
                        return acc;
                      }, {}),
                    ).map(([group, items]) => (
                      <optgroup key={group} label={group}>
                        {items.map((t) => (
                          <option
                            key={t.label}
                            value={t.label}
                            title={t.example}
                          >
                            {t.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </Field>

                <Field label="Work Type" required error={errors.workType}>
                  <select
                    value={form.workType}
                    onChange={(e) => set("workType", e.target.value)}
                    className={inputCls(errors.workType)}
                  >
                    <option value="">Select work type</option>
                    {WORK_TYPES.map((t) => (
                      <option key={t.label} value={t.label} title={t.example}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Work / Role" required error={errors.work}>
                  <select
                    value={form.work}
                    onChange={(e) => set("work", e.target.value)}
                    className={inputCls(errors.work)}
                  >
                    <option value="">Select type of work</option>
                    {WORKS.map((w) => (
                      <option key={w.label} value={w.label} title={w.example}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Rate" required error={errors.work}>
                  <select
                    value={form.rateType}
                    onChange={(e) => set("rateType", e.target.value)}
                    className={inputCls()}
                  >
                    {RATE_TYPES.map((r) => (
                      <option key={r.label} value={r.label} title={r.example}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  {form.rateType !== "On Discussion" && (
                    <input
                      type="number"
                      min={0}
                      placeholder="Enter amount e.g. 34000"
                      value={form.rateAmount}
                      onChange={(e) => set("rateAmount", e.target.value)}
                      className={`${inputCls()} mt-3`}
                    />
                  )}
                </Field>

                <Field
                  label="Workers Required"
                  required
                  error={errors.workersRequired}
                >
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 10"
                    value={form.workersRequired}
                    onChange={(e) => set("workersRequired", e.target.value)}
                    className={inputCls(errors.workersRequired)}
                  />
                </Field>

                <Field
                  label="Project Location (City)"
                  required
                  error={errors.location}
                >
                  <input
                    type="text"
                    placeholder="e.g. Jewer, Mukerian"
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    className={inputCls(errors.location)}
                  />
                </Field>

                <Field label="Country" required error={errors.country}>
                  <select
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    className={inputCls(errors.country)}
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                <Field label="State / Province" required error={errors.state}>
                  <select
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    className={inputCls(errors.state)}
                    disabled={!form.country || loadingStates}
                  >
                    <option value="">
                      {!form.country
                        ? "Select a country first"
                        : loadingStates
                          ? "Loading states…"
                          : "Select state"}
                    </option>
                    {states.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>

                <div className="flex items-center gap-3 mb-7">
                  <button
                    type="button"
                    onClick={() => set("urgent", !form.urgent)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: form.urgent ? "#0f0f0f" : "#e2e8f0",
                      border: "none",
                      cursor: "pointer",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 3,
                        left: form.urgent ? 22 : 3,
                        width: 18,
                        height: 18,
                        background: "#fff",
                        borderRadius: "50%",
                        transition: "left 0.15s",
                      }}
                    />
                  </button>
                  <span
                    className={`text-sm font-bold ${form.urgent ? "text-slate-900" : "text-slate-400"}`}
                  >
                    Mark as Urgent Hiring
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#0f0f0f] text-white text-sm font-black px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Saving…"
                      : editId
                        ? "Update Project"
                        : "Post Project"}
                  </button>
                  <Link
                    href="/employer/dashboard/projects"
                    className="flex items-center border border-slate-200 text-slate-600 text-sm font-bold px-5 py-3 rounded-xl hover:bg-slate-50 transition-colors no-underline"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>

            <div className="xl:block w-full xl:w-95 xl:shrink-0 xl:sticky xl:top-20 mt-6 xl:mt-0">
              <div
                className="rounded-2xl overflow-hidden border border-slate-200"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              >
                <Image
                  src={sideimage}
                  alt="Construction project"
                  width={380}
                  height={500}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              <div
                className="mt-4 bg-white rounded-2xl border border-slate-200 p-5"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              >
                <p className="text-sm font-black text-slate-800 mb-1">
                  Find the right workers, fast.
                </p>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                  Post your project details and connect with skilled
                  construction workers across India and beyond.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Field({ label, required, error, hint, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-black text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && (
        <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
          {hint}
        </p>
      )}
      {children}
      {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (error) =>
  `w-full border ${error ? "border-red-400" : "border-slate-200"} rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 outline-none focus:border-slate-400 transition-colors box-border disabled:opacity-50 disabled:cursor-not-allowed`;