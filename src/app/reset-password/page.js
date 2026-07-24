"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import premiumImg from "@/images/premium.jpg";
import logo3 from "@/images/logo3.png";
import {
  IoLockClosedOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoChevronBackOutline,
} from "react-icons/io5";
import { FiArrowRight } from "react-icons/fi";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useSearchParams, useRouter } from "next/navigation";

const BRAND_BLUE = "#004AAC";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!oobCode) {
      setError("Invalid or expired reset link.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("Password successfully updated! Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError("Failed to update password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="relative z-10 w-full max-w-sm sm:max-w-md"
    >
      <motion.div
        custom={0}
        variants={fadeUp}
        className="hidden md:flex justify-center mb-8"
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
        className="font-display text-[#0A0E17] text-3xl sm:text-4xl font-semibold mb-1.5 tracking-tight text-center"
      >
        New Password
      </motion.h1>
      <motion.p
        custom={2}
        variants={fadeUp}
        className="text-gray-400 text-sm mb-8 text-center"
      >
        Choose a strong new password for your account.
      </motion.p>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-sm mb-4 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"
        >
          {error}
        </motion.p>
      )}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-700 text-sm mb-4 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5"
        >
          {message}
        </motion.p>
      )}

      <form onSubmit={handleResetSubmit} className="space-y-5">
        <motion.div custom={3} variants={fadeUp}>
          <label className="block text-[#0A0E17] text-sm font-medium mb-2">
            New Password
          </label>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-5 py-3.5 focus-within:border-[#004AAC] focus-within:bg-white transition-all">
            <IoLockClosedOutline className="text-gray-400 shrink-0" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="flex-1 bg-transparent text-[#0A0E17] placeholder-gray-400 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <IoEyeOutline size={18} />
              ) : (
                <IoEyeOffOutline size={18} />
              )}
            </button>
          </div>
        </motion.div>

        <motion.div custom={4} variants={fadeUp}>
          <label className="block text-[#0A0E17] text-sm font-medium mb-2">
            Confirm Password
          </label>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-5 py-3.5 focus-within:border-[#004AAC] focus-within:bg-white transition-all">
            <IoLockClosedOutline className="text-gray-400 shrink-0" size={18} />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="flex-1 bg-transparent text-[#0A0E17] placeholder-gray-400 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? (
                <IoEyeOutline size={18} />
              ) : (
                <IoEyeOffOutline size={18} />
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
            {loading ? "Updating..." : "Update Password"}
            {!loading && (
              <FiArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            )}
          </button>
        </motion.div>

        <motion.div custom={6} variants={fadeUp} className="text-center">
          <Link
            href="/login"
            className="text-gray-400 text-sm hover:text-[#004AAC] flex items-center justify-center gap-2 transition-colors"
          >
            <IoChevronBackOutline /> Back to Login
          </Link>
        </motion.div>
      </form>
    </motion.div>
  );
}

const ResetPassword = () => {
  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col md:flex-row font-sans">
      {/* Left panel — desktop */}
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
                  Account Security
                </p>
                <h2 className="font-display text-white text-3xl lg:text-4xl font-semibold leading-tight">
                  Secure Your <br />
                  <span className="text-[#004aac]">Account.</span>
                </h2>
                <p className="text-white/85 text-sm mt-4 max-w-xs">
                  Choose a strong password to protect your professional profile
                  and global opportunities.
                </p>
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
                    <p className="text-white/85 text-sm leading-relaxed italic">
                      &ldquo;{q.text}&rdquo;
                    </p>
                    <p className="text-[#004acc] text-xs font-semibold mt-1.5">
                      — {q.author}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.p
              custom={6}
              variants={leftFade}
              initial="hidden"
              animate="visible"
              className="text-white/40 text-xs"
            >
              © {new Date().getFullYear()} Jobs Abroad. All rights reserved.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Top image — mobile */}
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
            New Password
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-white/85 text-sm max-w-xs"
          >
            Choose a strong new password for your account.
          </motion.p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-10 md:py-12 -mt-8 md:mt-0 rounded-t-3xl md:rounded-none bg-white">
        <Suspense
          fallback={
            <div className="relative z-10 text-gray-400 text-sm">
              Loading...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
};

export default ResetPassword;
