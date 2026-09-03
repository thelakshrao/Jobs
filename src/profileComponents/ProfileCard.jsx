"use client";

import {
  IoLocationOutline,
  IoMailOutline,
  IoCallOutline,
  IoLogoLinkedin,
  IoLogoGithub,
  IoGlobeOutline,
  IoLogoTwitter,
} from "react-icons/io5";
import { BLUE } from "./shared";

function InfoPill({ icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: "#64748b" }}>{icon}</span>
      <span
        className="text-[11px] sm:text-sm font-bold"
        style={{ color: "#64748b" }}
      >
        {label}:
      </span>
      <span
        className="text-xs sm:text-sm font-extrabold"
        style={{ color: "#0f172a" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ProfileCard({ profile }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: "1.5px solid #f1f5f9",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="px-4 pt-5 pb-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="shrink-0">
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt="avatar"
                className="rounded-2xl object-cover"
                style={{ width: 80, height: 80, border: "3px solid #e2e8f0" }}
              />
            ) : (
              <div
                className="rounded-2xl flex items-center justify-center font-extrabold text-white"
                style={{
                  width: 80,
                  height: 80,
                  fontSize: 28,
                  backgroundColor: BLUE,
                  border: "3px solid #e2e8f0",
                }}
              >
                {profile.name?.slice(0, 1).toUpperCase() || "?"}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h2
              className="text-base sm:text-2xl font-extrabold leading-tight"
              style={{ color: "#0f172a" }}
            >
              {profile.name || (
                <span
                  className="italic font-normal text-sm"
                  style={{ color: "#94a3b8" }}
                >
                  Your name here
                </span>
              )}
            </h2>

            {profile.title ? (
              <p className="text-xs sm:text-base font-semibold mt-0.5">
                <span className="font-bold" style={{ color: "#94a3b8" }}>
                  Role:{" "}
                </span>
                <span style={{ color: BLUE }}>{profile.title}</span>
              </p>
            ) : (
              <p
                className="text-xs font-semibold italic"
                style={{ color: "#94a3b8" }}
              >
                No job title yet
              </p>
            )}

            {profile.openToWork && (
              <span
                className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold"
                style={{
                  backgroundColor: "#f0fdf4",
                  color: "#16a34a",
                  border: "1px solid #bbf7d0",
                }}
              >
                ✓ Open to Work
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {profile.bio ? (
            <p
              className="text-xs sm:text-sm font-medium leading-relaxed"
              style={{ color: "#475569" }}
            >
              {profile.bio}
            </p>
          ) : (
            <p
              className="text-xs sm:text-sm font-semibold italic"
              style={{ color: "#94a3b8" }}
            >
              No bio added yet
            </p>
          )}

          <div className="flex flex-col gap-1 sm:gap-1.5">
            {profile.location && (
              <InfoPill
                icon={<IoLocationOutline size={12} />}
                label="Location"
                value={profile.location}
              />
            )}
            {profile.email && (
              <InfoPill
                icon={<IoMailOutline size={12} />}
                label="Email"
                value={profile.email}
              />
            )}
            {profile.phone && (
              <InfoPill
                icon={<IoCallOutline size={12} />}
                label="Phone"
                value={profile.countryCode ? `${profile.countryCode} ${profile.phone}` : profile.phone}
              />
            )}
          </div>

          {(profile.linkedin ||
            profile.github ||
            profile.portfolio ||
            profile.twitter) && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                  style={{
                    backgroundColor: "#f0f9ff",
                    color: "#0369a1",
                    border: "1px solid #bae6fd",
                  }}
                >
                  <IoLogoLinkedin size={11} /> LinkedIn
                </a>
              )}
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                  style={{
                    backgroundColor: "#f8fafc",
                    color: "#1e293b",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <IoLogoGithub size={11} /> GitHub
                </a>
              )}
              {profile.portfolio && (
                <a
                  href={profile.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                  style={{
                    backgroundColor: "#fdf4ff",
                    color: "#7e22ce",
                    border: "1px solid #e9d5ff",
                  }}
                >
                  <IoGlobeOutline size={11} /> Portfolio
                </a>
              )}
              {profile.twitter && (
                <a
                  href={profile.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                  style={{
                    backgroundColor: "#f0f9ff",
                    color: "#0284c7",
                    border: "1px solid #bae6fd",
                  }}
                >
                  <IoLogoTwitter size={11} /> Twitter
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
