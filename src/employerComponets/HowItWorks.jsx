"use client";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Share your opening",
    desc: "Publish a job in minutes and put it in front of thousands of job seekers actively browsing JobsAbroad.",
  },
  {
    title: "Get matched applicants",
    desc: "Filter by skills, experience, and location so you only review candidates who actually fit the role.",
  },
  {
    title: "Reach out directly",
    desc: "Message, shortlist, and schedule interviews right from your dashboard — no extra tools needed.",
  },
  {
    title: "Hire with confidence",
    desc: "Verified profiles and resumes mean less guesswork, so you can make an offer knowing who you're getting.",
  },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HiringProcess() {
  return (
    <section  id="how-it-works" className="py-20 md:py-28 px-6 bg-[#F1F2F4] font-sans box-border">
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div
        className="max-w-6xl mx-auto"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-[clamp(30px,4.6vw,48px)] leading-[1.15] font-bold text-[#0A0E17] m-0">
            Manage Jobs, Applicants & Interviews in One Place
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-24 h-0.75 bg-[#004AAC] rounded-full mx-auto mt-6 origin-left"
          />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8"
        >
          {steps.map((step, i) => (
            <motion.div key={step.title} variants={item} className="text-left">
              <span className="text-[12px] font-bold text-[#004AAC] tracking-wide mb-2 inline-block">
                0{i + 1}
              </span>
              <h3 className="text-[19px] md:text-[20px] font-bold text-[#0A0E17] m-0 mb-2.5">
                {step.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-[#6B7280] font-medium m-0">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
