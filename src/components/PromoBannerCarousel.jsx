"use client";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import welcome1 from "@/images/welcome1.png";
import welcome2 from "@/images/welcome2.png";
import welcome3 from "@/images/welcome3.png";
import welcome4 from "@/images/welcome4.png";
import welcome5 from "@/images/welcome5.png";

const BANNERS = [
  {
    id: "apply",
    bg: "linear-gradient(135deg, #004AAC 0%, #0061D5 100%)",
    badge: "Ready when you are",
    title: "Find the right job and hit apply",
    subtitle:
      "We've matched roles to your profile — pick one that fits and apply in a couple of clicks.",
    cta: "Browse matched jobs",
    path: "/dashboard/jobs",
    image: welcome1,
  },
  {
    id: "premium",
    bg: "linear-gradient(135deg, #062E6F 0%, #004AAC 100%)",
    badge: "JobsAbroad Premium",
    title: "Let us do the searching for you",
    subtitle:
      "Go Premium and get hand-picked opportunities plus priority visibility with employers.",
    cta: "Explore Premium",
    path: "/dashboard/premium",
    image: welcome2,
  },
  {
    id: "consult",
    bg: "linear-gradient(135deg, #0B3D91 0%, #1C64D1 100%)",
    badge: "1:1 Career Support",
    title: "Get ready for your next interview",
    subtitle:
      "Book a one-on-one consultation with a career expert and walk in with confidence.",
    cta: "Book a consultation",
    path: "/dashboard/consultation",
    image: welcome3,
  },
  {
    id: "profile",
    bg: "linear-gradient(135deg, #004AAC 0%, #2E7BE0 100%)",
    badge: "Stand out to employers",
    title: "A complete profile gets noticed first",
    subtitle:
      "Recruiters view fully completed profiles far more often. Finish yours in minutes.",
    cta: "Complete your profile",
    path: "/dashboard/profile",
    image: welcome4,
  },
  {
    id: "new",
    bg: "linear-gradient(135deg, #043A85 0%, #0A5BC4 100%)",
    badge: "Fresh today",
    title: "New opportunities added daily",
    subtitle: "Keep an eye out — roles matching your skills are posted every day.",
    cta: "See what's new",
    path: "/dashboard/jobs",
    image: welcome5,
  },
];

function getSessionBannerIndex() {
  if (typeof window === "undefined") return 0;
  const cached = sessionStorage.getItem("promoBannerIndex");
  if (cached !== null) return Number(cached);
  const picked = Math.floor(Math.random() * BANNERS.length);
  sessionStorage.setItem("promoBannerIndex", String(picked));
  return picked;
}

export default function PromoBannerCarousel({ router, userName }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(getSessionBannerIndex());
  }, []);

  const banner = BANNERS[index];

  return (
    <div
      className="relative rounded-3xl mt-1 mb-5 overflow-hidden"
      style={{
        background: banner.bg,
        minHeight: 200,
      }}
    >
      {/* decorative blobs */}
      <div
        className="absolute -right-10 -top-10 w-56 h-56 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
      />
      <div
        className="absolute right-16 bottom-0 w-40 h-40 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
      />

      <div className="relative flex items-center px-6 py-7 md:px-14 md:py-9">
        <div className="max-w-lg pl-1 md:pl-6 relative z-10">
          <span
            className="inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-3"
            style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#fff" }}
          >
            {banner.badge}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white leading-snug mb-2">
            {userName && banner.id === "apply" ? `${userName}, ` : ""}
            {banner.title}
          </h2>
          <p className="text-sm md:text-[15px] font-medium text-white/80 mb-5">
            {banner.subtitle}
          </p>
          <button
            onClick={() => router.push(banner.path)}
            className="inline-flex items-center gap-2 bg-white text-[#004AAC] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors"
          >
            {banner.cta}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div
        className="block absolute -bottom-15 md:bottom-0 right-3 md:right-12 pointer-events-none leading-none overflow-hidden"
        style={{ height: 210 }}
      >
        <img
          src={banner.image.src || banner.image}
          alt=""
          className="block h-37.5 md:h-55 w-auto object-contain object-bottom translate-y-2"
        />
      </div>
    </div>
  );
}