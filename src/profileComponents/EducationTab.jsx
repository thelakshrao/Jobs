import { IoCalendarOutline, IoSchoolOutline } from "react-icons/io5";

const PURPLE = "#8b5cf6";

function gradeLabel(value) {
  if (!value) return null;
  const str = value.toString().trim();
  const num = parseFloat(str);
  if (!isNaN(num) && num <= 10 && !str.includes("%")) {
    return { label: "CGPA", display: str };
  }
  return { label: "%", display: str.replace("%", "") + "%" };
}

export default function EducationTab({ educations }) {
  if (!educations || educations.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <h3 className="text-sm sm:text-base font-bold" style={{ color: "#0f172a" }}>
          Education
        </h3>
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <IoSchoolOutline size={36} color="#cbd5e1" />
          <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
            No education added yet.
          </p>
          <p className="text-xs" style={{ color: "#cbd5e1" }}>
            Click "Edit Profile" to add your education
          </p>
        </div>
      </div>
    );
  }

  const sorted = [...educations].sort(
    (a, b) => (b.endYear || 0) - (a.endYear || 0),
  );

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-sm sm:text-base font-bold" style={{ color: "#0f172a" }}>
        Education
      </h3>
      <div className="flex flex-col gap-4">
        {sorted.map((edu, i) => {
          const grade = gradeLabel(edu.percentage);
          return (
            <div key={i}
              className="flex gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-2xl"
              style={{ backgroundColor: "#fafafa", border: "1.5px solid #e2e8f0" }}
            >
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: PURPLE }}
              >
                {edu.institution ? edu.institution.slice(0, 2).toUpperCase() : "ED"}
              </div>

              <div className="flex-1 min-w-0">

                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-0.5">
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                    Degree
                  </span>
                  <p className="text-[11px] sm:text-sm font-extrabold" style={{ color: "#0f172a" }}>
                    {edu.type}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-0.5">
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                    Institution
                  </span>
                  <p className="text-[11px] sm:text-sm font-bold" style={{ color: PURPLE }}>
                    {edu.institution}
                  </p>
                </div>

                {edu.stream && (
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1.5">
                    <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                      Stream
                    </span>
                    <p className="text-[11px] sm:text-sm font-semibold" style={{ color: "#1e293b" }}>
                      {edu.stream}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mt-1">

                  {(edu.startYear || edu.endYear) && (
                    <span
                      className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold"
                      style={{ backgroundColor: "#f5f3ff", color: PURPLE, border: "1.5px solid #ede9fe" }}
                    >
                      <IoCalendarOutline size={10} />
                      {edu.startYear && edu.endYear
                        ? `${edu.startYear} – ${edu.endYear}`
                        : edu.startYear
                          ? `From ${edu.startYear}`
                          : `Until ${edu.endYear}`}
                    </span>
                  )}
                  {grade && (
                    <span
                      className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold"
                      style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0" }}
                    >
                      <span
                        className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide"
                        style={{ color: "#86efac" }}
                      >
                        {grade.label}
                      </span>
                      {grade.display}
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}