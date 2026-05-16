"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import heroBg from "@/images/hero.png";
import logo from "@/images/logo.png";
import { IoLockClosedOutline, IoEyeOffOutline, IoEyeOutline, IoChevronBackOutline } from "react-icons/io5";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useSearchParams, useRouter } from "next/navigation";

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

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!oobCode) {
      setError("Invalid or expired reset link.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("Password successfully updated! Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError("Failed to update password. Link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex">
      {/* Background Section */}
      <div className="absolute inset-0 z-0">
        <Image src={heroBg} alt="Background" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 z-10 hidden md:block" />

      {/* Left Panel: Branding */}
      <div className="relative z-10 hidden md:flex w-1/2 flex-col justify-between px-10 lg:px-16 py-12">
        <motion.div custom={0} variants={leftFade} initial="hidden" animate="visible">
          <Image src={logo} alt="Logo" width={160} height={48} className="object-contain" />
        </motion.div>

        <div className="space-y-6">
          <motion.div custom={1} variants={leftFade} initial="hidden" animate="visible">
            <h2 className="text-white text-3xl lg:text-4xl font-bold leading-tight">
              Secure Your <br />
              <span className="text-blue-400">Account.</span>
            </h2>
            <p className="text-white/60 text-sm mt-4 max-w-xs">
              Choose a strong password to protect your professional profile and global opportunities.
            </p>
          </motion.div>
        </div>

        <motion.p custom={6} variants={leftFade} initial="hidden" animate="visible" className="text-white/30 text-xs">
          © {new Date().getFullYear()} Jobs Abroad. All rights reserved.
        </motion.p>
      </div>

      {/* Right Panel: Reset Form */}
      <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[1.5px]" />

        <motion.div initial="hidden" animate="visible" className="relative z-10 w-full max-w-sm sm:max-w-md">
          <motion.div custom={0} variants={fadeUp} className="md:hidden mb-8 flex justify-center">
            <Image src={logo} alt="Logo" width={130} height={40} className="object-contain" />
          </motion.div>

          <motion.h1 custom={0} variants={fadeUp} className="text-white text-4xl sm:text-5xl font-bold mb-8 tracking-tight">New Password</motion.h1>

          {error && <motion.p custom={0} variants={fadeUp} className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</motion.p>}
          {message && <motion.p custom={0} variants={fadeUp} className="text-green-400 text-sm mb-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">{message}</motion.p>}

          <form onSubmit={handleResetSubmit} className="space-y-6">
            <motion.div custom={1} variants={fadeUp}>
              <label className="block text-white/80 text-sm font-medium mb-2">New Password</label>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-3.5 focus-within:border-blue-400 transition-all">
                <IoLockClosedOutline className="text-white/50" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-white placeholder-white/35 text-sm outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-white/40">
                  {showPassword ? <IoEyeOutline size={18} /> : <IoEyeOffOutline size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div custom={2} variants={fadeUp}>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-500/30 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </motion.div>

            <motion.div custom={3} variants={fadeUp} className="text-center">
              <Link href="/login" className="text-white/40 text-sm hover:text-white flex items-center justify-center gap-2 transition-colors">
                <IoChevronBackOutline /> Back to Login
              </Link>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;