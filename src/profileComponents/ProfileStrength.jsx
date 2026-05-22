"use client";

import { useState } from "react";
import {
  IoCheckmarkCircle,
  IoEllipseOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoPersonOutline,
  IoDocumentTextOutline,
  IoBulbOutline,
  IoBriefcaseOutline,
  IoSchoolOutline,
  IoLinkOutline,
  IoCloudUploadOutline,
} from "react-icons/io5";
import { BLUE, BLUE_BG, BLUE_BG_HOVER } from "./shared";

export const STRENGTH_ITEMS = [
  { key: "basicInfo", label: "Basic info filled", Icon: IoPersonOutline },
  {
    key: "about",
    label: "About section complete",
    Icon: IoDocumentTextOutline,
  },
  { key: "skills", label: "Skills added", Icon: IoBulbOutline },
  {
    key: "experience",
    label: "Work experience added",
    Icon: IoBriefcaseOutline,
  },
  { key: "education", label: "Education added", Icon: IoSchoolOutline },
  { key: "links", label: "Social / portfolio links", Icon: IoLinkOutline },
  { key: "resume", label: "Resume uploaded", Icon: IoCloudUploadOutline },
];

export default function ProfileStrength({
  completedItems = {},
  isGraduate = true,
  mobileOnly = false,
  onImprove, 
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItems = isGraduate
    ? STRENGTH_ITEMS
    : STRENGTH_ITEMS.filter(
        (i) => i.key !== "experience" && i.key !== "education",
      );

  const doneCount = activeItems.filter((i) => completedItems[i.key]).length;
  const total = activeItems.length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const label =
    percent === 100
      ? "Complete"
      : percent >= 70
        ? "Strong"
        : percent >= 40
          ? "Good"
          : "Getting started";

  const labelColor =
    percent === 100
      ? "#16a34a"
      : percent >= 70
        ? "#2563eb"
        : percent >= 40
          ? "#f59e0b"
          : "#94a3b8";

  const ringColor =
    percent === 100
      ? "#22c55e"
      : percent >= 70
        ? BLUE
        : percent >= 40
          ? "#f59e0b"
          : "#cbd5e1";

  const CheckList = ({ small = false }) => (
    <div className="w-full flex flex-col gap-2">
      <p
        className={`font-medium text-gray-400 mb-1 ${small ? "text-[11px]" : "text-xs"}`}
      >
        {percent === 100
          ? "Your profile is fully complete!"
          : "Complete all fields to boost your profile"}
      </p>
      {activeItems.map(({ label: lbl, key, Icon }) => {
        const done = !!completedItems[key];
        return (
          <div key={key} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Icon
                size={small ? 13 : 15}
                color={done ? "#22c55e" : "#94a3b8"}
                style={{ flexShrink: 0 }}
              />
              <span
                className={`${small ? "text-xs" : "text-sm"} font-medium`}
                style={{ color: done ? "#0f172a" : "#64748b" }}
              >
                {lbl}
              </span>
            </div>
            {done ? (
              <IoCheckmarkCircle size={small ? 16 : 20} color="#22c55e" />
            ) : (
              <IoEllipseOutline size={small ? 16 : 20} color="#cbd5e1" />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {!mobileOnly && (
        <div
          className="hidden lg:block rounded-2xl p-5 shrink-0 w-full"
          style={{
            border: "1.5px solid #f1f5f9",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            maxWidth: "300px",
          }}
        >
          <h3 className="text-base font-bold text-gray-900 mb-5">
            Profile Strength
          </h3>

          <div className="flex flex-col items-center gap-4 mb-5">
            <div className="relative" style={{ width: 110, height: 110 }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle
                  cx="55"
                  cy="55"
                  r="46"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="9"
                />
                <circle
                  cx="55"
                  cy="55"
                  r="46"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - percent / 100)}`}
                  transform="rotate(-90 55 55)"
                  style={{
                    transition: "stroke-dashoffset 0.6s ease, stroke 0.4s",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {percent}%
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: labelColor }}
                >
                  {label}
                </span>
              </div>
            </div>
            <CheckList />
          </div>

          <button
            onClick={onImprove}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
            style={{ backgroundColor: BLUE_BG, color: BLUE }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = BLUE_BG_HOVER)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = BLUE_BG)
            }
          >
            Improve Profile ›
          </button>
        </div>
      )}

      <div
        className="lg:hidden mb-4 rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#eff6ff", border: "1.5px solid #dbeafe" }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
            <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="#dbeafe"
                strokeWidth="4"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke={ringColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - percent / 100)}`}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center text-xs font-extrabold"
              style={{ color: "#0f172a" }}
            >
              {percent}%
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#0f172a" }}>
              Profile Strength ·{" "}
              <span style={{ color: labelColor }}>{label}</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#3b82f6" }}>
              {mobileOpen ? "Tap to close" : "Tap to see what's pending"}
            </p>
          </div>

          <div
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#dbeafe" }}
          >
            {mobileOpen ? (
              <IoChevronUpOutline size={16} color={BLUE} />
            ) : (
              <IoChevronDownOutline size={16} color={BLUE} />
            )}
          </div>
        </div>

        {mobileOpen && (
          <div
            className="px-4 pb-4 pt-3 flex flex-col gap-2"
            style={{ borderTop: "1.5px solid #dbeafe" }}
          >
            <CheckList small />
            <button
              onClick={onImprove}
              className="mt-2 w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1"
              style={{ backgroundColor: BLUE_BG, color: BLUE }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = BLUE_BG_HOVER)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = BLUE_BG)
              }
            >
              Improve Profile ›
            </button>
          </div>
        )}
      </div>
    </>
  );
}
