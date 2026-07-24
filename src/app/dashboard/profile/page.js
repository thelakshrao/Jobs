"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { DEFAULT_PROFILE, DEFAULT_ABOUT } from "@/profileComponents/shared";
import OnboardingModal from "@/profileComponents/OnboardingModal";
import SimpleProfile from "@/profileComponents/Simpleprofile";
import { setDoc } from "firebase/firestore";
import { generateUniqueSlug, reserveSlug } from "@/lib/generateSlug";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSimpleProfile, setShowSimpleProfile] = useState(false);
  const [uid, setUid] = useState(null);
  const [about, setAbout] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (!fu) {
        router.replace("/login");
        return;
      }

      setUid(fu.uid);
      const snap = await getDoc(doc(db, "users", fu.uid));
      const data = snap.exists() ? snap.data() : null;
      const slug = data?.slug;
      const onboardingDone = data?.about?.onboardingDone;

      if (slug && onboardingDone) {
        router.replace(`/dashboard/${slug}`);
        return;
      }

      if (!onboardingDone) {
        setLoading(false);
        setShowOnboarding(true);
        return;
      }

      if (!slug) {
        const newSlug = await generateUniqueSlug(fu.email);
        await reserveSlug(newSlug, fu.uid);
        router.replace(`/dashboard/${newSlug}`);
        return;
      }

      setLoading(false);
    });
    return () => unsub();
  }, []);

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
    const updatedAbout = {
      ...about,
      educationLevel: level,
      onboardingDone: true,
    };
    setAbout(updatedAbout);
    setShowOnboarding(false);
    await saveToDb(uid, { about: updatedAbout });

    const { auth: firebaseAuth } = await import("@/lib/firebase");
    const email = firebaseAuth.currentUser?.email;
    if (email) {
      const newSlug = await generateUniqueSlug(email);
      await reserveSlug(newSlug, uid);
      router.replace(`/dashboard/${newSlug}`);
    }
  };

  const handleSimpleProfileComplete = async (data) => {
    setShowSimpleProfile(false);
    const { auth: firebaseAuth } = await import("@/lib/firebase");
    const email = firebaseAuth.currentUser?.email;
    if (email) {
      const newSlug = await generateUniqueSlug(email);
      await reserveSlug(newSlug, uid);
      router.replace(`/dashboard/${newSlug}`);
    }
  };

  if (loading) return null;

  if (showSimpleProfile) {
    return <SimpleProfile onComplete={handleSimpleProfileComplete} />;
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-white">
        <OnboardingModal onSelect={handleOnboardingSelect} />
      </div>
    );
  }

  return null;
}
