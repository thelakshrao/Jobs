"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import premiumImg from "@/images/Premium.png";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Premium = () => {
  const textRef = useRef(null);
  const textInView = useInView(textRef, { once: true, margin: "-80px" });

  const phoneRef = useRef(null);
  const phoneInView = useInView(phoneRef, { once: true, margin: "-80px" });

  return (
    <section id="premium" className="w-full py-3 sm:py-4 md:py-12 px-3 sm:px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="relative w-full min-h-auto md:h-160 bg-[#fdf4f6] rounded-2xl sm:rounded-[2.5rem] md:rounded-[4rem] overflow-hidden flex flex-col md:flex-row items-center border border-pink-100 shadow-sm">

          <div className="absolute top-0 right-0 w-2/3 h-full z-0">
            <svg viewBox="0 0 500 500" fill="none" className="w-full h-full opacity-40">
              <path d="M500 0 C300 0, 400 200, 200 300 S 0 500, 500 500Z" fill="#E0E7FF" />
            </svg>
          </div>

          <div
            ref={textRef}
            className="relative z-10 w-full md:w-1/2 p-5 sm:p-8 md:p-16 flex flex-col justify-center"
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate={textInView ? "visible" : "hidden"}
              className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-blue-400 flex items-center justify-center shadow-md">
                <span className="text-white text-[8px] sm:text-[9px] md:text-[10px]">★</span>
              </div>
              <span className="text-blue-400 font-bold tracking-widest uppercase text-[9px] sm:text-[10px] md:text-xs">
                Premium Service
              </span>
            </motion.div>

            <motion.h2
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate={textInView ? "visible" : "hidden"}
              className="text-black text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold leading-tight mb-5 sm:mb-6 md:mb-8"
            >
              Unlock Your <br />
              <span className="text-blue-400">Global Potential</span>
            </motion.h2>

            <ul className="space-y-4 sm:space-y-5 md:space-y-6 mb-6 sm:mb-8 md:mb-10">
              {[
                { label: "Elite Appearance:", text: "We professionally design your resume to stand out in international markets." },
                { label: "Guaranteed Interviews:", text: "We ensure 3 to 4 companies shortlist you for your dream role." },
                { label: "Full Refund Policy:", text: "No interviews? No problem. We provide a 100% full refund." },
              ].map((item, i) => (
                <motion.li
                  key={i}
                  custom={2 + i}
                  variants={fadeUp}
                  initial="hidden"
                  animate={textInView ? "visible" : "hidden"}
                  className="flex gap-3 sm:gap-4"
                >
                  <div className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-400 text-[9px] sm:text-[10px] font-bold">
                    {i + 1}
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-snug">
                    <strong className="text-black">{item.label}</strong>{" "}
                    {item.text}
                  </p>
                </motion.li>
              ))}
            </ul>

            <motion.button
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate={textInView ? "visible" : "hidden"}
              className="group relative self-start flex items-center gap-3 sm:gap-4 bg-black pl-5 sm:pl-7 pr-2 py-2 sm:py-2.5 rounded-full hover:bg-blue-400 transition-all duration-300 cursor-pointer"
            >
              <span className="text-white font-bold text-xs sm:text-sm">
                Get Premium Now
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </div>
            </motion.button>
          </div>

          <div
            ref={phoneRef}
            className="relative z-10 w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-0 pb-6 md:pb-0"
          >
            <motion.div
              custom={0}
              variants={fadeIn}
              initial="hidden"
              animate={phoneInView ? "visible" : "hidden"}
              className="relative w-40 h-80 sm:w-52 sm:h-104 md:w-60 md:h-120 lg:w-75 lg:h-150 bg-white rounded-4xl sm:rounded-[2.5rem] md:rounded-[3rem] border-[6px] sm:border-8 md:border-10 border-black shadow-2xl overflow-hidden translate-y-0 md:translate-y-10 lg:translate-y-16"
            >
              <div className="flex flex-col h-full bg-white">
                <div className="h-6 sm:h-8 md:h-10 w-full flex items-center justify-center relative">
                  <div className="w-12 sm:w-16 md:w-20 h-3 sm:h-4 md:h-5 bg-black rounded-full" />
                </div>

                <div className="px-3 sm:px-4 md:px-5 pt-2 sm:pt-3 md:pt-4">
                  <motion.span
                    custom={1}
                    variants={fadeIn}
                    initial="hidden"
                    animate={phoneInView ? "visible" : "hidden"}
                    className="text-blue-400 text-[8px] sm:text-[9px] md:text-[10px] font-bold border border-blue-100 px-1.5 py-0.5 rounded-md mb-1.5 inline-block"
                  >
                    Premium Service
                  </motion.span>
                  <motion.h3
                    custom={2}
                    variants={fadeIn}
                    initial="hidden"
                    animate={phoneInView ? "visible" : "hidden"}
                    className="text-black text-sm sm:text-base md:text-xl font-bold leading-tight mb-2"
                  >
                    Faster <br /> Premium <br /> Service
                  </motion.h3>

                  <motion.div
                    custom={3}
                    variants={fadeIn}
                    initial="hidden"
                    animate={phoneInView ? "visible" : "hidden"}
                    className="space-y-1.5 sm:space-y-2 md:space-y-3 mb-2 sm:mb-3 md:mb-4"
                  >
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-800 font-bold">Resume & Branding</p>
                    <p className="text-[7px] sm:text-[8px] md:text-[9px] text-gray-500 leading-tight">
                      We build your profile to attract top recruiters worldwide.
                    </p>
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-800 font-bold mt-1">Interview Guarantee</p>
                    <p className="text-[7px] sm:text-[8px] md:text-[9px] text-gray-500 leading-tight">
                      At least 3-4 interviews are guaranteed.
                    </p>
                  </motion.div>

                  <motion.div
                    custom={4}
                    variants={fadeIn}
                    initial="hidden"
                    animate={phoneInView ? "visible" : "hidden"}
                    className="bg-blue-50 rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 border border-blue-100 mb-2 sm:mb-3 md:mb-4 flex items-center justify-between"
                  >
                    <p className="text-blue-600 text-[7px] sm:text-[8px] md:text-[9px] font-bold">Special Price</p>
                    <p className="text-black text-xs sm:text-sm font-black">₹2000/-</p>
                  </motion.div>
                </div>

                <div className="relative flex-1 w-full bg-gray-50">
                  <Image
                    src={premiumImg}
                    alt="Premium User"
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4 bg-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-md sm:rounded-lg shadow-md flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-black font-bold text-[7px] sm:text-[8px] md:text-[9px]">Shortlist Confirmed</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Premium;
