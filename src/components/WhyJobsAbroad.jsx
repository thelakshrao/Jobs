"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import whymain from "@/images/whymain.png";
import premiumImg from "@/images/premium.jpg";

const BRAND_BLUE = "#004aac";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const WorldMapDots = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 800 420"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern
        id="mapDots"
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="1.8" cy="1.8" r="1.7" fill={BRAND_BLUE} />
      </pattern>
      <clipPath id="worldClip">
        <path d="M55,55 C95,30 150,32 182,55 C210,75 205,100 218,128 C230,153 218,178 195,182 C178,185 168,205 145,202 C120,199 118,220 95,214 C72,208 65,180 60,155 C55,130 40,80 55,55 Z" />
        <path d="M170,215 C195,208 218,225 220,255 C222,288 232,312 214,340 C200,362 174,360 165,335 C157,308 160,278 158,252 C157,235 155,222 170,215 Z" />
        <path d="M372,48 C398,38 424,44 432,64 C439,82 424,95 405,99 C390,102 373,95 365,80 C358,68 359,56 372,48 Z" />
        <path d="M362,108 C402,98 448,113 456,153 C463,193 457,238 432,276 C415,302 388,306 370,282 C354,260 360,230 350,197 C342,168 337,124 362,108 Z" />
        <path d="M392,290 C404,286 416,294 415,308 C414,322 406,334 396,332 C388,330 385,318 386,306 C387,298 386,293 392,290 Z" />
        <path d="M440,42 C495,20 575,30 622,52 C662,72 680,102 660,130 C648,150 655,172 630,186 C608,198 585,186 572,198 C560,210 545,235 528,222 C515,212 522,190 508,172 C495,155 470,150 458,125 C447,103 428,60 440,42 Z" />
        <path d="M598,255 C630,246 668,256 675,278 C682,300 662,317 636,315 C612,313 590,301 592,280 C593,268 590,258 598,255 Z" />
      </clipPath>
    </defs>
    <rect
      width="800"
      height="420"
      fill="url(#mapDots)"
      clipPath="url(#worldClip)"
      opacity="0.85"
    />
  </svg>
);

const oldWay = [
  {
    label: "Manual Applications:",
    text: "You spend hours filling the same forms on ten different sites, hoping someone notices.",
  },
  {
    label: "No Guidance:",
    text: "No one tells you which jobs actually fit your skills, so you apply blind and hope.",
  },
  {
    label: "Silence After Applying:",
    text: "You wait weeks for a reply that never comes — no status, no feedback, no closure.",
  },
];

const newWay = [
  {
    label: "A Consultant Just For You:",
    text: "Our unique 1:1 consultation pairs you with a real person working only your case — not a forum, not a group chat.",
  },
  {
    label: "You Study, We Apply:",
    text: "You never touch an application form. You focus on preparing — we handle the searching and applying for you.",
  },
  {
    label: "We Hand You The Interview:",
    text: "Our team works your case until an interview call is in hand. You just show up ready to say yes.",
  },
];

const steps = [
  {
    title: "You Go Premium",
    text: "One simple upgrade puts a real career consultant on your case — not a support queue, not a chatbot. A person, dedicated to you.",
  },
  {
    title: "We Get to Know You",
    text: "Your consultant calls you personally to understand your target roles, preferred locations, salary expectations, and everything else that makes a job actually right for you.",
  },
  {
    title: "We Strengthen Your Profile",
    text: "Before anything goes out, we sharpen your resume and profile so you're genuinely competitive for the roles you're aiming for.",
  },
  {
    title: "You Study, We Search",
    text: "You focus on interview prep and skill-building. We take over the tedious part — searching and applying to jobs for you, every single day.",
  },
  {
    title: "We Deliver Interviews",
    text: "Through direct referrals or by getting you shortlisted, we work your case until a real interview is in hand — not just another application number.",
  },
  {
    title: "100% Money-Back Guarantee",
    text: "If we don't deliver on our promise, you get a full refund. No arguments, no fine print.",
    highlight: true,
  },
];

const HowItWorksPanel = ({ open, onClose }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60"
        />

        <motion.div
          key="panel"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-y-0 left-0 z-70 w-full sm:w-[88%] md:w-[65%] lg:w-1/2 overflow-y-auto text-white shadow-2xl"
          style={{ backgroundColor: BRAND_BLUE }}
        >
          <div className="relative h-44 sm:h-56 w-full overflow-hidden">
            <Image
              src={premiumImg}
              alt="JobsAbroad Premium"
              fill
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgba(0,74,172,0.15), ${BRAND_BLUE})`,
              }}
            />
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 2L14 14M14 2L2 14"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="px-6 sm:px-10 pb-10 sm:pb-14 -mt-6 relative">
            <span className="inline-block bg-white/15 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              How Premium Works
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight mb-3">
              We Handle The Job Hunt. <br className="hidden sm:block" />
              You Just Show Up.
            </h2>
            <p className="text-white/70 text-sm sm:text-base mb-9 max-w-md">
              Here's exactly what happens once you hand your job search over to
              us.
            </p>

            <ol className="space-y-7 sm:space-y-8">
              {steps.map((step, i) => (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={open ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.45,
                    delay: 0.25 + i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`flex gap-4 sm:gap-5 ${
                    step.highlight
                      ? "bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-5 -mx-1"
                      : ""
                  }`}
                >
                  <span
                    className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      step.highlight ? "bg-white" : "bg-white/15"
                    }`}
                    style={step.highlight ? { color: BRAND_BLUE } : undefined}
                  >
                    {step.highlight ? "✓" : `0${i + 1}`}
                  </span>
                  <div>
                    <p className="font-bold text-sm sm:text-base mb-1">
                      {step.title}
                    </p>
                    <p className="text-white/75 text-xs sm:text-sm leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>

            <button
              onClick={onClose}
              className="mt-10 w-full sm:w-auto bg-white text-sm font-bold px-8 py-3.5 rounded-full hover:bg-white/90 transition-colors cursor-pointer"
              style={{ color: BRAND_BLUE }}
            >
              Got It — Let's Start
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const WhyJobsAbroad = () => {
  const textRef = useRef(null);
  const textInView = useInView(textRef, { once: true, margin: "-80px" });
  const cardRef = useRef(null);
  const cardInView = useInView(cardRef, { once: true, margin: "-100px" });
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  return (
    <section
      id="why-us"
      className="relative bg-white py-16 sm:py-20 md:py-24 px-4 sm:px-8 md:px-12 lg:px-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
        <div ref={textRef} className="max-w-xl">
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={textInView ? "visible" : "hidden"}
            className="font-bold tracking-widest text-[10px] sm:text-xs uppercase mb-3"
            style={{ color: BRAND_BLUE }}
          >
            Why JobsAbroad
          </motion.p>
          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={textInView ? "visible" : "hidden"}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-6 md:mb-7"
          >
            Stop Struggling. <br />
            <span className="text-slate-400">Start Working.</span>
          </motion.h2>

          <div className="space-y-6 sm:space-y-7">
            <div>
              <motion.h3
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate={textInView ? "visible" : "hidden"}
                className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-widest mb-3 sm:mb-4 flex items-center gap-2"
              >
                <span className="w-6 sm:w-8 h-1 bg-slate-200" /> THE OLD WAY
              </motion.h3>
              <ul className="space-y-3 sm:space-y-3.5">
                {oldWay.map((item, i) => (
                  <motion.li
                    key={item.label}
                    custom={3 + i}
                    variants={fadeUp}
                    initial="hidden"
                    animate={textInView ? "visible" : "hidden"}
                    className="flex gap-3 sm:gap-4"
                  >
                    <span className="text-xs font-bold text-slate-300 mt-0.5 shrink-0">
                      0{i + 1}
                    </span>
                    <p className="text-slate-500 text-sm md:text-base">
                      <span className="text-slate-900 font-bold">
                        {item.label}
                      </span>{" "}
                      {item.text}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="pt-5 sm:pt-6 border-t border-slate-100">
              <motion.h3
                custom={6}
                variants={fadeUp}
                initial="hidden"
                animate={textInView ? "visible" : "hidden"}
                className="text-[10px] sm:text-xs font-bold tracking-widest mb-3 sm:mb-4 flex items-center gap-2"
                style={{ color: BRAND_BLUE }}
              >
                <span
                  className="w-6 sm:w-8 h-1"
                  style={{ backgroundColor: "#B7C9F5" }}
                />{" "}
                THE JOBSABROAD WAY
              </motion.h3>
              <ul className="space-y-3 sm:space-y-3.5">
                {newWay.map((item, i) => (
                  <motion.li
                    key={item.label}
                    custom={7 + i}
                    variants={fadeUp}
                    initial="hidden"
                    animate={textInView ? "visible" : "hidden"}
                    className="flex gap-3 sm:gap-4"
                  >
                    <span
                      className="text-xs font-bold mt-0.5 shrink-0"
                      style={{ color: BRAND_BLUE }}
                    >
                      0{i + 1}
                    </span>
                    <p className="text-slate-600 text-sm md:text-base">
                      <span className="text-slate-900 font-bold">
                        {item.label}
                      </span>{" "}
                      {item.text}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div ref={cardRef} className="relative w-full pt-10 lg:pt-0 lg:h-full">
          <div className="relative w-full h-full min-h-95">
            <div
              className="relative w-full h-full rounded-4xl sm:rounded-[2.5rem] overflow-hidden border border-gray-200 shadow-sm min-h-95"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <WorldMapDots />

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={
                  cardInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
                }
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.3,
                }}
                className="relative z-10 m-5 sm:m-8 md:m-10 max-w-70 sm:max-w-xs bg-white rounded-2xl shadow-xl p-5 sm:p-6"
              >
                <p className="text-slate-700 text-sm sm:text-[15px] leading-relaxed mb-4">
                  Hey! No more endless scrolling —{" "}
                  <span className="font-semibold text-slate-900">
                    we search, apply, and prep you for the interview.
                  </span>
                </p>
                <button
                  onClick={() => setHowItWorksOpen(true)}
                  className="text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                  style={{ backgroundColor: BRAND_BLUE }}
                >
                  See How It Works
                </button>

                <div className="mt-6 space-y-2">
                  <div className="h-2 w-full rounded-full bg-slate-100" />
                  <div className="h-2 w-4/5 rounded-full bg-slate-100" />
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-slate-900 font-bold text-sm">
                    The JobsAbroad Way
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      style={{ color: BRAND_BLUE }}
                      className="text-sm font-bold"
                    >
                      4.9
                    </span>
                    <span style={{ color: BRAND_BLUE }} className="text-xs">
                      ★★★★★
                    </span>
                    <span className="text-slate-400 text-xs">
                      500+ placements
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={
                cardInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
              }
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.15,
              }}
              className="absolute -top-6 sm:-top-10 md:-top-12 bottom-0 right-4 sm:right-8 md:right-10 w-[46%] sm:w-[40%] md:w-[38%] z-20"
            >
              <Image
                src={whymain}
                alt="Professional placed abroad through JobsAbroad"
                fill
                className="object-contain object-bottom"
                priority
              />
            </motion.div>
          </div>
        </div>
      </div>

      <HowItWorksPanel
        open={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
      />
    </section>
  );
};

export default WhyJobsAbroad;
