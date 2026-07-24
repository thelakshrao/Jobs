"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import emp1 from "@/images/emp1.webp";
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
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
export default function PostJobBanner() {
  const router = useRouter();

  const handlePostJobClick = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/employer/onboarding?redirect=create-job");
      return;
    }
    const empLoggedOut = sessionStorage.getItem("empLoggedOut");
    if (empLoggedOut === "true") {
      router.push("/employer/onboarding?mode=switch&redirect=create-job");
      return;
    }
    try {
      const empDoc = await getDoc(doc(db, "employers", user.uid));
      router.push(
        empDoc.exists()
          ? "/employer/dashboard/create-job"
          : "/employer/onboarding?redirect=create-job",
      );
    } catch (error) {
      console.error("Firestore error:", error.message);
    }
  };

  return (
    <div className="relative w-full h-90 sm:h-64 md:h-80 overflow-hidden bg-[#F1F2F4] font-sans">
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="hidden sm:block absolute right-[2%] md:right-[8%] top-1/2 -translate-y-1/2 w-75 h-75 md:w-100 md:h-100"
        style={{
          background:
            "linear-gradient(135deg, #004AAC 0%, #0561d6 55%, #2f7fe6 100%)",
          borderRadius: "42% 58% 65% 35% / 45% 40% 60% 55%",
          animation: "blobMorph 9s ease-in-out infinite",
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.4, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="hidden sm:block absolute right-[14%] md:right-[20%] top-1/2 -translate-y-1/2 w-60 h-60 md:w-[320px] md:h-80"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #004AAC 100%)",
          borderRadius: "42% 58% 65% 35% / 45% 40% 60% 55%",
          animation: "blobMorph 11s ease-in-out infinite reverse",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-[2%] sm:right-[6%] md:right-[10%] md:-bottom-3 -bottom-1 h-[45%] sm:h-full w-48 sm:w-55 md:w-75 flex items-end justify-center pointer-events-none opacity-30 sm:opacity-100"
      >
        <Image
          src={emp1}
          alt="Employer posting a job"
          className="h-[92%] w-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.18)]"
          priority
        />
      </motion.div>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-7 md:px-12 max-w-full sm:max-w-[70%] md:max-w-[52%]"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-1.5 text-[11px] md:text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#004AAC] mb-2 md:mb-3.5"
        >
          <span className="w-5 h-px bg-[#004AAC]" />
          For Employers
        </motion.span>
        <motion.h2
          variants={item}
          className="text-[24px] sm:text-[26px] md:text-[38px] leading-[1.12] font-extrabold text-[#0A0E17] mb-2 md:mb-3"
        >
          Post a job for{" "}
          <span className="text-white bg-[#004AAC] px-2.5 rounded-md whitespace-nowrap">
            free
          </span>
        </motion.h2>
        <motion.p
          variants={item}
          className="text-[13px] sm:text-[14px] md:text-[16px] leading-relaxed text-[#4b5563] font-medium mb-4 md:mb-6 max-w-70 sm:max-w-85"
        >
          Reach thousands of skilled candidates ready to work. Post your
          opening in minutes and find the best talent for your business —
          completely free.
        </motion.p>
        <motion.div variants={item}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block"
          >
            <button
              onClick={handlePostJobClick}
              className="inline-flex items-center gap-2 w-fit bg-[#0A0E17] text-white no-underline rounded-full pl-6 pr-2 py-2 md:py-2.5 text-[13.5px] md:text-[15px] font-semibold tracking-wide transition-colors duration-200 hover:bg-[#004AAC] border-none cursor-pointer"
            >
              Post a Job
              <span className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
      <style jsx>{`
        @keyframes -global-blobMorph {
          0%,
          100% {
            border-radius: 42% 58% 65% 35% / 45% 40% 60% 55%;
          }
          25% {
            border-radius: 58% 42% 35% 65% / 60% 55% 45% 40%;
          }
          50% {
            border-radius: 65% 35% 45% 55% / 40% 60% 40% 60%;
          }
          75% {
            border-radius: 35% 65% 55% 45% / 55% 45% 65% 35%;
          }
        }
      `}</style>
    </div>
  );
}