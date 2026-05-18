"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  IoPencilOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
} from "react-icons/io5";

import {
  DEFAULT_PROFILE,
  DEFAULT_ABOUT,
  BtnPrimary,
  BtnGhost,
} from "@/profileComponents/shared";
import OnboardingModal from "@/profileComponents/OnboardingModal";
import ProfileCard from "@/profileComponents/ProfileCard";
import ProfileStrength from "@/profileComponents/ProfileStrength";
import TabsSection from "@/profileComponents/TabsSection";
import ResumeSidebar from "@/profileComponents/ResumeSidebar";

const COMPLETED_ITEMS = ["resume", "skills", "portfolio", "email"];
const ALL_ITEMS = ["resume", "skills", "portfolio", "email", "experience"];

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [form, setForm] = useState(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("About");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [aboutForm, setAboutForm] = useState(DEFAULT_ABOUT);

  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);

  const [editSection, setEditSection] = useState(null);
  const [expForm, setExpForm] = useState({});
  const [eduForm, setEduForm] = useState({});

  const [skillInput, setSkillInput] = useState("");

  const isGraduate = about.educationLevel === "graduate";

  const strengthPct = Math.round(
    (COMPLETED_ITEMS.length / ALL_ITEMS.length) * 100,
  );
  const missing = ALL_ITEMS.filter((i) => !COMPLETED_ITEMS.includes(i));

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (!fu) return;
      setUser(fu);
      const snap = await getDoc(doc(db, "users", fu.uid));
      if (snap.exists()) {
        const data = snap.data();
        const p = { ...DEFAULT_PROFILE, ...data };
        setProfile(p);
        setForm(p);
        const a = { ...DEFAULT_ABOUT, ...(data.about || {}) };
        setAbout(a);
        setAboutForm(a);
        setExperiences(data.experiences || []);
        setEducations(data.educations || []);
        if (!a.onboardingDone) setShowOnboarding(true);
      } else {
        const init = {
          ...DEFAULT_PROFILE,
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

  const save = async (data) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), data, { merge: true });
  };

  const handleOnboardingSelect = async (level) => {
    const updated = { ...about, educationLevel: level, onboardingDone: true };
    setAbout(updated);
    setAboutForm(updated);
    setShowOnboarding(false);
    await save({ about: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    await save(form);
    setProfile(form);
    await save({ about: aboutForm });
    setAbout(aboutForm);
    setEditing(false);
    setEditSection(null);
    setSaving(false);
  };

  const handleCancel = () => {
    setForm(profile);
    setAboutForm(about);
    setExpForm({});
    setEduForm({});
    setEditSection(null);
    setEditing(false);
  };

  const saveExpToFirebase = async (updated) => {
    await save({ experiences: updated });
    setExperiences(updated);
    setExpForm({});
    setEditSection(null);
  };

  const saveEduToFirebase = async (updated) => {
    await save({ educations: updated });
    setEducations(updated);
    setEduForm({});
    setEditSection(null);
  };

  const handleAddSkill = async () => {
    if (!skillInput.trim()) return;
    const updated = {
      ...about,
      skills: [...(about.skills || []), skillInput.trim()],
    };
    await save({ about: updated });
    setAbout(updated);
    setAboutForm(updated);
    setSkillInput("");
  };

  const handleDeleteSkill = async (skill) => {
    const updated = {
      ...about,
      skills: about.skills.filter((s) => s !== skill),
    };
    await save({ about: updated });
    setAbout(updated);
    setAboutForm(updated);
  };

  if (loading) return null;

  const radius = 20;
  const circ = 2 * Math.PI * radius;
  const dash = (strengthPct / 100) * circ;

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
        <style>{`
          @media (max-width: 767px) {
            .profile-root {
              padding-left: 16px !important;
              padding-top: 72px !important;
              padding-right: 16px !important;
              padding-bottom: 80px !important;
            }
          }
        `}</style>

        <div className="profile-root" style={{ display: "contents" }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h1
                className="text-2xl font-extrabold"
                style={{ color: "#0f172a" }}
              >
                My Profile
              </h1>
              <p
                className="text-sm font-medium mt-0.5"
                style={{ color: "#64748b" }}
              >
                Manage your profile and increase your chances of getting hired
              </p>
            </div>
            {!editing ? (
              <BtnPrimary onClick={() => setEditing(true)}>
                <IoPencilOutline size={15} /> Edit Profile
              </BtnPrimary>
            ) : (
              <div className="flex gap-2">
                <BtnPrimary onClick={handleSave} disabled={saving}>
                  <IoCheckmarkOutline size={15} />{" "}
                  {saving ? "Saving…" : "Save All"}
                </BtnPrimary>
                <BtnGhost onClick={handleCancel}>
                  <IoCloseOutline size={15} /> Cancel
                </BtnGhost>
              </div>
            )}
          </div>

          {!editing && (
            <div
              className="md:hidden flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl"
              style={{
                backgroundColor: "#f8fafc",
                border: "1.5px solid #e2e8f0",
              }}
            >
              <div
                className="relative shrink-0"
                style={{ width: 48, height: 48 }}
              >
                <svg
                  width="48"
                  height="48"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="4"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="4"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-xs font-extrabold"
                  style={{ color: "#0f172a" }}
                >
                  {strengthPct}%
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-extrabold"
                  style={{ color: "#0f172a" }}
                >
                  Profile Strength · {strengthPct}%
                </p>
                {missing.length > 0 ? (
                  <p
                    className="text-xs font-medium mt-0.5"
                    style={{ color: "#64748b" }}
                  >
                    To complete: add your {missing.join(", ")}
                  </p>
                ) : (
                  <p
                    className="text-xs font-medium mt-0.5"
                    style={{ color: "#16a34a" }}
                  >
                    Profile complete!
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <ProfileCard
                profile={profile}
                form={form}
                setForm={setForm}
                editing={editing}
                about={about}
                aboutForm={aboutForm}
                setAboutForm={setAboutForm}
                experiences={experiences}
                setExperiences={setExperiences}
                educations={educations}
                setEducations={setEducations}
                isGraduate={isGraduate}
                editSection={editSection}
                setEditSection={setEditSection}
                expForm={expForm}
                setExpForm={setExpForm}
                eduForm={eduForm}
                setEduForm={setEduForm}
                skills={about.skills || []}
                onAddSkill={handleAddSkill}
                onDeleteSkill={handleDeleteSkill}
                skillInput={skillInput}
                setSkillInput={setSkillInput}
                saveExpToFirebase={saveExpToFirebase}
                saveEduToFirebase={saveEduToFirebase}
              />

              {!editing && (
                <TabsSection
                  about={about}
                  experiences={experiences}
                  educations={educations}
                  isGraduate={isGraduate}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              )}

              {!editing && (
                <div className="md:hidden">
                  <ResumeSidebar />
                </div>
              )}
            </div>

            {!editing && (
              <div className="hidden md:flex shrink-0 flex-col gap-4">
                <ProfileStrength completedItems={COMPLETED_ITEMS} />
                <ResumeSidebar />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
