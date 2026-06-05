"use client";
import React from "react";

const STEPS = [
  {
    number: "01",
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
        <circle
          cx="14"
          cy="9"
          r="5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M4 23c0-5.523 4.477-10 10-10s10 4.477 10 10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Create your employer profile",
    desc: "Sign up in minutes. Add your company name, industry, and contact details — no lengthy onboarding.",
  },
  {
    number: "02",
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
        <rect
          x="4"
          y="4"
          width="20"
          height="20"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M9 14h10M9 10h6M9 18h8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Post your job requirements",
    desc: "Enter the role, location, and salary range. Your listing goes live instantly and reaches local talent.",
  },
  {
    number: "03",
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
        <rect
          x="3"
          y="5"
          width="22"
          height="18"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M3 10h22" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="9" cy="16" r="2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M14 15h7M14 18h5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Manage from your dashboard",
    desc: "Track applicants, screen profiles, and schedule interviews — all in one dedicated place.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-white font-sans py-10 px-5 flex flex-col items-center box-border">
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-blue-50 border border-sky-300 rounded-full text-[10px] font-semibold tracking-[0.06em] uppercase text-blue-400 mb-2">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1v10M1 6h10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        How it works
      </div>

      <h2 className="text-[clamp(1.1rem,2.5vw,1.6rem)] font-bold text-slate-900 tracking-tight leading-[1.12] text-center mb-1.5">
        Three steps to your first hire
      </h2>

      <p className="text-[13px] text-slate-500 leading-relaxed text-center max-w-95 mb-8">
        No training needed. Post a job, find the right person, and manage
        everything from one place.
      </p>

      <div className="w-full max-w-225 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-0">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center text-center px-2 group">
              <div className="text-[10px] font-bold tracking-[0.08em] text-sky-300 mb-2">
                {step.number}
              </div>
              <div className="w-11.5 h-11.5 rounded-2xl bg-blue-50 border border-sky-300 flex items-center justify-center text-blue-400 mb-3 transition-all duration-200 group-hover:bg-blue-100 group-hover:shadow-[0_6px_18px_rgba(59,130,246,0.15)]">
                {step.icon}
              </div>
              <div className="text-[13px] font-semibold text-slate-900 mb-2 leading-[1.3] max-w-45 sm:max-w-none">
                {step.title}
              </div>
              <p className="text-[11.5px] text-slate-500 leading-relaxed max-w-47.5 sm:max-w-none">
                {step.desc}
              </p>
            </div>

            {i < STEPS.length - 1 && (
              <div className="hidden sm:flex items-center justify-center pt-7 opacity-35">
                <svg width="60" viewBox="0 0 80 16" fill="none">
                  <line
                    x1="0"
                    y1="8"
                    x2="68"
                    y2="8"
                    stroke="#60a5fa"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                  />
                  <path
                    d="M64 3l7 5-7 5"
                    stroke="#60a5fa"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-7 flex flex-col items-center gap-2.5">
        <span className="text-xs text-slate-400 font-medium">
          Ready to get started?
        </span>

        <a
          href="#"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-blue-400 text-white border-none rounded-full px-7 py-3 font-sans text-[13px] font-semibold no-underline tracking-tight shadow-[0_4px_14px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,99,246,0.28)]"
        >
          Post a Job for Free →
        </a>
      </div>
    </section>
  );
}
