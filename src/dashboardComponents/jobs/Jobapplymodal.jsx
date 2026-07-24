"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  X,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  Eye,
  Pencil,
  Flag,
  CheckCircle2,
  Upload,
} from "lucide-react";

const BLUE = "#004aac";

export default function JobApplyModal({ job, onClose, onApplied }) {
  const [profile, setProfile] = useState(null);
  const [resumeURL, setResumeURL] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const existing = await getDocs(
        query(
          collection(db, "applications"),
          where("jobId", "==", job.id),
          where("applicantUid", "==", user.uid),
        ),
      );
      if (!existing.empty) {
        setAlreadyApplied(true);
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) return;
      const data = snap.data();
      setProfile(data);
      setResumeURL(data.resumeURL || data.resume?.url || "");
      setEditName(data.name || "");
      setEditEmail(data.email || "");
      setEditPhone(data.phone || "");
      setEditLocation(data.location || "");
    };
    loadProfile();
  }, [job.id]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", PRESET);
      fd.append("resource_type", "raw");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD}/raw/upload`,
        { method: "POST", body: fd },
      );
      const data = await res.json();
      setResumeURL(data.secure_url);
      setResumeFile(file);
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      const dupCheck = await getDocs(
        query(
          collection(db, "applications"),
          where("jobId", "==", job.id),
          where("applicantUid", "==", user.uid),
        ),
      );
      if (!dupCheck.empty) {
        setAlreadyApplied(true);
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, "applications"), {
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName || "",
        employerUid: job.employerUid || "",
        applicantUid: user.uid,
        applicantName: editName || profile?.name || "",
        applicantEmail: editEmail || profile?.email || user.email || "",
        applicantPhone: editPhone || profile?.phone || "",
        applicantLocation: editLocation || profile?.location || "",
        applicantPhotoURL: profile?.photoURL || "",
        applicantSlug: profile?.slug || "",
        resumeURL: resumeURL || "",
        location: job.location || "",
        status: "Applied",
        appliedAt: new Date(),
      });

      await updateDoc(doc(db, "jobs", job.id), {
        applicants: increment(1),
      });

      setApplied(true);
      setTimeout(() => {
        onApplied?.();
        onClose();
      }, 1800);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const location = [job.location, job.targetCountry].filter(Boolean).join(", ");

  const contactRows = [
    {
      icon: <User size={14} />,
      label: "Full Name",
      value: editName,
      setter: setEditName,
      placeholder: "Your full name",
    },
    {
      icon: <Mail size={14} />,
      label: "Email",
      value: editEmail,
      setter: setEditEmail,
      placeholder: "Your email",
    },
    {
      icon: <Phone size={14} />,
      label: "Phone",
      value: editPhone,
      setter: setEditPhone,
      placeholder: "Your phone number",
    },
    {
      icon: <MapPin size={14} />,
      label: "Location",
      value: editLocation,
      setter: setEditLocation,
      placeholder: "Your location",
    },
  ];

  const modalContent = (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ zIndex: 99999, backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
        style={{
          maxHeight: "92vh",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.22)",
          zIndex: 100000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide mb-0.5">
              Applying to
            </p>
            <h2 className="text-base font-extrabold text-slate-900 leading-snug">
              {job.title}
              {job.companyName && (
                <span className="font-extrabold" style={{ color: BLUE }}>
                  {" "}
                  · {job.companyName}
                </span>
              )}
            </h2>
            {location && (
              <p className="text-xs font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin size={11} className="text-slate-400" />
                {location}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 shrink-0 ml-3"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {applied ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
              <CheckCircle2 size={52} style={{ color: "#22c55e" }} />
              <p className="text-xl font-extrabold text-slate-900">
                Application Sent!
              </p>
              <p className="text-sm font-bold text-slate-500 text-center">
                Your application has been submitted to{" "}
                {job.companyName || "the employer"}.
              </p>
            </div>
          ) : alreadyApplied ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
              <CheckCircle2 size={48} style={{ color: BLUE }} />
              <p className="text-lg font-extrabold text-slate-900">
                Already Applied
              </p>
              <p className="text-sm font-bold text-slate-500 text-center">
                You've already applied to this job.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">
                    Contact Information
                  </p>
                  <button
                    onClick={() => setEditingContact((v) => !v)}
                    className="flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                    style={{ color: BLUE }}
                  >
                    <Pencil size={11} />
                    {editingContact ? "Done" : "Edit"}
                  </button>
                </div>
                {contactRows
                  .filter((r) => r.value || editingContact)
                  .map(({ icon, label, value, setter, placeholder }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 last:border-0"
                    >
                      <span className="text-slate-400 shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-0.5">
                          {label}
                        </p>
                        {editingContact ? (
                          <input
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            placeholder={placeholder}
                            className="w-full text-sm font-extrabold text-slate-900 outline-none border-b border-blue-200 bg-transparent pb-0.5 focus:border-blue-400"
                          />
                        ) : (
                          <p className="text-sm font-extrabold text-slate-900 truncate">
                            {value || "—"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">
                    Resume
                  </p>
                  <div className="flex items-center gap-2">
                    {resumeURL && (
                      <a
                        href={resumeURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                        style={{ color: BLUE }}
                      >
                        <Eye size={11} /> View
                      </a>
                    )}
                    <label
                      className="flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                      style={{ color: BLUE }}
                    >
                      <Pencil size={11} /> Edit
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>

                {resumeURL ? (
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "#eff6ff" }}
                    >
                      <FileText size={18} style={{ color: BLUE }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-slate-900 truncate">
                        {resumeFile?.name || "Resume from profile"}
                      </p>
                      <p className="text-xs font-bold text-slate-400">
                        Ready to send
                      </p>
                    </div>
                    {uploading && (
                      <p
                        className="text-xs font-extrabold shrink-0"
                        style={{ color: BLUE }}
                      >
                        Uploading…
                      </p>
                    )}
                  </div>
                ) : (
                  <label className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0">
                      <Upload size={16} className="text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">
                        Upload resume
                      </p>
                      <p className="text-xs font-bold text-slate-400">
                        PDF or Word file
                      </p>
                    </div>
                    {uploading && (
                      <p
                        className="text-xs font-extrabold ml-auto"
                        style={{ color: BLUE }}
                      >
                        Uploading…
                      </p>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {!applied && !alreadyApplied && (
          <div className="px-5 pb-6 pt-3 border-t border-slate-100 shrink-0 flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{ backgroundColor: BLUE }}
            >
              {submitting ? "Submitting…" : "Submit Application ✓"}
            </button>

            <button className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 py-1">
              <Flag size={12} />
              Report an issue with this job
            </button>

            <p className="text-[11px] font-bold text-slate-400 text-center leading-relaxed">
              By applying you agree to our{" "}
              <a
                href="/terms"
                className="underline font-extrabold"
                style={{ color: BLUE }}
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="underline font-extrabold"
                style={{ color: BLUE }}
              >
                Privacy Policy
              </a>
              . Your information may be shared with the employer.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}