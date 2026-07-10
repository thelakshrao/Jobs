"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import findImg from "@/images/find.webp";
import selectImg from "@/images/select.webp";
import deliverImg from "@/images/deliver.webp";

const SLIDES = [
  {
    key: "find",
    image: findImg,
    eyebrow: "Step 1 · Find",
    title: "Find better talent, faster",
    copy: "Post a job once and reach qualified candidates across borders — not just whoever happens to apply.",
    cta: "Post a Job",
    href: "/employer/dashboard/create-job",
    bg: "linear-gradient(135deg, #001B45 0%, #004AAC 100%)",
  },
  {
    key: "select",
    image: selectImg,
    eyebrow: "Step 2 · Select",
    title: "Choose wisely, not quickly",
    copy: "Compare applicants side by side, filter by what actually matters, and shortlist with confidence.",
    cta: "Review Applicants",
    href: "/employer/dashboard/jobs",
    bg: "linear-gradient(135deg, #002559 0%, #0057C7 100%)",
  },
  {
    key: "deliver",
    image: deliverImg,
    eyebrow: "Step 3 · Deliver",
    title: "We deliver, end to end",
    copy: "Shortlisting, interview scheduling, and hiring updates — automated from the moment you post to the moment you hire.",
    cta: "See How It Works",
    href: "/employer/how-it-works",
    bg: "linear-gradient(135deg, #001438 0%, #003D94 100%)",
  },
];

export default function EmployerHeroBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[index];

  return (
    <div className="relative mb-8">
      <div
        className="relative rounded-2xl overflow-hidden transition-[background] duration-500"
        style={{ background: slide.bg }}
      >
        <div
          className="absolute -right-10 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <div
          className="absolute right-24 -top-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />

        <div
          key={slide.key}
          className="relative flex items-center px-6 sm:px-10 py-8 sm:py-9 min-h-55 animate-[fadeIn_0.5s_ease]"
        >
          <div className="min-w-0 max-w-md pr-40 sm:pr-0">
            <span
              className="inline-block text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#fff" }}
            >
              {slide.eyebrow}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-[15px] font-medium text-blue-100/80 leading-relaxed">
              {slide.copy}
            </p>
            <Link
              href={slide.href}
              className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 no-underline shadow-sm bg-white"
              style={{ color: "#004aac" }}
            >
              {slide.cta}
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>

      <div
        key={`${slide.key}-img`}
        className="hidden sm:block absolute z-20 pointer-events-none select-none animate-[fadeIn_0.5s_ease]"
        style={{
          right: "1.5rem",
          bottom: "-4px",
          width: "22rem",
          height: "38rem",
        }}
      >
        <Image
          src={slide.image}
          alt=""
          fill
          className="object-contain object-bottom"
          draggable={false}
          priority
        />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}