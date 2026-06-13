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

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div
      className="flex items-start gap-3 py-2.5"
      style={{ borderBottom: "1px solid #f1f5f9" }}
    >
      <div className="shrink-0 mt-0.5" style={{ color: "#94a3b8" }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[11px] font-bold uppercase tracking-wider mb-0.5"
          style={{ color: "#94a3b8" }}
        >
          {label}
        </p>
        <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function EmployerCard({ emp, index, onEdit, onDelete, isOwner }) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-2xl"
      style={{ backgroundColor: "#f8fafc", border: "1.5px solid #f1f5f9" }}
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
        <div className="flex items-center gap-3 mt-0.5">
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
      {isOwner && (
        <div className="flex gap-1.5 shrink-0">
          <button onClick={onEdit} style={{ color: "#94a3b8" }}>
            <IoPencilOutline size={13} />
          </button>
          <button onClick={onDelete} style={{ color: "#ef4444" }}>
            <IoTrashOutline size={13} />
          </button>
        </div>
      )}
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
        { key: "phone", placeholder: "Employer phone (optional)" },
      ].map(({ key, placeholder }) => (
        <input
          key={key}
          value={value[key] || ""}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          placeholder={placeholder}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{
            border: "1.5px solid #e2e8f0",
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

export default function SimpleProfileCard({
  profile,
  simpleEmployers = [],
  uid,       
  onUpdate,
}) {
  const isOwner = !!uid;

  const [photoUploading, setPhotoUploading] = useState(false);
  const [employers, setEmployers] = useState(simpleEmployers);
  const [addingNew, setAddingNew] = useState(false);
  const [newEmp, setNewEmp] = useState({
    company: "",
    role: "",
    years: "",
    phone: "",
  });
  const [editIdx, setEditIdx] = useState(null);
  const [editEmp, setEditEmp] = useState({});
  const fileRef = useRef(null);

  const saveEmployers = async (updated) => {
    setEmployers(updated);
    if (uid) {
      await setDoc(
        doc(db, "users", uid),
        { simpleEmployers: updated },
        { merge: true },
      );
    }
    if (onUpdate) onUpdate({ simpleEmployers: updated });
  };

  const handleAddNew = () => {
    if (!newEmp.company && !newEmp.role) return;
    saveEmployers([...employers, newEmp]);
    setNewEmp({ company: "", role: "", years: "", phone: "" });
    setAddingNew(false);
  };

  const handleEditSave = () => {
    const updated = employers.map((e, i) => (i === editIdx ? editEmp : e));
    saveEmployers(updated);
    setEditIdx(null);
    setEditEmp({});
  };

  const handleDelete = (i) => {
    saveEmployers(employers.filter((_, idx) => idx !== i));
  };

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

  const about = profile.about || {};

  return (
    <div
      className="rounded-3xl overflow-hidden mb-10"
      style={{
        border: "1.5px solid #f1f5f9",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      }}
    >
      <div
        className="flex flex-col sm:flex-row gap-0"
        style={{ backgroundColor: "#fff" }}
      >
        <div
          className="flex items-center justify-center p-6 sm:p-8 shrink-0"
          style={{ backgroundColor: BLUE_BG, minWidth: 180 }}
        >
          <div className="relative">
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt="profile"
                className="object-cover"
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 36,
                  border: "4px solid white",
                  boxShadow: "0 8px 24px rgba(96,165,250,0.3)",
                }}
              />
            ) : (
              <div
                className="flex items-center justify-center font-extrabold text-white"
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 36,
                  backgroundColor: BLUE,
                  fontSize: 52,
                  border: "4px solid white",
                  boxShadow: "0 8px 24px rgba(96,165,250,0.3)",
                }}
              >
                {profile.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}

            {isOwner && (
              <>
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
                  style={{
                    borderRadius: 36,
                    backgroundColor: "rgba(0,0,0,0.45)",
                  }}
                >
                  {photoUploading ? (
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
                      <IoCameraOutline size={24} color="white" />
                      <span
                        style={{ color: "white", fontSize: 9, fontWeight: 700 }}
                      >
                        CHANGE
                      </span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-6 flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap mb-1">
            <h1
              className="text-2xl font-extrabold leading-tight"
              style={{ color: "#0f172a" }}
            >
              {profile.name || "Your Name"}
            </h1>
            {profile.openToWork && (
              <span
                className="mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0"
                style={{
                  backgroundColor: "#f0fdf4",
                  color: "#16a34a",
                  border: "1px solid #bbf7d0",
                }}
              >
                ✓ Open to Work
              </span>
            )}
          </div>

          {profile.title && (
            <p className="text-base font-bold mb-3" style={{ color: BLUE }}>
              {profile.title}
            </p>
          )}

          <div className="flex flex-col gap-1">
            {profile.location && (
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: "#475569" }}
              >
                <IoLocationOutline size={14} color="#94a3b8" />
                {profile.location}
              </div>
            )}
            {profile.phone && (
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: "#475569" }}
              >
                <IoCallOutline size={14} color="#94a3b8" />
                {profile.phone}
              </div>
            )}
          </div>

          {profile.bio && (
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "#64748b" }}
            >
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      <div className="px-6 py-4" style={{ borderTop: "1.5px solid #f1f5f9" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          <InfoRow
            icon={<IoSchoolOutline size={16} />}
            label="Education"
            value={about.education}
          />
          <InfoRow
            icon={<IoBriefcaseOutline size={16} />}
            label="Experience"
            value={about.experience}
          />
          <InfoRow
            icon={<IoCashOutline size={16} />}
            label="Expected Pay"
            value={about.expectedSalary}
          />
          <InfoRow
            icon={<IoPersonOutline size={16} />}
            label="Email"
            value={profile.email}
          />
        </div>
      </div>

      <div className="px-6 pb-6" style={{ borderTop: "1.5px solid #f1f5f9" }}>
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-extrabold" style={{ color: "#0f172a" }}>
              Past Employers
            </p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              {employers.length === 0
                ? "No work history added yet"
                : `${employers.length} job${employers.length > 1 ? "s" : ""} added`}
            </p>
          </div>
          {isOwner && !addingNew && editIdx === null && (
            <button
              onClick={() => setAddingNew(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
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
          {employers.map((emp, i) =>
            isOwner && editIdx === i ? (
              <EmployerForm
                key={i}
                value={editEmp}
                onChange={setEditEmp}
                onSave={handleEditSave}
                onCancel={() => {
                  setEditIdx(null);
                  setEditEmp({});
                }}
              />
            ) : (
              <EmployerCard
                key={i}
                emp={emp}
                index={i}
                isOwner={isOwner}
                onEdit={() => {
                  setEditIdx(i);
                  setEditEmp(emp);
                }}
                onDelete={() => handleDelete(i)}
              />
            ),
          )}

          {isOwner && addingNew && (
            <EmployerForm
              value={newEmp}
              onChange={setNewEmp}
              onSave={handleAddNew}
              onCancel={() => {
                setAddingNew(false);
                setNewEmp({ company: "", role: "", years: "", phone: "" });
              }}
            />
          )}

          {employers.length === 0 && !addingNew && (
            <div
              className="flex flex-col items-center gap-2 py-8 rounded-2xl"
              style={{
                backgroundColor: "#f8fafc",
                border: "1.5px dashed #e2e8f0",
              }}
            >
              <IoBriefcaseOutline size={28} color="#cbd5e1" />
              <p className="text-sm font-semibold" style={{ color: "#94a3b8" }}>
                No past employers added
              </p>
              {isOwner && (
                <button
                  onClick={() => setAddingNew(true)}
                  className="text-xs font-bold px-4 py-2 rounded-xl mt-1"
                  style={{ backgroundColor: BLUE_BG, color: BLUE }}
                >
                  + Add your first job
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}