import { BLUE } from "./shared";

export default function AboutTab({ about }) {
  const fields = [
    { label: "Experience",      value: about.experience },
    { label: "Current Role",    value: about.currentRole },
    { label: "Expected Salary", value: about.expectedSalary },
    { label: "Availability",    value: about.availability },
    { label: "Job Preferences", value: about.jobPreferences },
  ];

  const languages = Array.isArray(about.languages)
    ? about.languages
    : about.languages
      ? about.languages.split(",").map(l => l.trim()).filter(Boolean)
      : [];

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-base font-extrabold" style={{ color: "#0f172a" }}>About Me</h3>

      {about.description
        ? <p className="text-sm font-medium leading-relaxed" style={{ color: "#1e293b" }}>{about.description}</p>
        : <p className="text-sm italic" style={{ color: "#94a3b8" }}>No description yet — click Edit Profile to add one.</p>}

      <div
        className="grid grid-cols-3 gap-x-6 gap-y-4 py-4"
        style={{ borderTop: "1.5px solid #e2e8f0", borderBottom: "1.5px solid #e2e8f0" }}
      >
        {fields.map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>{label}</p>
            {value
              ? <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>{value}</p>
              : <p className="text-sm italic" style={{ color: "#cbd5e1" }}>Not added</p>}
          </div>
        ))}

        <div className="col-span-3">
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#94a3b8" }}>Languages Known</p>
          {languages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {languages.map(lang => (
                <span key={lang}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#f1f5f9", color: "#0f172a", border: "1.5px solid #e2e8f0" }}>
                  {lang}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm italic" style={{ color: "#cbd5e1" }}>Not added</p>
          )}
        </div>
      </div>
    </div>
  );
}