"use client";

import { useState, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  IoCameraOutline,
  IoLocationOutline,
  IoCallOutline,
  IoSchoolOutline,
  IoBriefcaseOutline,
  IoCashOutline,
  IoAddOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoPersonOutline,
  IoMailOutline,
} from "react-icons/io5";
import { BLUE, BLUE_BG } from "./shared";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function uploadPhoto(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd },
  );
  if (!res.ok) throw new Error("Upload failed");
  return (await res.json()).secure_url;
}

const EDUCATION_OPTIONS = [
  "10th Pass",
  "12th Pass",
  "Diploma",
  "Graduate",
  "Postgraduate",
  "No formal education",
];
const EXP_YEARS = [
  "Less than 1 year",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5+ years",
  "10+ years",
];
const SALARY_OPTIONS = [
  "Below ₹10,000/mo",
  "₹10,000–15,000/mo",
  "₹15,000–25,000/mo",
  "₹25,000–40,000/mo",
  "₹40,000+/mo",
  "Open to discuss",
];


function QLabel({ children }) {
  return (
    <p
      className="text-xs font-black uppercase tracking-widest mb-2"
      style={{ color: "#94a3b8" }}
    >
      {children}
    </p>
  );
}

function EditInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <QLabel>{label}</QLabel>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-all"
        style={{
          border: "1.5px solid #e2e8f0",
          color: "#0f172a",
          backgroundColor: "#f8fafc",
        }}
        onFocus={(e) => (e.target.style.borderColor = BLUE)}
        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
      />
    </div>
  );
}

function ChipSelect({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <QLabel>{label}</QLabel>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                border: `1.5px solid ${active ? BLUE : "#e2e8f0"}`,
                backgroundColor: active ? BLUE_BG : "#f8fafc",
                color: active ? BLUE : "#475569",
              }}
            >
              {active && "✓ "}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmployerCard({ emp, onEdit, onDelete }) {
  return (
    <div
      className="flex items-start gap-3 p-3.5 rounded-2xl"
      style={{ backgroundColor: "#f8fafc", border: "1.5px solid #e2e8f0" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-sm shrink-0"
        style={{ backgroundColor: BLUE }}
      >
        {emp.company ? emp.company[0].toUpperCase() : "#"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: "#0f172a" }}>
          {emp.role || "Role not specified"}
        </p>
        <p className="text-xs font-semibold" style={{ color: BLUE }}>
          {emp.company || "Company not specified"}
        </p>
        <div className="flex flex-wrap gap-3 mt-0.5">
          {emp.years && (
            <span className="text-xs" style={{ color: "#64748b" }}>
              ⏱ {emp.years}
            </span>
          )}
          {emp.phone && (
            <span className="text-xs" style={{ color: "#64748b" }}>
              📞 {emp.phone}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={onEdit} style={{ color: "#94a3b8" }}>
          <IoPencilOutline size={14} />
        </button>
        <button onClick={onDelete} style={{ color: "#ef4444" }}>
          <IoTrashOutline size={14} />
        </button>
      </div>
    </div>
  );
}

function EmployerForm({ value, onChange, onSave, onCancel }) {
  return (
    <div
      className="flex flex-col gap-2.5 p-4 rounded-2xl"
      style={{ border: `1.5px solid ${BLUE}`, backgroundColor: BLUE_BG }}
    >
      {[
        { key: "company", placeholder: "Company / Employer name" },
        { key: "role", placeholder: "Your role (e.g. Driver, Cook, Helper)" },
        { key: "years", placeholder: "How long? (e.g. 2 years, 6 months)" },
        { key: "phone", placeholder: "Employer phone (optional)", type: "tel" },
      ].map(({ key, placeholder, type = "text" }) => (
        <input
          key={key}
          type={type}
          value={value[key] || ""}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          placeholder={placeholder}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none font-semibold"
          style={{
            border: "1.5px solid #dbeafe",
            color: "#0f172a",
            backgroundColor: "white",
          }}
        />
      ))}
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
          style={{ backgroundColor: BLUE }}
        >
          <IoCheckmarkOutline size={13} /> Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
          style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
        >
          <IoCloseOutline size={13} /> Cancel
        </button>
      </div>
    </div>
  );
}


function QARow({ question, answer, icon }) {
  if (!answer) return null;
  return (
    <div
      className="flex flex-col gap-1 py-3"
      style={{ borderBottom: "1px solid #f1f5f9" }}
    >
      <div className="flex items-center gap-1.5">
        <span style={{ color: "#bfdbfe" }}>{icon}</span>
        <p
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: "#93c5fd" }}
        >
          {question}
        </p>
      </div>
      <p className="text-base font-extrabold" style={{ color: "#0f172a" }}>
        {answer}
      </p>
    </div>
  );
}

function SimpleProfileViewCard({
  profile,
  simpleEmployers = [],
  uid,
  onUpdate,
}) {
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileRef = useRef(null);
  const about = profile.about || {};

  const handlePhoto = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPhotoUploading(true);
    try {
      const url = await uploadPhoto(file);
      if (uid)
        await setDoc(doc(db, "users", uid), { photoURL: url }, { merge: true });
      if (onUpdate) onUpdate({ photoURL: url });
    } catch {}
    setPhotoUploading(false);
  };

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        border: "1.5px solid #dbeafe",
        boxShadow: "0 4px 24px rgba(96,165,250,0.1)",
      }}
    >
      <div
        className="flex flex-col sm:flex-row gap-0"
        style={{ backgroundColor: BLUE_BG }}
      >
        <div className="flex items-center justify-center p-6 sm:p-8 shrink-0">
          <div className="relative">
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt="profile"
                className="object-cover"
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: 36,
                  border: "4px solid white",
                  boxShadow: "0 4px 20px rgba(96,165,250,0.25)",
                }}
              />
            ) : (
              <div
                className="flex items-center justify-center font-extrabold text-white"
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: 36,
                  backgroundColor: BLUE,
                  fontSize: 48,
                  border: "4px solid white",
                }}
              >
                {profile.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhoto(e.target.files?.[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={photoUploading}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 transition-all opacity-0 hover:opacity-100"
              style={{ borderRadius: 36, backgroundColor: "rgba(0,0,0,0.42)" }}
            >
              {photoUploading ? (
                <svg
                  className="animate-spin"
                  width="22"
                  height="22"
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
                    style={{ color: "white", fontSize: 9, fontWeight: 700 }}
                  >
                    CHANGE
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-6 flex-1 min-w-0">
          <h1
            className="text-2xl sm:text-3xl font-black leading-tight mb-1"
            style={{ color: "#0f172a" }}
          >
            {profile.name || "Your Name"}
          </h1>
          {profile.title && (
            <p className="text-base font-bold mb-2" style={{ color: BLUE }}>
              {profile.title}
            </p>
          )}
          {profile.openToWork && (
            <span
              className="inline-flex items-center gap-1 mb-3 px-3 py-1 rounded-full text-xs font-bold w-fit"
              style={{
                backgroundColor: "#f0fdf4",
                color: "#16a34a",
                border: "1px solid #bbf7d0",
              }}
            >
              ✓ Open to Work
            </span>
          )}
          <div className="flex flex-col gap-1.5">
            {profile.location && (
              <div
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#475569" }}
              >
                <IoLocationOutline size={14} color={BLUE} /> {profile.location}
              </div>
            )}
            {profile.phone && (
              <div
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#475569" }}
              >
                <IoCallOutline size={14} color={BLUE} /> {profile.phone}
              </div>
            )}
            {profile.email && (
              <div
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#475569" }}
              >
                <IoMailOutline size={14} color={BLUE} /> {profile.email}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="px-6 py-2"
        style={{ backgroundColor: "#fff", borderTop: "1.5px solid #dbeafe" }}
      >
        {profile.bio && (
          <div className="py-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <p
              className="text-[10px] font-black uppercase tracking-widest mb-1"
              style={{ color: "#93c5fd" }}
            >
              About Me
            </p>
            <p
              className="text-sm font-medium leading-relaxed"
              style={{ color: "#334155" }}
            >
              "{profile.bio}"
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <QARow
            question="Education"
            answer={about.education}
            icon={<IoSchoolOutline size={12} />}
          />
          <QARow
            question="Years of Experience"
            answer={about.experience}
            icon={<IoBriefcaseOutline size={12} />}
          />
          <QARow
            question="Expected Pay"
            answer={about.expectedSalary}
            icon={<IoCashOutline size={12} />}
          />
        </div>
      </div>

      <div
        className="px-6 pb-6"
        style={{ backgroundColor: "#fff", borderTop: "1.5px solid #dbeafe" }}
      >
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-extrabold" style={{ color: "#0f172a" }}>
              Past Employers
            </p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              {simpleEmployers.length === 0
                ? "No work history added yet"
                : `${simpleEmployers.length} job${simpleEmployers.length > 1 ? "s" : ""} added`}
            </p>
          </div>
          <IoBriefcaseOutline size={18} color={BLUE} />
        </div>

        {simpleEmployers.length === 0 ? (
          <div
            className="flex flex-col items-center gap-2 py-8 rounded-2xl"
            style={{
              backgroundColor: "#f8fafc",
              border: "1.5px dashed #dbeafe",
            }}
          >
            <IoBriefcaseOutline size={26} color="#bfdbfe" />
            <p className="text-sm font-semibold" style={{ color: "#94a3b8" }}>
              No past employers added yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {simpleEmployers.map((emp, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0"
                  style={{ backgroundColor: BLUE_BG, color: BLUE }}
                >
                  {emp.company ? emp.company[0].toUpperCase() : "#"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: "#0f172a" }}>
                    {emp.role || "—"}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: BLUE }}>
                    {emp.company || "—"}
                  </p>
                  {emp.years && (
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      ⏱ {emp.years}
                    </p>
                  )}
                </div>
                {emp.phone && (
                  <span
                    className="text-xs font-semibold shrink-0"
                    style={{ color: "#64748b" }}
                  >
                    📞 {emp.phone}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function SimpleProfileEditForm({ profile, employers, onSave, onCancel }) {
  const [photoURL, setPhotoURL] = useState(profile.photoURL || "");
  const [name, setName] = useState(profile.name || "");
  const [jobTitle, setJobTitle] = useState(profile.title || "");
  const [location, setLocation] = useState(profile.location || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [education, setEducation] = useState(profile.about?.education || "");
  const [expYears, setExpYears] = useState(profile.about?.experience || "");
  const [salary, setSalary] = useState(profile.about?.expectedSalary || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [localEmployers, setLocalEmployers] = useState(
    employers.length > 0 ? employers : [],
  );
  const [uploading, setUploading] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newEmp, setNewEmp] = useState({
    company: "",
    role: "",
    years: "",
    phone: "",
  });
  const [editIdx, setEditIdx] = useState(null);
  const [editEmp, setEditEmp] = useState({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handlePhoto = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      setPhotoURL(await uploadPhoto(file));
    } catch {}
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const user = auth.currentUser;
    if (!user) return;
    const validEmployers = localEmployers.filter((e) => e.company || e.role);
    const data = {
      name,
      title: jobTitle,
      location,
      phone,
      photoURL,
      bio,
      profileType: "simple",
      about: {
        educationLevel: "simple",
        education,
        experience: expYears,
        expectedSalary: salary,
        onboardingDone: true,
      },
      simpleEmployers: validEmployers,
    };
    await setDoc(doc(db, "users", user.uid), data, { merge: true });
    setSaving(false);
    onSave(data, validEmployers);
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-3xl p-5"
        style={{ backgroundColor: "#f8fafc", border: "1.5px solid #e2e8f0" }}
      >
        <QLabel>Your photo</QLabel>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {photoURL ? (
              <img
                src={photoURL}
                alt="profile"
                className="object-cover"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 22,
                  border: `2px solid ${BLUE}`,
                }}
              />
            ) : (
              <div
                className="flex items-center justify-center font-extrabold text-white"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 22,
                  backgroundColor: BLUE,
                  fontSize: 28,
                }}
              >
                {name ? name[0].toUpperCase() : "?"}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhoto(e.target.files?.[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 hover:opacity-100 transition-all"
              style={{ borderRadius: 22, backgroundColor: "rgba(0,0,0,0.45)" }}
            >
              {uploading ? (
                <svg
                  className="animate-spin"
                  width="18"
                  height="18"
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
                <IoCameraOutline size={18} color="white" />
              )}
            </button>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#0f172a" }}>
              {uploading ? "Uploading…" : "Tap photo to change"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              A clear photo helps employers recognise you
            </p>
          </div>
        </div>
      </div>

      <div
        className="rounded-3xl p-5 flex flex-col gap-4"
        style={{ backgroundColor: "#f8fafc", border: "1.5px solid #e2e8f0" }}
      >
        <EditInput
          label="What is your full name?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ramesh Kumar"
        />
        <EditInput
          label="What job are you looking for?"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Driver, Cook, Security Guard…"
        />
        <EditInput
          label="Where are you based?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Andheri, Mumbai"
        />
        <EditInput
          label="Your mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 9876543210"
          type="tel"
        />
      </div>

      <div
        className="rounded-3xl p-5"
        style={{ backgroundColor: "#f8fafc", border: "1.5px solid #e2e8f0" }}
      >
        <ChipSelect
          label="What is your education level?"
          options={EDUCATION_OPTIONS}
          value={education}
          onChange={setEducation}
        />
      </div>

      <div
        className="rounded-3xl p-5"
        style={{ backgroundColor: "#f8fafc", border: "1.5px solid #e2e8f0" }}
      >
        <ChipSelect
          label="How many years of experience do you have?"
          options={EXP_YEARS}
          value={expYears}
          onChange={setExpYears}
        />
      </div>

      <div
        className="rounded-3xl p-5"
        style={{ backgroundColor: "#f8fafc", border: "1.5px solid #e2e8f0" }}
      >
        <ChipSelect
          label="How much pay are you expecting?"
          options={SALARY_OPTIONS}
          value={salary}
          onChange={setSalary}
        />
      </div>

      <div
        className="rounded-3xl p-5 flex flex-col gap-3"
        style={{ backgroundColor: "#f8fafc", border: "1.5px solid #e2e8f0" }}
      >
        <div className="flex items-center justify-between">
          <QLabel>Where have you worked before?</QLabel>
          {!addingNew && editIdx === null && (
            <button
              onClick={() => setAddingNew(true)}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{
                backgroundColor: BLUE_BG,
                color: BLUE,
                border: `1.5px solid ${BLUE}`,
              }}
            >
              <IoAddOutline size={13} /> Add Job
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2.5">
          {localEmployers.map((emp, i) =>
            editIdx === i ? (
              <EmployerForm
                key={i}
                value={editEmp}
                onChange={setEditEmp}
                onSave={() => {
                  setLocalEmployers(
                    localEmployers.map((e, idx) => (idx === i ? editEmp : e)),
                  );
                  setEditIdx(null);
                  setEditEmp({});
                }}
                onCancel={() => {
                  setEditIdx(null);
                  setEditEmp({});
                }}
              />
            ) : (
              <EmployerCard
                key={i}
                emp={emp}
                onEdit={() => {
                  setEditIdx(i);
                  setEditEmp(emp);
                }}
                onDelete={() =>
                  setLocalEmployers(
                    localEmployers.filter((_, idx) => idx !== i),
                  )
                }
              />
            ),
          )}
          {addingNew && (
            <EmployerForm
              value={newEmp}
              onChange={setNewEmp}
              onSave={() => {
                if (newEmp.company || newEmp.role)
                  setLocalEmployers([...localEmployers, newEmp]);
                setNewEmp({ company: "", role: "", years: "", phone: "" });
                setAddingNew(false);
              }}
              onCancel={() => {
                setAddingNew(false);
                setNewEmp({ company: "", role: "", years: "", phone: "" });
              }}
            />
          )}
          {localEmployers.length === 0 && !addingNew && (
            <div
              className="flex flex-col items-center gap-2 py-5 rounded-2xl"
              style={{
                backgroundColor: "white",
                border: "1.5px dashed #dbeafe",
              }}
            >
              <IoBriefcaseOutline size={22} color="#bfdbfe" />
              <p className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
                No past employers — skip if this is your first job
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className="rounded-3xl p-5"
        style={{ backgroundColor: "#f8fafc", border: "1.5px solid #e2e8f0" }}
      >
        <QLabel>Anything else about you? (optional)</QLabel>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="e.g. I am a hard-working driver with 5 years of experience in Mumbai…"
          rows={3}
          className="w-full rounded-2xl px-4 py-3 text-sm font-semibold outline-none resize-none transition-all"
          style={{
            border: "1.5px solid #e2e8f0",
            color: "#0f172a",
            backgroundColor: "white",
          }}
          onFocus={(e) => (e.target.style.borderColor = BLUE)}
          onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />
      </div>

      <div className="flex gap-3 pb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-extrabold text-white"
          style={{ backgroundColor: BLUE }}
        >
          <IoCheckmarkOutline size={16} />
          {saving ? "Saving…" : "Save Profile"}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-3.5 rounded-2xl text-sm font-bold"
          style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}


export default function SimpleProfileEdit({
  profile,
  simpleEmployers = [],
  uid,
  onUpdate,
  editing = false,
  onSave,
  onCancel,
}) {
  if (editing) {
    return (
      <SimpleProfileEditForm
        profile={profile}
        employers={simpleEmployers}
        onSave={(data, updatedEmployers) => {
          if (onUpdate) onUpdate(data);
          if (onSave) onSave(data, updatedEmployers);
        }}
        onCancel={onCancel}
      />
    );
  }
  return (
    <SimpleProfileViewCard
      profile={profile}
      simpleEmployers={simpleEmployers}
      uid={uid}
      onUpdate={onUpdate}
    />
  );
}
