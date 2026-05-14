"use client";

import React from "react";
import Image from "next/image";
import about1 from "@/images/about1.jpg";
import about2 from "@/images/about2.jpg";
import about3 from "@/images/about3.jpg";
import about4 from "@/images/about4.jpg";
import about5 from "@/images/about5.jpg";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

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

const About = () => {
  const imagesRef = useRef(null);
  const isInView = useInView(imagesRef, { once: true, margin: "-80px" });

  return (
    <div id="about" className="relative w-full min-h-screen bg-white overflow-hidden flex flex-col items-center justify-center py-12 md:py-20">
      <svg
        className="absolute top-0 right-0 w-40 h-40 md:w-80 md:h-80 pointer-events-none z-0"
        viewBox="0 0 320 320"
        fill="none"
      >
        <path
          d="M320 0 C220 0, 320 100, 200 160 S 80 320, 320 320Z"
          fill="#EFF6FF"
          opacity="0.8"
        />
        <path
          d="M320 0 C260 0, 320 60, 240 120 S 140 320, 320 320Z"
          fill="#DBEAFE"
          opacity="0.6"
        />
        <path
          d="M320 0 C290 0, 320 30, 280 80 S 200 320, 320 320Z"
          fill="#BFDBFE"
          opacity="0.4"
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
          fill="#EFF6FF"
          opacity="0.8"
        />
        <path
          d="M320 0 C260 0, 320 60, 240 120 S 140 320, 320 320Z"
          fill="#DBEAFE"
          opacity="0.6"
        />
        <path
          d="M320 0 C290 0, 320 30, 280 80 S 200 320, 320 320Z"
          fill="#BFDBFE"
          opacity="0.4"
        />
      </svg>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <svg
          className="absolute -top-20 -left-20 w-112.5 h-112.5 opacity-60"
          viewBox="0 0 320 320"
          fill="none"
          style={{ transform: "scaleX(-1) scaleY(-1)" }}
        >
          <path
            d="M320 0 C220 0, 320 100, 200 160 S 80 320, 320 320Z"
            fill="#EFF6FF"
            opacity="0.8"
          />
          <path
            d="M320 0 C260 0, 320 60, 240 120 S 140 320, 320 320Z"
            fill="#DBEAFE"
            opacity="0.6"
          />
          <path
            d="M320 0 C290 0, 320 30, 280 80 S 200 320, 320 320Z"
            fill="#BFDBFE"
            opacity="0.4"
          />
        </svg>
      </div>

      <div className="text-center mb-10 md:mb-14 z-10 px-5 max-w-3xl mx-auto">
        <AnimatedLine delay={0}>
          <span className="text-xs md:text-sm font-semibold tracking-widest text-blue-400 uppercase">
            Who We Are
          </span>
        </AnimatedLine>

        <AnimatedLine delay={0.1}>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-black mt-2 md:mt-3 mb-3 md:mb-5 leading-tight">
            Every Skill Has <br />
            <span className="text-blue-400">A Place Here</span>
          </h2>
        </AnimatedLine>

        <AnimatedLine delay={0.2}>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-3 md:mb-4">
            At <strong className="text-gray-900">Jobs Abroad</strong>, we
            believe that every person — regardless of their education,
            background, or experience — deserves a fair shot at a great
            opportunity.
          </p>
        </AnimatedLine>

        <AnimatedLine delay={0.3}>
          <p className="md:block text-gray-600 text-sm md:text-base leading-relaxed mb-3 md:mb-4">
            Whether you are a construction worker, a home cook, a fresh
            graduate, a seasoned engineer, or someone just starting out — we are
            here to connect you with employers who value your skills and your
            story.
          </p>
        </AnimatedLine>

        <AnimatedLine delay={0.4}>
          <p className="md:block text-gray-600 text-sm md:text-base leading-relaxed mb-3 md:mb-4">
            We also take responsibility beyond just listing jobs. For students
            and graduates, we offer interview preparation, resume coaching, and
            step-by-step guidance so you walk into every opportunity with
            confidence. No one gets left behind.
          </p>
        </AnimatedLine>
      </div>

      <div
        ref={imagesRef}
        className="relative z-10 flex items-center justify-center w-full max-w-7xl px-2 md:px-4"
      >
        <div className="flex items-center gap-2 md:gap-16 mr-1 md:-mr-5">
          <motion.div
            className="relative w-20 h-28 md:w-52 md:h-72 rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl transform -rotate-6 md:-rotate-12 md:translate-y-12 border-2 md:border-4 border-white"
            initial={{ opacity: 0, x: 70, scale: 0.85 }}
            animate={
              isInView
                ? { opacity: 1, x: 0, scale: 1 }
                : { opacity: 0, x: 70, scale: 0.85 }
            }
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.55,
            }}
          >
            <Image
              src={about1}
              alt="For Workers"
              fill
              className="object-cover"
            />
          </motion.div>

        
          <motion.div
            className="hidden lg:block relative w-64 h-80 rounded-3xl overflow-hidden shadow-2xl transform -rotate-6 border-4 border-white"
            initial={{ opacity: 0, x: 120, scale: 0.85 }}
            animate={
              isInView
                ? { opacity: 1, x: 0, scale: 1 }
                : { opacity: 0, x: 120, scale: 0.85 }
            }
            transition={{
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.65,
            }}
          >
            <Image
              src={about2}
              alt="For Trades"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        <motion.div
          className="relative w-40 h-80 md:w-65 md:h-130 bg-gray-900 rounded-4xl md:rounded-[3rem] border-[5px] md:border-8 border-gray-900 shadow-2xl overflow-hidden shrink-0 z-20"
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <div className="absolute top-2 md:top-3 left-1/2 -translate-x-1/2 w-14 md:w-24 h-4 md:h-6 bg-black rounded-full z-30" />
          <div className="w-full h-full relative">
            <Image
              src={about3}
              alt="Jobs Abroad App"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-black/10 z-10" />

            <div className="absolute top-7 md:top-10 left-3 md:left-5 right-3 md:right-5 flex items-center justify-between z-20">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-5 h-5 md:w-7 md:h-7 rounded-lg md:rounded-xl bg-blue-400 flex items-center justify-center shadow-lg">
                  <svg width="10" height="10" viewBox="0 0 13 13" fill="none">
                    <path
                      d="M2 6.5h3.5M7.5 6.5H11M6.5 2v3.5M6.5 7.5V11"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="text-white text-[10px] md:text-sm font-bold drop-shadow">
                  Jobs Abroad
                </span>
              </div>
              <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <circle
                    cx="6"
                    cy="4"
                    r="2.5"
                    stroke="white"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M1 11c0-2.5 2.2-4 5-4s5 1.5 5 4"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="absolute bottom-3 md:bottom-6 left-3 md:left-5 right-3 md:right-5 z-20">
              <div className="flex items-center gap-1 mb-1.5 md:mb-3">
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-[8px] md:text-[10px] font-semibold tracking-wide uppercase">
                  1,200+ Jobs Live Now
                </span>
              </div>
              <p className="text-white font-bold text-xs md:text-lg mb-0.5 md:mb-1 leading-snug">
                Find Your Opportunity Abroad
              </p>
              <p className="text-white/65 text-[8px] md:text-[11px] leading-relaxed mb-2 md:mb-4 hidden md:block">
                Cook, engineer, driver, nurse — every skill is in demand
                somewhere in the world. We match you with the right employer, no
                matter your background.
              </p>
              <div className="flex gap-1 md:gap-2 mb-2 md:mb-3">
                {[
                  ["48K+", "Companies"],
                  ["95%", "Placement"],
                  ["30+", "Countries"],
                ].map(([val, label]) => (
                  <div
                    key={label}
                    className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-lg md:rounded-xl px-1.5 md:px-3 py-1 md:py-1.5 text-center flex-1"
                  >
                    <p className="text-white text-[9px] md:text-xs font-bold">
                      {val}
                    </p>
                    <p className="text-white/50 text-[7px] md:text-[9px]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-blue-400 rounded-xl md:rounded-2xl py-1.5 md:py-2.5 text-center shadow-lg">
                <p className="text-white text-[9px] md:text-xs font-bold">
                  Browse Jobs →
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-2 md:gap-16 ml-1 md:-ml-5">
          <motion.div
            className="hidden lg:block relative w-64 h-80 rounded-3xl overflow-hidden shadow-2xl transform rotate-6 border-4 border-white"
            initial={{ opacity: 0, x: -120, scale: 0.85 }}
            animate={
              isInView
                ? { opacity: 1, x: 0, scale: 1 }
                : { opacity: 0, x: -120, scale: 0.85 }
            }
            transition={{
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.65,
            }}
          >
            <Image
              src={about4}
              alt="For Students"
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.div
            className="relative w-20 h-28 md:w-52 md:h-72 rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl transform rotate-6 md:rotate-12 md:translate-y-12 border-2 md:border-4 border-white"
            initial={{ opacity: 0, x: -70, scale: 0.85 }}
            animate={
              isInView
                ? { opacity: 1, x: 0, scale: 1 }
                : { opacity: 0, x: -70, scale: 0.85 }
            }
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.55,
            }}
          >
            <Image
              src={about5}
              alt="For Graduates"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
