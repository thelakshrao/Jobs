"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.replace("/login");
      const snap = await getDoc(doc(db, "users", user.uid));
      const slug = snap.data()?.slug;
      if (slug) router.replace(`/dashboard/${slug}`);
    });
    return () => unsub();
  }, []);

  return null;
}