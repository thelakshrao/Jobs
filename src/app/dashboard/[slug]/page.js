"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import ProfileCard from "@/profileComponents/ProfileCard";
import ProfileEdit from "@/profileComponents/Profileedit";
import ProfileStrength from "@/profileComponents/ProfileStrength";
import TabsSection from "@/profileComponents/TabsSection";
import ResumeSidebar from "@/profileComponents/ResumeSidebar";
import SimpleProfileEdit from "@/profileComponents/Simpleprofileedit";
import SimpleProfileCard from "@/profileComponents/SimpleProfileCard";
import { computeCompletedItems } from "@/lib/Computecompleteditems";

export default function ProfileSlugPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug;

  const [isOwner, setIsOwner] = useState(false);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [form, setForm] = useState(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("About");
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
    if (!slug) return;


    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      unsubAuth();

      try {
        const slugSnap = await getDoc(doc(db, "slugs", slug));
        if (!slugSnap.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const profileUid = slugSnap.data().uid;

        const profileSnap = await getDoc(doc(db, "users", profileUid));
        if (!profileSnap.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data = profileSnap.data();
        const p = { ...DEFAULT_PROFILE, ...data };
        const a = { ...DEFAULT_ABOUT, ...(data.about || {}) };

        setProfile(p);
        setAbout(a);
        setExperiences(data.experiences || []);
        setEducations(data.educations || []);
        setResumeURL(data.resumeURL || data.resume?.url || "");

        if (currentUser && currentUser.uid === profileUid) {
          setUid(currentUser.uid);
          setForm(p);
          setAboutForm(a);
          setIsOwner(true);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading profile:", err);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, [slug]);

  const saveToDb = async (uid, data) => {
    if (!uid) return;
    await setDoc(doc(db, "users", uid), data, { merge: true });
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

  if (loading)
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div
          className="w-7 h-7 border-[3px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#60a5fa", borderTopColor: "transparent" }}
        />
      </div>
    );

  if (notFound)
    return (
      <div
        className="flex flex-col items-center justify-center h-screen gap-4"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <p className="text-4xl">🔍</p>
        <p className="text-xl font-bold text-slate-900">Profile not found</p>
        <p className="text-sm text-slate-500">
          This profile link doesn't exist or may have changed.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: "#60a5fa" }}
        >
          Go Home
        </button>
      </div>
    );

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:pl-6 lg:pr-6 pb-20 lg:pb-10"
      style={{
        paddingTop: "12px",
        backgroundColor: "#f8fafc",
        fontFamily: "'Inter',system-ui,sans-serif",
      }}
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h1
            className="text-xl sm:text-2xl font-extrabold"
            style={{ color: "#0f172a" }}
          >
            {isOwner ? "My Profile" : `${profile.name || ""}'s Profile`}
          </h1>
          {isOwner && (
            <p
              className="text-xs sm:text-sm font-medium mt-0.5"
              style={{ color: "#64748b" }}
            >
              Manage your profile and increase your chances of getting hired
            </p>
          )}
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
        !editing ? (
          <SimpleProfileCard
            profile={profile}
            simpleEmployers={profile.simpleEmployers || []}
            uid={isOwner ? uid : null}
            onUpdate={
              isOwner
                ? (data) => setProfile((p) => ({ ...p, ...data }))
                : undefined
            }
          />
        ) : isOwner ? (
          <SimpleProfileEdit
            profile={profile}
            simpleEmployers={profile.simpleEmployers || []}
            uid={uid}
            editing={true}
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
        ) : (
          <SimpleProfileCard
            profile={profile}
            simpleEmployers={profile.simpleEmployers || []}
            uid={null}
          />
        )
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-3">
            {isOwner && !editing && (
              <div className="lg:hidden">
                <ProfileStrength
                  completedItems={completedItems}
                  isGraduate={isGraduate}
                  mobileOnly={true}
                  onImprove={() => setEditing(true)}
                />
              </div>
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
  );
}