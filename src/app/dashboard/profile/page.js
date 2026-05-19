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
  STRENGTH_ITEMS,
} from "@/profileComponents/shared";
import OnboardingModal from "@/profileComponents/OnboardingModal";
import ProfileCard from "@/profileComponents/ProfileCard";
import ProfileStrength from "@/profileComponents/ProfileStrength";
import TabsSection from "@/profileComponents/TabsSection";
import ResumeSidebar from "@/profileComponents/ResumeSidebar";

const COMPLETED_ITEMS = ["resume", "skills", "portfolio", "email"];

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

  const [uid, setUid] = useState(null);

  const isGraduate = about.educationLevel === "graduate";

  const strengthPercent = Math.round(
    (COMPLETED_ITEMS.length / STRENGTH_ITEMS.length) * 100,
  );
  const missingItems = STRENGTH_ITEMS.filter(
    (item) => !COMPLETED_ITEMS.includes(item.key),
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (!fu) return;
      setUser(fu);
      setUid(fu.uid);
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

  // always uses uid state — never stale
  const saveToDb = async (uid, data) => {
    if (!uid) return;
    await setDoc(doc(db, "users", uid), data, { merge: true });
  };

  const handleOnboardingSelect = async (level) => {
    const updated = { ...about, educationLevel: level, onboardingDone: true };
    setAbout(updated);
    setAboutForm(updated);
    setShowOnboarding(false);
    await saveToDb(uid, { about: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    await saveToDb(uid, form);
    setProfile(form);
    await saveToDb(uid, { about: aboutForm });
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
    if (!uid) return;
    await setDoc(
      doc(db, "users", uid),
      { experiences: updated },
      { merge: true },
    );
    setExperiences(updated);
    setExpForm({});
    setEditSection(null);
  };

  const saveEduToFirebase = async (updated) => {
    if (!uid) return;
    await setDoc(
      doc(db, "users", uid),
      { educations: updated },
      { merge: true },
    );
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
    await saveToDb(uid, { about: updated });
    setAbout(updated);
    setAboutForm(updated);
    setSkillInput("");
  };

  const handleDeleteSkill = async (skill) => {
    const updated = {
      ...about,
      skills: about.skills.filter((s) => s !== skill),
    };
    await saveToDb(uid, { about: updated });
    setAbout(updated);
    setAboutForm(updated);
  };

  if (loading) return null;

  return (
    <>
      {showOnboarding && <OnboardingModal onSelect={handleOnboardingSelect} />}

      <div className="min-h-screen bg-white px-4 sm:px-6 lg:pl-27 lg:pr-6 pt-18 lg:pt-22 pb-20 lg:pb-10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h1
              className="text-xl sm:text-2xl font-extrabold"
              style={{ color: "#0f172a" }}
            >
              My Profile
            </h1>
            <p
              className="text-xs sm:text-sm font-medium mt-0.5"
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
            <div className="flex gap-2 flex-wrap">
              <BtnPrimary onClick={handleSave} disabled={saving}>
                <IoCheckmarkOutline size={15} />
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
            className="lg:hidden mb-4 px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{
              backgroundColor: "#eff6ff",
              border: "1.5px solid #dbeafe",
            }}
          >
            <div
              className="relative shrink-0"
              style={{ width: 44, height: 44 }}
            >
              <svg
                width="44"
                height="44"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="#dbeafe"
                  strokeWidth="4"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - strengthPercent / 100)}`}
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-xs font-extrabold"
                style={{ color: "#0f172a" }}
              >
                {strengthPercent}%
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: "#0f172a" }}>
                Profile Strength · {strengthPercent}%
              </p>
              {missingItems.length > 0 ? (
                <p className="text-xs mt-0.5" style={{ color: "#3b82f6" }}>
                  Complete all fields to increase profile strength
                </p>
              ) : (
                <p className="text-xs mt-0.5" style={{ color: "#16a34a" }}>
                  🎉 Profile complete!
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-4">
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
              <div className="lg:hidden">
                <ResumeSidebar />
              </div>
            )}
          </div>

          {!editing && (
            <div className="hidden lg:flex shrink-0 flex-col gap-4">
              <ProfileStrength completedItems={COMPLETED_ITEMS} />
              <ResumeSidebar />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
