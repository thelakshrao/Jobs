"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAssignSlug } from "@/hooks/useAssignSlug";
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
import SimpleProfile from "@/profileComponents/Simpleprofile";
import ProfileCard from "@/profileComponents/ProfileCard";
import ProfileEdit from "@/profileComponents/Profileedit";
import ProfileStrength from "@/profileComponents/ProfileStrength";
import TabsSection from "@/profileComponents/TabsSection";
import ResumeSidebar from "@/profileComponents/ResumeSidebar";
import SimpleProfileEdit from "@/profileComponents/Simpleprofileedit";
import { computeCompletedItems } from "@/lib/Computecompleteditems";

export default function ProfilePage({ params }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [form, setForm] = useState(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("About");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSimpleProfile, setShowSimpleProfile] = useState(false);
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [aboutForm, setAboutForm] = useState(DEFAULT_ABOUT);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [editSection, setEditSection] = useState(null);
  const [expForm, setExpForm] = useState({});
  const [eduForm, setEduForm] = useState({});
  const [skillInput, setSkillInput] = useState("");
  const [uid, setUid] = useState(null);
  const [resumeURL, setResumeURL] = useState("");

  const isSimple = profile.profileType === "simple";
  const isGraduate = about.educationLevel === "graduate";

  const completedItems = computeCompletedItems({
    profile,
    about,
    experiences,
    educations,
    resumeURL,
  });

  useEffect(() => {
    const urlSlug = window.location.pathname.split("/")[2];
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (!fu) {
        const { getUidBySlug } = await import("@/lib/generateSlug");
        const profileUid = await getUidBySlug(urlSlug);
        if (!profileUid) {
          setLoading(false);
          return;
        }
        const snap = await getDoc(doc(db, "users", profileUid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile({ ...DEFAULT_PROFILE, ...data });
          setAbout({ ...DEFAULT_ABOUT, ...(data.about || {}) });
          setExperiences(data.experiences || []);
          setEducations(data.educations || []);
        }
        setIsOwner(false);
        setLoading(false);
        return;
      }

      setUser(fu);
      setUid(fu.uid);
      const snap = await getDoc(doc(db, "users", fu.uid));
      const data = snap.exists() ? snap.data() : {};
      const userSlug = data.slug;
      const owner = userSlug === urlSlug;
      setIsOwner(owner);

      if (owner) {
        const p = { ...DEFAULT_PROFILE, ...data };
        setProfile(p);
        setForm(p);
        const a = { ...DEFAULT_ABOUT, ...(data.about || {}) };
        setAbout(a);
        setAboutForm(a);
        setExperiences(data.experiences || []);
        setEducations(data.educations || []);
        setResumeURL(data.resumeURL || data.resume?.url || data.resume || "");
        if (!a.onboardingDone) setShowOnboarding(true);
      } else {
        const { getUidBySlug } = await import("@/lib/generateSlug");
        const profileUid = await getUidBySlug(urlSlug);
        if (profileUid) {
          const profileSnap = await getDoc(doc(db, "users", profileUid));
          if (profileSnap.exists()) {
            const profileData = profileSnap.data();
            setProfile({ ...DEFAULT_PROFILE, ...profileData });
            setAbout({ ...DEFAULT_ABOUT, ...(profileData.about || {}) });
            setExperiences(profileData.experiences || []);
            setEducations(profileData.educations || []);
          }
        }
      }

      setLoading(false);
    });
    return () => unsub();
  }, []);

  useAssignSlug(user, profile, setProfile);

  useEffect(() => {
    if (!loading && profile.slug && isOwner) {
      const urlSlug = window.location.pathname.split("/")[2];
      if (urlSlug !== profile.slug) {
        router.replace(`/dashboard/${profile.slug}`);
      }
    }
  }, [profile.slug, loading]);

  const saveToDb = async (uid, data) => {
    if (!uid) return;
    await setDoc(doc(db, "users", uid), data, { merge: true });
  };

  const handleOnboardingSelect = async (level) => {
    if (level === "simple") {
      setShowOnboarding(false);
      setShowSimpleProfile(true);
      return;
    }
    const updated = { ...about, educationLevel: level, onboardingDone: true };
    setAbout(updated);
    setAboutForm(updated);
    setShowOnboarding(false);
    await saveToDb(uid, { about: updated });
  };

  const handleSimpleProfileComplete = (data) => {
    setProfile((p) => ({ ...p, ...data }));
    setForm((p) => ({ ...p, ...data }));
    setShowSimpleProfile(false);
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

  if (showSimpleProfile) {
    return <SimpleProfile onComplete={handleSimpleProfileComplete} />;
  }

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
              {isOwner ? "My Profile" : `${profile.name}'s Profile`}
            </h1>
            <p
              className="text-xs sm:text-sm font-medium mt-0.5"
              style={{ color: "#64748b" }}
            >
              {isOwner
                ? "Manage your profile and increase your chances of getting hired"
                : ""}
            </p>
          </div>

          {isOwner &&
            !isSimple &&
            (!editing ? (
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
            ))}

          {isOwner && isSimple && !editing && (
            <BtnPrimary onClick={() => setEditing(true)}>
              <IoPencilOutline size={15} /> Edit Profile
            </BtnPrimary>
          )}
        </div>

        {isSimple ? (
          <div className="w-full">
            <SimpleProfileEdit
              profile={profile}
              simpleEmployers={profile.simpleEmployers || []}
              uid={uid}
              editing={isOwner && editing}
              onUpdate={(data) => {
                setProfile((p) => ({ ...p, ...data }));
                setForm((p) => ({ ...p, ...data }));
              }}
              onSave={(data, updatedEmployers) => {
                setProfile((p) => ({
                  ...p,
                  ...data,
                  simpleEmployers: updatedEmployers,
                }));
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-4">
              {isOwner && !editing && (
                <ProfileStrength
                  completedItems={completedItems}
                  isGraduate={isGraduate}
                  mobileOnly={true}
                  onImprove={() => setEditing(true)}
                />
              )}

              {!editing ? (
                <ProfileCard profile={profile} />
              ) : (
                isOwner && (
                  <ProfileEdit
                    form={form}
                    setForm={setForm}
                    aboutForm={aboutForm}
                    setAboutForm={setAboutForm}
                    experiences={experiences}
                    educations={educations}
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
                )
              )}

              {!editing && (
                <TabsSection
                  about={about}
                  experiences={experiences}
                  educations={educations}
                  isGraduate={isGraduate}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  profile={profile} 
                  isOwner={isOwner} 
                />
              )}

              {isOwner && !editing && (
                <div className="lg:hidden">
                  <ResumeSidebar onUpload={(url) => setResumeURL(url)} />
                </div>
              )}
            </div>

            {isOwner && !editing && (
              <div className="hidden lg:flex shrink-0 flex-col gap-4">
                <ProfileStrength
                  completedItems={completedItems}
                  isGraduate={isGraduate}
                  onImprove={() => setEditing(true)}
                />
                <ResumeSidebar onUpload={(url) => setResumeURL(url)} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
