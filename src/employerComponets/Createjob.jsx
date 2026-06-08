"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  DEPARTMENT_SUGGESTIONS,
  WORK_TYPES,
  JOB_TYPES,
  EXP_LEVELS,
  URGENCY_OPTIONS,
  PAY_STRUCTURES,
  CURRENCIES,
  ALL_PERKS,
} from "@/app/employer/dashboard/create-job/constants";

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
  companyName: "",
  industry: "",
  customIndustry: "",
  title: "",
  workType: "On-site",
  city: "",
  state: "",
  department: "",
  jobType: "Full-time",
  experienceLevel: "",
  vacancies: 1,
  jobStartDate: "",
  applicationDeadline: "",
  urgency: "Medium",
  payStructure: "Salary Range",
  currencies: ["INR"],
  salaryMin: "",
  salaryMax: "",
  fixedSalary: "",
  hourlyRate: "",
  perks: [],
  description: "",
  requirements: "",
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
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all",
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
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all",
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
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
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
                    ? "bg-slate-100 text-slate-900 font-semibold"
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
                    className="px-3 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-black"
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
          <span className="text-slate-400">Select currencies...</span>
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
                  className="accent-slate-800"
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
              className="w-full py-2 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors"
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
                    ? "bg-slate-900 border-slate-900 text-white"
                    : active
                      ? "bg-white border-slate-900 text-slate-900"
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
                    ? "text-slate-900"
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
                  done ? "bg-slate-900" : "bg-slate-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Step1({ form, setForm, employerData }) {
  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
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

      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <Building2 size={16} className="text-slate-500 shrink-0" />
        <div>
          <p className="text-xs text-slate-500 font-semibold">Posting as</p>
          <p className="text-sm font-bold text-slate-900">
            {employerData?.company || form.companyName || "Your Company"}
          </p>
        </div>
      </div>

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
          suggestions={JOB_TITLE_SUGGESTIONS}
          value={form.title}
          onChange={update("title")}
          placeholder="e.g. Full Stack Developer, Data Scientist..."
        />
        <p className="text-xs text-slate-400 mt-1.5">
          Start typing to see suggestions
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <Label>City</Label>
            <Input
              placeholder="e.g. New York"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div>
            <Label>State / Region</Label>
            <Input
              placeholder="e.g. NY"
              value={form.state}
              onChange={(e) =>
                setForm((f) => ({ ...f, state: e.target.value }))
              }
            />
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
            className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none"
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
            className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none"
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
            className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none"
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

  const primaryCurrency = form.currencies[0] || "INR";
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
            className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none"
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
        <div className="grid grid-cols-2 gap-5">
          <div>
            <Label>Min Salary ({currencySymbol})</Label>
            <Input
              type="number"
              placeholder="50000"
              value={form.salaryMin}
              onChange={update("salaryMin")}
            />
          </div>
          <div>
            <Label>Max Salary ({currencySymbol})</Label>
            <Input
              type="number"
              placeholder="80000"
              value={form.salaryMax}
              onChange={update("salaryMax")}
            />
          </div>
        </div>
      )}
      {form.payStructure === "Fixed" && (
        <div>
          <Label>Fixed Annual Salary ({currencySymbol})</Label>
          <Input
            type="number"
            placeholder="65000"
            value={form.fixedSalary}
            onChange={update("fixedSalary")}
          />
        </div>
      )}
      {form.payStructure === "Hourly" && (
        <div>
          <Label>Hourly Rate ({currencySymbol})</Label>
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
                  ? "bg-slate-900 text-white border-slate-900"
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

function Step5({ form, setForm, employerData }) {
  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const location =
    form.workType === "Remote"
      ? "Remote"
      : [form.city, form.state].filter(Boolean).join(", ") || "—";
  const primaryCurrency = form.currencies[0] || "INR";
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
      return `${currencySymbol} ${Number(form.salaryMin).toLocaleString()} – ${Number(form.salaryMax).toLocaleString()}`;
    if (form.payStructure === "Fixed" && form.fixedSalary)
      return `${currencySymbol} ${Number(form.fixedSalary).toLocaleString()} / yr`;
    if (form.payStructure === "Hourly" && form.hourlyRate)
      return `${currencySymbol} ${form.hourlyRate} / hr`;
    return "—";
  })();

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
        <Textarea
          rows={6}
          placeholder="Describe the role, responsibilities, and what a typical day looks like…"
          value={form.description}
          onChange={update("description")}
        />
      </div>
      <div>
        <Label required>Requirements</Label>
        <Textarea
          rows={5}
          placeholder="List required skills, qualifications, and experience…"
          value={form.requirements}
          onChange={update("requirements")}
        />
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Job Preview Summary
        </p>

        {employerData && (
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">
                {employerData.firstName?.[0]}
                {employerData.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {employerData.firstName} {employerData.lastName}
              </p>
              <p className="text-xs text-slate-500">
                {employerData.email} · {employerData.company}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {[
            ["Company", employerData?.company || "—"],
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
      </div>
    </div>
  );
}

export default function CreateJob({ draftId }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [currentDraftId, setCurrentDraftId] = useState(draftId || null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [employerData, setEmployerData] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "employers", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setEmployerData(data);
          setForm((f) => ({ ...f, companyName: data.company || "" }));
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
        employerUid: user.uid,
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
        employerUid: user.uid,
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
      router.push("/employer/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to publish job.");
    } finally {
      setPublishing(false);
    }
  };

  const stepProps = { form, setForm: updateForm, employerData };

  return (
    <div
      className="min-h-screen bg-[#e8eaed]"
      style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}
    >
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-14 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              isDirty
                ? setShowLeaveWarning(true)
                : router.push("/employer/dashboard")
            }
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900">
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
                className="flex items-center gap-1.5 px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-black rounded-xl transition-colors shadow-sm"
              >
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-black rounded-xl transition-colors shadow-sm disabled:opacity-60"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
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
                  router.push("/employer/dashboard");
                }}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-black rounded-xl transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={() => router.push("/employer/dashboard")}
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
    </div>
  );
}
