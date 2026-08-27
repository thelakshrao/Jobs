"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import about1 from "@/images/about1.jpg";
import about2 from "@/images/about2.jpg";
import about3 from "@/images/about3.jpg";
import about4 from "@/images/about4.jpg";
import about5 from "@/images/about5.jpg";
import mainabout from "@/images/mainabout.png";

const BRAND_BLUE = "#004aac";

const EMAILJS_SERVICE_ID = "service_3giimhf";
const EMAILJS_QUICKAPPLY_TEMPLATE_ID = "template_chbn6wi"; 
const EMAILJS_PUBLIC_KEY = "UHzBWCtmnhUoZASXL";

const AnimatedLine = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={`overflow-hidden ${className}`}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
  >
    {children}
  </motion.div>
);

const CardWaves = ({ tint = "#ffffff", opacity = 0.35 }) => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 400 300"
    preserveAspectRatio="none"
  >
    <path
      d="M-20,90 C60,50 120,140 200,100 C280,60 320,130 420,95 L420,320 L-20,320 Z"
      fill="#D6E3F7"
      opacity={opacity}
    />
    <path
      d="M-20,150 C80,190 140,110 220,150 C300,190 340,140 420,170 L420,320 L-20,320 Z"
      fill="#9DBFEE"
      opacity={opacity * 0.7}
    />
  </svg>
);

const CardShell = ({ className = "", children, delay = 0, style }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    className={`relative overflow-hidden rounded-[1.75rem] ${className}`}
    style={style}
  >
    {children}
  </motion.div>
);

const About = () => {
  const centerRef = useRef(null);
  const isInView = useInView(centerRef, { once: true, margin: "-80px" });

  const [quickForm, setQuickForm] = useState({ name: "", phone: "" });
  const [quickStatus, setQuickStatus] = useState("idle");

  const handleQuickChange = (e) => {
    const { name, value } = e.target;
    setQuickForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickSubmit = async () => {
    if (!quickForm.name.trim() || !quickForm.phone.trim()) {
      setQuickStatus("error");
      return;
    }
    setQuickStatus("sending");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_QUICKAPPLY_TEMPLATE_ID,
        {
          from_name: quickForm.name,
          phone: quickForm.phone,
        },
        EMAILJS_PUBLIC_KEY,
      );
      setQuickStatus("success");
      setQuickForm({ name: "", phone: "" });
      setTimeout(() => setQuickStatus("idle"), 4000);
    } catch (err) {
      console.error("EmailJS quick-apply error:", err);
      setQuickStatus("error");
    }
  };

  return (
    <div
      id="about"
      className="relative w-full bg-[#F2F3F5] overflow-hidden py-14 md:py-20"
    >
      <svg
        className="absolute top-0 right-0 w-40 h-40 md:w-80 md:h-80 pointer-events-none z-0"
        viewBox="0 0 320 320"
        fill="none"
      >
        <path
          d="M320 0 C220 0, 320 100, 200 160 S 80 320, 320 320Z"
          fill="#DCE6FB"
          opacity="0.9"
        />
        <path
          d="M320 0 C260 0, 320 60, 240 120 S 140 320, 320 320Z"
          fill="#BFD1F5"
          opacity="0.6"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-40 h-40 md:w-80 md:h-80 pointer-events-none z-0"
        viewBox="0 0 320 320"
        fill="none"
        style={{ transform: "rotate(180deg)" }}
      >
        <path
          d="M320 0 C220 0, 320 100, 200 160 S 80 320, 320 320Z"
          fill="#DCE6FB"
          opacity="0.9"
        />
        <path
          d="M320 0 C260 0, 320 60, 240 120 S 140 320, 320 320Z"
          fill="#BFD1F5"
          opacity="0.6"
        />
      </svg>

      <div className="text-center mb-10 md:mb-14 z-10 relative px-5 max-w-3xl mx-auto">
        <AnimatedLine delay={0}>
          <span
            className="text-xs md:text-sm font-semibold tracking-widest uppercase"
            style={{ color: BRAND_BLUE }}
          >
            Who We Are
          </span>
        </AnimatedLine>
        <AnimatedLine delay={0.1}>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-2 md:mt-3 mb-3 md:mb-5 leading-tight">
            Your Skills. Your Future.
            <br />
            <span style={{ color: BRAND_BLUE }}>Your Place.</span>
          </h2>
        </AnimatedLine>
        <AnimatedLine delay={0.2}>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            At <strong className="text-gray-900">Jobs Abroad</strong>, we
            believe everyone — fresher or veteran, cook or engineer — deserves a
            fair shot at a great opportunity.
          </p>
        </AnimatedLine>
      </div>

      <div
        ref={centerRef}
        className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr_1fr] gap-4 md:gap-5"
      >
        <div className="flex flex-col gap-4 md:gap-5">
          <CardShell
            delay={0.05}
            className="bg-white border border-blue-100 shadow-sm min-h-57.5 p-6 md:p-7 flex flex-col justify-between"
          >
            <CardWaves tint="#EAF0FD" opacity={0.9} />
            <Image
              src={about3}
              alt=""
              fill
              className="object-cover object-top opacity-[0.08] pointer-events-none"
            />
            <div className="relative z-10">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm mb-3"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2 3 14h7l-1 8 11-14h-7l1-6Z" fill="white" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Your First Job, Faster
              </h3>
            </div>
            <p className="relative z-10 text-gray-500 text-sm md:text-[15px] leading-relaxed">
              Fresh out of college? We fast-track freshers straight into their
              very first job — zero experience needed, real employers, no
              waiting around.
            </p>
          </CardShell>

          <CardShell
            delay={0.15}
            className="bg-white border border-blue-100 shadow-sm min-h-57.5 p-6 md:p-7 flex flex-col justify-between"
          >
            <CardWaves tint="#EAF0FD" opacity={0.9} />
            <div className="relative z-10 flex items-center gap-2 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13.5 2.5a4 4 0 0 1 0 5.7l-2 2-1.4-1.4 2-2a2 2 0 0 0-2.9-2.9l-3 3a2 2 0 0 0 0 2.9l1.4 1.4-1.4 1.4-1.4-1.4a4 4 0 0 1 0-5.7l3-3a4 4 0 0 1 5.7 0Zm-3 9.3 1.4 1.4-3 3a4 4 0 1 1-5.7-5.7l2-2 1.4 1.4-2 2a2 2 0 1 0 2.9 2.9l3-3Z"
                    fill="white"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Get Hired Fast
              </h3>
            </div>

            <div className="relative z-10 space-y-2">
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={quickForm.name}
                onChange={handleQuickChange}
                className="w-full rounded-full bg-slate-100 placeholder-gray-400 text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2.5">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  value={quickForm.phone}
                  onChange={handleQuickChange}
                  className="flex-1 bg-transparent placeholder-gray-400 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleQuickSubmit}
                  disabled={quickStatus === "sending"}
                  className="shrink-0 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: BRAND_BLUE }}
                >
                  {quickStatus === "sending" ? "Sending…" : "Notify Us"}
                </button>
              </div>

              <AnimatePresence>
                {quickStatus === "success" && (
                  <motion.p
                    key="qsuccess"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-green-600 text-xs font-medium px-1"
                  >
                    ✅ Got it! We'll reach out shortly.
                  </motion.p>
                )}
                {quickStatus === "error" && (
                  <motion.p
                    key="qerror"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-red-500 text-xs font-medium px-1"
                  >
                    ❌ Please fill in your name and phone number.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <p className="relative z-10 text-gray-500 text-xs md:text-sm mt-3">
              Drop your contact details fast — get your first job even faster.
            </p>
          </CardShell>
        </div>

        <CardShell
          delay={0.1}
          className="bg-white border border-blue-100 shadow-sm min-h-75 lg:min-h-full row-span-1 lg:row-span-2"
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 640"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 H255 C205,110 300,190 235,300 C175,405 260,520 210,640 H0 Z"
              fill="#EAF0FD"
            />
            <path
              d="M0,0 H225 C190,100 265,180 210,280 C160,375 230,500 185,640 H0 Z"
              fill="#CFDDF8"
              opacity="0.7"
            />
          </svg>

          <div className="absolute inset-y-0 left-0 w-[58%] md:w-[52%] z-10 p-5 md:p-7 flex flex-col justify-between">
            <div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm mb-3"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9Z"
                    fill="white"
                  />
                </svg>
              </div>
              <h3 className="text-base md:text-xl font-bold text-gray-900 leading-snug">
                Every Talent Welcome
              </h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed mt-2">
                We help every kind of talent land a job — not just here,
                everywhere.
              </p>
            </div>

            <motion.div
              className="flex flex-col items-start gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[about1, about2, about4, about5].map((img, i) => (
                <div
                  key={i}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-white shadow-md relative"
                  style={{ marginTop: i === 0 ? 0 : -14 }}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </div>
              ))}
              <button
                className="w-9 h-9 md:w-11 md:h-11 rounded-full text-white flex items-center justify-center shadow-md relative"
                style={{ marginTop: -14, backgroundColor: BRAND_BLUE }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </motion.div>
          </div>

          <div className="absolute inset-y-0 right-0 w-[55%] md:w-[58%] z-0">
            <Image
              src={mainabout}
              alt="Jobs Abroad — every kind of talent"
              fill
              className="object-cover object-[30%_center]"
            />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-[#EAF0FD] to-transparent" />
          </div>
        </CardShell>

        <div className="flex flex-col gap-4 md:gap-5">
          <CardShell
            delay={0.2}
            className="bg-white border border-blue-100 shadow-sm min-h-57.5 p-6 md:p-7 flex flex-col justify-between"
          >
            <CardWaves tint="#EAF0FD" opacity={0.9} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: BRAND_BLUE }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 8 3 4l4 2 3-5 3 5 4-2-2 4M5 8h14l-1.5 11h-11L5 8Z"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
                <span
                  className="text-[10px] font-bold tracking-wide uppercase text-white px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: BRAND_BLUE }}
                >
                  Premium
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Your Own 1:1 Career Consultant
              </h3>
            </div>
            <p className="relative z-10 text-gray-500 text-sm md:text-[15px] leading-relaxed">
              Go premium and get a dedicated one-on-one consultant. You focus on
              your studies — we'll hunt down the right role and land you the
              interview.
            </p>
          </CardShell>

          <CardShell
            delay={0.3}
            className="min-h-57.5 p-6 md:p-7 flex flex-col justify-between"
            style={{ backgroundColor: BRAND_BLUE }}
          >
            <CardWaves tint="#ffffff" opacity={0.08} />
            <div className="relative z-10 flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="8"
                    r="3.2"
                    stroke="white"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M4.5 20c0-4 3.5-6.5 7.5-6.5s7.5 2.5 7.5 6.5"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white">
                When You Are Ready
              </h3>
            </div>
            <p className="relative z-10 text-white/75 text-sm">
              Your dream job is one click away.
            </p>
            <Link
              href="/login"
              className="relative z-10 self-start bg-white text-sm font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm hover:bg-slate-100 transition-colors"
              style={{ color: BRAND_BLUE }}
            >
              Connect
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 19 19 5M19 5H9M19 5v10"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </CardShell>
        </div>
      </div>
    </div>
  );
};

export default About;
