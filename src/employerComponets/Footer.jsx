"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import LogoEmp from "@/images/logoemp.png";
import PolicyPanel from "@/components/Policypanel";
import policyContent from "@/components/Policycontent";
import {
  IoCallOutline,
  IoLocationOutline,
  IoMailOutline,
} from "react-icons/io5";

const ADDRESS = "30 Eglinton Ave W, Mississauga, ON L5R 3E7, Canada";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(ADDRESS);
const PHONE_DISPLAY = "+1 437-967-3178";
const PHONE_HREF = "tel:+14379673178";
const SUPPORT_EMAIL = "support@thejobsabroad.com";
const INFO_EMAIL = "info@thejobsabroad.com";

const headingClass =
  "text-xs font-bold uppercase tracking-widest text-white/60 mb-3";
const linkClass =
  "text-sm font-medium text-white/85 hover:text-white hover:underline transition-colors";
const buttonLinkClass = `${linkClass} bg-transparent border-none cursor-pointer p-0 text-left`;

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const [activePolicy, setActivePolicy] = useState(null);

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

  const scrollToId = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer
      className="bg-[#004AAC] text-white font-sans px-6 md:px-10 pt-10 pb-5"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1.2fr] gap-8 lg:gap-10">
        {/* Brand + address */}
        <div className="flex flex-col gap-3">
          <img
            src={LogoEmp.src}
            alt="Logo"
            className="h-12 w-auto block self-start"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <p className="text-[13px] leading-relaxed text-white/70 font-medium max-w-xs">
            Connecting employers with skilled, verified talent — from tech
            professionals to essential service staff.
          </p>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 max-w-xs text-[13px] font-medium text-white/85 hover:text-white hover:underline transition-colors"
          >
            <IoLocationOutline size={18} className="mt-0.5 shrink-0" />
            <span>{ADDRESS}</span>
          </a>
        </div>

        {/* For Employers */}
        <div>
          <h4 className={headingClass}>For Employers</h4>
          <div className="flex flex-col gap-2.5 items-start">
            <button onClick={handleHomeClick} className={buttonLinkClass}>
              Home
            </button>
            <button onClick={handlePostJobClick} className={buttonLinkClass}>
              Post a Job
            </button>
            <button
              onClick={() => scrollToId("how-it-works")}
              className={buttonLinkClass}
            >
              How it works
            </button>
            <button
              onClick={() => scrollToId("contact")}
              className={buttonLinkClass}
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className={headingClass}>Company</h4>
          <div className="flex flex-col gap-2.5 items-start">
            <Link href="/dashboard" className={`${linkClass} no-underline`}>
              Find a Job
            </Link>
            <button
              onClick={() => setActivePolicy(policyContent.privacy)}
              className={buttonLinkClass}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActivePolicy(policyContent.terms)}
              className={buttonLinkClass}
            >
              Terms of Service
            </button>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className={headingClass}>Contact</h4>
          <ul className="space-y-2.5">
            <li>
              <a
                href={PHONE_HREF}
                className={`flex items-center gap-2.5 ${linkClass}`}
              >
                <IoCallOutline size={18} className="shrink-0" />
                <span>{PHONE_DISPLAY}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className={`flex items-center gap-2.5 ${linkClass}`}
              >
                <IoMailOutline size={18} className="shrink-0" />
                <span className="break-all">{SUPPORT_EMAIL}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${INFO_EMAIL}`}
                className={`flex items-center gap-2.5 ${linkClass}`}
              >
                <IoMailOutline size={18} className="shrink-0" />
                <span className="break-all">{INFO_EMAIL}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-[12px] text-white/60 font-medium">
          © {new Date().getFullYear()} JobsAbroad. All rights reserved.
        </span>
        <span className="text-[12px] text-white/60 font-medium">
          Made for employers, by JobsAbroad.
        </span>
      </div>

      <PolicyPanel content={activePolicy} onClose={() => setActivePolicy(null)} />
    </footer>
  );
}