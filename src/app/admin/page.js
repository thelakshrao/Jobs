"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import AdminBg from "@/images/admin.jpg";
import Logo from "@/images/logoemp.png";

const BRAND = "#003882";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const resolveEmail = async (input) => {
    if (input.includes("@")) return input.trim();
    const q = query(
      collection(db, "admin_staff"),
      where("employee_id", "==", input.trim()),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data().email || null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setResetSent(false);

    if (!identifier.trim() || !password) {
      setError("Please enter your email/employee ID and password.");
      return;
    }

    setLoading(true);
    try {
      const email = await resolveEmail(identifier);
      if (!email) {
        setError("No admin account found for that ID.");
        setLoading(false);
        return;
      }

      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      const staffSnap = await getDoc(doc(db, "admin_staff", uid));
      if (!staffSnap.exists()) {
        await signOut(auth);
        setError("This account does not have admin access.");
        setLoading(false);
        return;
      }

      const staffData = staffSnap.data();
      if (staffData.status !== "active") {
        await signOut(auth);
        setError("This admin account is suspended. Contact the super admin.");
        setLoading(false);
        return;
      }

      router.replace("/admin/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);
      if (err.code === "permission-denied") {
        setError(
          "Server permission error. Check Firestore rules for admin_staff.",
        );
      } else if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with that email.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError("Login failed. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setResetSent(false);
    if (!identifier.trim()) {
      setError("Enter your email or employee ID above first.");
      return;
    }
    try {
      const email = await resolveEmail(identifier);
      if (!email) {
        setError("No admin account found for that ID.");
        return;
      }
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/admin/reset-password`,
        handleCodeInApp: true,
      });
      setResetSent(true);
    } catch (err) {
      console.error(err);
      if (err.code === "permission-denied") {
        setError(
          "Server permission error. Check Firestore rules for admin_staff.",
        );
      } else if (err.code === "auth/too-many-requests") {
        setError(
          "Too many reset attempts. Please wait 15-30 minutes and try again.",
        );
      } else if (
        err.code === "auth/invalid-continue-uri" ||
        err.code === "auth/unauthorized-continue-uri"
      ) {
        setError("This domain isn't authorized for password reset redirects.");
      } else {
        setError(
          `Could not send reset email (${err.code || "unknown error"}).`,
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={AdminBg.src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,56,130,0.55) 0%, rgba(0,56,130,0.85) 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          <div className="bg-white rounded-2xl px-4 py-3 inline-flex w-fit">
            <img src={Logo.src} alt="Logo" className="h-9 w-auto" />
          </div>

          <div>
            <p className="uppercase tracking-widest text-xs font-bold text-white/60 mb-3">
              Internal Access
            </p>
            <h1 className="text-4xl font-extrabold leading-tight mb-3">
              Run the platform.
              <br />
              <span className="text-white/70">Not just watch it.</span>
            </h1>
            <p className="text-white/70 text-sm max-w-sm leading-relaxed font-medium">
              Monitor jobs, employers, and applicants across Jobs Abroad — all
              from one control center built for the team behind the scenes.
            </p>
          </div>

          <p className="text-white/40 text-xs font-medium">
            © 2026 Jobs Abroad. Internal use only.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-7">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ backgroundColor: "#eaf1fb" }}
            >
              <ShieldCheck size={22} style={{ color: BRAND }} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Admin Login
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1 text-center">
              Internal staff access only
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-7">
            {error && (
              <div className="mb-4 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-600">
                {error}
              </div>
            )}
            {resetSent && (
              <div className="mb-4 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-700">
                Password reset email sent. Check your inbox.
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Email or Employee ID
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com or JA-0001"
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-9 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-bold hover:underline"
                  style={{ color: BRAND }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: BRAND }}
              >
                {loading ? "Logging in…" : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
