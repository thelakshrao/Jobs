"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  IoLocationOutline,
  IoMailOutline,
  IoCallOutline,
  IoLogoLinkedin,
  IoLogoGithub,
  IoGlobeOutline,
  IoLogoTwitter,
  IoPencilOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoCheckmarkCircle,
  IoEllipseOutline,
  IoCloudUploadOutline,
  IoDownloadOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCalendarOutline,
  IoLocationSharp,
  IoEllipsisVertical,
  IoSchoolOutline,
  IoBriefcaseOutline,
  IoPersonOutline,
} from "react-icons/io5";

// ─── constants ────────────────────────────────────────────────────────────────
const BLUE = "#60a5fa";
const BLUE_DARK = "#3b82f6";
const BLUE_BG = "#eff6ff";
const BLUE_BG_HOVER = "#dbeafe";

const defaultProfile = {
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

const defaultAbout = {
  description: "",
  experience: "",
  currentRole: "",
  expectedSalary: "",
  languages: "",
  availability: "",
  jobPreferences: "",
  skills: [],
  educationLevel: null, // "school" | "graduate"
  onboardingDone: false,
};

const strengthItems = [
  { label: "Add your resume", key: "resume" },
  { label: "Add skills", key: "skills" },
  { label: "Add portfolio link", key: "portfolio" },
  { label: "Verify email", key: "email" },
  { label: "Add work experience", key: "experience" },
];

const GRADUATE_TABS = ["About", "Experience", "Education", "Skills"];
const SCHOOL_TABS = ["About", "Skills"];

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

// ─── tiny helpers ─────────────────────────────────────────────────────────────
function Field({
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
      <label className="text-xs font-semibold text-gray-500">{label}</label>
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

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="rounded-xl px-3 py-2 text-sm outline-none"
        style={{
          border: "1.5px solid #e2e8f0",
          color: value ? "#0f172a" : "#94a3b8",
          backgroundColor: "white",
        }}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function BtnPrimary({ onClick, disabled, children, className = "" }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all ${className}`}
      style={{ backgroundColor: hov ? BLUE_DARK : BLUE }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
}

function BtnGhost({ onClick, children }) {
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

function SectionCard({ children }) {
  return (
    <div
      className="rounded-2xl"
      style={{
        border: "1.5px solid #f1f5f9",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

// ─── onboarding modal ─────────────────────────────────────────────────────────
function OnboardingModal({ onSelect }) {
  const [hov, setHov] = useState(null);
  const cards = [
    {
      id: "school",
      icon: <IoSchoolOutline size={32} color={BLUE} />,
      title: "10th / 12th Pass",
      desc: "I have completed school education (Matriculation or Intermediate)",
    },
    {
      id: "graduate",
      icon: <IoBriefcaseOutline size={32} color={BLUE} />,
      title: "Graduate / Postgraduate",
      desc: "I have completed or pursuing a bachelor's or master's degree",
    },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="bg-white rounded-3xl p-10 flex flex-col items-center gap-8"
        style={{ width: "520px", boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
            style={{ backgroundColor: BLUE_BG }}
          >
            <IoPersonOutline size={24} color={BLUE} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            What's your education level?
          </h2>
          <p className="text-sm text-gray-400">
            This helps us personalise your profile experience
          </p>
        </div>
        <div className="flex gap-4 w-full">
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl text-center transition-all"
              style={{
                border:
                  hov === c.id ? `2px solid ${BLUE}` : "2px solid #f1f5f9",
                backgroundColor: hov === c.id ? BLUE_BG : "#fafafa",
              }}
              onMouseEnter={() => setHov(c.id)}
              onMouseLeave={() => setHov(null)}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: BLUE_BG }}
              >
                {c.icon}
              </div>
              <p className="text-sm font-bold text-gray-900">{c.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(defaultProfile);
  const [form, setForm] = useState(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("About");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [about, setAbout] = useState(defaultAbout);
  const [aboutForm, setAboutForm] = useState(defaultAbout);
  const [editingAbout, setEditingAbout] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);

  const [experiences, setExperiences] = useState([]);
  const [editingExp, setEditingExp] = useState(null);
  const [expForm, setExpForm] = useState({});

  const [educations, setEducations] = useState([]);
  const [editingEdu, setEditingEdu] = useState(null);
  const [eduForm, setEduForm] = useState({});

  const [skillInput, setSkillInput] = useState("");

  const completedItems = ["resume", "skills", "portfolio", "email"];
  const strengthPercent = Math.round(
    (completedItems.length / strengthItems.length) * 100,
  );

  const isGraduate = about.educationLevel === "graduate";
  const TABS = isGraduate ? GRADUATE_TABS : SCHOOL_TABS;

  // ── load ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (!fu) return;
      setUser(fu);
      const snap = await getDoc(doc(db, "users", fu.uid));
      if (snap.exists()) {
        const data = snap.data();
        const p = { ...defaultProfile, ...data };
        setProfile(p);
        setForm(p);
        const a = { ...defaultAbout, ...(data.about || {}) };
        setAbout(a);
        setAboutForm(a);
        setExperiences(data.experiences || []);
        setEducations(data.educations || []);
        if (!a.onboardingDone) setShowOnboarding(true);
      } else {
        const init = {
          ...defaultProfile,
          name: fu.displayName || "",
          email: fu.email || "",
          photoURL: fu.photoURL || "",
        };
        setProfile(init);
        setForm(init);
        setShowOnboarding(true);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const saveToFirebase = async (data) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), data, { merge: true });
  };

  // ── onboarding ──
  const handleOnboardingSelect = async (level) => {
    const updated = { ...about, educationLevel: level, onboardingDone: true };
    setAbout(updated);
    setAboutForm(updated);
    setShowOnboarding(false);
    await saveToFirebase({ about: updated });
  };

  // ── profile card ──
  const handleSave = async () => {
    setSaving(true);
    await saveToFirebase(form);
    setProfile(form);
    setEditing(false);
    setSaving(false);
  };

  // ── about ──
  const handleSaveAbout = async () => {
    setSavingAbout(true);
    await saveToFirebase({ about: aboutForm });
    setAbout(aboutForm);
    setEditingAbout(false);
    setSavingAbout(false);
  };

  // ── experience ──
  const saveExp = async (updated) => {
    await saveToFirebase({ experiences: updated });
    setExperiences(updated);
    setEditingExp(null);
    setExpForm({});
  };
  const handleSaveExp = () => {
    const updated =
      editingExp === "new"
        ? [...experiences, expForm]
        : experiences.map((e, i) => (i === editingExp ? expForm : e));
    saveExp(updated);
  };
  const handleDeleteExp = (i) =>
    saveExp(experiences.filter((_, idx) => idx !== i));

  // ── education ──
  const saveEdu = async (updated) => {
    await saveToFirebase({ educations: updated });
    setEducations(updated);
    setEditingEdu(null);
    setEduForm({});
  };
  const handleSaveEdu = () => {
    const updated =
      editingEdu === "new"
        ? [...educations, eduForm]
        : educations.map((e, i) => (i === editingEdu ? eduForm : e));
    saveEdu(updated);
  };
  const handleDeleteEdu = (i) =>
    saveEdu(educations.filter((_, idx) => idx !== i));

  // ── skills ──
  const handleAddSkill = async () => {
    if (!skillInput.trim()) return;
    const updated = {
      ...about,
      skills: [...(about.skills || []), skillInput.trim()],
    };
    await saveToFirebase({ about: updated });
    setAbout(updated);
    setAboutForm(updated);
    setSkillInput("");
  };
  const handleDeleteSkill = async (skill) => {
    const updated = {
      ...about,
      skills: about.skills.filter((s) => s !== skill),
    };
    await saveToFirebase({ about: updated });
    setAbout(updated);
    setAboutForm(updated);
  };

  if (loading) return null;

  // ── edu level label ──
  const STREAM_OPTIONS = {
    graduate: [
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
    ],
    school: [
      "Science (PCM)",
      "Science (PCB)",
      "Commerce",
      "Arts / Humanities",
      "Other",
    ],
  };
  const EDU_TYPE_GRADUATE = [
    "10th (Matriculation)",
    "12th (Intermediate)",
    "Diploma",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD / Doctorate",
  ];
  const EDU_TYPE_SCHOOL = ["10th (Matriculation)", "12th (Intermediate)"];

  return (
    <>
      {showOnboarding && <OnboardingModal onSelect={handleOnboardingSelect} />}

      <div
        className="min-h-screen bg-white"
        style={{
          paddingLeft: "108px",
          paddingTop: "88px",
          paddingRight: "24px",
          paddingBottom: "40px",
        }}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage your profile and increase your chances of getting hired
            </p>
          </div>
          {!editing && (
            <BtnPrimary onClick={() => setEditing(true)}>
              <IoPencilOutline size={15} /> Edit Profile
            </BtnPrimary>
          )}
        </div>

        {/* top row */}
        <div className="flex gap-4 items-start mb-4">
          {/* Profile card */}
          <SectionCard>
            <div className="p-8 flex-1" style={{ minWidth: 0 }}>
              {editing ? (
                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-6">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: BLUE }}
                    >
                      {form.name ? form.name[0].toUpperCase() : "?"}
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="flex gap-3">
                        <Field
                          label="Full Name"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          placeholder="Lakshay Yadav"
                        />
                        <Field
                          label="Job Title"
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                          placeholder="Full Stack Developer"
                        />
                        <Select
                          label="Gender"
                          value={form.gender}
                          onChange={(e) =>
                            setForm({ ...form, gender: e.target.value })
                          }
                          options={GENDERS}
                        />
                      </div>
                      <Field
                        as="textarea"
                        label="Bio"
                        value={form.bio}
                        onChange={(e) =>
                          setForm({ ...form, bio: e.target.value })
                        }
                        placeholder="Passionate developer with 2+ years..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Field
                      label="Location"
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      placeholder="Bangalore, India"
                    />
                    <Field
                      label="Email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="you@email.com"
                    />
                    <Field
                      label="Phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Field
                      label="LinkedIn"
                      value={form.linkedin}
                      onChange={(e) =>
                        setForm({ ...form, linkedin: e.target.value })
                      }
                      placeholder="linkedin.com/in/you"
                    />
                    <Field
                      label="GitHub"
                      value={form.github}
                      onChange={(e) =>
                        setForm({ ...form, github: e.target.value })
                      }
                      placeholder="github.com/you"
                    />
                    <Field
                      label="Twitter"
                      value={form.twitter}
                      onChange={(e) =>
                        setForm({ ...form, twitter: e.target.value })
                      }
                      placeholder="twitter.com/you"
                    />
                    <Field
                      label="Portfolio"
                      value={form.portfolio}
                      onChange={(e) =>
                        setForm({ ...form, portfolio: e.target.value })
                      }
                      placeholder="yoursite.com"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setForm({ ...form, openToWork: !form.openToWork })
                      }
                      className="w-10 h-6 rounded-full transition-all flex items-center px-1"
                      style={{
                        backgroundColor: form.openToWork
                          ? "#22c55e"
                          : "#e2e8f0",
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full bg-white transition-all"
                        style={{
                          transform: form.openToWork
                            ? "translateX(16px)"
                            : "translateX(0)",
                        }}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      Open to work
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <BtnPrimary onClick={handleSave} disabled={saving}>
                      <IoCheckmarkOutline size={15} />{" "}
                      {saving ? "Saving..." : "Save"}
                    </BtnPrimary>
                    <BtnGhost
                      onClick={() => {
                        setForm(profile);
                        setEditing(false);
                      }}
                    >
                      <IoCloseOutline size={15} /> Cancel
                    </BtnGhost>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-8">
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                      style={{ backgroundColor: BLUE }}
                    >
                      {profile.name ? profile.name[0].toUpperCase() : "?"}
                    </div>
                    {profile.openToWork && (
                      <span
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "#dcfce7",
                          color: "#16a34a",
                          whiteSpace: "nowrap",
                          border: "1.5px solid #bbf7d0",
                        }}
                      >
                        Open to work
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900">
                        {profile.name || "Your Name"}
                      </h2>
                      {profile.gender && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "#f1f5f9",
                            color: "#64748b",
                          }}
                        >
                          {profile.gender}
                        </span>
                      )}
                    </div>
                    {profile.title && (
                      <p className="text-sm font-medium text-gray-500">
                        {profile.title}
                      </p>
                    )}
                    <div className="flex items-center gap-5 flex-wrap">
                      {profile.location && (
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <IoLocationOutline size={15} />
                          {profile.location}
                        </span>
                      )}
                      {profile.email && (
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <IoMailOutline size={15} />
                          {profile.email}
                        </span>
                      )}
                      {profile.phone && (
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <IoCallOutline size={15} />
                          {profile.phone}
                        </span>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {profile.linkedin && (
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#0f172a" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = BLUE)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#0f172a")
                          }
                        >
                          <IoLogoLinkedin size={22} />
                        </a>
                      )}
                      {profile.github && (
                        <a
                          href={profile.github}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#0f172a" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = BLUE)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#0f172a")
                          }
                        >
                          <IoLogoGithub size={22} />
                        </a>
                      )}
                      {profile.twitter && (
                        <a
                          href={profile.twitter}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#0f172a" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = BLUE)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#0f172a")
                          }
                        >
                          <IoLogoTwitter size={22} />
                        </a>
                      )}
                      {profile.portfolio && (
                        <a
                          href={profile.portfolio}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#0f172a" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = BLUE)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#0f172a")
                          }
                        >
                          <IoGlobeOutline size={22} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Profile Strength */}
          {!editing && (
            <div
              className="rounded-2xl p-6 flex-shrink-0"
              style={{
                border: "1.5px solid #f1f5f9",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                width: "300px",
              }}
            >
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Profile Strength
              </h3>
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="relative flex-shrink-0"
                  style={{ width: "80px", height: "80px" }}
                >
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="7"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke={BLUE}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - strengthPercent / 100)}`}
                      transform="rotate(-90 40 40)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-bold text-gray-900">
                      {strengthPercent}%
                    </span>
                    <span className="text-xs text-gray-400">Good</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">
                    Complete to improve
                  </p>
                  {strengthItems.map(({ label, key }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-xs text-gray-700">{label}</span>
                      {completedItems.includes(key) ? (
                        <IoCheckmarkCircle size={16} color="#22c55e" />
                      ) : (
                        <IoEllipseOutline size={16} color="#cbd5e1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor: BLUE_BG, color: BLUE }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = BLUE_BG_HOVER)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BLUE_BG)
                }
              >
                Improve Profile
              </button>
            </div>
          )}
        </div>

        {/* bottom row */}
        {!editing && (
          <div className="flex gap-4 items-start">
            {/* Tabs */}
            <div className="flex-1 min-w-0">
              <SectionCard>
                {/* tab bar */}
                <div
                  className="flex border-b"
                  style={{ borderColor: "#f1f5f9" }}
                >
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="px-5 py-3 text-sm font-semibold transition-all"
                      style={{
                        color: activeTab === tab ? BLUE : "#64748b",
                        borderBottom:
                          activeTab === tab
                            ? `2px solid ${BLUE}`
                            : "2px solid transparent",
                        background: "none",
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* ── ABOUT ── */}
                  {activeTab === "About" && (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">
                          About Me
                        </h3>
                        {!editingAbout && (
                          <button
                            onClick={() => {
                              setAboutForm(about);
                              setEditingAbout(true);
                            }}
                            className="flex items-center gap-1.5 text-sm font-medium"
                            style={{ color: BLUE }}
                          >
                            <IoPencilOutline size={14} /> Edit
                          </button>
                        )}
                      </div>

                      {editingAbout ? (
                        <div className="flex flex-col gap-4">
                          <Field
                            as="textarea"
                            label="Description"
                            value={aboutForm.description}
                            onChange={(e) =>
                              setAboutForm({
                                ...aboutForm,
                                description: e.target.value,
                              })
                            }
                            placeholder="I am a Full Stack Developer who loves turning ideas into real-world products..."
                            rows={3}
                          />
                          <div className="grid grid-cols-3 gap-3">
                            <Field
                              label="Experience"
                              value={aboutForm.experience}
                              onChange={(e) =>
                                setAboutForm({
                                  ...aboutForm,
                                  experience: e.target.value,
                                })
                              }
                              placeholder="2+ Years"
                            />
                            <Field
                              label="Current Role"
                              value={aboutForm.currentRole}
                              onChange={(e) =>
                                setAboutForm({
                                  ...aboutForm,
                                  currentRole: e.target.value,
                                })
                              }
                              placeholder="Full Stack Developer"
                            />
                            <Field
                              label="Expected Salary"
                              value={aboutForm.expectedSalary}
                              onChange={(e) =>
                                setAboutForm({
                                  ...aboutForm,
                                  expectedSalary: e.target.value,
                                })
                              }
                              placeholder="₹ 8 - 12 LPA"
                            />
                            <Field
                              label="Languages Known"
                              value={aboutForm.languages}
                              onChange={(e) =>
                                setAboutForm({
                                  ...aboutForm,
                                  languages: e.target.value,
                                })
                              }
                              placeholder="English, Hindi"
                            />
                            <Field
                              label="Availability"
                              value={aboutForm.availability}
                              onChange={(e) =>
                                setAboutForm({
                                  ...aboutForm,
                                  availability: e.target.value,
                                })
                              }
                              placeholder="Immediately"
                            />
                            <Field
                              label="Job Preferences"
                              value={aboutForm.jobPreferences}
                              onChange={(e) =>
                                setAboutForm({
                                  ...aboutForm,
                                  jobPreferences: e.target.value,
                                })
                              }
                              placeholder="Remote, Bangalore, Hybrid"
                            />
                          </div>
                          <div className="flex gap-2">
                            <BtnPrimary
                              onClick={handleSaveAbout}
                              disabled={savingAbout}
                            >
                              <IoCheckmarkOutline size={15} />{" "}
                              {savingAbout ? "Saving..." : "Save"}
                            </BtnPrimary>
                            <BtnGhost onClick={() => setEditingAbout(false)}>
                              <IoCloseOutline size={15} /> Cancel
                            </BtnGhost>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {about.description ? (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {about.description}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              No description added yet.
                            </p>
                          )}
                          <div
                            className="grid grid-cols-3 gap-x-6 gap-y-4 py-4"
                            style={{
                              borderTop: "1px solid #f1f5f9",
                              borderBottom: "1px solid #f1f5f9",
                            }}
                          >
                            {[
                              { label: "Experience", value: about.experience },
                              {
                                label: "Current Role",
                                value: about.currentRole,
                              },
                              {
                                label: "Expected Salary",
                                value: about.expectedSalary,
                              },
                              {
                                label: "Languages Known",
                                value: about.languages,
                              },
                              {
                                label: "Availability",
                                value: about.availability,
                              },
                              {
                                label: "Job Preferences",
                                value: about.jobPreferences,
                              },
                            ].map(({ label, value }) => (
                              <div key={label}>
                                <p className="text-xs text-gray-400 mb-0.5">
                                  {label}
                                </p>
                                <p className="text-sm font-medium text-gray-800">
                                  {value || "—"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── EXPERIENCE (graduate only) ── */}
                  {activeTab === "Experience" && (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">
                          Work Experience
                        </h3>
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
                            setEditingExp("new");
                          }}
                          className="flex items-center gap-1.5 text-sm font-medium"
                          style={{ color: BLUE }}
                        >
                          <IoAddOutline size={16} /> Add Experience
                        </button>
                      </div>

                      {editingExp !== null && (
                        <div
                          className="rounded-2xl p-5 flex flex-col gap-3"
                          style={{
                            border: "1.5px solid #e2e8f0",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            {editingExp === "new"
                              ? "Add New Experience"
                              : "Edit Experience"}
                          </p>
                          <div className="flex gap-3">
                            <Field
                              label="Job Title / Role"
                              value={expForm.title || ""}
                              onChange={(e) =>
                                setExpForm({
                                  ...expForm,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Full Stack Developer"
                            />
                            <Field
                              label="Company Name"
                              value={expForm.company || ""}
                              onChange={(e) =>
                                setExpForm({
                                  ...expForm,
                                  company: e.target.value,
                                })
                              }
                              placeholder="TechCorp Solutions"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Field
                              label="Job Location"
                              value={expForm.location || ""}
                              onChange={(e) =>
                                setExpForm({
                                  ...expForm,
                                  location: e.target.value,
                                })
                              }
                              placeholder="Bangalore, India"
                            />
                            <Field
                              label="Start Date"
                              value={expForm.startDate || ""}
                              onChange={(e) =>
                                setExpForm({
                                  ...expForm,
                                  startDate: e.target.value,
                                })
                              }
                              placeholder="Jan 2023"
                            />
                            <Field
                              label="End Date"
                              value={
                                expForm.current
                                  ? "Present"
                                  : expForm.endDate || ""
                              }
                              onChange={(e) =>
                                setExpForm({
                                  ...expForm,
                                  endDate: e.target.value,
                                })
                              }
                              placeholder="Dec 2024"
                            />
                          </div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer w-fit">
                            <input
                              type="checkbox"
                              checked={!!expForm.current}
                              onChange={(e) =>
                                setExpForm({
                                  ...expForm,
                                  current: e.target.checked,
                                  endDate: "",
                                })
                              }
                              className="accent-blue-400 w-4 h-4"
                            />
                            I currently work here
                          </label>
                          <Field
                            as="textarea"
                            label="Job Description"
                            value={expForm.description || ""}
                            onChange={(e) =>
                              setExpForm({
                                ...expForm,
                                description: e.target.value,
                              })
                            }
                            placeholder={
                              "• Developed and maintained scalable web applications using MERN stack.\n• Collaborated with cross-functional teams to implement new features."
                            }
                            rows={4}
                          />
                          <div className="flex gap-2 mt-1">
                            <BtnPrimary onClick={handleSaveExp}>
                              <IoCheckmarkOutline size={15} /> Save
                            </BtnPrimary>
                            <BtnGhost
                              onClick={() => {
                                setEditingExp(null);
                                setExpForm({});
                              }}
                            >
                              <IoCloseOutline size={15} /> Cancel
                            </BtnGhost>
                          </div>
                        </div>
                      )}

                      {experiences.length === 0 && editingExp === null && (
                        <div className="flex flex-col items-center gap-2 py-10 text-center">
                          <IoBriefcaseOutline size={36} color="#cbd5e1" />
                          <p className="text-sm text-gray-400">
                            No work experience added yet.
                          </p>
                          <p className="text-xs text-gray-300">
                            Click "Add Experience" to get started
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-4">
                        {experiences.map((exp, i) => (
                          <div
                            key={i}
                            className="flex gap-4 items-start p-4 rounded-2xl transition-all"
                            style={{
                              backgroundColor: "#fafafa",
                              border: "1.5px solid #f1f5f9",
                            }}
                          >
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                              style={{ backgroundColor: BLUE }}
                            >
                              {exp.company
                                ? exp.company.slice(0, 2).toUpperCase()
                                : "CO"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-bold text-gray-900">
                                    {exp.title}
                                  </p>
                                  <p
                                    className="text-sm font-semibold"
                                    style={{ color: BLUE }}
                                  >
                                    {exp.company}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    {(exp.startDate ||
                                      exp.endDate ||
                                      exp.current) && (
                                      <span className="flex items-center gap-1 text-xs text-gray-400">
                                        <IoCalendarOutline size={12} />
                                        {exp.startDate}
                                        {exp.startDate &&
                                        (exp.endDate || exp.current)
                                          ? " – "
                                          : ""}
                                        {exp.current ? "Present" : exp.endDate}
                                      </span>
                                    )}
                                    {exp.location && (
                                      <span className="flex items-center gap-1 text-xs text-gray-400">
                                        <IoLocationSharp size={12} />{" "}
                                        {exp.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => {
                                      setExpForm(exp);
                                      setEditingExp(i);
                                    }}
                                    style={{ color: "#94a3b8" }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.color = BLUE)
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.color = "#94a3b8")
                                    }
                                  >
                                    <IoPencilOutline size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteExp(i)}
                                    style={{ color: "#94a3b8" }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.color = "#ef4444")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.color = "#94a3b8")
                                    }
                                  >
                                    <IoTrashOutline size={16} />
                                  </button>
                                </div>
                              </div>
                              {exp.description && (
                                <ul className="mt-2 flex flex-col gap-0.5">
                                  {exp.description
                                    .split("\n")
                                    .filter(Boolean)
                                    .map((line, li) => (
                                      <li
                                        key={li}
                                        className="text-sm text-gray-600"
                                      >
                                        {line}
                                      </li>
                                    ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── EDUCATION (graduate only) ── */}
                  {activeTab === "Education" && (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">
                          Education
                        </h3>
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
                            setEditingEdu("new");
                          }}
                          className="flex items-center gap-1.5 text-sm font-medium"
                          style={{ color: BLUE }}
                        >
                          <IoAddOutline size={16} /> Add Education
                        </button>
                      </div>

                      {editingEdu !== null && (
                        <div
                          className="rounded-2xl p-5 flex flex-col gap-3"
                          style={{
                            border: "1.5px solid #e2e8f0",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            {editingEdu === "new"
                              ? "Add New Education"
                              : "Edit Education"}
                          </p>
                          <div className="flex gap-3">
                            <Select
                              label="Education Type"
                              value={eduForm.type || ""}
                              onChange={(e) =>
                                setEduForm({ ...eduForm, type: e.target.value })
                              }
                              options={EDU_TYPE_GRADUATE}
                            />
                            <Field
                              label="College / School / University"
                              value={eduForm.institution || ""}
                              onChange={(e) =>
                                setEduForm({
                                  ...eduForm,
                                  institution: e.target.value,
                                })
                              }
                              placeholder="Delhi Technological University"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Select
                              label="Stream / Branch"
                              value={eduForm.stream || ""}
                              onChange={(e) =>
                                setEduForm({
                                  ...eduForm,
                                  stream: e.target.value,
                                })
                              }
                              options={STREAM_OPTIONS.graduate}
                            />
                            <Field
                              label="Start Year"
                              value={eduForm.startYear || ""}
                              onChange={(e) =>
                                setEduForm({
                                  ...eduForm,
                                  startYear: e.target.value,
                                })
                              }
                              placeholder="2019"
                            />
                            <Field
                              label="End Year"
                              value={eduForm.endYear || ""}
                              onChange={(e) =>
                                setEduForm({
                                  ...eduForm,
                                  endYear: e.target.value,
                                })
                              }
                              placeholder="2023"
                            />
                            <Field
                              label="Percentage / CGPA"
                              value={eduForm.percentage || ""}
                              onChange={(e) =>
                                setEduForm({
                                  ...eduForm,
                                  percentage: e.target.value,
                                })
                              }
                              placeholder="8.5 CGPA"
                            />
                          </div>
                          <div className="flex gap-2 mt-1">
                            <BtnPrimary onClick={handleSaveEdu}>
                              <IoCheckmarkOutline size={15} /> Save
                            </BtnPrimary>
                            <BtnGhost
                              onClick={() => {
                                setEditingEdu(null);
                                setEduForm({});
                              }}
                            >
                              <IoCloseOutline size={15} /> Cancel
                            </BtnGhost>
                          </div>
                        </div>
                      )}

                      {educations.length === 0 && editingEdu === null && (
                        <div className="flex flex-col items-center gap-2 py-10 text-center">
                          <IoSchoolOutline size={36} color="#cbd5e1" />
                          <p className="text-sm text-gray-400">
                            No education added yet.
                          </p>
                          <p className="text-xs text-gray-300">
                            Click "Add Education" to get started
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-4">
                        {educations.map((edu, i) => (
                          <div
                            key={i}
                            className="flex gap-4 items-start p-4 rounded-2xl"
                            style={{
                              backgroundColor: "#fafafa",
                              border: "1.5px solid #f1f5f9",
                            }}
                          >
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                              style={{ backgroundColor: "#8b5cf6" }}
                            >
                              {edu.institution
                                ? edu.institution.slice(0, 2).toUpperCase()
                                : "ED"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-bold text-gray-900">
                                    {edu.type}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {edu.institution}
                                  </p>
                                  {edu.stream && (
                                    <p
                                      className="text-xs font-medium mt-0.5"
                                      style={{ color: "#8b5cf6" }}
                                    >
                                      {edu.stream}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    {(edu.startYear || edu.endYear) && (
                                      <span className="flex items-center gap-1 text-xs text-gray-400">
                                        <IoCalendarOutline size={12} />
                                        {edu.startYear}
                                        {edu.startYear && edu.endYear
                                          ? " – "
                                          : ""}
                                        {edu.endYear}
                                      </span>
                                    )}
                                    {edu.percentage && (
                                      <span
                                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                                        style={{
                                          backgroundColor: "#f0fdf4",
                                          color: "#16a34a",
                                        }}
                                      >
                                        {edu.percentage}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => {
                                      setEduForm(edu);
                                      setEditingEdu(i);
                                    }}
                                    style={{ color: "#94a3b8" }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.color = BLUE)
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.color = "#94a3b8")
                                    }
                                  >
                                    <IoPencilOutline size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEdu(i)}
                                    style={{ color: "#94a3b8" }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.color = "#ef4444")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.color = "#94a3b8")
                                    }
                                  >
                                    <IoTrashOutline size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── SKILLS ── */}
                  {activeTab === "Skills" && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-base font-bold text-gray-900">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2 min-h-8">
                        {(about.skills || []).length === 0 && (
                          <p className="text-sm text-gray-400 italic">
                            No skills added yet. Add your first skill below.
                          </p>
                        )}
                        {(about.skills || []).map((skill) => (
                          <span
                            key={skill}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                            style={{
                              backgroundColor: "#f8fafc",
                              border: "1.5px solid #e2e8f0",
                              color: "#334155",
                            }}
                          >
                            {skill}
                            <button
                              onClick={() => handleDeleteSkill(skill)}
                              style={{ color: "#94a3b8", lineHeight: 1 }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "#ef4444")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "#94a3b8")
                              }
                            >
                              <IoCloseOutline size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddSkill()
                          }
                          placeholder="e.g. React.js, Node.js, Python…"
                          className="rounded-xl px-3 py-2 text-sm outline-none"
                          style={{
                            border: "1.5px solid #e2e8f0",
                            color: "#0f172a",
                            width: "260px",
                          }}
                        />
                        <BtnPrimary onClick={handleAddSkill}>
                          <IoAddOutline size={15} /> Add Skill
                        </BtnPrimary>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Right sidebar */}
            <div
              className="shrink-0 flex flex-col gap-4"
              style={{ width: "300px" }}
            >
              {/* Resume */}
              <div
                className="rounded-2xl p-5"
                style={{
                  border: "1.5px solid #f1f5f9",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  Resume
                </h3>
                <div
                  className="flex items-center justify-between p-3 rounded-xl mb-3"
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1.5px solid #f1f5f9",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#fee2e2" }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#ef4444" }}
                      >
                        PDF
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Resume.pdf
                      </p>
                      <p className="text-xs text-gray-400">
                        Upload your resume
                      </p>
                    </div>
                  </div>
                  <button style={{ color: "#94a3b8" }}>
                    <IoEllipsisVertical size={16} />
                  </button>
                </div>
                <button
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    border: `1.5px solid ${BLUE}`,
                    color: BLUE,
                    backgroundColor: "white",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = BLUE_BG)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "white")
                  }
                >
                  <IoCloudUploadOutline size={16} /> Upload Resume
                </button>
              </div>

              {/* Quick Links */}
              <div
                className="rounded-2xl p-5"
                style={{
                  border: "1.5px solid #f1f5f9",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  Quick Links
                </h3>
                <button
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all"
                  style={{ backgroundColor: "#f8fafc" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = BLUE_BG)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8fafc")
                  }
                >
                  <div className="flex items-center gap-3">
                    <IoDownloadOutline size={18} style={{ color: BLUE }} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">
                        Download Profile
                      </p>
                      <p className="text-xs text-gray-400">
                        Download your profile as PDF
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
