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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
});

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="relative min-h-[85vh] md:min-h-screen w-full overflow-hidden font-sans">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroBg}
            alt="Hero background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] md:min-h-screen text-center px-6 pt-20 pb-10">
          <motion.div
            {...fadeUp(0.1)}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] md:text-xs font-medium px-3 py-1 rounded-full mb-5"
          >
            <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
            Every Talent Deserves an Opportunity
          </motion.div>
          <motion.h1
            {...fadeUp(0.22)}
            className="text-white text-3xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-4xl mb-4 drop-shadow-xl"
          >
            Every Skill Has <br className="hidden sm:block" />
            <span className="text-blue-400">A Place Here</span>
          </motion.h1>
          <motion.p
            {...fadeUp(0.34)}
            className="text-white/70 text-sm md:text-lg max-w-lg mb-8 leading-relaxed"
          >
            From first jobs to dream careers — we connect every kind of talent
            with companies that value who you truly are.
          </motion.p>

          <motion.div
            {...fadeUp(0.46)}
            className="w-full max-w-md md:max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-5 mt-2"
          >
            <p className="text-white text-sm md:text-base font-semibold mb-0.5">
              What kind of work are you looking for?
            </p>
            <p className="text-white/55 text-[10px] md:text-xs mb-4">
              Doctor, driver, cook, engineer, carpenter, designer — everyone is
              welcome here.
            </p>

            <input
              type="text"
              placeholder="Type your work or skill..."
              className="w-full bg-white/15 border border-white/25 text-white text-sm rounded-xl px-4 py-2 md:py-2.5 outline-none placeholder:text-white/40 focus:border-white/50 transition mb-2.5"
            />

            <button className="w-full bg-white hover:bg-gray-100 active:scale-95 text-black font-semibold text-sm py-2 md:py-2.5 rounded-xl transition-all duration-200 cursor-pointer">
              Find Opportunities
            </button>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              <span className="text-[10px] md:text-xs text-white/40 self-center mr-1">
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
                    delay: 0.6 + i * 0.07,
                  }}
                  className="text-[10px] md:text-xs border border-white/20 hover:border-white/50 text-white/60 hover:text-white cursor-pointer px-2.5 py-0.5 md:px-3 md:py-1 rounded-full transition-all duration-150"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
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
