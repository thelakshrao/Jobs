"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import premium from "@/images/premium.jpg";

const BRAND_BLUE = "#004aac";

const points = [
  {
    n: "1",
    title: "Elite Appearance",
    text: "We professionally design your resume to stand out in international markets.",
    accent: true,
  },
  {
    n: "2",
    title: "Guaranteed Interviews",
    text: "We ensure 3 to 4 companies shortlist you for your dream role.",
  },
  {
    n: "3",
    title: "Full Refund Policy",
    text: "No interviews? No problem. We provide a 100% full refund.",
  },
];

const Icon = ({ light = false }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M7 17 17 7M17 7H9M17 7v8"
      stroke={light ? "white" : BRAND_BLUE}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CardWaves = ({ tint = BRAND_BLUE, opacity = 0.06 }) => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 400 300"
    preserveAspectRatio="none"
  >
    <path
      d="M-20,90 C60,50 120,140 200,100 C280,60 320,130 420,95 L420,320 L-20,320 Z"
      fill={tint}
      opacity={opacity}
    />
    <path
      d="M-20,150 C80,190 140,110 220,150 C300,190 340,140 420,170 L420,320 L-20,320 Z"
      fill={tint}
      opacity={opacity * 0.7}
    />
  </svg>
);

const Premium = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-white pt-16 sm:pt-20 md:pt-24 pb-28 sm:pb-24 md:pb-20 px-4 sm:px-8 md:px-12 lg:px-24">
      <div ref={ref} className="max-w-6xl mx-auto">
        <div className="relative rounded-4xl sm:rounded-[2.5rem] overflow-hidden min-h-95 sm:min-h-105 md:min-h-115">
          <Image
            src={premium}
            alt="Premium 1:1 career consultation"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {/* top copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 p-6 sm:p-10 md:p-12 max-w-md"
          >
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: BRAND_BLUE }} className="text-lg">
                ★
              </span>
              <span className="text-white/90 text-xs sm:text-sm font-semibold tracking-widest uppercase">
                Premium Service
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.08]">
              Unlock Your <br /> Global Potential
            </h2>
          </motion.div>
        </div>

        <div className="relative z-20 -mt-24 sm:-mt-20 md:-mt-16 px-2 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr_1fr] gap-4 sm:gap-5 items-start">
            {points.map((p, i) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2 + i * 0.12,
                }}
                className={`relative overflow-hidden rounded-3xl shadow-xl border ${
                  p.accent
                    ? "border-transparent p-6 sm:p-7 md:p-8"
                    : "bg-white border-gray-100 p-5 sm:p-6 mt-0 sm:mt-8 md:mt-10"
                }`}
                style={p.accent ? { backgroundColor: "#EAEEF6" } : undefined}
              >
                <CardWaves tint={BRAND_BLUE} opacity={p.accent ? 0.07 : 0.045} />

                <div className="relative z-10">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: p.accent ? BRAND_BLUE : "#EAEEF6" }}
                  >
                    <Icon light={p.accent} />
                  </div>
                  <h3 className="text-slate-900 font-bold text-base sm:text-lg leading-snug mb-1.5">
                    {p.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {p.text}
                  </p>

                  {p.accent && (
                    <button
                      className="mt-5 inline-flex items-center gap-1.5 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-sm hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#0B1220" }}
                    >
                      Get Premium
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 19 19 5M19 5H9M19 5v10"
                          stroke="white"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Premium;