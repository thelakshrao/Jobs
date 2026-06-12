"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import DashboardNavbar from "@/employerComponets/DashboardNavbar";
import EmployerSidebar from "@/employerComponets/EmployerSidebar";
import PostedJobs from "@/employerComponets/PostedJobs";

export default function EmployerDashboard() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/employer/onboarding");
        return;
      }
      const empDoc = await getDoc(doc(db, "employers", user.uid));
      if (!empDoc.exists()) {
        router.replace("/employer/onboarding");
        return;
      }
      sessionStorage.removeItem("empLoggedOut");
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" /> 
      </div>
    );
  }

  return (
    <>
      <EmployerSidebar />
      <DashboardNavbar />
      <main className="md:ml-64 pt-14 pb-16 md:pb-0 min-h-screen bg-slate-50">
        <PostedJobs />
      </main>
    </>
  );
}