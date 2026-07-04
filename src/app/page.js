"use client";

import React from "react";
import Image from "next/image";
import heroBg from "@/images/hero.png";
import About from "@/components/About";
import Premium from "@/components/Premium";
import WhyJobsAbroad from "@/components/WhyJobsAbroad";
import Contact from "@/components/Contact";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const tags = [
  "Remote",
  "Full-time",
  "Internship",
  "Freelance",
  "Part-time",
  "Engineering",
];

const fadeLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
});

const fadeRight = (delay = 0) => ({
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
});

export default function Page() {
  return (
    <>
      <Navbar />

      <div className="relative w-full overflow-hidden bg-[#F2F3F5] font-sans pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="pointer-events-none absolute top-0 right-[-12%] w-[62vw] h-[62vw] max-w-185 max-h-185 opacity-95 z-0">
          <svg
            viewBox="0 0 600 600"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path
              fill="#AFCBF2"
              d="M436.5,320Q420,390,360,430Q300,470,235,450Q170,430,120,380Q70,330,80,260Q90,190,140,140Q190,90,260,80Q330,70,390,110Q450,150,460,220Q470,290,436.5,320Z"
            />
          </svg>
        </div>

        <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-14 md:gap-10 items-center">
          <div className="text-center md:text-left">
            <motion.h1
              {...fadeLeft(0.15)}
              className="font-display text-4xl md:text-6xl lg:text-[4.2rem] font-semibold leading-[1.05] text-[#0A0E17] mb-5"
            >
              Every Skill Has <br className="hidden sm:block" />
              <span className="text-[#004AAC]">A Place Here</span>
            </motion.h1>

            <motion.p
              {...fadeLeft(0.3)}
              className="text-gray-500 text-sm md:text-lg max-w-md mx-auto md:mx-0 mb-9 leading-relaxed"
            >
              From first jobs to dream careers — we connect every kind of
              talent with companies that value who you truly are.
            </motion.p>

            <motion.div
              {...fadeLeft(0.45)}
              className="w-full max-w-md mx-auto md:mx-0 bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,74,172,0.18)] p-5"
            >
              <p className="text-[#0A0E17] text-sm md:text-base font-semibold mb-0.5 text-left">
                What kind of work are you looking for?
              </p>
              <p className="text-gray-400 text-[10px] md:text-xs mb-4 text-left">
                Doctor, driver, cook, engineer, carpenter, designer —
                everyone is welcome here.
              </p>

              <input
                type="text"
                placeholder="Type your work or skill..."
                className="w-full bg-gray-50 border border-gray-200 text-[#0A0E17] text-sm rounded-xl px-4 py-2 md:py-2.5 outline-none placeholder:text-gray-400 focus:border-[#004AAC] transition mb-2.5"
              />

              <button className="w-full bg-[#004AAC] hover:bg-[#003785] active:scale-95 text-white font-semibold text-sm py-2 md:py-2.5 rounded-xl transition-all duration-200 cursor-pointer">
                Find Opportunities
              </button>

              <div className="flex flex-wrap justify-start gap-1.5 mt-4">
                <span className="text-[10px] md:text-xs text-gray-400 self-center mr-1">
                  Popular:
                </span>
                {tags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.7 + i * 0.07,
                    }}
                    className="text-[10px] md:text-xs bg-[#004AAC]/5 border border-[#004AAC]/15 hover:border-[#004AAC] text-[#004AAC]/70 hover:text-[#004AAC] cursor-pointer px-2.5 py-0.5 md:px-3 md:py-1 rounded-full transition-all duration-150"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            {...fadeRight(0.25)}
            className="relative mx-auto md:mx-0 max-w-sm md:max-w-md"
          >
            <div className="relative rotate-3 rounded-[2.5rem] overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,74,172,0.35)] border-4 border-white">
              <Image
                src={heroBg}
                alt="People finding opportunities with Jobs Abroad"
                className="w-full h-105 md:h-130 object-cover"
                priority
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.9,
              }}
              className="absolute -bottom-6 -left-6 md:-left-10 flex items-center gap-2 bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3 max-w-57.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#004AAC] animate-pulse shrink-0" />
              <p className="text-[#0A0E17] text-[11px] md:text-xs font-medium leading-snug">
                Every Talent Deserves an Opportunity
              </p>
            </motion.div>
          </motion.div>
        </main>
      </div>

      <section id="about">
        <About />
      </section>

      <section id="why-us">
        <WhyJobsAbroad />
      </section>

      <section id="premium">
        <Premium />
      </section>

      <section id="contact">
        <Contact />
      </section>

      <Footer />
    </>
  );
}