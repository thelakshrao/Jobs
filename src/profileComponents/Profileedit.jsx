"use client";
import { useState, useRef } from "react";
import {
  IoCheckmarkOutline,
  IoCloseOutline,
  IoAddOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoCameraOutline,
  IoCloudUploadOutline,
  IoGlobeOutline,
  IoLinkOutline,
  IoPersonOutline,
  IoBriefcaseOutline,
  IoSchoolOutline,
  IoStarOutline,
} from "react-icons/io5";
import {
  BLUE,
  BLUE_BG,
  Field,
  NativeSelect,
  StreamField,
  KeywordPicker,
  BtnPrimary,
  GENDERS,
  EXPERIENCE_OPTIONS,
  SALARY_OPTIONS,
  AVAILABILITY_OPTIONS,
  EDU_TYPE_GRADUATE,
  FREELANCE_EXPERIENCE_OPTIONS,
  RolePicker,
  PhoneField,
  LocationField,
} from "./shared";
import { usePhotoUpload } from "@/hooks/Usephotoupload";

const SIDEBAR_ITEMS = [
  { key: "profile", label: "Profile Settings", icon: IoPersonOutline },
  { key: "experience", label: "Work Experience", icon: IoBriefcaseOutline },
  { key: "education", label: "Education", icon: IoSchoolOutline },
  { key: "skills", label: "Skills", icon: IoStarOutline },
];

function PasteURLModal({ onConfirm, onClose }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const handleConfirm = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL.");
      return;
    }
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setError("URL must start with http:// or https://");
      return;
    }
    onConfirm(trimmed);
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
          border: "1.5px solid #e2e8f0",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1.5px solid #f1f5f9" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BLUE_BG }}
            >
              <IoLinkOutline size={16} color={BLUE} />
            </div>
            <div>
              <p
                className="text-sm font-extrabold"
                style={{ color: "#0f172a" }}
              >
                Paste Image URL
              </p>
              <p
                className="text-[10px] font-semibold"
                style={{ color: "#94a3b8" }}
              >
                Link must point directly to an image
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
          >
            <IoCloseOutline size={16} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: "#475569" }}>
              Image URL
            </label>
            <div className="relative">
              <IoGlobeOutline
                size={14}
                color="#94a3b8"
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                autoFocus
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                placeholder="https://example.com/photo.jpg"
                className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium outline-none transition-all"
                style={{
                  border: `1.5px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
                  backgroundColor: error ? "#fff5f5" : "#f8fafc",
                  color: "#0f172a",
                }}
                onFocus={(e) => !error && (e.target.style.borderColor = BLUE)}
                onBlur={(e) =>
                  !error && (e.target.style.borderColor = "#e2e8f0")
                }
              />
            </div>
            {error && (
              <p
                className="text-[11px] font-semibold"
                style={{ color: "#ef4444" }}
              >
                ⚠ {error}
              </p>
            )}
            <p
              className="text-[10px] font-semibold"
              style={{ color: "#94a3b8" }}
            >
              Tip: Right-click any image online → "Copy image address"
            </p>
          </div>
          {url && url.startsWith("http") && (
            <div
              className="rounded-xl overflow-hidden flex items-center justify-center"
              style={{
                height: 100,
                backgroundColor: "#f8fafc",
                border: "1.5px solid #e2e8f0",
              }}
            >
              <img
                src={url}
                alt="preview"
                className="max-h-full max-w-full object-contain rounded-xl"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          )}
        </div>
        <div
          className="flex gap-2 px-5 py-4"
          style={{ borderTop: "1.5px solid #f1f5f9" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
            style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer"
            style={{ backgroundColor: BLUE }}
          >
            Use this URL
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h2 className="text-base font-bold mb-5" style={{ color: "#0f172a" }}>
      {title}
    </h2>
  );
}

function Divider() {
  return (
    <div style={{ height: 1, backgroundColor: "#f1f5f9", margin: "24px 0" }} />
  );
}

function FormLabel({ children, required }) {
  return (
    <label
      className="block text-xs font-semibold mb-1.5"
      style={{ color: "#374151" }}
    >
      {children}
      {required && <span style={{ color: "#ef4444" }}> *</span>}
    </label>
  );
}

function StyledInput({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-all"
      style={{
        border: "1.5px solid #e5e7eb",
        backgroundColor: disabled ? "#f9fafb" : "#ffffff",
        color: disabled ? "#9ca3af" : "#111827",
        fontFamily: "inherit",
      }}
      onFocus={(e) => !disabled && (e.target.style.borderColor = BLUE)}
      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
    />
  );
}

function StyledTextarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-all resize-none"
      style={{
        border: "1.5px solid #e5e7eb",
        backgroundColor: "#ffffff",
        color: "#111827",
        fontFamily: "inherit",
      }}
      onFocus={(e) => (e.target.style.borderColor = BLUE)}
      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
    />
  );
}

function GenderRadio({ value, onChange }) {
  const options = ["Male", "Female", "Other", "Prefer not to say"];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          style={{
            border: `1.5px solid ${value === opt ? BLUE : "#e5e7eb"}`,
            backgroundColor: value === opt ? BLUE_BG : "#ffffff",
            color: value === opt ? BLUE : "#374151",
          }}
        >
          <span
            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
            style={{
              border: `2px solid ${value === opt ? BLUE : "#d1d5db"}`,
              backgroundColor: value === opt ? BLUE : "transparent",
            }}
          >
            {value === opt && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  display: "block",
                }}
              />
            )}
          </span>
          {opt}
        </button>
      ))}
    </div>
  );
}

function SaveButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer"
      style={{
        backgroundColor: BLUE,
        opacity: loading ? 0.7 : 1,
        minWidth: 120,
      }}
    >
      {loading ? "Saving…" : "Save Changes"}
    </button>
  );
}

function SavedToast({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center pointer-events-none px-4">
      <div
        className="flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl"
        style={{
          backgroundColor: "#16a34a",
          color: "#ffffff",
          animation: "fadeInOut 2.5s ease forwards",
        }}
      >
        <IoCheckmarkOutline size={18} />
        <span className="text-sm font-bold">Saved</span>
      </div>
      <style jsx>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          85% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function MiniExpRow({ exp, onEdit, onDelete }) {
  return (
    <div
      className="flex gap-3 items-start p-3.5 rounded-xl mb-2.5"
      style={{ backgroundColor: "#f8fafc", border: "1.5px solid #e5e7eb" }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ backgroundColor: BLUE }}
      >
        {exp.company ? exp.company.slice(0, 2).toUpperCase() : "CO"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{exp.title}</p>
        <p className="text-xs font-semibold truncate" style={{ color: BLUE }}>
          {exp.company}
        </p>
        <p className="text-[11px] font-semibold" style={{ color: "#94a3b8" }}>
          {exp.startDate
            ? new Date(exp.startDate).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : ""}
          {exp.startDate && (exp.endDate || exp.current) ? " – " : ""}
          {exp.current
            ? "Present"
            : exp.endDate
              ? new Date(exp.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : ""}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
        >
          <IoPencilOutline size={13} />
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
        >
          <IoTrashOutline size={13} />
        </button>
      </div>
    </div>
  );
}

function MiniEduRow({ edu, onEdit, onDelete }) {
  return (
    <div
      className="flex gap-3 items-start p-3.5 rounded-xl mb-2.5"
      style={{ backgroundColor: "#f8fafc", border: "1.5px solid #e5e7eb" }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ backgroundColor: "#8b5cf6" }}
      >
        {edu.institution ? edu.institution.slice(0, 2).toUpperCase() : "ED"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{edu.type}</p>
        <p className="text-xs font-semibold text-gray-600 truncate">
          {edu.institution}
        </p>
        <p className="text-[11px] font-semibold" style={{ color: "#94a3b8" }}>
          {edu.startYear}
          {edu.startYear && edu.endYear ? " – " : ""}
          {edu.endYear}
          {edu.percentage ? ` · ${edu.percentage}` : ""}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
        >
          <IoPencilOutline size={13} />
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
        >
          <IoTrashOutline size={13} />
        </button>
      </div>
    </div>
  );
}

function ExpForm({ value, onChange, onSave, onCancel }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 mb-3"
      style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#fafafa" }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <FormLabel>Job Title / Role</FormLabel>
          <StyledInput
            value={value.title || ""}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder="e.g. Sales Executive"
          />
        </div>
        <div>
          <FormLabel>Company Name</FormLabel>
          <StyledInput
            value={value.company || ""}
            onChange={(e) => onChange({ ...value, company: e.target.value })}
            placeholder="e.g. Reliance Industries"
          />
        </div>
        <div>
          <FormLabel>Job Location</FormLabel>
          <StyledInput
            value={value.location || ""}
            onChange={(e) => onChange({ ...value, location: e.target.value })}
            placeholder="e.g. Mumbai, India"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FormLabel>Start Month</FormLabel>
          <input
            type="month"
            value={value.startDate || ""}
            onChange={(e) => onChange({ ...value, startDate: e.target.value })}
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ border: "1.5px solid #e5e7eb", color: "#111827" }}
          />
        </div>
        <div>
          <FormLabel>End Month</FormLabel>
          <input
            type="month"
            value={value.endDate || ""}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
            disabled={value.current}
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{
              border: "1.5px solid #e5e7eb",
              color: value.current ? "#9ca3af" : "#111827",
              backgroundColor: value.current ? "#f9fafb" : "#fff",
            }}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={!!value.current}
          onChange={(e) =>
            onChange({ ...value, current: e.target.checked, endDate: "" })
          }
          className="accent-blue-400 w-3.5 h-3.5"
        />
        I currently work here
      </label>
      <div>
        <FormLabel>Description (optional)</FormLabel>
        <StyledTextarea
          value={value.description || ""}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          placeholder={"• Managed sales targets\n• Handled customer queries"}
          rows={2}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
          style={{ backgroundColor: BLUE }}
        >
          <IoCheckmarkOutline size={13} /> Save
        </button>
        <button
          onClick={onCancel}
          className="text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
          style={{ color: "#64748b", backgroundColor: "#f1f5f9" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function EduForm({ value, onChange, onSave, onCancel }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 mb-3"
      style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#fafafa" }}
    >
      <div>
        <FormLabel>Type of Education</FormLabel>
        <NativeSelect
          value={value.type || ""}
          onChange={(e) => onChange({ ...value, type: e.target.value })}
          options={EDU_TYPE_GRADUATE}
        />
      </div>
      <div>
        <FormLabel>School / College Name</FormLabel>
        <StyledInput
          value={value.institution || ""}
          onChange={(e) => onChange({ ...value, institution: e.target.value })}
          placeholder="e.g. Delhi Public School"
        />
      </div>
      <div>
        <FormLabel>Subject / Branch (optional)</FormLabel>
        <StreamField
          value={value.stream || ""}
          onChange={(v) => onChange({ ...value, stream: v })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <FormLabel>Start Year</FormLabel>
          <StyledInput
            value={value.startYear || ""}
            onChange={(e) => onChange({ ...value, startYear: e.target.value })}
            placeholder="2018"
          />
        </div>
        <div>
          <FormLabel>End Year</FormLabel>
          <StyledInput
            value={value.endYear || ""}
            onChange={(e) => onChange({ ...value, endYear: e.target.value })}
            placeholder="2022"
          />
        </div>
        <div>
          <FormLabel>% or Grade</FormLabel>
          <StyledInput
            value={value.percentage || ""}
            onChange={(e) => onChange({ ...value, percentage: e.target.value })}
            placeholder="85%"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
          style={{ backgroundColor: BLUE }}
        >
          <IoCheckmarkOutline size={13} /> Save
        </button>
        <button
          onClick={onCancel}
          className="text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
          style={{ color: "#64748b", backgroundColor: "#f1f5f9" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ProfileEdit({
  form,
  setForm,
  aboutForm,
  setAboutForm,
  experiences,
  educations,
  isGraduate,
  editSection,
  setEditSection,
  expForm,
  setExpForm,
  eduForm,
  setEduForm,
  skills,
  onAddSkill,
  onDeleteSkill,
  skillInput,
  setSkillInput,
  saveExpToFirebase,
  saveEduToFirebase,
  onSave,
}) {
  const [activeTab, setActiveTab] = useState("profile");
  const [langInput, setLangInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showURLModal, setShowURLModal] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const { uploading, error, upload } = usePhotoUpload(setForm);
  const isFresher = !!aboutForm.isFresher;

  const handleSaveClick = async () => {
    setSaving(true);
    try {
      await onSave();
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2500);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    upload(e.dataTransfer.files?.[0]);
  };
  const handleSaveExp = () => {
    if (editSection === "exp-new") saveExpToFirebase([...experiences, expForm]);
    else {
      const idx = parseInt(editSection.replace("exp-", ""));
      saveExpToFirebase(experiences.map((e, i) => (i === idx ? expForm : e)));
    }
  };
  const handleSaveEdu = () => {
    if (editSection === "edu-new") saveEduToFirebase([...educations, eduForm]);
    else {
      const idx = parseInt(editSection.replace("edu-", ""));
      saveEduToFirebase(educations.map((e, i) => (i === idx ? eduForm : e)));
    }
  };
  const langList = Array.isArray(aboutForm.languages)
    ? aboutForm.languages
    : aboutForm.languages
      ? aboutForm.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
      : [];
  const addLanguage = (val) => {
    const t = val.trim();
    if (t && !langList.includes(t))
      setAboutForm({ ...aboutForm, languages: [...langList, t] });
    setLangInput("");
  };
  const removeLanguage = (lang) =>
    setAboutForm({
      ...aboutForm,
      languages: langList.filter((l) => l !== lang),
    });

  return (
    <>
      <SavedToast show={showSaved} />
      {showURLModal && (
        <PasteURLModal
          onConfirm={(url) => {
            setForm((prev) => ({ ...prev, photoURL: url }));
            setShowURLModal(false);
          }}
          onClose={() => setShowURLModal(false)}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-stretch lg:items-start mb-10 w-full">
        <aside
          className="w-full lg:w-52.5 lg:shrink-0 rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid #e5e7eb",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          {/* 2x2 grid on mobile, vertical list on desktop */}
          <div className="grid grid-cols-2 lg:flex lg:flex-col">
            {SIDEBAR_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              const isTopRow = idx < 2;
              const isLeftCol = idx % 2 === 0;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className="flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-start gap-1.5 lg:gap-3 px-2 lg:px-4 py-3 lg:py-3.5 text-center lg:text-left transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? BLUE_BG : "transparent",
                    borderBottom: isTopRow ? "1px solid #f1f5f9" : "none",
                    borderRight: isLeftCol ? "1px solid #f1f5f9" : "none",
                    color: isActive ? BLUE : "#6b7280",
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  <Icon size={16} />
                  <span className="lg:text-[13px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main
          className="flex-1 min-w-0 w-full rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid #e5e7eb",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div className="px-4 py-5 sm:px-6 sm:py-6 w-full overflow-x-hidden">
            {activeTab === "profile" && (
              <div>
                <SectionTitle title="Profile Settings" />
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5 mb-6">
                  <div className="relative shrink-0">
                    {form.photoURL ? (
                      <img
                        src={form.photoURL}
                        alt="avatar"
                        className="rounded-full object-cover"
                        style={{
                          width: 88,
                          height: 88,
                          border: "3px solid #e5e7eb",
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-full flex items-center justify-center font-extrabold text-white"
                        style={{
                          width: 88,
                          height: 88,
                          fontSize: 32,
                          backgroundColor: BLUE,
                          border: "3px solid #e5e7eb",
                        }}
                      >
                        {form.name?.slice(0, 1).toUpperCase() || "?"}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md cursor-pointer"
                      style={{
                        backgroundColor: BLUE,
                        border: "2px solid #fff",
                      }}
                    >
                      <IoCameraOutline size={14} color="white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => upload(e.target.files?.[0])}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer"
                      style={{ backgroundColor: BLUE }}
                    >
                      {uploading ? "Uploading…" : "Upload New"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowURLModal(true)}
                      className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer"
                      style={{
                        backgroundColor: "#f3f4f6",
                        color: "#374151",
                        border: "1.5px solid #e5e7eb",
                      }}
                    >
                      Paste URL
                    </button>
                    {form.photoURL && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, photoURL: "" }))
                        }
                        className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer"
                        style={{
                          backgroundColor: "#fef2f2",
                          color: "#ef4444",
                          border: "1.5px solid #fee2e2",
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                {error && (
                  <p
                    className="text-xs font-bold mb-3"
                    style={{ color: "#ef4444" }}
                  >
                    ⚠ {error}
                  </p>
                )}
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className="flex flex-col items-center gap-2 py-4 rounded-xl mb-6 cursor-pointer transition-all"
                  style={{
                    border: `1.5px dashed ${dragOver ? BLUE : "#d1d5db"}`,
                    backgroundColor: dragOver ? BLUE_BG : "#f9fafb",
                  }}
                >
                  <IoCloudUploadOutline
                    size={22}
                    color={dragOver ? BLUE : "#9ca3af"}
                  />
                  <p
                    className="text-xs font-semibold"
                    style={{ color: dragOver ? BLUE : "#9ca3af" }}
                  >
                    Drag & drop a photo here
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <FormLabel required>First Name</FormLabel>
                    <StyledInput
                      value={form.name?.split(" ")[0] || ""}
                      onChange={(e) => {
                        const parts = (form.name || "").split(" ");
                        parts[0] = e.target.value;
                        setForm({ ...form, name: parts.join(" ") });
                      }}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <FormLabel>Last Name</FormLabel>
                    <StyledInput
                      value={form.name?.split(" ").slice(1).join(" ") || ""}
                      onChange={(e) => {
                        const firstName = (form.name || "").split(" ")[0] || "";
                        setForm({
                          ...form,
                          name: `${firstName} ${e.target.value}`.trim(),
                        });
                      }}
                      placeholder="Last name"
                    />
                  </div>
                  <div>
                    <FormLabel>Email</FormLabel>
                    <StyledInput
                      value={form.email || ""}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="examples@gmail.com"
                      type="email"
                    />
                  </div>
                  <div>
                    <FormLabel required>Mobile Number</FormLabel>
                    <PhoneField
                      countryCode={form.countryCode}
                      phone={form.phone}
                      onCountryChange={(code) =>
                        setForm({ ...form, countryCode: code })
                      }
                      onPhoneChange={(num) => setForm({ ...form, phone: num })}
                    />
                  </div>
                </div>
                <Divider />
                <div className="mb-4">
                  <FormLabel>Gender</FormLabel>
                  <GenderRadio
                    value={form.gender || ""}
                    onChange={(v) => setForm({ ...form, gender: v })}
                  />
                </div>
                <Divider />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <FormLabel>Your Job Title</FormLabel>
                    <StyledInput
                      value={form.title || ""}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="e.g. Sales Executive"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <FormLabel required>Location</FormLabel>
                  <LocationField
                    country={form.country}
                    state={form.state}
                    city={form.city}
                    onChange={({ country, state, city }) =>
                      setForm({ ...form, country, state, city })
                    }
                  />
                </div>
                <div className="mt-4">
                  <FormLabel>Short Bio</FormLabel>
                  <StyledTextarea
                    value={form.bio || ""}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell employers a little about yourself…"
                    rows={3}
                  />
                </div>
                <Divider />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <FormLabel>LinkedIn</FormLabel>
                    <StyledInput
                      value={form.linkedin || ""}
                      onChange={(e) =>
                        setForm({ ...form, linkedin: e.target.value })
                      }
                      placeholder="https://linkedin.com/in/your-name"
                    />
                  </div>
                  <div>
                    <FormLabel>GitHub</FormLabel>
                    <StyledInput
                      value={form.github || ""}
                      onChange={(e) =>
                        setForm({ ...form, github: e.target.value })
                      }
                      placeholder="https://github.com/your-name"
                    />
                  </div>
                  <div>
                    <FormLabel>Portfolio / Website</FormLabel>
                    <StyledInput
                      value={form.portfolio || ""}
                      onChange={(e) =>
                        setForm({ ...form, portfolio: e.target.value })
                      }
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <FormLabel>Twitter</FormLabel>
                    <StyledInput
                      value={form.twitter || ""}
                      onChange={(e) =>
                        setForm({ ...form, twitter: e.target.value })
                      }
                      placeholder="https://twitter.com/your-name"
                    />
                  </div>
                </div>
                <Divider />
                <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 cursor-pointer w-fit mb-4">
                  <input
                    type="checkbox"
                    checked={!!form.openToWork}
                    onChange={(e) =>
                      setForm({ ...form, openToWork: e.target.checked })
                    }
                    className="accent-blue-500 w-4 h-4"
                  />
                  I am looking for a job right now (Open to Work)
                </label>
                <div className="flex justify-start">
                  <SaveButton onClick={handleSaveClick} loading={saving} />
                </div>
              </div>
            )}

            {activeTab === "experience" && (
              <div>
                <SectionTitle title="Work Experience" />
                <div className="mb-4">
                  <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={isFresher}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAboutForm({
                          ...aboutForm,
                          isFresher: checked,
                          ...(checked
                            ? { experience: "", currentRole: "" }
                            : {
                                hasFreelanceExp: false,
                                freelanceExperience: "",
                                freelanceRole: "",
                              }),
                        });
                      }}
                      className="accent-blue-500 w-4 h-4"
                    />
                    I am a Fresher / Student (no work experience yet)
                  </label>
                  {isFresher && (
                    <div
                      className="mt-2 rounded-xl px-3 py-2 text-xs font-semibold"
                      style={{
                        backgroundColor: "#f0fdf4",
                        color: "#16a34a",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      ✓ Marked as Fresher
                    </div>
                  )}
                </div>
                {!isFresher && (
                  <>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <p
                        className="text-sm font-bold"
                        style={{ color: "#374151" }}
                      >
                        Your Jobs
                      </p>
                      {editSection !== "exp-new" && (
                        <button
                          onClick={() => {
                            setExpForm({
                              title: "",
                              company: "",
                              location: "",
                              startDate: "",
                              endDate: "",
                              current: false,
                              description: "",
                            });
                            setEditSection("exp-new");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                          style={{ color: BLUE, backgroundColor: BLUE_BG }}
                        >
                          <IoAddOutline size={13} /> Add Job
                        </button>
                      )}
                    </div>
                    {editSection === "exp-new" && (
                      <ExpForm
                        value={expForm}
                        onChange={setExpForm}
                        onSave={handleSaveExp}
                        onCancel={() => {
                          setExpForm({});
                          setEditSection(null);
                        }}
                      />
                    )}
                    {experiences.length === 0 && editSection !== "exp-new" && (
                      <div
                        className="flex flex-col items-center py-10 rounded-xl"
                        style={{
                          backgroundColor: "#f9fafb",
                          border: "1.5px dashed #e5e7eb",
                        }}
                      >
                        <IoBriefcaseOutline size={32} color="#d1d5db" />
                        <p
                          className="text-sm font-semibold mt-2"
                          style={{ color: "#9ca3af" }}
                        >
                          No jobs added yet
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: "#d1d5db" }}
                        >
                          Tap "Add Job" above to get started
                        </p>
                      </div>
                    )}
                    {experiences.map((exp, i) =>
                      editSection === `exp-${i}` ? (
                        <ExpForm
                          key={i}
                          value={expForm}
                          onChange={setExpForm}
                          onSave={handleSaveExp}
                          onCancel={() => {
                            setExpForm({});
                            setEditSection(null);
                          }}
                        />
                      ) : (
                        <MiniExpRow
                          key={i}
                          exp={exp}
                          onEdit={() => {
                            setExpForm(exp);
                            setEditSection(`exp-${i}`);
                          }}
                          onDelete={() =>
                            saveExpToFirebase(
                              experiences.filter((_, idx) => idx !== i),
                            )
                          }
                        />
                      ),
                    )}
                  </>
                )}
                <Divider />
                {!isFresher && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                    <div>
                      <FormLabel>Total Professional Experience</FormLabel>
                      <NativeSelect
                        value={aboutForm.experience || ""}
                        onChange={(e) =>
                          setAboutForm({
                            ...aboutForm,
                            experience: e.target.value,
                          })
                        }
                        options={EXPERIENCE_OPTIONS}
                      />
                    </div>
                    <div>
                      <FormLabel>Current or Last Job Title</FormLabel>
                      <StyledInput
                        value={aboutForm.currentRole || ""}
                        onChange={(e) =>
                          setAboutForm({
                            ...aboutForm,
                            currentRole: e.target.value,
                          })
                        }
                        placeholder="e.g. Cashier, Driver…"
                      />
                    </div>
                  </div>
                )}

                {isFresher && (
                  <div className="mb-4">
                    <FormLabel>
                      Do you have any freelance / part-time experience?
                    </FormLabel>
                    <div className="flex gap-2 flex-wrap">
                      {["Yes", "No"].map((opt) => {
                        const active =
                          (aboutForm.hasFreelanceExp ? "Yes" : "No") === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setAboutForm({
                                ...aboutForm,
                                hasFreelanceExp: opt === "Yes",
                                ...(opt === "No" && {
                                  freelanceExperience: "",
                                  freelanceRole: "",
                                }),
                              })
                            }
                            className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                            style={{
                              border: `1.5px solid ${active ? BLUE : "#e5e7eb"}`,
                              backgroundColor: active ? BLUE_BG : "#fff",
                              color: active ? BLUE : "#374151",
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {aboutForm.hasFreelanceExp && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-3">
                        <div>
                          <FormLabel>
                            Freelance / Part-time Experience
                          </FormLabel>
                          <NativeSelect
                            value={aboutForm.freelanceExperience || ""}
                            onChange={(e) =>
                              setAboutForm({
                                ...aboutForm,
                                freelanceExperience: e.target.value,
                              })
                            }
                            options={FREELANCE_EXPERIENCE_OPTIONS}
                          />
                        </div>
                        {aboutForm.freelanceExperience && (
                          <div>
                            <FormLabel>
                              What was your role during this work?
                            </FormLabel>
                            <StyledInput
                              value={aboutForm.freelanceRole || ""}
                              onChange={(e) =>
                                setAboutForm({
                                  ...aboutForm,
                                  freelanceRole: e.target.value,
                                })
                              }
                              placeholder="e.g. Full Stack Developer, Graphic Designer"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <FormLabel required>
                    What role(s) are you looking for?
                  </FormLabel>
                  <p className="text-xs mb-2" style={{ color: "#9ca3af" }}>
                    This is how employers find you — select roles you're
                    genuinely interested in.
                  </p>
                  <RolePicker
                    value={aboutForm.lookingForRoles || []}
                    onChange={(roles) =>
                      setAboutForm({ ...aboutForm, lookingForRoles: roles })
                    }
                  />
                </div>
                <div className="mb-4">
                  <FormLabel>About You — for employers</FormLabel>
                  <StyledTextarea
                    value={aboutForm.description || ""}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Write more about your skills, work style, what kind of job you want, etc."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                  <div>
                    <FormLabel>Expected Yearly Salary</FormLabel>
                    <NativeSelect
                      value={aboutForm.expectedSalary || ""}
                      onChange={(e) =>
                        setAboutForm({
                          ...aboutForm,
                          expectedSalary: e.target.value,
                        })
                      }
                      options={SALARY_OPTIONS}
                    />
                  </div>
                  <div>
                    <FormLabel>When can you start?</FormLabel>
                    <NativeSelect
                      value={aboutForm.availability || ""}
                      onChange={(e) =>
                        setAboutForm({
                          ...aboutForm,
                          availability: e.target.value,
                        })
                      }
                      options={AVAILABILITY_OPTIONS}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <FormLabel>Job Type & Location Preferences</FormLabel>
                  <KeywordPicker
                    value={aboutForm.jobPreferences || ""}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        jobPreferences: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-start">
                  <SaveButton onClick={handleSaveClick} loading={saving} />
                </div>
              </div>
            )}

            {activeTab === "education" && (
              <div>
                <SectionTitle title="Education" />
                {isGraduate ? (
                  <>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <p
                        className="text-sm font-bold"
                        style={{ color: "#374151" }}
                      >
                        Your Qualifications
                      </p>
                      {editSection !== "edu-new" && (
                        <button
                          onClick={() => {
                            setEduForm({
                              type: "",
                              institution: "",
                              stream: "",
                              startYear: "",
                              endYear: "",
                              percentage: "",
                            });
                            setEditSection("edu-new");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                          style={{
                            color: "#8b5cf6",
                            backgroundColor: "#f5f3ff",
                          }}
                        >
                          <IoAddOutline size={13} /> Add Education
                        </button>
                      )}
                    </div>
                    {editSection === "edu-new" && (
                      <EduForm
                        value={eduForm}
                        onChange={setEduForm}
                        onSave={handleSaveEdu}
                        onCancel={() => {
                          setEduForm({});
                          setEditSection(null);
                        }}
                      />
                    )}
                    {educations.length === 0 && editSection !== "edu-new" && (
                      <div
                        className="flex flex-col items-center py-10 rounded-xl"
                        style={{
                          backgroundColor: "#f9fafb",
                          border: "1.5px dashed #e5e7eb",
                        }}
                      >
                        <IoSchoolOutline size={32} color="#d1d5db" />
                        <p
                          className="text-sm font-semibold mt-2"
                          style={{ color: "#9ca3af" }}
                        >
                          No education added yet
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: "#d1d5db" }}
                        >
                          Tap "Add Education" above to get started
                        </p>
                      </div>
                    )}
                    {educations.map((edu, i) =>
                      editSection === `edu-${i}` ? (
                        <EduForm
                          key={i}
                          value={eduForm}
                          onChange={setEduForm}
                          onSave={handleSaveEdu}
                          onCancel={() => {
                            setEduForm({});
                            setEditSection(null);
                          }}
                        />
                      ) : (
                        <MiniEduRow
                          key={i}
                          edu={edu}
                          onEdit={() => {
                            setEduForm(edu);
                            setEditSection(`edu-${i}`);
                          }}
                          onDelete={() =>
                            saveEduToFirebase(
                              educations.filter((_, idx) => idx !== i),
                            )
                          }
                        />
                      ),
                    )}
                  </>
                ) : (
                  <div
                    className="flex flex-col items-center py-10 rounded-xl"
                    style={{
                      backgroundColor: "#f9fafb",
                      border: "1.5px dashed #e5e7eb",
                    }}
                  >
                    <IoSchoolOutline size={32} color="#d1d5db" />
                    <p
                      className="text-sm font-semibold mt-2"
                      style={{ color: "#9ca3af" }}
                    >
                      Education section not available
                    </p>
                  </div>
                )}
                <div className="flex justify-start mt-4">
                  <SaveButton onClick={handleSaveClick} loading={saving} />
                </div>
              </div>
            )}

            {activeTab === "skills" && (
              <div>
                <SectionTitle title="Skills" />
                <p className="text-sm mb-4" style={{ color: "#6b7280" }}>
                  Add at least 3 skills. E.g. MS Excel, Driving, Cooking,
                  React.js…
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.length === 0 && (
                    <p
                      className="text-sm font-semibold italic"
                      style={{ color: "#9ca3af" }}
                    >
                      No skills added yet.
                    </p>
                  )}
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
                      style={{
                        backgroundColor: BLUE_BG,
                        border: "1.5px solid #D6E3F7",
                        color: BLUE,
                      }}
                    >
                      {skill}
                      <button
                        onClick={() => onDeleteSkill(skill)}
                        className="cursor-pointer"
                        style={{ color: "#93c5fd", lineHeight: 1 }}
                      >
                        <IoCloseOutline size={13} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mb-6">
                  <StyledInput
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onAddSkill()}
                    placeholder="Type a skill and press Enter…"
                  />
                  <button
                    onClick={onAddSkill}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 cursor-pointer"
                    style={{ backgroundColor: BLUE }}
                  >
                    <IoAddOutline size={15} /> Add
                  </button>
                </div>
                <Divider />
                <div className="mb-4">
                  <FormLabel>Languages You Speak</FormLabel>
                  {langList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {langList.map((lang) => (
                        <span
                          key={lang}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
                          style={{
                            backgroundColor: "#f0fdf4",
                            border: "1.5px solid #bbf7d0",
                            color: "#16a34a",
                          }}
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => removeLanguage(lang)}
                            className="cursor-pointer"
                            style={{ color: "#86efac", lineHeight: 1 }}
                          >
                            <IoCloseOutline size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <StyledInput
                      value={langInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v.endsWith(",")) addLanguage(v.slice(0, -1));
                        else setLangInput(v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLanguage(langInput);
                        }
                        if (
                          e.key === "Backspace" &&
                          !langInput &&
                          langList.length > 0
                        )
                          removeLanguage(langList[langList.length - 1]);
                      }}
                      placeholder="Type a language and press Enter…"
                    />
                    <button
                      onClick={() => addLanguage(langInput)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 cursor-pointer"
                      style={{ backgroundColor: "#16a34a" }}
                    >
                      <IoAddOutline size={15} /> Add
                    </button>
                  </div>
                  <p
                    className="text-[11px] font-semibold mt-1.5"
                    style={{ color: "#9ca3af" }}
                  >
                    Press Enter or comma to add · Backspace to remove last
                  </p>
                </div>
                <div className="flex justify-start">
                  <SaveButton onClick={handleSaveClick} loading={saving} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
