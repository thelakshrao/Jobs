"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import LogoEmp from "@/images/logoemp.png";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const handleHomeClick = () => {
    if (pathname === "/employer") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/employer");
    }
  };

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
    <footer
      className="bg-[#004AAC] text-white font-sans px-6 md:px-15 pt-14 pb-8"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
        <div className="md:col-span-2">
          <img
            src={LogoEmp.src}
            alt="Logo"
            className="h-15 w-auto block mb-4"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <p className="text-[13.5px] leading-relaxed text-white/70 font-medium max-w-xs">
            Connecting employers with skilled, verified talent — from tech
            professionals to essential service staff.
          </p>
        </div>
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-widest text-white/60 mb-4">
            For Employers
          </h4>
          <div className="flex flex-col gap-3 items-start">
            <button
              onClick={handleHomeClick}
              className="text-[14px] font-medium text-white/85 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 text-left"
            >
              Home
            </button>
            <button
              onClick={handlePostJobClick}
              className="text-[14px] font-medium text-white/85 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 text-left"
            >
              Post a Job
            </button>
            <button
              onClick={handleHowItWorksClick}
              className="text-[14px] font-medium text-white/85 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 text-left"
            >
              How it works
            </button>
          </div>
        </div>
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-widest text-white/60 mb-4">
            Company
          </h4>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="text-[14px] font-medium text-white/85 hover:text-white transition-colors no-underline"
            >
              Find a Job
            </Link>
            <a
              href="#"
              className="text-[14px] font-medium text-white/85 hover:text-white transition-colors no-underline"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[14px] font-medium text-white/85 hover:text-white transition-colors no-underline"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-[12.5px] text-white/60 font-medium">
          © {new Date().getFullYear()} JobsAbroad. All rights reserved.
        </span>
        <span className="text-[12.5px] text-white/60 font-medium">
          Made for employers, by JobsAbroad.
        </span>
      </div>
    </footer>
  );
}
