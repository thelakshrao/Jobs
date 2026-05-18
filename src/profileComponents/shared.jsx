import { useState } from "react";
import { IoChevronDownOutline, IoCloseOutline } from "react-icons/io5";

export const BLUE = "#60a5fa";
export const BLUE_DARK = "#3b82f6";
export const BLUE_BG = "#eff6ff";
export const BLUE_BG_HOVER = "#dbeafe";

export const EXPERIENCE_OPTIONS = [
  "Fresher (0 years)",
  "Less than 1 year",
  "1+ year",
  "2+ years",
  "3+ years",
  "4+ years",
  "5+ years",
  "6+ years",
  "7+ years",
  "8+ years",
  "9+ years",
  "10+ years",
];
export const SALARY_OPTIONS = [
  "Below ₹2 LPA",
  "₹2 – 4 LPA",
  "₹4 – 6 LPA",
  "₹6 – 8 LPA",
  "₹8 – 12 LPA",
  "₹12 – 18 LPA",
  "₹18 – 25 LPA",
  "₹25 – 40 LPA",
  "₹40+ LPA",
  "Open to discussion",
];
export const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "English, Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Other",
];
export const AVAILABILITY_OPTIONS = [
  "Immediately",
  "Within 2 weeks",
  "Within 1 month",
  "Within 2 months",
  "Within 3 months",
  "Currently employed – notice period",
];
export const JOB_PREF_KEYWORDS = [
  "Remote",
  "On-site",
  "Hybrid",
  "Full-time",
  "Part-time",
  "Freelance",
  "Contract",
  "Internship",
  "Bangalore",
  "Mumbai",
  "Delhi / NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Gurgaon",
  "Noida",
  "Kolkata",
  "Any Location",
];
export const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
export const EDU_TYPE_GRADUATE = [
  "10th (Matriculation)",
  "12th (Intermediate)",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD / Doctorate",
];
export const STREAM_OPTIONS_GRADUATE = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "MBA",
  "Commerce",
  "Arts",
  "Science",
  "Other",
];
export const STRENGTH_ITEMS = [
  { label: "Add your resume", key: "resume" },
  { label: "Add skills", key: "skills" },
  { label: "Add portfolio link", key: "portfolio" },
  { label: "Verify email", key: "email" },
  { label: "Add work experience", key: "experience" },
];
export const DEFAULT_PROFILE = {
  name: "",
  title: "",
  bio: "",
  location: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  twitter: "",
  portfolio: "",
  openToWork: false,
  photoURL: "",
  gender: "",
};
export const DEFAULT_ABOUT = {
  description: "",
  experience: "",
  currentRole: "",
  expectedSalary: "",
  languages: "",
  availability: "",
  jobPreferences: "",
  skills: [],
  educationLevel: null,
  onboardingDone: false,
};

export function Field({
  label,
  value,
  onChange,
  placeholder,
  as = "input",
  rows = 3,
}) {
  const cls = "rounded-xl px-3 py-2 text-sm outline-none w-full";
  const sty = { border: "1.5px solid #e2e8f0", color: "#0f172a" };
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      {label && (
        <label className="text-xs font-semibold text-gray-500">{label}</label>
      )}
      {as === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${cls} resize-none`}
          style={sty}
        />
      ) : (
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cls}
          style={sty}
        />
      )}
    </div>
  );
}

export function NativeSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
}) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      {label && (
        <label className="text-xs font-semibold text-gray-500">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="rounded-xl px-3 py-2 text-sm outline-none w-full appearance-none pr-8"
          style={{
            border: "1.5px solid #e2e8f0",
            color: value ? "#0f172a" : "#94a3b8",
            backgroundColor: "white",
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <IoChevronDownOutline
          size={14}
          color="#94a3b8"
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

export function StreamField({ label, value, onChange }) {
  const tags = value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const [custom, setCustom] = useState("");
  const addTag = (tag) => {
    const t = tag.trim();
    if (!t || tags.includes(t)) return;
    onChange([...tags, t].join(", "));
  };
  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag).join(", "));
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      {label && (
        <label className="text-xs font-semibold text-gray-500">{label}</label>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: BLUE_BG,
                border: `1px solid ${BLUE}`,
                color: BLUE,
              }}
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                style={{ lineHeight: 1, color: BLUE }}
              >
                <IoCloseOutline size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) addTag(e.target.value);
            }}
            className="rounded-xl px-3 py-2 text-sm outline-none w-full appearance-none pr-8"
            style={{
              border: "1.5px solid #e2e8f0",
              color: "#94a3b8",
              backgroundColor: "white",
            }}
          >
            <option value="">Add from list…</option>
            {STREAM_OPTIONS_GRADUATE.filter((o) => !tags.includes(o)).map(
              (o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ),
            )}
          </select>
          <IoChevronDownOutline
            size={14}
            color="#94a3b8"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
        </div>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && custom.trim()) {
              addTag(custom);
              setCustom("");
            }
          }}
          placeholder="Custom stream…"
          className="rounded-xl px-3 py-2 text-sm outline-none flex-1"
          style={{ border: "1.5px solid #e2e8f0", color: "#0f172a" }}
        />
        {custom.trim() && (
          <button
            type="button"
            onClick={() => {
              addTag(custom);
              setCustom("");
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-white shrink-0"
            style={{ backgroundColor: BLUE }}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}

export function KeywordPicker({ label, value, onChange }) {
  const selected = value ? value.split(", ").filter(Boolean) : [];
  const toggle = (kw) => {
    const next = selected.includes(kw)
      ? selected.filter((k) => k !== kw)
      : [...selected, kw];
    onChange({ target: { value: next.join(", ") } });
  };
  return (
    <div className="flex flex-col gap-2 col-span-3">
      {label && (
        <label className="text-xs font-semibold text-gray-500">{label}</label>
      )}
      <div className="flex flex-wrap gap-1.5">
        {JOB_PREF_KEYWORDS.map((kw) => {
          const active = selected.includes(kw);
          return (
            <button
              key={kw}
              type="button"
              onClick={() => toggle(kw)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: active ? BLUE_BG : "#f8fafc",
                border: active ? `1.5px solid ${BLUE}` : "1.5px solid #e2e8f0",
                color: active ? BLUE : "#64748b",
              }}
            >
              {kw}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BtnPrimary({
  onClick,
  disabled,
  children,
  small = false,
  className = "",
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-xl font-semibold text-white transition-all ${small ? "px-3 py-1.5 text-xs" : "px-5 py-2 text-sm"} ${className}`}
      style={{ backgroundColor: hov ? BLUE_DARK : BLUE }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
}

export function BtnGhost({ onClick, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
      style={{ color: "#64748b", backgroundColor: hov ? "#e2e8f0" : "#f1f5f9" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
}

export function SectionCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        border: "1.5px solid #f1f5f9",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

export function PlaceholderRow({ label, placeholder }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-300 italic">{placeholder}</p>
    </div>
  );
}
