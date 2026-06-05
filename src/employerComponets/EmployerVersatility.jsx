"use client";
import Image from "next/image";
import traders from "@/images/job2.webp";

export default function EmployerVersatility() {
  return (
    <section className="py-16 px-6 bg-[#f8f9fb] font-serif box-border">
      <div className="max-w-275 mx-auto">
        <div className="flex justify-between items-start mb-10 flex-wrap gap-5">
          <span className="text-[10px] tracking-[0.12em] text-slate-400 uppercase font-sans shrink-0">
            About Our Talent
          </span>
          <p className="text-[clamp(14px,1.6vw,18px)] text-slate-900 leading-relaxed max-w-130 m-0 font-normal">
            At Jobs Abroad, we don't just fill roles — we match ambition. Since
            day one, our platform has been a home for every kind of
            professional, from fresh graduates to seasoned tradespeople.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div className="bg-slate-900 rounded-[20px] p-9 flex flex-col justify-between min-h-80 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04] bg-image:[linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-size:[28px_28px]" />
            <div className="relative z-10">
              <div className="w-9.5 h-9.5 rounded-[10px] bg-white/8 flex items-center justify-center mb-6 text-[17px]">
                💻
              </div>
              <p className="text-[clamp(15px,1.6vw,20px)] leading-[1.35] font-normal text-slate-50 m-0 mb-2.5">
                Find developers, analysts, and{" "}
                <span className="text-blue-400">project leads.</span>
              </p>
              <p className="text-xs leading-relaxed m-0 text-slate-50/45 font-sans">
                Tech & Corporate talent with verified portfolios, resumes, and
                work history — ready for full-time or contract.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-8 px-3.5 py-2 bg-white/5 rounded-full w-fit border border-white/8">
              <div className="w-6 h-3.5 rounded-full bg-blue-400 relative shrink-0">
                <div className="absolute right-0.5 top-0.5 w-2.5 h-2.5 rounded-full bg-white" />
              </div>
              <span className="text-[10px] text-white/50 tracking-[0.06em] font-sans">
                Corporate Mode
              </span>
            </div>
          </div>

          <div className="rounded-[20px] overflow-hidden relative min-h-80">
            <Image
              src={traders}
              alt="Skilled Trades"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-4.5 py-2 text-white text-xs font-semibold whitespace-nowrap font-sans tracking-[0.02em]">
              Skilled Trades & Services
            </div>
            <div className="absolute bottom-5 left-5 right-5 z-10">
              <p className="text-[13px] text-white/90 m-0 leading-relaxed font-sans font-medium">
                Connect with technicians, artisans, and specialized labor.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-9 border border-slate-200 flex flex-col justify-start min-h-80">
            <div className="w-9.5 h-9.5 rounded-[10px] bg-blue-50 flex items-center justify-center mb-6 text-[17px]">
              🤝
            </div>
            <p className="text-[clamp(15px,1.6vw,20px)] leading-[1.35] font-normal text-slate-900 m-0 mb-2.5">
              Hire hospitality staff, housekeeping &{" "}
              <span className="text-blue-400">essential workers.</span>
            </p>
            <p className="text-xs leading-relaxed m-0 text-slate-500 font-sans">
              Service & Support professionals vetted and ready to join your team
              with flexible availability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
