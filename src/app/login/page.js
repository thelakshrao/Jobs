"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import heroBg from "@/images/hero.png";
import logo2 from "@/images/logo2.png";
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
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

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
    text: "500+ professionals have already found their opportunity. You're next.",
    author: "Jobs Abroad",
  },
];

const Login = () => {
  const router = useRouter();
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
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setError("");
      alert("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError("Could not send reset email. Check the address and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroBg}
          alt="Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 z-10 hidden md:block" />

      <div className="relative z-10 hidden md:flex w-1/2 flex-col justify-between px-10 lg:px-16 py-12">
        <motion.div
          custom={0}
          variants={leftFade}
          initial="hidden"
          animate="visible"
        >
          <Image
            src={logo2}
            alt="Jobs Abroad Logo"
            width={160}
            height={48}
            className="object-contain"
          />
        </motion.div>

        <div className="space-y-10">
          <motion.div
            custom={1}
            variants={leftFade}
            initial="hidden"
            animate="visible"
          >
            <p className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-3">
              Why Jobs Abroad?
            </p>
            <h2 className="text-white text-3xl lg:text-4xl font-bold leading-tight">
              Stop Struggling. <br />
              <span className="text-blue-400">Start Working.</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
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
                <p className="text-blue-400 text-xs font-semibold mt-1.5">
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
            className="flex gap-8"
          >
            {[
              ["500+", "Professionals"],
              ["30+", "Countries"],
              ["95%", "Placement"],
            ].map(([val, label]) => (
              <div key={label}>
                <p className="text-white text-2xl font-black">{val}</p>
                <p className="text-white/40 text-xs">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p
          custom={6}
          variants={leftFade}
          initial="hidden"
          animate="visible"
          className="text-white/30 text-xs"
        >
          © {new Date().getFullYear()} Jobs Abroad. All rights reserved.
        </motion.p>
      </div>

      <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12">
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[1.5px]" />

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-sm sm:max-w-md"
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            className="md:hidden mb-8 flex justify-center"
          >
            <Image
              src={logo2}
              alt="Jobs Abroad"
              width={130}
              height={40}
              className="object-contain"
            />
          </motion.div>

          <motion.h1
            custom={0}
            variants={fadeUp}
            className="text-white text-4xl sm:text-5xl font-bold mb-8 tracking-tight"
          >
            Login
          </motion.h1>

          {error && (
            <motion.p
              custom={0}
              variants={fadeUp}
              className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
            >
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div custom={1} variants={fadeUp}>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email
              </label>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-3.5 focus-within:border-blue-400 focus-within:bg-white/15 transition-all">
                <IoMailOutline className="text-white/50 shrink-0" size={18} />
                <input
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-white placeholder-white/35 text-sm outline-none"
                />
              </div>
            </motion.div>

            <motion.div custom={2} variants={fadeUp}>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-3.5 focus-within:border-blue-400 focus-within:bg-white/15 transition-all">
                <IoLockClosedOutline
                  className="text-white/50 shrink-0"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-white placeholder-white/35 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? (
                    <IoEyeOutline size={18} />
                  ) : (
                    <IoEyeOffOutline size={18} />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div custom={3} variants={fadeUp}>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-white/45 text-xs hover:text-white/70 transition-colors"
              >
                Forgot password?
              </button>
            </motion.div>

            <motion.div
              custom={4}
              variants={fadeUp}
              className="flex items-center gap-3"
            >
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-white/35 text-xs whitespace-nowrap">
                or continue with
              </span>
              <div className="flex-1 h-px bg-white/15" />
            </motion.div>

            <motion.div
              custom={5}
              variants={fadeUp}
              className="flex justify-center"
            >
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center hover:bg-white/20 hover:border-blue-400 transition-all disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
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
              </button>
            </motion.div>

            <motion.p
              custom={6}
              variants={fadeUp}
              className="text-center text-white/45 text-xs"
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
              >
                Register here
              </Link>
            </motion.p>

            <motion.div custom={7} variants={fadeUp}>
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100"
              >
                {loading ? "Please wait..." : "Login"}
                {!loading && (
                  <FiArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
