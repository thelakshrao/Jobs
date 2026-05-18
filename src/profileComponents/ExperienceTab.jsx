import {
  IoCalendarOutline,
  IoLocationSharp,
  IoBriefcaseOutline,
} from "react-icons/io5";
import { BLUE } from "./shared";

export default function ExperienceTab({ experiences }) {
  if (experiences.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <h3 className="text-base font-extrabold" style={{ color: "#0f172a" }}>
          Work Experience
        </h3>
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <IoBriefcaseOutline size={36} color="#cbd5e1" />
          <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
            No work experience added yet.
          </p>
          <p className="text-xs" style={{ color: "#cbd5e1" }}>
            Click "Edit Profile" to add your experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-base font-extrabold" style={{ color: "#0f172a" }}>
        Work Experience
      </h3>
      <div className="flex flex-col gap-4">
        {experiences.map((exp, i) => (
          <div
            key={i}
            className="flex gap-4 items-start p-4 rounded-2xl"
            style={{
              backgroundColor: "#fafafa",
              border: "1.5px solid #e2e8f0",
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: BLUE }}
            >
              {exp.company ? exp.company.slice(0, 2).toUpperCase() : "CO"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: "#94a3b8" }}
                >
                  Role
                </span>
                <p
                  className="text-sm font-extrabold"
                  style={{ color: "#0f172a" }}
                >
                  {exp.title}
                </p>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: "#94a3b8" }}
                >
                  Company
                </span>
                <p className="text-sm font-bold" style={{ color: BLUE }}>
                  {exp.company}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {(exp.startDate || exp.endDate || exp.current) && (
                  <span
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: "#eff6ff",
                      color: "#3b82f6",
                      border: "1.5px solid #dbeafe",
                    }}
                  >
                    <IoCalendarOutline size={11} />
                    {exp.startDate}
                    {exp.startDate && (exp.endDate || exp.current) ? " – " : ""}
                    {exp.current ? "Present" : exp.endDate}
                  </span>
                )}
                {exp.location && (
                  <span
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: "#f8fafc",
                      color: "#475569",
                      border: "1.5px solid #e2e8f0",
                    }}
                  >
                    <IoLocationSharp size={11} />
                    {exp.location}
                  </span>
                )}
              </div>

              {exp.description && (
                <ul className="mt-3 flex flex-col gap-1 pl-1">
                  {exp.description
                    .split("\n")
                    .filter(Boolean)
                    .map((line, li) => (
                      <li
                        key={li}
                        className="flex items-start gap-2 text-sm font-medium"
                        style={{ color: "#1e293b" }}
                      >
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: BLUE }}
                        />
                        {line.replace(/^[•\-]\s*/, "")}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
