"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import why1 from "@/images/why1.jpg";
import why2 from "@/images/why2.jpg";
import why3 from "@/images/why3.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

function AnimatedSection({ children, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const WhyJobsAbroad = () => {
  const textRef = useRef(null);
  const textInView = useInView(textRef, { once: true, margin: "-80px" });

  const imgRef = useRef(null);
  const imgInView = useInView(imgRef, { once: true, margin: "-80px" });

  return (
    <section id="why-us" className="bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12 lg:px-24 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
        <div ref={textRef} className="max-w-xl order-2 lg:order-1">
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={textInView ? "visible" : "hidden"}
            className="text-blue-400 font-bold tracking-widest text-[10px] sm:text-xs uppercase mb-3"
          >
            Why JobsAbroad
          </motion.p>

          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={textInView ? "visible" : "hidden"}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 sm:mb-8 md:mb-10"
          >
            Stop Struggling. <br />
            <span className="text-slate-400">Start Working.</span>
          </motion.h2>

          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {/* OLD WAY */}
            <div>
              <motion.h3
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate={textInView ? "visible" : "hidden"}
                className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-widest mb-4 sm:mb-5 flex items-center gap-2"
              >
                <span className="w-6 sm:w-8 h-1 bg-slate-200"></span> THE OLD
                WAY
              </motion.h3>
              <ul className="space-y-4 sm:space-y-5 md:space-y-6">
                {[
                  {
                    label: "Wasted Time:",
                    text: "Spending weeks sending applications with no response and no idea why.",
                  },
                  {
                    label: "No Guidance:",
                    text: "Not knowing which jobs match your skills or how to present yourself.",
                  },
                  {
                    label: "Zero Follow-up:",
                    text: "Applying and hearing nothing back — no status, no feedback, no closure.",
                  },
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    custom={3 + i}
                    variants={fadeUp}
                    initial="hidden"
                    animate={textInView ? "visible" : "hidden"}
                    className="flex gap-3 sm:gap-4"
                  >
                    <span className="text-xs font-bold text-slate-300 mt-0.5 shrink-0">
                      0{i + 1}
                    </span>
                    <p className="text-slate-500 text-xs sm:text-sm md:text-base">
                      <span className="text-slate-900 font-bold">
                        {item.label}
                      </span>{" "}
                      {item.text}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="pt-6 sm:pt-8 md:pt-10 border-t border-slate-100">
              <motion.h3
                custom={6}
                variants={fadeUp}
                initial="hidden"
                animate={textInView ? "visible" : "hidden"}
                className="text-[10px] sm:text-xs font-bold text-blue-400 tracking-widest mb-4 sm:mb-5 flex items-center gap-2"
              >
                <span className="w-6 sm:w-8 h-1 bg-blue-200"></span> THE
                JOBSABROAD WAY
              </motion.h3>
              <ul className="space-y-4 sm:space-y-5 md:space-y-6">
                {[
                  {
                    label: "We Search For You:",
                    text: "Tell us your skill and we find matching jobs — no endless scrolling required.",
                  },
                  {
                    label: "We Apply For You:",
                    text: "Our team handles the paperwork, applications, and employer communication.",
                  },
                  {
                    label: "You Just Show Up:",
                    text: "We do the hard work. You walk into the interview ready to impress.",
                  },
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    custom={7 + i}
                    variants={fadeUp}
                    initial="hidden"
                    animate={textInView ? "visible" : "hidden"}
                    className="flex gap-3 sm:gap-4"
                  >
                    <span className="text-xs font-bold text-blue-400 mt-0.5 shrink-0">
                      0{i + 1}
                    </span>
                    <p className="text-slate-600 text-xs sm:text-sm md:text-base">
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

        <div
          ref={imgRef}
          className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 h-72 sm:h-96 md:h-125 lg:h-175 order-1 lg:order-2"
        >
          <div className="grid grid-rows-6 gap-2 sm:gap-3 md:gap-4">
            <motion.div
              custom={0}
              variants={fadeIn}
              initial="hidden"
              animate={imgInView ? "visible" : "hidden"}
              className="row-span-4 relative rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <Image
                src={why1}
                alt="Professional guidance"
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>
            <motion.div
              custom={1}
              variants={fadeIn}
              initial="hidden"
              animate={imgInView ? "visible" : "hidden"}
              className="row-span-2 relative rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-blue-400 p-3 sm:p-5 md:p-8 flex flex-col justify-end text-white"
            >
              <p className="text-[10px] sm:text-xs md:text-lg font-bold leading-tight">
                We bridge the gap between talent and opportunity.
              </p>
              <div className="mt-2 sm:mt-3 md:mt-4 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-[10px] sm:text-xs">→</span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-rows-6 gap-2 sm:gap-3 md:gap-4 pt-6 sm:pt-8 md:pt-12">
            <motion.div
              custom={2}
              variants={fadeIn}
              initial="hidden"
              animate={imgInView ? "visible" : "hidden"}
              className="row-span-2 relative rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-xl bg-slate-100"
            >
              <Image
                src={why2}
                alt="Job matching"
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-6 left-2 sm:left-3 md:left-6 text-white">
                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-80">
                  Global Network
                </p>
                <p className="text-[9px] sm:text-xs md:text-sm font-semibold">
                  Join 500+ professionals
                </p>
              </div>
            </motion.div>

            <motion.div
              custom={3}
              variants={fadeIn}
              initial="hidden"
              animate={imgInView ? "visible" : "hidden"}
              className="row-span-4 relative rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <Image
                src={why3}
                alt="Success story"
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyJobsAbroad;
