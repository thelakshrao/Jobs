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
  IoImageOutline,
  IoGlobeOutline,
  IoLinkOutline,
} from "react-icons/io5";
import {
  BLUE,
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
} from "./shared";
import { usePhotoUpload } from "@/hooks/Usephotoupload";

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
          backgroundColor: "#fff",
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
              style={{ backgroundColor: "#eff6ff" }}
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
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
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
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ backgroundColor: BLUE }}
          >
            Use this URL
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ title, action }) {
  return (
    <div
      className="flex items-center justify-between pt-3 pb-1 border-t"
      style={{ borderColor: "#f1f5f9" }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-wider"
        style={{ color: "#94a3b8" }}
      >
        {title}
      </p>
      {action}
    </div>
  );
}

function MiniExpRow({ exp, onEdit, onDelete }) {
  return (
    <div
      className="flex gap-2 items-start p-2.5 rounded-xl mb-2"
      style={{ backgroundColor: "#f8fafc", border: "1.5px solid #f1f5f9" }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ backgroundColor: BLUE }}
      >
        {exp.company ? exp.company.slice(0, 2).toUpperCase() : "CO"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-900 truncate">{exp.title}</p>
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
      <div className="flex gap-1.5 shrink-0">
        <button onClick={onEdit} style={{ color: "#94a3b8" }}>
          <IoPencilOutline size={13} />
        </button>
        <button onClick={onDelete} style={{ color: "#94a3b8" }}>
          <IoTrashOutline size={13} />
        </button>
      </div>
    </div>
  );
}

function MiniEduRow({ edu, onEdit, onDelete }) {
  return (
    <div
      className="flex gap-2 items-start p-2.5 rounded-xl mb-2"
      style={{ backgroundColor: "#f8fafc", border: "1.5px solid #f1f5f9" }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ backgroundColor: "#8b5cf6" }}
      >
        {edu.institution ? edu.institution.slice(0, 2).toUpperCase() : "ED"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-900 truncate">{edu.type}</p>
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
      <div className="flex gap-1.5 shrink-0">
        <button onClick={onEdit} style={{ color: "#94a3b8" }}>
          <IoPencilOutline size={13} />
        </button>
        <button onClick={onDelete} style={{ color: "#94a3b8" }}>
          <IoTrashOutline size={13} />
        </button>
      </div>
    </div>
  );
}

function ExpForm({ value, onChange, onSave, onCancel }) {
  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-2.5 mb-2"
      style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#fafafa" }}
    >
      <Field
        label="Job Title / Role"
        value={value.title || ""}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        placeholder="e.g. Sales Executive"
      />
      <Field
        label="Company Name"
        value={value.company || ""}
        onChange={(e) => onChange({ ...value, company: e.target.value })}
        placeholder="e.g. Reliance Industries"
      />
      <Field
        label="Job Location"
        value={value.location || ""}
        onChange={(e) => onChange({ ...value, location: e.target.value })}
        placeholder="e.g. Mumbai, India"
      />
      <div className="flex gap-2">
        <div className="flex-1">
          <p className="text-[11px] font-bold text-gray-500 mb-1">
            Start Month
          </p>
          <input
            type="month"
            value={value.startDate || ""}
            onChange={(e) => onChange({ ...value, startDate: e.target.value })}
            className="rounded-lg px-2 py-1.5 text-xs outline-none w-full"
            style={{ border: "1.5px solid #e2e8f0", color: "#0f172a" }}
          />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-bold text-gray-500 mb-1">End Month</p>
          <input
            type="month"
            value={value.endDate || ""}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
            disabled={value.current}
            className="rounded-lg px-2 py-1.5 text-xs outline-none w-full"
            style={{
              border: "1.5px solid #e2e8f0",
              color: value.current ? "#94a3b8" : "#0f172a",
              backgroundColor: value.current ? "#f8fafc" : "#fff",
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
      <Field
        as="textarea"
        label="What did you do there? (optional)"
        value={value.description || ""}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder={"• Managed sales targets\n• Handled customer queries"}
        rows={2}
      />
      <div className="flex gap-2">
        <BtnPrimary small onClick={onSave}>
          <IoCheckmarkOutline size={11} /> Save
        </BtnPrimary>
        <button
          onClick={onCancel}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
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
      className="rounded-xl p-3 flex flex-col gap-2.5 mb-2"
      style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#fafafa" }}
    >
      <NativeSelect
        label="Type of Education"
        value={value.type || ""}
        onChange={(e) => onChange({ ...value, type: e.target.value })}
        options={EDU_TYPE_GRADUATE}
      />
      <Field
        label="School / College Name"
        value={value.institution || ""}
        onChange={(e) => onChange({ ...value, institution: e.target.value })}
        placeholder="e.g. Delhi Public School"
      />
      <StreamField
        label="Subject / Branch (optional)"
        value={value.stream || ""}
        onChange={(v) => onChange({ ...value, stream: v })}
      />
      <div className="flex gap-2">
        <Field
          label="Start Year"
          value={value.startYear || ""}
          onChange={(e) => onChange({ ...value, startYear: e.target.value })}
          placeholder="2018"
        />
        <Field
          label="End Year"
          value={value.endYear || ""}
          onChange={(e) => onChange({ ...value, endYear: e.target.value })}
          placeholder="2022"
        />
        <Field
          label="% or Grade"
          value={value.percentage || ""}
          onChange={(e) => onChange({ ...value, percentage: e.target.value })}
          placeholder="85%"
        />
      </div>
      <div className="flex gap-2">
        <BtnPrimary small onClick={onSave}>
          <IoCheckmarkOutline size={11} /> Save
        </BtnPrimary>
        <button
          onClick={onCancel}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
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
}) {
  const [langInput, setLangInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showURLModal, setShowURLModal] = useState(false);
  const fileInputRef = useRef(null);
  const { uploading, error, upload } = usePhotoUpload(setForm);

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
      {showURLModal && (
        <PasteURLModal
          onConfirm={(url) => {
            setForm((prev) => ({ ...prev, photoURL: url }));
            setShowURLModal(false);
          }}
          onClose={() => setShowURLModal(false)}
        />
      )}

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: "1.5px solid #f1f5f9",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div className="px-4 pt-5 pb-5 flex flex-col gap-3">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              {form.photoURL ? (
                <img
                  src={form.photoURL}
                  alt="avatar"
                  className="rounded-2xl object-cover"
                  style={{ width: 80, height: 80, border: "3px solid #e2e8f0" }}
                />
              ) : (
                <div
                  className="rounded-2xl flex items-center justify-center font-extrabold text-white"
                  style={{
                    width: 80,
                    height: 80,
                    fontSize: 28,
                    backgroundColor: BLUE,
                    border: "3px solid #e2e8f0",
                  }}
                >
                  {form.name?.slice(0, 1).toUpperCase() || "?"}
                </div>
              )}
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => upload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  title="Tap to change photo"
                  className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all"
                  style={{ backgroundColor: "rgba(0,0,0,0.48)" }}
                >
                  {uploading ? (
                    <svg
                      className="animate-spin"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="white"
                        strokeWidth="3"
                        strokeDasharray="28"
                        strokeDashoffset="10"
                      />
                    </svg>
                  ) : (
                    <>
                      <IoCameraOutline size={22} color="white" />
                      <span
                        style={{
                          color: "white",
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.03em",
                        }}
                      >
                        CHANGE
                      </span>
                    </>
                  )}
                </button>
              </>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <p
                className="text-sm font-extrabold"
                style={{ color: "#0f172a" }}
              >
                {form.name || (
                  <span
                    className="italic font-normal text-xs"
                    style={{ color: "#94a3b8" }}
                  >
                    Your name here
                  </span>
                )}
              </p>
              {form.title && (
                <p
                  className="text-xs font-semibold mt-0.5"
                  style={{ color: BLUE }}
                >
                  {form.title}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold" style={{ color: "#64748b" }}>
              📷 Profile Photo
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-center transition-all"
                style={{
                  border: "1.5px dashed #bfdbfe",
                  backgroundColor: "#eff6ff",
                }}
              >
                <IoImageOutline size={20} color={BLUE} />
                <span className="text-[11px] font-bold" style={{ color: BLUE }}>
                  Browse
                  <br />
                  Phone
                </span>
              </button>

              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-center transition-all cursor-pointer"
                style={{
                  border: `1.5px dashed ${dragOver ? BLUE : "#e2e8f0"}`,
                  backgroundColor: dragOver ? "#eff6ff" : "#f8fafc",
                }}
              >
                <IoCloudUploadOutline
                  size={20}
                  color={dragOver ? BLUE : "#94a3b8"}
                />
                <span
                  className="text-[11px] font-bold"
                  style={{ color: dragOver ? BLUE : "#94a3b8" }}
                >
                  Drag &<br />
                  Drop
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowURLModal(true)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-center transition-all"
                style={{
                  border: "1.5px dashed #e2e8f0",
                  backgroundColor: "#f8fafc",
                }}
              >
                <IoGlobeOutline size={20} color="#94a3b8" />
                <span
                  className="text-[11px] font-bold"
                  style={{ color: "#94a3b8" }}
                >
                  Paste
                  <br />
                  URL
                </span>
              </button>
            </div>

            {uploading && (
              <p className="text-xs font-bold" style={{ color: BLUE }}>
                ⏳ Uploading… please wait
              </p>
            )}
            {error && (
              <p className="text-xs font-bold" style={{ color: "#ef4444" }}>
                ⚠ {error}
              </p>
            )}
          </div>

          <div
            className="rounded-xl px-3 py-2 text-xs font-semibold"
            style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}
          >
            ✎ Fill in the fields below. Each field has a label telling you what
            to write.
          </div>

          <SectionLabel title="Your Basic Info" />
          <Field
            label="Your Full Name"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Ravi Kumar"
          />
          <Field
            label="Your Job Title or What You Do"
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Sales Executive, Driver, Tailor, Student…"
          />
          <Field
            as="textarea"
            label="Short Bio — tell employers a little about yourself"
            value={form.bio || ""}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="e.g. I have 2 years of experience in retail sales and I am looking for a full-time job in Mumbai."
            rows={3}
          />

          <div className="flex gap-2">
            <Field
              label="Your City / Location"
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Mumbai"
            />
            <NativeSelect
              label="Gender"
              value={form.gender || ""}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              options={GENDERS}
            />
          </div>
          <div className="flex gap-2">
            <Field
              label="Email Address"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="yourname@gmail.com"
            />
            <Field
              label="Mobile Number"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 9876543210"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={!!form.openToWork}
              onChange={(e) =>
                setForm({ ...form, openToWork: e.target.checked })
              }
              className="accent-blue-400 w-3.5 h-3.5"
            />
            I am looking for a job right now (Open to Work)
          </label>

          <SectionLabel title="Social & Portfolio Links (optional)" />
          <Field
            label="LinkedIn Profile Link"
            value={form.linkedin || ""}
            onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/your-name"
          />
          <Field
            label="GitHub Profile Link"
            value={form.github || ""}
            onChange={(e) => setForm({ ...form, github: e.target.value })}
            placeholder="https://github.com/your-name"
          />
          <Field
            label="Portfolio / Website Link"
            value={form.portfolio || ""}
            onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
            placeholder="https://yourwebsite.com"
          />
          <Field
            label="Twitter Profile Link"
            value={form.twitter || ""}
            onChange={(e) => setForm({ ...form, twitter: e.target.value })}
            placeholder="https://twitter.com/your-name"
          />

          <SectionLabel title="Career Details" />
          <Field
            as="textarea"
            label="About You — more detail for employers"
            value={aboutForm.description || ""}
            onChange={(e) =>
              setAboutForm({ ...aboutForm, description: e.target.value })
            }
            placeholder="Write more about your skills, work style, what kind of job you want, etc."
            rows={3}
          />
          <div className="flex gap-2">
            <NativeSelect
              label="Years of work experience?"
              value={aboutForm.experience || ""}
              onChange={(e) =>
                setAboutForm({ ...aboutForm, experience: e.target.value })
              }
              options={EXPERIENCE_OPTIONS}
            />
            <Field
              label="Current or Last Job Title"
              value={aboutForm.currentRole || ""}
              onChange={(e) =>
                setAboutForm({ ...aboutForm, currentRole: e.target.value })
              }
              placeholder="e.g. Cashier, Driver…"
            />
          </div>
          <NativeSelect
            label="Expected Yearly Salary"
            value={aboutForm.expectedSalary || ""}
            onChange={(e) =>
              setAboutForm({ ...aboutForm, expectedSalary: e.target.value })
            }
            options={SALARY_OPTIONS}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: "#475569" }}>
              Languages You Speak
            </label>
            {langList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1">
                {langList.map((lang) => (
                  <span
                    key={lang}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: "#eff6ff",
                      color: "#3b82f6",
                      border: "1px solid #dbeafe",
                    }}
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      className="ml-0.5 font-bold leading-none"
                      style={{ color: "#93c5fd", fontSize: 14 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              placeholder="Type a language and press Enter…"
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
                if (e.key === "Backspace" && !langInput && langList.length > 0)
                  removeLanguage(langList[langList.length - 1]);
              }}
              onBlur={() => {
                if (langInput.trim()) addLanguage(langInput);
              }}
              className="w-full rounded-xl px-3 py-2 text-sm font-medium outline-none"
              style={{
                border: "1.5px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                color: "#0f172a",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            />
            <p
              className="text-[10px] font-semibold"
              style={{ color: "#94a3b8" }}
            >
              Press Enter or comma to add · Backspace to remove last
            </p>
          </div>

          <NativeSelect
            label="When can you start a new job?"
            value={aboutForm.availability || ""}
            onChange={(e) =>
              setAboutForm({ ...aboutForm, availability: e.target.value })
            }
            options={AVAILABILITY_OPTIONS}
          />
          <KeywordPicker
            label="Job Type & Location Preferences (tap to select)"
            value={aboutForm.jobPreferences || ""}
            onChange={(e) =>
              setAboutForm({ ...aboutForm, jobPreferences: e.target.value })
            }
          />

          {isGraduate && (
            <>
              <SectionLabel
                title="Work Experience"
                action={
                  editSection !== "exp-new" && (
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
                      className="text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{ color: BLUE, backgroundColor: "#eff6ff" }}
                    >
                      <IoAddOutline size={12} /> Add Job
                    </button>
                  )
                }
              />
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
                <p
                  className="text-xs font-semibold italic"
                  style={{ color: "#94a3b8" }}
                >
                  No jobs added yet. Tap "Add Job" above.
                </p>
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

          {isGraduate && (
            <>
              <SectionLabel
                title="Education"
                action={
                  editSection !== "edu-new" && (
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
                      className="text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{ color: "#8b5cf6", backgroundColor: "#f5f3ff" }}
                    >
                      <IoAddOutline size={12} /> Add Education
                    </button>
                  )
                }
              />
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
                <p
                  className="text-xs font-semibold italic"
                  style={{ color: "#94a3b8" }}
                >
                  No education added yet. Tap "Add Education" above.
                </p>
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
          )}

          <SectionLabel title="Skills (what are you good at?)" />
          <p
            className="text-[11px] font-semibold -mt-1"
            style={{ color: "#94a3b8" }}
          >
            Type a skill and tap Add. E.g. MS Excel, Driving, Cooking,
            Tailoring, React.js…
          </p>
          <div className="flex flex-wrap gap-1.5 mb-1">
            {skills.length === 0 && (
              <p
                className="text-xs font-semibold italic"
                style={{ color: "#94a3b8" }}
              >
                No skills added yet.
              </p>
            )}
            {skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  color: "#334155",
                }}
              >
                {skill}
                <button
                  onClick={() => onDeleteSkill(skill)}
                  style={{ color: "#94a3b8", lineHeight: 1 }}
                >
                  <IoCloseOutline size={11} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddSkill()}
              placeholder="Type a skill…"
              className="rounded-xl px-3 py-2 text-xs font-medium outline-none flex-1 min-w-0"
              style={{ border: "1.5px solid #e2e8f0", color: "#0f172a" }}
            />
            <BtnPrimary small onClick={onAddSkill}>
              <IoAddOutline size={12} /> Add
            </BtnPrimary>
          </div>
        </div>
      </div>
    </>
  );
}
