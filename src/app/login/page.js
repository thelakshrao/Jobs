"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import premiumImg from "@/images/premium.jpg";
import logo3 from "@/images/logo3.png";
import {
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOffOutline,
  IoEyeOutline,
} from "react-icons/io5";
import { FiArrowRight } from "react-icons/fi";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};

const leftFade = {
  hidden: { opacity: 0, x: -30 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] },
  }),
};

const quotes = [
  {
    text: "Your skill is your passport. We help you use it anywhere in the world.",
    author: "Jobs Abroad",
  },
  {
    text: "Every great career begins with one brave step across a border.",
    author: "Jobs Abroad",
  },
  {
    text: "Great careers aren't found by chance — they're built with the right support.",
    author: "Jobs Abroad",
  },
];

const inputClass =
  "flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 focus-within:border-[#004AAC] focus-within:bg-white transition-all";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Self-healing: if this account's signup was interrupted before its
      // Firestore profile doc was created, back-fill it now on login.
      // merge:true + only touching lastLoginAt on the happy path means
      // this never clobbers an existing, fully-formed profile.
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            name: user.displayName || "",
            email: user.email || "",
            lastLoginAt: new Date().toISOString(),
          },
          { merge: true },
        );
      } catch (docErr) {
        // Don't block login if this write fails — just log it.
        console.error("Failed to upsert user profile on login:", docErr);
      }

      router.push(redirectTarget);
    } catch (err) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (err.code === "auth/user-disabled") {
        setError("This account has been disabled.");
      } else {
        setError("Could not sign in. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(
        auth,
        googleProvider,
        browserPopupRedirectResolver,
      );
      const user = result.user;
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName || "",
          email: user.email || "",
          phone: user.phoneNumber || "",
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true },
      );
      router.push(redirectTarget);
    } catch (err) {
      console.error("Google sign-in error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups and try again.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain isn't authorized for Google sign-in.");
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const signupHref =
    redirectTarget && redirectTarget !== "/dashboard"
      ? `/signup?redirect=${encodeURIComponent(redirectTarget)}`
      : "/signup";

  const resetHref =
    redirectTarget && redirectTarget !== "/dashboard"
      ? `/reset-password?redirect=${encodeURIComponent(redirectTarget)}`
      : "/reset-password";

  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col md:flex-row font-sans">
      <div className="hidden md:block w-1/2 p-4 lg:p-6">
        <div className="relative w-full h-full rounded-4xl overflow-hidden">
          <Image
            src={premiumImg}
            alt="Jobs Abroad"
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,74,172,0.88) 0%, rgba(0,74,172,0.4) 45%, rgba(0,74,172,0.08) 70%)",
            }}
          />

          <div className="relative z-10 h-full flex flex-col justify-between p-8 lg:p-10">
            <motion.div
              custom={0}
              variants={leftFade}
              initial="hidden"
              animate="visible"
              className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 inline-flex self-start"
            >
              <Image
                src={logo3}
                alt="Jobs Abroad Logo"
                width={130}
                height={40}
                className="object-contain h-8 w-auto"
              />
            </motion.div>

            <div className="space-y-8">
              <motion.div
                custom={1}
                variants={leftFade}
                initial="hidden"
                animate="visible"
              >
                <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-3">
                  Welcome Back
                </p>
                <h2 className="font-display text-white text-3xl lg:text-4xl font-semibold leading-tight">
                  Pick Up Where <br />
                  <span className="text-white">You Left Off.</span>
                </h2>
              </motion.div>

              <div className="space-y-5">
                {quotes.map((q, i) => (
                  <motion.div
                    key={i}
                    custom={2 + i}
                    variants={leftFade}
                    initial="hidden"
                    animate="visible"
                  >
                    <p className="text-white/90 text-sm leading-relaxed italic">
                      &ldquo;{q.text}&rdquo;
                    </p>
                    <p className="text-white/70 text-xs font-semibold mt-1.5">
                      — {q.author}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                custom={5}
                variants={leftFade}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {[
                  "A dedicated 1:1 career consultant",
                  "Direct interview referrals, not just applications",
                  "100% money-back guarantee",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <p className="text-white/85 text-sm">{item}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.p
              custom={6}
              variants={leftFade}
              initial="hidden"
              animate="visible"
              className="text-white/50 text-xs"
            >
              © {new Date().getFullYear()} Jobs Abroad. All rights reserved.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="md:hidden relative w-full h-72 sm:h-80 overflow-hidden">
        <Image
          src={premiumImg}
          alt="Jobs Abroad"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,74,172,0.55) 0%, rgba(0,74,172,0.55) 55%, rgba(0,74,172,0.92) 100%)",
          }}
        />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 inline-flex mb-6"
          >
            <Image
              src={logo3}
              alt="Jobs Abroad"
              width={120}
              height={36}
              className="object-contain h-7 w-auto"
            />
          </motion.div>
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display text-white text-2xl sm:text-3xl font-semibold tracking-tight mb-2"
          >
            Welcome back
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-white/85 text-sm max-w-xs"
          >
            Log in to continue your journey with Jobs Abroad.
          </motion.p>
        </div>
      </div>

      <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-10 -mt-8 md:mt-0 rounded-t-3xl md:rounded-none bg-white">
        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-sm sm:max-w-md"
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            className="hidden md:flex justify-center mb-6"
          >
            <div className="inline-flex">
              <Image
                src={logo3}
                alt="Jobs Abroad"
                width={120}
                height={36}
                className="object-contain h-10 w-auto"
              />
            </div>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="hidden md:block font-display text-[#0A0E17] text-3xl sm:text-4xl font-semibold mb-1.5 tracking-tight text-center"
          >
            Welcome back
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            className="hidden md:block text-gray-400 text-sm mb-7 text-center"
          >
            Log in to continue your journey with Jobs Abroad.
          </motion.p>

          {error && (
            <motion.p
              custom={0}
              variants={fadeUp}
              className="text-red-600 text-sm mb-4 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"
            >
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div custom={3} variants={fadeUp}>
              <label className="block text-[#0A0E17] text-xs font-medium mb-1.5">
                Email
              </label>
              <div className={inputClass}>
                <IoMailOutline className="text-gray-400 shrink-0" size={17} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="flex-1 bg-transparent text-[#0A0E17] placeholder-gray-400 text-sm outline-none"
                />
              </div>
            </motion.div>

            <motion.div custom={4} variants={fadeUp}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[#0A0E17] text-xs font-medium">
                  Password
                </label>
                <Link
                  href={resetHref}
                  className="text-[#004AAC] text-xs font-semibold hover:text-[#003785] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className={inputClass}>
                <IoLockClosedOutline
                  className="text-gray-400 shrink-0"
                  size={17}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="flex-1 bg-transparent text-[#0A0E17] placeholder-gray-400 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <IoEyeOutline size={17} />
                  ) : (
                    <IoEyeOffOutline size={17} />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div custom={5} variants={fadeUp}>
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-[#004AAC] hover:bg-[#003785] text-white font-bold text-sm py-4 rounded-full flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-[#004AAC]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100 cursor-pointer"
              >
                {loading ? "Please wait..." : "Log In"}
                {!loading && (
                  <FiArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
            </motion.div>

            <motion.div
              custom={6}
              variants={fadeUp}
              className="flex items-center gap-3"
            >
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs whitespace-nowrap">
                or continue with
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </motion.div>

            <motion.div custom={7} variants={fadeUp}>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full py-3.5 transition-all disabled:opacity-50 cursor-pointer"
              >
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
                <span className="text-[#0A0E17] text-sm font-semibold">
                  Log in with Google
                </span>
              </button>
            </motion.div>

            <motion.p
              custom={8}
              variants={fadeUp}
              className="text-center text-gray-400 text-xs"
            >
              Don&apos;t have an account?{" "}
              <Link
                href={signupHref}
                className="text-[#004AAC] font-semibold hover:text-[#003785] transition-colors"
              >
                Sign up here
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#004AAC] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}