"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoCallOutline,
  IoClose,
} from "react-icons/io5";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

const inputClass =
  "flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 focus-within:border-[#004AAC] focus-within:bg-white transition-all";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function EmployerAuthModal({ open, onClose, onAuthed }) {
  const [mode, setMode] = useState("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const switchMode = (m) => {
    setMode(m);
    resetMessages();
    setPassword("");
    setConfirmPassword("");
  };

  const ensureUserDoc = async (user, extra = {}) => {
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName || extra.name || "",
          email: user.email || "",
          phone: extra.phone || user.phoneNumber || "",
          createdAt: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (err) {
      console.error("EmployerAuthModal: ensureUserDoc failed:", err);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    resetMessages();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullName });
      await ensureUserDoc(cred.user, { name: fullName, phone });
      onAuthed(cred.user);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Could not create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      onAuthed(cred.user);
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    resetMessages();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(result.user);
      onAuthed(result.user);
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email above, then tap 'Forgot password?' again.");
      return;
    }
    setLoading(true);
    resetMessages();
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError("Could not send reset email. Check the address and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl px-6 py-8 sm:px-8 sm:py-9 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <IoClose size={20} />
          </button>

          <h2 className="text-2xl font-bold text-[#0A0E17] mb-1">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {mode === "signup"
              ? "One account works for both applying to jobs and hiring."
              : "Log in to continue to your employer dashboard."}
          </p>

          {error && (
            <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-700 text-sm mb-4 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
              {success}
            </p>
          )}

          {mode === "signup" ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-[#0A0E17] text-xs font-medium mb-1.5">
                  Full Name
                </label>
                <div className={inputClass}>
                  <IoPersonOutline
                    className="text-gray-400 shrink-0"
                    size={17}
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0A0E17] text-xs font-medium mb-1.5">
                  Email
                </label>
                <div className={inputClass}>
                  <IoMailOutline className="text-gray-400 shrink-0" size={17} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0A0E17] text-xs font-medium mb-1.5">
                  Phone Number
                </label>
                <div className={inputClass}>
                  <IoCallOutline className="text-gray-400 shrink-0" size={17} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0A0E17] text-xs font-medium mb-1.5">
                  Password
                </label>
                <div className={inputClass}>
                  <IoLockClosedOutline
                    className="text-gray-400 shrink-0"
                    size={17}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a password"
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <IoEyeOutline size={17} />
                    ) : (
                      <IoEyeOffOutline size={17} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#0A0E17] text-xs font-medium mb-1.5">
                  Confirm Password
                </label>
                <div className={inputClass}>
                  <IoLockClosedOutline
                    className="text-gray-400 shrink-0"
                    size={17}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#004AAC] hover:bg-[#003785] text-white font-bold text-sm py-3.5 rounded-full transition-all disabled:opacity-60"
              >
                {loading ? "Please wait..." : "Create Account & Continue"}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full py-3 transition-all disabled:opacity-50"
              >
                <GoogleIcon />
                <span className="text-[#0A0E17] text-sm font-semibold">
                  Sign up with Google
                </span>
              </button>

              <p className="text-center text-gray-400 text-xs pt-1">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-[#004AAC] font-semibold hover:underline"
                >
                  Log in
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[#0A0E17] text-xs font-medium mb-1.5">
                  Email
                </label>
                <div className={inputClass}>
                  <IoMailOutline className="text-gray-400 shrink-0" size={17} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0A0E17] text-xs font-medium mb-1.5">
                  Password
                </label>
                <div className={inputClass}>
                  <IoLockClosedOutline
                    className="text-gray-400 shrink-0"
                    size={17}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <IoEyeOutline size={17} />
                    ) : (
                      <IoEyeOffOutline size={17} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[#004AAC] text-xs font-medium hover:text-[#003785]"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#004AAC] hover:bg-[#003785] text-white font-bold text-sm py-3.5 rounded-full transition-all disabled:opacity-60"
              >
                {loading ? "Please wait..." : "Login & Continue"}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full py-3 transition-all disabled:opacity-50"
              >
                <GoogleIcon />
                <span className="text-[#0A0E17] text-sm font-semibold">
                  Continue with Google
                </span>
              </button>

              <p className="text-center text-gray-400 text-xs pt-1">
                New here?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-[#004AAC] font-semibold hover:underline"
                >
                  Create an account
                </button>
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
