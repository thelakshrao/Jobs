"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import AdminBg from "@/images/admin.jpg";
import Logo from "@/images/logoemp.png";

const BRAND = "#003882";

export default function AdminResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminResetPasswordInner />
    </Suspense>
  );
}

function AdminResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [checking, setChecking] = useState(true);
  const [validCode, setValidCode] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setError("This reset link is invalid or missing a code.");
      setChecking(false);
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((verifiedEmail) => {
        setEmail(verifiedEmail);
        setValidCode(true);
      })
      .catch(() => {
        setError("This reset link has expired or already been used.");
      })
      .finally(() => setChecking(false));
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      setTimeout(() => router.replace("/admin"), 2000);
    } catch (err) {
      console.error(err);
      setError("Could not reset password. Please request a new link.");
    } finally {
      setSubmitting(false);
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
              Account Security
            </p>
            <h1 className="text-4xl font-extrabold leading-tight mb-3">
              Reset your
              <br />
              <span className="text-white/70">admin password.</span>
            </h1>
            <p className="text-white/70 text-sm max-w-sm leading-relaxed font-medium">
              Choose a strong password to keep the Jobs Abroad admin panel
              secure.
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
              New Password
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1 text-center">
              {validCode && email
                ? `Set a new password for ${email}`
                : "Choose a strong new password for your admin account."}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-7">
            {checking ? (
              <p className="text-sm text-slate-500 font-medium text-center py-4">
                Verifying link…
              </p>
            ) : !validCode ? (
              <div>
                <div className="mb-4 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-600">
                  {error}
                </div>
                <button
                  onClick={() => router.replace("/admin")}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  Back to Login
                </button>
              </div>
            ) : success ? (
              <div className="px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-700 text-center">
                Password updated. Redirecting to login…
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-600">
                    {error}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
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

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full pl-9 pr-9 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
                  style={{ backgroundColor: BRAND }}
                >
                  {submitting ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}