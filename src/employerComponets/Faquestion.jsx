"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import EmpNavbar from "@/employerComponets/EmpNavbar";

const faqs = [
  {
    question: "How do I create an Jobs Abroad for Employers account for free?",
    answer:
      "Click 'Post a Job' to get started. Creating an account is free and gives you access to the Employer Dashboard to manage your recruitment.",
  },
];

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-6 py-6 text-left bg-transparent border-none cursor-pointer"
      >
        <span className="text-[16px] md:text-[17px] font-semibold text-[#0A0E17] leading-snug">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 mt-1 text-slate-500"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[14px] md:text-[15px] leading-relaxed text-slate-600 font-medium max-w-xl">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HowItWorksPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <EmpNavbar />
      <div
        className="h-100 bg-white px-6 md:px-15 pt-10 md:pt-15 pb-15"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h1 className="text-[clamp(32px,5vw,48px)] leading-[1.1] font-extrabold text-[#0A0E17] mb-4">
              Frequently Asked
              <br />
              Questions
            </h1>
            <span className="block w-14 h-0.75 bg-[#004AAC] rounded-full" />
          </div>

          <div>
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                faq={faq}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}