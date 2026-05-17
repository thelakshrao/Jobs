"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(undefined);
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setShowWelcome(true);
        const timer = setTimeout(() => setShowWelcome(false), 5500);
        return () => clearTimeout(timer);
      } else {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) return null;

  const displayName = user.displayName || user.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-white">

      {showWelcome && (
        <div
          style={{
            position: "fixed",
            top: "88px",
            left: "50vw",
            transform: "translateX(-50%)",
            zIndex: 200,
            padding: "10px 20px",
            borderRadius: "999px",
            fontSize: "14px",
            color: "#16a34a",
            backgroundColor: "rgba(240, 253, 244, 0.95)",
            border: "1px solid #bbf7d0",
            whiteSpace: "nowrap",
            animation: "fadeSlideIn 0.35s ease forwards",
          }}
        >
          👋 Welcome back, {displayName}! Good to see you.
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);    }
        }
      `}</style>
    </div>
  );
}