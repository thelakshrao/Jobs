"use client";

import { useState, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  IoCameraOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCheckmarkOutline,
  IoChevronDownOutline,
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

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+353", country: "Ireland", flag: "🇮🇪" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
];

const STEPS = [
  "Your Photo",
  "Your Name",
  "Job You Want",
  "Location",
  "Phone Number",
  "Education",
  "Work Experience",
  "Expected Pay",
  "Past Employers",
  "Anything Else?",
];

function TextInput({ placeholder, value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
      style={{
        border: "1.5px solid #e2e8f0",
        color: "#0f172a",
        backgroundColor: "white",
      }}
      onFocus={(e) => (e.target.style.borderColor = BLUE)}
      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
    />
  );
}

function PhoneInput({
  countryCode,
  onCountryCodeChange,
  value,
  onChange,
  fullWidth,
}) {
  return (
    <div
      className="flex items-stretch w-full overflow-hidden"
      style={{
        border: "1.5px solid #e2e8f0",
        borderRadius: fullWidth ? 16 : 12,
        backgroundColor: fullWidth ? "#f8fafc" : "white",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = BLUE)}
      onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
    >
      <div className="relative flex items-center shrink-0">
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          className="h-full appearance-none outline-none text-sm font-semibold pl-3 pr-7"
          style={{
            border: "none",
            borderRight: "1.5px solid #e2e8f0",
            color: "#0f172a",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code + c.country} value={c.code}>
              {c.flag} {c.code} {c.country}
            </option>
          ))}
        </select>
        <IoChevronDownOutline
          size={12}
          style={{
            position: "absolute",
            right: 8,
            color: "#94a3b8",
            pointerEvents: "none",
          }}
        />
      </div>
      <input
        type="tel"
        value={value}
        onChange={onChange}
        placeholder="Enter your mobile number"
        className={`flex-1 min-w-0 outline-none text-sm ${fullWidth ? "px-4 py-3" : "px-3 py-2.5"}`}
        style={{
          border: "none",
          color: "#0f172a",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}

export default function SimpleProfile({ onComplete }) {
  const [step, setStep] = useState(0);
  const [photoURL, setPhotoURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("");
  const [expYears, setExpYears] = useState("");
  const [salary, setSalary] = useState("");
  const [bio, setBio] = useState("");
  const [employers, setEmployers] = useState([
    { company: "", role: "", years: "", phone: "", phoneCountryCode: "+91" },
  ]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const addEmployer = () =>
    setEmployers([
      ...employers,
      { company: "", role: "", years: "", phone: "", phoneCountryCode: "+91" },
    ]);
  const removeEmployer = (i) =>
    setEmployers(employers.filter((_, idx) => idx !== i));
  const updateEmployer = (i, field, val) =>
    setEmployers(
      employers.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)),
    );

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
    const data = {
      name,
      title: jobTitle,
      location,
      phone: phone ? `${countryCode} ${phone}` : "",
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
      simpleEmployers: employers
        .filter((e) => e.company || e.role)
        .map((e) => ({
          ...e,
          phone: e.phone ? `${e.phoneCountryCode || "+91"} ${e.phone}` : "",
        })),
    };
    await setDoc(doc(db, "users", user.uid), data, { merge: true });
    setSaving(false);
    if (onComplete) onComplete(data);
  };

  const canNext = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return jobTitle.trim().length > 0;
    if (step === 4) return phone.trim().length > 0;
    return true;
  };

  const pct = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: "#f8fafc" }}
    >
      <div
        className="w-full bg-white rounded-3xl overflow-hidden flex flex-col"
        style={{
          maxWidth: 480,
          boxShadow: "0 24px 60px rgba(0,0,0,0.1)",
          minHeight: 560,
        }}
      >
        <div className="w-full h-1.5" style={{ backgroundColor: "#f1f5f9" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: BLUE }}
          />
        </div>

        <div className="flex flex-col flex-1 p-6 sm:p-8 gap-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold" style={{ color: "#94a3b8" }}>
              {step + 1} / {STEPS.length}
            </span>
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 16 : 5,
                    height: 5,
                    backgroundColor: i <= step ? BLUE : "#e2e8f0",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-5 overflow-y-auto">
            {step === 0 && (
              <div className="flex flex-col items-center gap-5">
                <h2
                  className="text-xl font-extrabold text-center"
                  style={{ color: "#0f172a" }}
                >
                  Add your profile photo
                </h2>
                <p className="text-sm text-center" style={{ color: "#64748b" }}>
                  A clear photo helps employers recognise you easily
                </p>
                <div className="relative">
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt="profile"
                      className="object-cover"
                      style={{
                        width: 160,
                        height: 160,
                        borderRadius: 40,
                        border: "4px solid #e2e8f0",
                      }}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center font-extrabold text-white"
                      style={{
                        width: 160,
                        height: 160,
                        borderRadius: 40,
                        backgroundColor: BLUE,
                        fontSize: 48,
                        border: "4px solid #e2e8f0",
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
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[40px] transition-all"
                    style={{ backgroundColor: "rgba(0,0,0,0.42)" }}
                  >
                    {uploading ? (
                      <svg
                        className="animate-spin"
                        width="28"
                        height="28"
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
                        <IoCameraOutline size={28} color="white" />
                        <span
                          style={{
                            color: "white",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          TAP TO ADD
                        </span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  You can skip this and add it later
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2
                  className="text-xl font-extrabold"
                  style={{ color: "#0f172a" }}
                >
                  What is your full name?
                </h2>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  This will appear on your profile
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="rounded-2xl px-4 py-3 text-sm outline-none w-full"
                  style={{
                    border: "1.5px solid #e2e8f0",
                    color: "#0f172a",
                    backgroundColor: "#f8fafc",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = BLUE)}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h2
                  className="text-xl font-extrabold"
                  style={{ color: "#0f172a" }}
                >
                  What job are you looking for?
                </h2>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  Write the job title you want
                </p>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Enter the job title you're looking for"
                  className="rounded-2xl px-4 py-3 text-sm outline-none w-full"
                  style={{
                    border: "1.5px solid #e2e8f0",
                    color: "#0f172a",
                    backgroundColor: "#f8fafc",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = BLUE)}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h2
                  className="text-xl font-extrabold"
                  style={{ color: "#0f172a" }}
                >
                  Where are you based?
                </h2>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  Your city or area helps employers find you nearby
                </p>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your city or area"
                  className="rounded-2xl px-4 py-3 text-sm outline-none w-full"
                  style={{
                    border: "1.5px solid #e2e8f0",
                    color: "#0f172a",
                    backgroundColor: "#f8fafc",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = BLUE)}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-4">
                <h2
                  className="text-xl font-extrabold"
                  style={{ color: "#0f172a" }}
                >
                  Your mobile number
                </h2>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  Employers will contact you on this number
                </p>
                <PhoneInput
                  countryCode={countryCode}
                  onCountryCodeChange={setCountryCode}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  fullWidth
                />
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col gap-4">
                <h2
                  className="text-xl font-extrabold"
                  style={{ color: "#0f172a" }}
                >
                  What is your education level?
                </h2>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  Pick the highest level you completed
                </p>
                <div className="flex flex-col gap-2">
                  {EDUCATION_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setEducation(opt)}
                      className="w-full text-left px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all"
                      style={{
                        border: `2px solid ${education === opt ? BLUE : "#e2e8f0"}`,
                        backgroundColor:
                          education === opt ? BLUE_BG : "#f8fafc",
                        color: education === opt ? BLUE : "#0f172a",
                      }}
                    >
                      {opt}
                      {education === opt && (
                        <IoCheckmarkOutline
                          size={14}
                          style={{ float: "right", marginTop: 2 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="flex flex-col gap-4">
                <h2
                  className="text-xl font-extrabold"
                  style={{ color: "#0f172a" }}
                >
                  How many years of experience do you have?
                </h2>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  Total work experience in any job
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EXP_YEARS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setExpYears(opt)}
                      className="px-3 py-3 rounded-2xl text-sm font-semibold transition-all text-center"
                      style={{
                        border: `2px solid ${expYears === opt ? BLUE : "#e2e8f0"}`,
                        backgroundColor: expYears === opt ? BLUE_BG : "#f8fafc",
                        color: expYears === opt ? BLUE : "#0f172a",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="flex flex-col gap-4">
                <h2
                  className="text-xl font-extrabold"
                  style={{ color: "#0f172a" }}
                >
                  How much pay are you expecting?
                </h2>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  Pick what feels right for your work
                </p>
                <div className="flex flex-col gap-2">
                  {SALARY_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSalary(opt)}
                      className="w-full text-left px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all"
                      style={{
                        border: `2px solid ${salary === opt ? BLUE : "#e2e8f0"}`,
                        backgroundColor: salary === opt ? BLUE_BG : "#f8fafc",
                        color: salary === opt ? BLUE : "#0f172a",
                      }}
                    >
                      {opt}
                      {salary === opt && (
                        <IoCheckmarkOutline
                          size={14}
                          style={{ float: "right", marginTop: 2 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 8 && (
              <div className="flex flex-col gap-4">
                <h2
                  className="text-xl font-extrabold"
                  style={{ color: "#0f172a" }}
                >
                  Where have you worked before?
                </h2>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  Add as many past jobs as you like — or skip if this is your
                  first job
                </p>
                {employers.map((emp, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 p-4 rounded-2xl"
                    style={{
                      border: "1.5px solid #e2e8f0",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#94a3b8" }}
                      >
                        Job #{i + 1}
                      </span>
                      {employers.length > 1 && (
                        <button
                          onClick={() => removeEmployer(i)}
                          style={{ color: "#ef4444" }}
                        >
                          <IoTrashOutline size={14} />
                        </button>
                      )}
                    </div>
                    <TextInput
                      value={emp.company}
                      onChange={(e) =>
                        updateEmployer(i, "company", e.target.value)
                      }
                      placeholder="Enter company / employer name"
                    />
                    <TextInput
                      value={emp.role}
                      onChange={(e) =>
                        updateEmployer(i, "role", e.target.value)
                      }
                      placeholder="Enter your role there"
                    />
                    <TextInput
                      value={emp.years}
                      onChange={(e) =>
                        updateEmployer(i, "years", e.target.value)
                      }
                      placeholder="Enter how long you worked there"
                    />
                    <PhoneInput
                      countryCode={emp.phoneCountryCode || "+91"}
                      onCountryCodeChange={(val) =>
                        updateEmployer(i, "phoneCountryCode", val)
                      }
                      value={emp.phone || ""}
                      onChange={(e) =>
                        updateEmployer(i, "phone", e.target.value)
                      }
                    />
                  </div>
                ))}
                <button
                  onClick={addEmployer}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-2xl transition-all"
                  style={{
                    backgroundColor: BLUE_BG,
                    color: BLUE,
                    border: `1.5px dashed ${BLUE}`,
                  }}
                >
                  <IoAddOutline size={16} /> Add another job
                </button>
              </div>
            )}

            {step === 9 && (
              <div className="flex flex-col gap-4">
                <h2
                  className="text-xl font-extrabold"
                  style={{ color: "#0f172a" }}
                >
                  Anything else about you?
                </h2>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  Optional — write 1–2 sentences about yourself for employers
                </p>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short note about your skills and experience"
                  rows={4}
                  className="rounded-2xl px-4 py-3 text-sm outline-none resize-none"
                  style={{
                    border: "1.5px solid #e2e8f0",
                    color: "#0f172a",
                    backgroundColor: "#f8fafc",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = BLUE)}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => {
                  if (canNext()) setStep(step + 1);
                }}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all"
                style={{
                  backgroundColor: canNext() ? BLUE : "#e2e8f0",
                  color: canNext() ? "white" : "#94a3b8",
                }}
              >
                {step === 0 && !photoURL ? "Skip & Continue" : "Continue →"}
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: BLUE }}
              >
                <IoCheckmarkOutline size={16} />
                {saving ? "Saving…" : "Save My Profile"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
