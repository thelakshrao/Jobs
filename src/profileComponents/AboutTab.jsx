import { BLUE } from "./shared";

export default function AboutTab({ about }) {
  const languages = Array.isArray(about?.languages)
    ? about.languages
    : about?.languages
      ? about.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
      : [];

  return (
    <div className="flex flex-col gap-4">
      <h3
        className="text-sm sm:text-base font-bold"
        style={{ color: "#0f172a" }}
      >
        About Me
      </h3>

      {about?.description ? (
        <p
          className="text-xs sm:text-sm font-medium leading-relaxed"
          style={{ color: "#1e293b" }}
        >
          {about.description}
        </p>
      ) : (
        <p className="text-xs sm:text-sm italic" style={{ color: "#94a3b8" }}>
          No description yet — click Edit Profile to add one.
        </p>
      )}

      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4 py-3 sm:py-4"
        style={{
          borderTop: "0.5px solid #e2e8f0",
          borderBottom: "0.5px solid #e2e8f0",
        }}
      >
        {(() => {
          const isFreelanceFresher = about?.isFresher && about?.hasFreelanceExp;
          const fields = isFreelanceFresher
            ? [
                { label: "Freelance Experience", value: about?.freelanceExperience },
                { label: "Freelance Role", value: about?.freelanceRole },
                { label: "Expected Salary", value: about?.expectedSalary },
              ]
            : [
                { label: "Experience", value: about?.experience },
                { label: "Current Role", value: about?.currentRole },
                { label: "Expected Salary", value: about?.expectedSalary },
              ];

          return fields.map(({ label, value }) => (
            <div
              key={label}
              className={
                label === "Expected Salary" ? "col-span-1 sm:col-span-1" : ""
              }
            >
              <p
                className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wide mb-1"
                style={{ color: "#94a3b8" }}
              >
                {label}
              </p>
              {value ? (
                <p
                  className="text-[11px] sm:text-sm font-semibold"
                  style={{ color: "#0f172a" }}
                >
                  {value}
                </p>
              ) : (
                <p
                  className="text-[11px] sm:text-sm italic"
                  style={{ color: "#cbd5e1" }}
                >
                  Not added
                </p>
              )}
            </div>
          ));
        })()}

        <div>
          <p
            className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wide mb-1"
            style={{ color: "#94a3b8" }}
          >
            Availability
          </p>
          {about?.availability ? (
            <p
              className="text-[11px] sm:text-sm font-semibold"
              style={{ color: "#0f172a" }}
            >
              {about.availability}
            </p>
          ) : (
            <p
              className="text-[11px] sm:text-sm italic"
              style={{ color: "#cbd5e1" }}
            >
              Not added
            </p>
          )}
        </div>

        <div>
          <p
            className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wide mb-1"
            style={{ color: "#94a3b8" }}
          >
            Job Preferences
          </p>
          {about?.jobPreferences ? (
            <p
              className="text-[11px] sm:text-sm font-semibold"
              style={{ color: "#0f172a" }}
            >
              {about.jobPreferences}
            </p>
          ) : (
            <p
              className="text-[11px] sm:text-sm italic"
              style={{ color: "#cbd5e1" }}
            >
              Not added
            </p>
          )}
        </div>

        <div>
          <p
            className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wide mb-2"
            style={{ color: "#94a3b8" }}
          >
            Languages Known
          </p>
          {languages.length > 0 ? (
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold"
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#0f172a",
                    border: "0.5px solid #e2e8f0",
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>
          ) : (
            <p
              className="text-[11px] sm:text-sm italic"
              style={{ color: "#cbd5e1" }}
            >
              Not added
            </p>
          )}
        </div>
      </div>
    </div>
  );
}