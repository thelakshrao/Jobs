import { IoCalendarOutline, IoSchoolOutline } from "react-icons/io5";

const PURPLE = "#8b5cf6";

export default function EducationTab({ educations }) {
  if (educations.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <h3 className="text-base font-extrabold" style={{ color: "#0f172a" }}>Education</h3>
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <IoSchoolOutline size={36} color="#cbd5e1" />
          <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>No education added yet.</p>
          <p className="text-xs" style={{ color: "#cbd5e1" }}>Click "Edit Profile" to add your education</p>
        </div>
      </div>
    );
  }

  const sorted = [...educations].sort((a, b) => (b.endYear || 0) - (a.endYear || 0));

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-base font-extrabold" style={{ color: "#0f172a" }}>Education</h3>
      <div className="flex flex-col gap-4">
        {sorted.map((edu, i) => (
          <div key={i} className="flex gap-4 items-start p-4 rounded-2xl"
            style={{ backgroundColor: "#fafafa", border: "1.5px solid #e2e8f0" }}>

            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: PURPLE }}>
              {edu.institution ? edu.institution.slice(0, 2).toUpperCase() : "ED"}
            </div>

            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>Degree</span>
                <p className="text-sm font-extrabold" style={{ color: "#0f172a" }}>{edu.type}</p>
              </div>

              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>Institution</span>
                <p className="text-sm font-bold" style={{ color: PURPLE }}>{edu.institution}</p>
              </div>

              {edu.stream && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>Stream</span>
                  <p className="text-sm font-semibold" style={{ color: "#1e293b" }}>{edu.stream}</p>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap mt-1">
                {(edu.startYear || edu.endYear) && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "#f5f3ff", color: PURPLE, border: "1.5px solid #ede9fe" }}>
                    <IoCalendarOutline size={11} />
                    {edu.startYear}{edu.startYear && edu.endYear ? " – " : ""}{edu.endYear}
                  </span>
                )}
                {edu.percentage && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0" }}>
                    {edu.percentage}
                  </span>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}