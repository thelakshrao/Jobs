"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import emphero from "@/images/emphero.jpg";
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
export default function EmployerHero() {
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

  const handleHowItWorksClick = () => {
    const section = document.getElementById("how-it-works");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative w-full min-h-svh overflow-hidden bg-[#0a0e17]">
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <Image src={emphero} alt="" fill priority className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/20" />
      <div className="absolute inset-0 bg-linear-to-r from-black/30 via-black/10 to-transparent" />
      <div
        className="relative z-10 flex flex-col min-h-svh px-5 md:px-12"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col justify-center pb-16 md:pb-24 max-w-2xl"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white/70 mb-5"
          >
            <span className="w-6 h-px bg-[#4d8fdc]" />
            For Employers
          </motion.span>
          <motion.h1
            variants={item}
            className="text-[clamp(36px,7vw,64px)] leading-[1.08] text-white font-extrabold tracking-tight mb-2"
          >
            Find Your Next
          </motion.h1>
          <motion.h1
            variants={item}
            className="text-[clamp(36px,7vw,64px)] leading-[1.08] text-white font-extrabold tracking-tight mb-6 flex items-center gap-4"
          >
            Great Hire
            <span className="hidden sm:block w-16 h-px bg-white/30" />
          </motion.h1>
          <motion.p
            variants={item}
            className="text-white/40 text-2xl md:text-3xl font-light italic -mt-4 mb-7"
          >
            in minutes.
          </motion.p>
          <motion.p
            variants={item}
            className="text-white/70 text-[15px] leading-relaxed font-normal max-w-md mb-9"
          >
            Whether you need skilled software professionals or dedicated service
            staff, we connect you with the right talent for your business.
          </motion.p>
          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                onClick={handlePostJobClick}
                className="inline-flex items-center gap-2 bg-[#004AAC] text-white no-underline rounded-full pl-6 pr-2 py-2 text-[14px] font-semibold tracking-wide transition-colors duration-200 hover:bg-[#00368a] border-none cursor-pointer"
              >
                Post a Job for Free
                <motion.span
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.span>
              </button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                onClick={handleHowItWorksClick}
                className="inline-flex items-center gap-2 text-white text-[14px] font-semibold border border-white/30 rounded-full px-6 py-3 hover:bg-white/10 transition-colors bg-transparent cursor-pointer"
              >
                How it works
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
