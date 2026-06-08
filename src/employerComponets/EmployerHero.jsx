"use client";
import { useRef, useState } from "react";

export default function EmployerHero() {
  const videoRef = useRef(null);
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [experience, setExperience] = useState("");

  return (
    <div className="w-full min-h-svh bg-[#e8e7e4] px-4 md:px-10 pt-20 md:pt-16 pb-8 md:pb-16 font-sans overflow-hidden">
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div
        className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-10 mb-6 md:mb-8"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        <h1 className="text-[clamp(40px,11vw,68px)] leading-[1.05] text-[#1a1a1a] m-0 font-extrabold tracking-tight">
          Find Your Next
          <br />
          Great Hire—
          <br />
          <span className="font-light italic">In Minutes.</span>
        </h1>

        <div className="flex flex-col items-start gap-4 md:pt-2 md:max-w-70 md:shrink-0">
          <p
            className="text-[14px] md:text-sm text-[#555] leading-relaxed m-0 font-normal max-w-[320px]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Whether you need skilled software professionals or dedicated service
            staff, we connect you with the right talent for your business.
          </p>
          <a
            href="/employer/dashboard/create-job"
            className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white no-underline rounded-lg px-5 py-3 text-[13px] font-semibold tracking-wide transition-all duration-200 hover:bg-[#333] hover:-translate-y-0.5 w-full md:w-auto justify-center md:justify-start"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Post a Job for Free
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
          </a>
        </div>
      </div>

      <div className="relative w-full pb-45 md:pb-8">
        <div
          className="relative w-full rounded-4 md:rounded-[20px] overflow-hidden bg-[#222]"
          style={{ aspectRatio: "16/9" }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/vid/job1.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/5 to-black/50" />
        </div>

        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] md:w-[88%] z-10"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center md:pr-1.5">
              <div className="flex flex-col px-4 py-3.5 border-b md:border-b-0 md:border-r border-[#ebebeb] md:flex-1 hover:bg-[#f8f8f8] transition-colors cursor-pointer">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-1">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="opacity-50"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                  Job Title
                </div>
                <input
                  className="border-none outline-none text-[13.5px] text-[#1a1a1a] font-medium bg-transparent w-full p-0 placeholder:text-[#bbb] placeholder:font-normal"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                  placeholder="e.g. Frontend Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col px-4 py-3.5 border-b md:border-b-0 md:border-r border-[#ebebeb] md:flex-1 hover:bg-[#f8f8f8] transition-colors cursor-pointer">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-1">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="opacity-50"
                  >
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Location
                </div>
                <input
                  className="border-none outline-none text-[13.5px] text-[#1a1a1a] font-medium bg-transparent w-full p-0 placeholder:text-[#bbb] placeholder:font-normal"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                  placeholder="City or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="flex flex-row gap-0 md:contents">
                <div className="flex flex-col px-4 py-3.5 border-r border-[#ebebeb] flex-1 md:flex-1 hover:bg-[#f8f8f8] transition-colors cursor-pointer">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-1">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="opacity-50"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Job Type
                  </div>
                  <select
                    className="border-none outline-none text-[13.5px] text-[#1a1a1a] font-medium bg-transparent w-full p-0 cursor-pointer appearance-none"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                  >
                    <option value="" disabled hidden>
                      Full-time…
                    </option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div className="flex flex-col px-4 py-3.5 flex-1 md:flex-1 hover:bg-[#f8f8f8] transition-colors cursor-pointer">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-1">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="opacity-50"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Experience
                  </div>
                  <select
                    className="border-none outline-none text-[13.5px] text-[#1a1a1a] font-medium bg-transparent w-full p-0 cursor-pointer appearance-none"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  >
                    <option value="" disabled hidden>
                      Any level
                    </option>
                    <option value="entry">Entry (0–2 yrs)</option>
                    <option value="mid">Mid (2–5 yrs)</option>
                    <option value="senior">Senior (5–10 yrs)</option>
                    <option value="lead">Lead (10+ yrs)</option>
                  </select>
                </div>
              </div>

              <div className="p-2 md:p-0 md:pr-0 flex md:block">
                <button className="w-full md:w-11 md:h-11 h-11 bg-[#1a1a1a] border-none rounded-xl md:rounded-[10px] md:m-1.5 flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-[#333] hover:scale-105 gap-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <span className="text-white text-[13px] font-semibold md:hidden">
                    Search Jobs
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
