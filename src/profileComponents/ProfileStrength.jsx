import { IoCheckmarkCircle, IoEllipseOutline } from "react-icons/io5";
import { BLUE, BLUE_BG, BLUE_BG_HOVER, STRENGTH_ITEMS } from "./shared";

export default function ProfileStrength({ completedItems = [] }) {
  const strengthPercent = Math.round(
    (completedItems.length / STRENGTH_ITEMS.length) * 100,
  );
  return (
    <div
      className="rounded-2xl p-6 shrink-0"
      style={{
        border: "1.5px solid #f1f5f9",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        width: "300px",
      }}
    >
      <h3 className="text-base font-bold text-gray-900 mb-5">
        Profile Strength
      </h3>
      <div className="flex flex-col items-center gap-4 mb-5">
        <div className="relative" style={{ width: "110px", height: "110px" }}>
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
              stroke={BLUE}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - strengthPercent / 100)}`}
              transform="rotate(-90 55 55)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">
              {strengthPercent}%
            </span>
            <span className="text-sm font-medium text-gray-400">Good</span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-400 mb-1">
            Complete to improve your profile
          </p>
          {STRENGTH_ITEMS.map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-700">{label}</span>
              {completedItems.includes(key) ? (
                <IoCheckmarkCircle size={20} color="#22c55e" />
              ) : (
                <IoEllipseOutline size={20} color="#cbd5e1" />
              )}
            </div>
          ))}
        </div>
      </div>
      <button
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ backgroundColor: BLUE_BG, color: BLUE }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = BLUE_BG_HOVER)
        }
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BLUE_BG)}
      >
        Improve Profile
      </button>
    </div>
  );
}
