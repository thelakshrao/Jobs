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
    href: "/employer/dashboard/applicants",
    bg: "linear-gradient(135deg, #002559 0%, #0057C7 100%)",
  },
  {
  key: "deliver",
  image: deliverImg,
  eyebrow: "Step 3 · Deliver",
  title: "We deliver, end to end",
  copy: "Shortlisting, interview scheduling, offer management, and hiring updates — all automated from the moment you post a job to the moment your new hire signs on. No spreadsheets, no chasing emails, no guesswork.",
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
    <div className="relative mb-8" style={{ transform: "translateZ(0)" }}>
      <div className="relative sm:pt-7">
        <div
          className="relative rounded-2xl overflow-hidden transition-[background] duration-700"
          style={{ background: slide.bg }}
        >
          <div
            className="absolute -right-10 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />

          <div className="block sm:hidden absolute z-0 pointer-events-none select-none right-0 bottom-0 w-28 h-40 opacity-90 transition-opacity duration-700">
            <Image
              src={slide.image}
              alt=""
              fill
              sizes="100px"
              className="object-contain object-bottom"
              draggable={false}
            />
          </div>

          <div className="relative flex items-center px-4 sm:px-10 py-5 sm:py-9 min-h-40 sm:min-h-55">
            <div className="relative z-10 w-full sm:max-w-md sm:pr-0">
              <span
                className="inline-block text-[9px] sm:text-[11px] font-black uppercase tracking-widest px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full mb-2 sm:mb-3 transition-opacity duration-700"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  color: "#fff",
                }}
              >
                {slide.eyebrow}
              </span>
              <h1 className="text-lg sm:text-3xl font-black text-white leading-tight mb-1 sm:mb-2 transition-opacity duration-700">
                {slide.title}
              </h1>
              <p className="text-xs sm:text-[15px] font-medium text-blue-100/80 leading-snug sm:leading-relaxed transition-opacity duration-700">
                {slide.copy}
              </p>
              {slide.cta && slide.href && (
                <Link
                  href={slide.href}
                  className="inline-flex items-center gap-1.5 mt-3 sm:mt-5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-opacity hover:opacity-90 no-underline shadow-sm bg-white"
                  style={{ color: "#004aac" }}
                >
                  {slide.cta}
                  <ArrowRight size={13} strokeWidth={2.5} />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div
          className="hidden sm:block absolute z-20 pointer-events-none select-none transition-opacity duration-700"
          style={{
            right: "1.5rem",
            top: 0,
            bottom: "-4px",
            width: "22rem",
          }}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            sizes="352px"
            className="object-contain object-bottom"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}