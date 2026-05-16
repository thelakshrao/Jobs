"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import logo2 from "@/images/logo2.png";

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = user?.displayName || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Image
          src={logo2}
          alt="Jobs Abroad"
          width={130}
          height={40}
          className="object-contain"
        />
        <button
          onClick={handleLogout}
          className="text-white/50 hover:text-white text-sm transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white/40 text-sm font-semibold tracking-widest uppercase mb-4">
            Welcome back
          </p>
          <h1 className="text-white text-5xl sm:text-6xl font-bold tracking-tight mb-3">
            Hello, {displayName} 👋
          </h1>
          <p className="text-white/40 text-base">
            Your dashboard is ready. More features coming soon.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;