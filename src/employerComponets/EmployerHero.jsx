"use client";
import { useRef } from "react";

export default function EmployerHero() {
  const videoRef = useRef(null);

  return (
    <section className="relative h-svh min-h-120 overflow-hidden font-serif">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover bg-black/20"
      >
        <source src="/vid/job1.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/60 to-black/80" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5">
        <h1 className="text-[clamp(26px,5.5vw,76px)] font-normal leading-[1.15] text-white mb-3.5 tracking-tight max-w-205 [text-shadow:0_2px_24px_rgba(0,0,0,0.3)]">
          Find Your Next Great Hire—
          <br />
          In Minutes.
        </h1>

        <p className="text-[clamp(12px,1.6vw,16px)] text-white/80 max-w-120 leading-relaxed mb-7 font-normal [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">
          Whether you need skilled software professionals or dedicated service
          staff, we connect you with the right talent for your business.
        </p>

        <a
          href="/post-job"
          className="inline-flex items-center gap-2 px-7 py-2.75 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/35 rounded-full text-white text-[13px] font-semibold tracking-wide no-underline transition-all duration-200 hover:-translate-y-0.5"
        >
          Post a Job for Free
        </a>
      </div>

      <div className="absolute bottom-5 left-5 z-10 flex flex-col gap-1">
        <div className="flex">
          {["bg-slate-200", "bg-slate-300", "bg-slate-400"].map((bg, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full border-2 border-white/60 ${bg} ${i > 0 ? "-ml-2" : ""}`}
            />
          ))}
        </div>
        <p className="text-[10px] text-white/70 leading-snug m-0">
          10,000+ candidates ready
          <br />
          <span className="text-white/50">to join your team today</span>
        </p>
      </div>
    </section>
  );
}
