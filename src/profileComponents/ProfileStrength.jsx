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
  {
    key: "desiredRoles",
    label: "Desired roles selected",
    Icon: IoBriefcaseOutline,
  },
];

function StrengthBar({ percent }) {
  const segments = [
    { color: "#ef4444", label: "Low" },
    { color: "#f97316", label: "Medium" },
    { color: "#eab308", label: "Good" },
    { color: "#22c55e", label: "Strong" },
  ];

  return (
    <div className="w-full">
      <div
        className="flex gap-0.5 rounded-full overflow-hidden"
        style={{ height: 10 }}
      >
        {segments.map((seg, i) => {
          const segStart = i * 25;
          const fill = Math.min(
            100,
            Math.max(0, ((percent - segStart) / 25) * 100),
          );
          return (
            <div
              key={i}
              className="flex-1 relative"
              style={{ backgroundColor: "#f1f5f9" }}
            >
              <div
                className="absolute inset-y-0 left-0 transition-all duration-700"
                style={{ width: `${fill}%`, backgroundColor: seg.color }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex mt-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex-1 flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[9px] font-bold" style={{ color: "#94a3b8" }}>
              {seg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfileStrength({
  completedItems = {},
  isGraduate = true,
  mobileOnly = false,
  onImprove,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isFresher = completedItems.fresher === true;

  const activeItems = STRENGTH_ITEMS.map((item) => {
    if (item.key === "experience" && isFresher) {
      return {
        ...item,
        label: "Fresher / Student",
        Icon: IoPersonOutline,
      };
    }
    return item;
  });

  const doneCount = activeItems.filter((i) => completedItems[i.key]).length;
  const total = activeItems.length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const label =
    percent === 100
      ? "Complete"
      : percent >= 75
        ? "Strong"
        : percent >= 50
          ? "Good"
          : percent >= 25
            ? "Medium"
            : "Getting started";

  const labelColor =
    percent === 100
      ? "#16a34a"
      : percent >= 75
        ? "#2563eb"
        : percent >= 50
          ? "#eab308"
          : percent >= 25
            ? "#f97316"
            : "#94a3b8";

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
            maxWidth: 300,
          }}
        >
          <h3 className="text-base font-bold text-gray-900 mb-4">
            Profile Strength
          </h3>

          <div className="flex items-end justify-between mb-3">
            <span
              className="text-3xl font-extrabold"
              style={{ color: "#0f172a" }}
            >
              {percent}%
            </span>
            <span
              className="text-sm font-bold mb-0.5"
              style={{ color: labelColor }}
            >
              {label}
            </span>
          </div>

          <div className="mb-5">
            <StrengthBar percent={percent} />
          </div>

          <CheckList />

          <button
            onClick={onImprove}
            className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
        className="lg:hidden mx-3 sm:mx-6 mb-4 rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#eff6ff", border: "1.5px solid #dbeafe" }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <div className="shrink-0" style={{ width: 48 }}>
            <span
              className="text-sm font-extrabold"
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
            <div className="mt-1.5">
              <StrengthBar percent={percent} />
            </div>
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
              className="mt-2 w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
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
