"use client";
import Image from "next/image";
import emp2 from "@/images/emp2.webp";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Tech & Corporate Talent",
    desc: "Developers, analysts, and project leads with verified portfolios and work history — ready for full-time or contract roles.",
  },
  {
    number: "02",
    title: "Skilled Trades & Services",
    desc: "Technicians, artisans, and specialized labor — connect with hands-on professionals ready to get to work.",
  },
  {
    number: "03",
    title: "Service & Support Staff",
    desc: "Hospitality, housekeeping, and essential workers — vetted talent ready to join your team with flexible availability.",
  },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function TalentCategories() {
  return (
    <section
      data-navbar-dark="true"
      className="relative pt-10 md:pt-14 px-6 bg-[#004AAC] font-sans box-border overflow-hidden"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div
        className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-end"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 md:order-1 relative flex items-end justify-center h-90 md:h-115"
        >
          <div
            className="absolute left-1/2 bottom-0 -translate-x-1/2 w-88 h-88 md:w-115 md:h-115"
            style={{
              background:
                "linear-gradient(135deg, #d1d5db 0%, #9ca3af 55%, #e5e7eb 100%)",
              borderRadius: "63% 37% 54% 46% / 42% 58% 42% 58%",
              animation: "blobMorph 8s ease-in-out infinite",
              opacity: 0.9,
            }}
          />
          <div
            className="absolute left-1/2 bottom-0 -translate-x-[38%] w-70 h-70 md:w-90 md:h-90 opacity-30"
            style={{
              background: "linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)",
              borderRadius: "48% 52% 65% 35% / 55% 45% 60% 40%",
              animation: "blobMorph2 10s ease-in-out infinite reverse",
            }}
          />
          <div className="relative w-full h-full flex items-end justify-center pointer-events-none">
            <Image
              src={emp2}
              alt="Skilled professional"
              className="h-full w-auto object-contain object-bottom drop-shadow-[0_16px_28px_rgba(0,0,0,0.25)]"
              priority
            />
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="order-1 md:order-2 pb-10 md:pb-14"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 mb-3"
          >
            <span className="w-5 h-px bg-white/50" />
            Why Choose Us
          </motion.span>

          <motion.h2
            variants={item}
            className="text-[clamp(26px,3.6vw,36px)] leading-[1.15] font-extrabold text-white m-0 mb-3"
          >
            Your Talent,
            <br />
            Our Commitment
          </motion.h2>

          <motion.p
            variants={item}
            className="text-[13.5px] md:text-[14.5px] leading-relaxed text-white/70 font-medium max-w-md mb-7"
          >
            At JobsAbroad, we don't just fill roles — we match ambition. From
            fresh graduates to seasoned tradespeople, our platform is built for
            every kind of professional.
          </motion.p>

          <div className="flex flex-col gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                variants={item}
                className="flex items-start gap-4"
              >
                <span className="text-[12px] font-bold text-white/50 tracking-wide pt-0.5 shrink-0">
                  {step.number}
                </span>
                <div
                  className={`flex-1 ${
                    i !== steps.length - 1
                      ? "border-b border-white/15 pb-5"
                      : ""
                  }`}
                >
                  <h3 className="text-[15px] md:text-[16px] font-bold text-white m-0 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-[12.5px] md:text-[13px] leading-relaxed text-white/65 font-medium m-0">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes -global-blobMorph {
          0%,
          100% {
            border-radius: 63% 37% 54% 46% / 42% 58% 42% 58%;
          }
          20% {
            border-radius: 40% 60% 35% 65% / 65% 40% 60% 35%;
          }
          40% {
            border-radius: 55% 45% 68% 32% / 30% 65% 35% 70%;
          }
          60% {
            border-radius: 35% 65% 45% 55% / 60% 35% 65% 40%;
          }
          80% {
            border-radius: 70% 30% 40% 60% / 45% 55% 30% 70%;
          }
        }
        @keyframes -global-blobMorph2 {
          0%,
          100% {
            border-radius: 48% 52% 65% 35% / 55% 45% 60% 40%;
          }
          25% {
            border-radius: 65% 35% 40% 60% / 40% 65% 35% 60%;
          }
          50% {
            border-radius: 38% 62% 55% 45% / 65% 35% 55% 45%;
          }
          75% {
            border-radius: 58% 42% 30% 70% / 45% 60% 40% 65%;
          }
        }
      `}</style>
    </section>
  );
}