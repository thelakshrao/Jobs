"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import EmpNavbar from "@/employerComponets/EmpNavbar";

const faqs = [
  {
    question: "How do I create an Jobs Abroad for Employers account for free?",
    answer:
      "Click 'Post a Job' to get started. Creating an account is free and gives you access to the Employer Dashboard to manage your recruitment.",
  },
  {
    question: "How much does it cost to post a job?",
    answer:
      "Posting a job on Jobs Abroad is completely free. You can publish your opening in minutes and start reaching skilled candidates without any upfront cost.",
  },
  {
    question: "What kind of talent can I find on this platform?",
    answer:
      "We connect you with tech & corporate professionals, skilled trades & service technicians, and hospitality, housekeeping, and essential support staff — all with verified profiles and work history.",
  },
  {
    question: "How do I manage applicants once I post a job?",
    answer:
      "Once your job is live, you can filter applicants by skills, experience, and location right from your Employer Dashboard, so you only review candidates who genuinely fit the role.",
  },
  {
    question: "Can I message and schedule interviews directly with candidates?",
    answer:
      "Yes. You can message, shortlist, and schedule interviews directly from your dashboard — no need for any extra tools or third-party apps.",
  },
  {
    question: "Are candidate profiles and resumes verified?",
    answer:
      "Yes, we verify candidate profiles and resumes so you can make hiring decisions with confidence and less guesswork about who you're actually getting.",
  },
  {
    question: "How long does it take for my job posting to go live?",
    answer:
      "Your job posting goes live within minutes of submission, putting it in front of thousands of job seekers actively browsing Jobs Abroad right away.",
  },
  {
    question: "Can I edit or close a job posting after publishing it?",
    answer:
      "Yes. You can edit job details or close a posting anytime from your Employer Dashboard — useful once you've found the right candidate or need to update the role.",
  },
];

function FaqItem({ faq, isOpen, onToggle, itemRef }) {
  return (
    <div ref={itemRef} className="border-b border-slate-200">
      <button
        type="button"
        // Prevents the button from receiving focus on click, which is what
        // causes the browser to auto-scroll the whole page to it.
        onMouseDown={(e) => e.preventDefault()}
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
  const scrollContainerRef = useRef(null);
  const itemRefs = useRef([]);

  const handleToggle = (i) => {
    const willOpen = openIndex !== i;
    setOpenIndex(willOpen ? i : -1);

    if (willOpen) {
      // Scroll ONLY the inner panel, after the expand animation settles,
      // so the opened question + answer land near the top and a couple
      // more collapsed questions remain visible below it.
      setTimeout(() => {
        const container = scrollContainerRef.current;
        const item = itemRefs.current[i];
        if (container && item) {
          const targetTop = item.offsetTop - container.offsetTop;
          container.scrollTo({ top: targetTop, behavior: "smooth" });
        }
      }, 320);
    }
  };

  return (
    <>
      <EmpNavbar />
      <div
        className="bg-white px-6 md:px-15 pt-10 md:pt-15 pb-15"
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

          <div
            ref={scrollContainerRef}
            className="h-115 overflow-y-auto overflow-x-hidden overscroll-contain pr-2 scroll-smooth [scrollbar-thin] [scrollbar-color:#cbd5e1_transparent]"
          >
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                faq={faq}
                isOpen={openIndex === i}
                onToggle={() => handleToggle(i)}
                itemRef={(el) => (itemRefs.current[i] = el)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}