"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Save,
  Send,
  X,
  Globe,
  Building2,
  Briefcase,
  DollarSign,
  FileText,
  AlertCircle,
  Search,
  Plus,
} from "lucide-react";
import {
  COUNTRIES,
  LANGUAGES,
  INDUSTRIES,
  JOB_TITLE_SUGGESTIONS,
  JOB_TITLES_BY_INDUSTRY,
  DEPARTMENT_SUGGESTIONS,
  WORK_TYPES,
  JOB_TYPES,
  EXP_LEVELS,
  URGENCY_OPTIONS,
  PAY_STRUCTURES,
  CURRENCIES,
  ALL_PERKS,
} from "@/app/employer/dashboard/create-job/constants";
import AdminSidebar, {
  getStoredSidebarCollapsed,
  TOGGLE_EVENT,
} from "@/adminComponents/AdminSidebar";

const ADMIN_COMPANY = "Jobs Abroad";

const PLATFORM_EMPLOYER_UID = "yQJi0KNN9EVOkzJNntMtUnV";

const STEPS = [
  { id: 1, label: "Context", icon: Globe },
  { id: 2, label: "Details", icon: Briefcase },
  { id: 3, label: "Terms", icon: Building2 },
  { id: 4, label: "Compensation", icon: DollarSign },
  { id: 5, label: "Review", icon: FileText },
];

const INITIAL_FORM = {
  targetCountry: "",
  language: "English",
  companyName: ADMIN_COMPANY,
  industry: "",
  customIndustry: "",
  title: "",
  workType: "On-site",
  city: "",
  state: "",
  addressLine: "",
  department: "",
  jobType: "Full-time",
  experienceLevel: "",
  vacancies: 1,
  jobStartDate: "",
  applicationDeadline: "",
  urgency: "Medium",
  payStructure: "Salary Range",
  currencies: [],
  salaryUnit: "LPA",
  salaryMin: "",
  salaryMax: "",
  fixedSalary: "",
  hourlyRate: "",
  perks: [],
  description: "",
  requirements: "",
  benefits: "",
  postingMode: "own",
  externalCompanyName: "",
  externalCareerUrl: "",
  referralCompanyName: "",
  referralContactName: "",
  referralContactPhone: "",
};

function cls(...args) {
  return args.filter(Boolean).join(" ");
}

function Label({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={cls(
        "w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003882]/40 focus:border-transparent transition-all",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cls(
        "w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl resize-none",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003882]/40 focus:border-transparent transition-all",
        className,
      )}
      {...props}
    />
  );
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cls(
            "px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all",
            value === opt
              ? "bg-[#003882] text-white border-[#003882] shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  allowCustom,
  customLabel,
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative">
      <div
        className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl cursor-pointer flex items-center justify-between"
        onClick={() => setOpen((p) => !p)}
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <Search size={14} className="text-slate-400" />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                  setSearch("");
                }}
                className={cls(
                  "w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors",
                  value === opt
                    ? "bg-[#e8eefb] text-[#003882] font-semibold"
                    : "text-slate-700",
                )}
              >
                {opt}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-slate-400">
                No results found
              </p>
            )}
          </div>
          {allowCustom && (
            <div className="border-t border-slate-100 p-2">
              {!showCustom ? (
                <button
                  type="button"
                  onClick={() => setShowCustom(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-semibold"
                >
                  <Plus size={13} /> Add "{customLabel || "custom"}"
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder={`Enter custom ${customLabel || "value"}...`}
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customValue.trim()) {
                        onChange(customValue.trim());
                        setOpen(false);
                        setShowCustom(false);
                        setCustomValue("");
                        setSearch("");
                      }
                    }}
                    className="px-3 py-2 bg-[#003882] text-white text-sm font-semibold rounded-lg hover:bg-[#002a61]"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AutocompleteInput({ suggestions, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(value.toLowerCase()) &&
      s.toLowerCase() !== value.toLowerCase(),
  );

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 150)}
        placeholder={placeholder}
      />
      {show && value.length > 0 && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 max-h-48 overflow-y-auto">
          {filtered.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => {
                onChange(s);
                setShow(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CurrencySelect({ selected, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (code) => {
    onChange(
      selected.includes(code)
        ? selected.filter((c) => c !== code)
        : [...selected, code],
    );
  };

  return (
    <div className="relative">
      <div
        className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl cursor-pointer flex items-center justify-between min-h-12 flex-wrap gap-1"
        onClick={() => setOpen((p) => !p)}
      >
        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selected.map((code) => {
              const c = CURRENCIES.find((x) => x.code === code);
              return (
                <span
                  key={code}
                  className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                  {c?.symbol} {code}
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      toggle(code);
                    }}
                    className="hover:text-red-400"
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-slate-400">Select currency...</span>
        )}
        <Search size={14} className="text-slate-400 shrink-0" />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 outline-none"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map((c) => (
              <label
                key={c.code}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(c.code)}
                  onChange={() => toggle(c.code)}
                  className="accent-[#003882]"
                />
                <span className="text-sm font-semibold text-slate-700 w-10">
                  {c.code}
                </span>
                <span className="text-sm text-slate-500">{c.name}</span>
                <span className="ml-auto text-sm text-slate-400">
                  {c.symbol}
                </span>
              </label>
            ))}
          </div>
          <div className="p-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-2 bg-[#003882] hover:bg-[#002a61] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div
            key={step.id}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={cls(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  done
                    ? "bg-[#003882] border-[#003882] text-white"
                    : active
                      ? "bg-white border-[#003882] text-[#003882]"
                      : "bg-white border-slate-200 text-slate-400",
                )}
              >
                {done ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (
                  <Icon size={16} />
                )}
              </div>
              <span
                className={cls(
                  "text-xs font-semibold hidden sm:block",
                  active
                    ? "text-[#003882]"
                    : done
                      ? "text-slate-500"
                      : "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cls(
                  "flex-1 h-0.5 mx-2 mb-5",
                  done ? "bg-[#003882]" : "bg-slate-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Step1({ form, setForm, adminData }) {
  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const postingMode = form.postingMode || "own";

  const setMode = (mode) => {
    setForm((f) => ({
      ...f,
      postingMode: mode,
      externalCompanyName: "",
      externalCareerUrl: "",
      referralCompanyName: "",
      referralContactName: "",
      referralContactPhone: "",
      companyName: mode === "own" ? ADMIN_COMPANY : "",
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Context & Localization
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Set the target market and framing before anything else.
        </p>
      </div>

      <div>
        <Label required>Posting Type</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
          {[
            {
              key: "own",
              title: "My Company",
              desc: `Post a job for ${ADMIN_COMPANY}`,
            },
            {
              key: "external",
              title: "External Listing",
              desc: "Post for another company with a redirect to their careers page",
            },
            {
              key: "referral",
              title: "Referral Post",
              desc: "Refer applicants to another employer you know is hiring",
            },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setMode(opt.key)}
              className={cls(
                "text-left px-4 py-4 rounded-xl border-2 transition-all",
                postingMode === opt.key
                  ? "border-[#003882] bg-[#003882]"
                  : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50",
              )}
            >
              <p
                className={cls(
                  "text-sm font-bold",
                  postingMode === opt.key ? "text-white" : "text-slate-900",
                )}
              >
                {opt.title}
              </p>
              <p
                className={cls(
                  "text-xs mt-1 leading-relaxed",
                  postingMode === opt.key ? "text-slate-300" : "text-slate-500",
                )}
              >
                {opt.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {postingMode === "own" && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Building2 size={16} className="text-slate-500 shrink-0" />
          <div>
            <p className="text-xs text-slate-500 font-semibold">Posting as</p>
            <p className="text-sm font-bold text-slate-900">{ADMIN_COMPANY}</p>
          </div>
        </div>
      )}

      {postingMode === "external" && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-600 leading-relaxed">
            Applicants will see all job details on your portal. When they click
            Apply, they will be redirected to the external company's careers
            page.
          </div>
          <div>
            <Label required>External Company Name</Label>
            <Input
              placeholder="e.g. Google, Infosys, Accenture..."
              value={form.externalCompanyName || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  externalCompanyName: e.target.value,
                  companyName: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label required>Company Careers Page URL</Label>
            <Input
              placeholder="https://careers.company.com/job/..."
              value={form.externalCareerUrl || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  externalCareerUrl: e.target.value,
                }))
              }
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Applicants will be redirected here when they click Apply
            </p>
          </div>
        </div>
      )}

      {postingMode === "referral" && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-600 leading-relaxed">
            You are referring applicants to another employer. Your name will be
            shown as the referrer. Applicants apply through your portal and you
            forward them.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label required>Company You're Referring To</Label>
              <Input
                placeholder="e.g. Microsoft, TCS, Wipro..."
                value={form.referralCompanyName || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    referralCompanyName: e.target.value,
                    companyName: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Contact Person at That Company</Label>
              <Input
                placeholder="e.g. Raj Sharma (HR Manager)"
                value={form.referralContactName || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    referralContactName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>
                Contact Person Phone{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={form.referralContactPhone || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    referralContactPhone: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-slate-400 mt-1.5">
                Shown privately to you only — not visible to applicants
              </p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Building2 size={16} className="text-slate-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-semibold">
                Referral posted by
              </p>
              <p className="text-sm font-bold text-slate-900">
                {adminData?.firstName} {adminData?.lastName} · {ADMIN_COMPANY}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label required>Target Country</Label>
          <SearchableSelect
            options={COUNTRIES}
            value={form.targetCountry}
            onChange={update("targetCountry")}
            placeholder="Select country..."
          />
        </div>
        <div>
          <Label required>Job Posting Language</Label>
          <SearchableSelect
            options={LANGUAGES}
            value={form.language}
            onChange={update("language")}
            placeholder="Select language..."
          />
        </div>
        <div className="sm:col-span-2">
          <Label required>Industry</Label>
          <SearchableSelect
            options={INDUSTRIES}
            value={form.industry}
            onChange={update("industry")}
            placeholder="Search or select industry..."
            allowCustom
            customLabel="industry"
          />
        </div>
      </div>
    </div>
  );
}

function Step2({ form, setForm }) {
  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const titleSuggestions =
    JOB_TITLES_BY_INDUSTRY[form.industry] || JOB_TITLE_SUGGESTIONS;
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const prevCountryRef = useRef(null);
  const prevStateRef = useRef(null);

  useEffect(() => {
    if (!form.targetCountry || form.workType === "Remote") return;
    const countryChanged =
      prevCountryRef.current !== null &&
      prevCountryRef.current !== form.targetCountry;
    prevCountryRef.current = form.targetCountry;
    setStates([]);
    setCities([]);
    if (countryChanged) {
      setForm((f) => ({ ...f, state: "", city: "", addressLine: "" }));
    }
    setLoadingStates(true);
    fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: form.targetCountry }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.data?.states) {
          setStates(data.data.states.map((s) => s.name));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStates(false));
  }, [form.targetCountry, form.workType]);

  useEffect(() => {
    if (!form.state || !form.targetCountry || form.workType === "Remote")
      return;
    const stateChanged =
      prevStateRef.current !== null && prevStateRef.current !== form.state;
    prevStateRef.current = form.state;
    setCities([]);
    if (stateChanged) {
      setForm((f) => ({ ...f, city: "" }));
    }
    setLoadingCities(true);
    fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: form.targetCountry, state: form.state }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.data) setCities(data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingCities(false));
  }, [form.state, form.targetCountry, form.workType]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Basic Job Details</h2>
        <p className="text-sm text-slate-500 mt-1">
          Core information about the role and location.
        </p>
      </div>
      <div>
        <Label required>Job Title</Label>
        <AutocompleteInput
          suggestions={titleSuggestions}
          value={form.title}
          onChange={update("title")}
          placeholder="e.g. Full Stack Developer, Data Scientist..."
        />
        <p className="text-xs text-slate-400 mt-1.5">
          {form.industry
            ? `Showing suggestions for ${form.industry}`
            : "Start typing to see suggestions"}
        </p>
      </div>
      <div>
        <Label>Department</Label>
        <AutocompleteInput
          suggestions={DEPARTMENT_SUGGESTIONS}
          value={form.department}
          onChange={update("department")}
          placeholder="e.g. Engineering, Marketing..."
        />
      </div>
      <div>
        <Label>Work Location Type</Label>
        <ToggleGroup
          options={WORK_TYPES}
          value={form.workType}
          onChange={(v) => setForm((f) => ({ ...f, workType: v }))}
        />
      </div>
      {form.workType !== "Remote" && (
        <div className="space-y-4">
          {!form.targetCountry && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs font-semibold text-amber-700">
              Please select a Target Country in Step 1 to load states and
              cities.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label>State / Region</Label>
              {states.length > 0 ? (
                <SearchableSelect
                  options={states}
                  value={form.state}
                  onChange={(val) => setForm((f) => ({ ...f, state: val }))}
                  placeholder={
                    loadingStates ? "Loading states..." : "Select state..."
                  }
                />
              ) : (
                <Input
                  placeholder={
                    loadingStates ? "Loading states..." : "e.g. Maharashtra"
                  }
                  value={form.state}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, state: e.target.value }))
                  }
                  disabled={loadingStates}
                />
              )}
            </div>
            <div>
              <Label>City</Label>
              {cities.length > 0 ? (
                <SearchableSelect
                  options={cities}
                  value={form.city}
                  onChange={(val) => setForm((f) => ({ ...f, city: val }))}
                  placeholder={
                    loadingCities ? "Loading cities..." : "Select city..."
                  }
                />
              ) : (
                <Input
                  placeholder={
                    loadingCities
                      ? "Loading cities..."
                      : form.state
                        ? "e.g. Pune"
                        : "Select state first"
                  }
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                  disabled={
                    loadingCities || (!form.state && cities.length === 0)
                  }
                />
              )}
            </div>
          </div>
          <div>
            <Label>Address Line</Label>
            <Input
              placeholder="e.g. 4th Floor, Tech Park, Whitefield"
              value={form.addressLine || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, addressLine: e.target.value }))
              }
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Building, street, or area name
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Step3({ form, setForm }) {
  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Employment Terms & Urgency
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Define the timeline and hiring urgency.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label>Job Type</Label>
          <select
            value={form.jobType}
            onChange={update("jobType")}
            className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003882]/40 appearance-none"
          >
            {JOB_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Experience Level</Label>
          <select
            value={form.experienceLevel}
            onChange={update("experienceLevel")}
            className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003882]/40 appearance-none"
          >
            <option value="">Select level...</option>
            {EXP_LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Number of Vacancies</Label>
          <Input
            type="number"
            min={1}
            value={form.vacancies}
            onChange={(e) =>
              setForm((f) => ({ ...f, vacancies: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <Label>Hiring Urgency</Label>
          <select
            value={form.urgency}
            onChange={update("urgency")}
            className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003882]/40 appearance-none"
          >
            {URGENCY_OPTIONS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Job Start Date</Label>
          <Input
            type="date"
            value={form.jobStartDate}
            onChange={update("jobStartDate")}
          />
          <p className="text-xs text-slate-400 mt-1.5">
            When the selected candidate is expected to start work
          </p>
        </div>
        <div>
          <Label>Application Deadline</Label>
          <Input
            type="date"
            value={form.applicationDeadline}
            onChange={update("applicationDeadline")}
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Last date for candidates to apply for this role
          </p>
        </div>
      </div>
    </div>
  );
}

const SALARY_UNIT_OPTIONS = [
  "LPA",
  "CTC",
  "Per Month",
  "Per Week",
  "Per Day",
  "Per Hour",
];

function SalaryUnitToggle({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SALARY_UNIT_OPTIONS.map((unit) => (
        <button
          key={unit}
          type="button"
          onClick={() => onChange(unit)}
          className={cls(
            "px-4 py-2 text-xs font-semibold rounded-xl border transition-all",
            value === unit
              ? "bg-[#003882] text-white border-[#003882]"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-400",
          )}
        >
          {unit}
        </button>
      ))}
    </div>
  );
}

function Step4({ form, setForm }) {
  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const togglePerk = (p) =>
    setForm((f) => ({
      ...f,
      perks: f.perks.includes(p)
        ? f.perks.filter((x) => x !== p)
        : [...f.perks, p],
    }));

  const primaryCurrency = form.currencies[0] || "";
  const currencySymbol =
    CURRENCIES.find((c) => c.code === primaryCurrency)?.symbol ||
    primaryCurrency;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Compensation & Perks
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tell candidates what they'll earn and enjoy.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label>Pay Structure</Label>
          <select
            value={form.payStructure}
            onChange={update("payStructure")}
            className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003882]/40 appearance-none"
          >
            {PAY_STRUCTURES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Currency</Label>
          <CurrencySelect
            selected={form.currencies}
            onChange={(v) => setForm((f) => ({ ...f, currencies: v }))}
          />
        </div>
      </div>

      {form.payStructure === "Salary Range" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Label>Salary Unit</Label>
            <SalaryUnitToggle
              value={form.salaryUnit}
              onChange={(v) => setForm((f) => ({ ...f, salaryUnit: v }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label>
                Min Salary{currencySymbol ? ` (${currencySymbol})` : ""}{" "}
                {form.salaryUnit}
              </Label>
              <Input
                type="number"
                placeholder="50000"
                value={form.salaryMin}
                onChange={update("salaryMin")}
              />
            </div>
            <div>
              <Label>
                Max Salary{currencySymbol ? ` (${currencySymbol})` : ""}{" "}
                {form.salaryUnit}
              </Label>
              <Input
                type="number"
                placeholder="80000"
                value={form.salaryMax}
                onChange={update("salaryMax")}
              />
            </div>
          </div>
        </div>
      )}

      {form.payStructure === "Fixed" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Label>Salary Unit</Label>
            <SalaryUnitToggle
              value={form.salaryUnit}
              onChange={(v) => setForm((f) => ({ ...f, salaryUnit: v }))}
            />
          </div>
          <div>
            <Label>
              Fixed Annual Salary{currencySymbol ? ` (${currencySymbol})` : ""}{" "}
              {form.salaryUnit}
            </Label>
            <Input
              type="number"
              placeholder="65000"
              value={form.fixedSalary}
              onChange={update("fixedSalary")}
            />
          </div>
        </div>
      )}

      {form.payStructure === "Hourly" && (
        <div>
          <Label>
            Hourly Rate{currencySymbol ? ` (${currencySymbol})` : ""}
          </Label>
          <Input
            type="number"
            placeholder="45"
            value={form.hourlyRate}
            onChange={update("hourlyRate")}
          />
        </div>
      )}

      {form.payStructure === "Negotiable" && (
        <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-500 border border-slate-200">
          Salary will be discussed during the interview process.
        </div>
      )}

      <div>
        <Label>Benefits & Perks</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {ALL_PERKS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePerk(p)}
              className={cls(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full border transition-all",
                form.perks.includes(p)
                  ? "bg-[#003882] text-white border-[#003882]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400",
              )}
            >
              {form.perks.includes(p) && <Check size={10} />}
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step5({ form, setForm, adminData }) {
  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const location =
    form.workType === "Remote"
      ? "Remote"
      : [form.city, form.state].filter(Boolean).join(", ") || "—";
  const primaryCurrency = form.currencies[0] || "";
  const currencySymbol =
    CURRENCIES.find((c) => c.code === primaryCurrency)?.symbol ||
    primaryCurrency;

  const salary = (() => {
    if (form.payStructure === "Negotiable") return "Negotiable";
    if (
      form.payStructure === "Salary Range" &&
      form.salaryMin &&
      form.salaryMax
    )
      return `${currencySymbol} ${Number(form.salaryMin).toLocaleString()} – ${Number(form.salaryMax).toLocaleString()} ${form.salaryUnit}`;
    if (form.payStructure === "Fixed" && form.fixedSalary)
      return `${currencySymbol} ${Number(form.fixedSalary).toLocaleString()} ${form.salaryUnit}`;
    if (form.payStructure === "Hourly" && form.hourlyRate)
      return `${currencySymbol} ${form.hourlyRate} / hr`;
    return "—";
  })();

  const insertFormatting = (fieldKey, currentValue, type) => {
    const lines = currentValue ? currentValue.split("\n") : [];
    let newText = currentValue || "";
    if (type === "numbered") {
      const nextNum = lines.filter((l) => /^\d+\./.test(l)).length + 1;
      newText = currentValue ? currentValue + `\n${nextNum}. ` : `${nextNum}. `;
    } else if (type === "bullet") {
      newText = currentValue ? currentValue + "\n• " : "• ";
    } else if (type === "newline") {
      newText = currentValue ? currentValue + "\n" : "\n";
    }
    setForm((f) => ({ ...f, [fieldKey]: newText }));
  };

  function FormattingToolbar({ fieldKey, value }) {
    return (
      <div className="flex items-center gap-1.5 mb-1.5">
        <button
          type="button"
          onClick={() => insertFormatting(fieldKey, value, "numbered")}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
        >
          1. Numbered
        </button>
        <button
          type="button"
          onClick={() => insertFormatting(fieldKey, value, "bullet")}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
        >
          • Bullet
        </button>
        <button
          type="button"
          onClick={() => insertFormatting(fieldKey, value, "newline")}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
        >
          ↵ New Line
        </button>
        <span className="text-xs text-slate-400 ml-auto">
          {value ? value.split("\n").length : 0} lines
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Role Definition & Review
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Write the job description and review everything before publishing.
        </p>
      </div>

      <div>
        <Label required>Job Description</Label>
        <FormattingToolbar fieldKey="description" value={form.description} />
        <textarea
          rows={8}
          placeholder={`Describe the role, responsibilities, and what a typical day looks like…\n\nExample:\n1. Lead the frontend development team\n2. Collaborate with designers\n• Work in an agile environment`}
          value={form.description}
          onChange={update("description")}
          className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003882]/40 focus:border-transparent transition-all font-mono leading-relaxed"
          style={{ resize: "vertical", minHeight: "180px" }}
        />
      </div>

      <div>
        <Label required>Requirements</Label>
        <FormattingToolbar fieldKey="requirements" value={form.requirements} />
        <textarea
          rows={7}
          placeholder={`List required skills, qualifications, and experience…\n\nExample:\n1. 3+ years of React experience\n2. Strong communication skills\n• Bachelor's degree in CS or related field`}
          value={form.requirements}
          onChange={update("requirements")}
          className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003882]/40 focus:border-transparent transition-all font-mono leading-relaxed"
          style={{ resize: "vertical", minHeight: "160px" }}
        />
      </div>

      <div>
        <Label>Benefits</Label>
        <FormattingToolbar fieldKey="benefits" value={form.benefits} />
        <textarea
          rows={5}
          placeholder={`List the benefits you offer…\n\nExample:\n• Health insurance\n• Flexible working hours\n1. Annual performance bonus`}
          value={form.benefits || ""}
          onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))}
          className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003882]/40 focus:border-transparent transition-all font-mono leading-relaxed"
          style={{ resize: "vertical", minHeight: "120px" }}
        />
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Job Preview Summary
        </p>

        {adminData && (
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <div className="w-9 h-9 rounded-full bg-[#003882] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">
                {adminData.firstName?.[0]}
                {adminData.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {adminData.firstName} {adminData.lastName}
              </p>
              <p className="text-xs text-slate-500">
                {adminData.email} · {ADMIN_COMPANY}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {[
            ["Company", form.companyName || ADMIN_COMPANY || "—"],
            ["Title", form.title || "—"],
            ["Industry", form.industry || "—"],
            ["Location", location],
            ["Type", form.jobType],
            ["Experience", form.experienceLevel || "—"],
            ["Vacancies", form.vacancies],
            ["Urgency", form.urgency],
            ["Job Start Date", form.jobStartDate || "—"],
            ["Application Deadline", form.applicationDeadline || "—"],
            ["Compensation", salary],
            ["Target Market", form.targetCountry || "—"],
          ].map(([label, val]) => (
            <div key={label}>
              <span className="text-slate-400 text-xs font-semibold">
                {label}
              </span>
              <p className="text-slate-800 font-semibold truncate">{val}</p>
            </div>
          ))}
        </div>

        {form.perks.length > 0 && (
          <div>
            <span className="text-slate-400 text-xs font-semibold">Perks</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {form.perks.map((p) => (
                <span
                  key={p}
                  className="bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {form.description && (
          <div>
            <span className="text-slate-400 text-xs font-semibold">
              Description Preview
            </span>
            <p className="text-slate-700 text-xs mt-1 whitespace-pre-line leading-relaxed line-clamp-4">
              {form.description}
            </p>
          </div>
        )}

        {form.requirements && (
          <div>
            <span className="text-slate-400 text-xs font-semibold">
              Requirements Preview
            </span>
            <p className="text-slate-700 text-xs mt-1 whitespace-pre-line leading-relaxed line-clamp-4">
              {form.requirements}
            </p>
          </div>
        )}

        {form.benefits && (
          <div>
            <span className="text-slate-400 text-xs font-semibold">
              Benefits Preview
            </span>
            <p className="text-slate-700 text-xs mt-1 whitespace-pre-line leading-relaxed line-clamp-4">
              {form.benefits}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateJobPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [currentDraftId, setCurrentDraftId] = useState(draftId || null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(getStoredSidebarCollapsed());
    const handleToggle = () => setSidebarCollapsed(getStoredSidebarCollapsed());
    window.addEventListener(TOGGLE_EVENT, handleToggle);
    return () => window.removeEventListener(TOGGLE_EVENT, handleToggle);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "admin_staff", user.uid));
        if (snap.exists()) {
          setAdminData(snap.data());
        }
      } catch (err) {
        console.error(err);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!draftId) return;
    const load = async () => {
      const snap = await getDoc(doc(db, "jobs", draftId));
      if (snap.exists()) setForm((prev) => ({ ...prev, ...snap.data() }));
    };
    load();
  }, [draftId]);

  const updateForm = useCallback((updater) => {
    setForm(updater);
    setIsDirty(true);
  }, []);

  const saveDraft = async (formData, silent = false) => {
    const user = auth.currentUser;
    if (!user) return;
    if (!silent) setSaving(true);
    try {
      const payload = {
        ...formData,
        status: "Draft",
        employerUid:
          formData.postingMode === "own" ? PLATFORM_EMPLOYER_UID : null,
        postedByAdmin: true,
        postedByAdminUid: user.uid,
        updatedAt: new Date().toISOString(),
        location:
          formData.workType === "Remote"
            ? "Remote"
            : [formData.city, formData.state].filter(Boolean).join(", "),
        type: formData.jobType,
      };
      if (currentDraftId) {
        await updateDoc(doc(db, "jobs", currentDraftId), payload);
      } else {
        const ref = await addDoc(collection(db, "jobs"), {
          ...payload,
          createdAt: new Date().toISOString(),
          applicants: 0,
          starred: false,
        });
        setCurrentDraftId(ref.id);
      }
      if (!silent) {
        setSaveMsg("Draft saved");
        setTimeout(() => setSaveMsg(""), 2500);
      }
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      setError("Failed to save draft.");
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const handleNext = async () => {
    setError("");
    if (step === 1 && (!form.targetCountry.trim() || !form.industry)) {
      setError("Please fill in all required fields.");
      return;
    }
    if (
      step === 1 &&
      form.postingMode === "external" &&
      (!form.externalCompanyName?.trim() || !form.externalCareerUrl?.trim())
    ) {
      setError(
        "Please provide the external company name and careers page URL.",
      );
      return;
    }
    if (
      step === 1 &&
      form.postingMode === "referral" &&
      !form.referralCompanyName?.trim()
    ) {
      setError("Please provide the company you're referring to.");
      return;
    }
    if (step === 2 && !form.title.trim()) {
      setError("Job title is required.");
      return;
    }
    if (step === 5 && (!form.description.trim() || !form.requirements.trim())) {
      setError("Job description and requirements are required.");
      return;
    }
    await saveDraft(form, true);
    setStep((s) => Math.min(s + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePublish = async () => {
    setError("");
    if (!form.description.trim() || !form.requirements.trim()) {
      setError("Please complete the job description and requirements.");
      return;
    }
    const user = auth.currentUser;
    if (!user) return;
    setPublishing(true);
    try {
      const payload = {
        ...form,
        status: "Open",
        employerUid: form.postingMode === "own" ? PLATFORM_EMPLOYER_UID : null,
        postedByAdmin: true,
        postedByAdminUid: user.uid,
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        location:
          form.workType === "Remote"
            ? "Remote"
            : [form.city, form.state].filter(Boolean).join(", "),
        type: form.jobType,
      };
      if (currentDraftId) {
        await updateDoc(doc(db, "jobs", currentDraftId), payload);
      } else {
        await addDoc(collection(db, "jobs"), {
          ...payload,
          createdAt: new Date().toISOString(),
          applicants: 0,
          starred: false,
        });
      }
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to publish job.");
    } finally {
      setPublishing(false);
    }
  };

  const stepProps = { form, setForm: updateForm, adminData };

  return (
    <>
      <AdminSidebar />
      <main
        className={cls(
          "min-h-screen bg-[#e8eaed] transition-all duration-200",
          sidebarCollapsed ? "md:ml-20" : "md:ml-60",
          "pt-14 md:pt-0",
        )}
        style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}
      >
        <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  isDirty
                    ? setShowLeaveWarning(true)
                    : router.push("/admin/dashboard")
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-[#003882]">
                  {currentDraftId ? "Continue Draft" : "Create Job Posting"}
                </h1>
                {currentDraftId && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    Draft · Auto-saved
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saveMsg && (
                <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <Check size={12} /> {saveMsg}
                </span>
              )}
              <button
                onClick={() => saveDraft(form)}
                disabled={saving}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Save size={13} />
                {saving ? "Saving…" : "Save Draft"}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <StepBar current={step} />

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            {step === 1 && <Step1 {...stepProps} />}
            {step === 2 && <Step2 {...stepProps} />}
            {step === 3 && <Step3 {...stepProps} />}
            {step === 4 && <Step4 {...stepProps} />}
            {step === 5 && <Step5 {...stepProps} />}

            {error && (
              <div className="mt-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center gap-1.5 px-5 py-3 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={15} /> Back
              </button>
              {step < 5 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-6 py-3 text-sm font-semibold text-white bg-[#003882] hover:bg-[#002a61] rounded-xl transition-colors shadow-sm"
                >
                  Next <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-[#003882] hover:bg-[#002a61] rounded-xl transition-colors shadow-sm disabled:opacity-60"
                >
                  <Send size={14} />
                  {publishing ? "Publishing…" : "Publish Job"}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4 font-medium">
            Step {step} of {STEPS.length} — {STEPS[step - 1].label}
          </p>
        </div>

        {showLeaveWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003882]/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <h2 className="text-base font-bold text-slate-900 mb-2">
                Save before leaving?
              </h2>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                You have unsaved changes. Your progress will be saved as a draft
                so you can come back anytime.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await saveDraft(form);
                    router.push("/admin/dashboard");
                  }}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#003882] hover:bg-[#002a61] rounded-xl transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Discard
                </button>
              </div>
              <button
                onClick={() => setShowLeaveWarning(false)}
                className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Keep editing
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function CreateJobPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8eaed]">
      <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CreateJobPageFallback />}>
      <CreateJobPageInner />
    </Suspense>
  );
}
