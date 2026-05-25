import { BLUE, SectionCard } from "./shared";
import AboutTab from "./AboutTab";
import ExperienceTab from "./ExperienceTab";
import EducationTab from "./EducationTab";
import SkillsTab from "./SkillsTab";

const GRADUATE_TABS = ["About", "Experience", "Education", "Skills"];
const SCHOOL_TABS = ["About", "Skills"];

export default function TabsSection({
  about,
  experiences,
  educations,
  isGraduate,
  activeTab,
  setActiveTab,
  profile,
  isOwner,
}) {
  const TABS = isGraduate ? GRADUATE_TABS : SCHOOL_TABS;
  const safeTab = TABS.includes(activeTab) ? activeTab : "About";
  const skills = about.skills || [];

  return (
    <>
      <SectionCard>
        <div
          className="flex border-b overflow-x-auto"
          style={{ borderColor: "#f1f5f9", scrollbarWidth: "none" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 sm:px-5 py-3 text-sm font-semibold transition-all whitespace-nowrap shrink-0"
              style={{
                color: safeTab === tab ? BLUE : "#64748b",
                borderBottom:
                  safeTab === tab
                    ? `2px solid ${BLUE}`
                    : "2px solid transparent",
                background: "none",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {safeTab === "About" && <AboutTab about={about} />}
          {safeTab === "Experience" && (
            <ExperienceTab experiences={experiences} />
          )}
          {safeTab === "Education" && <EducationTab educations={educations} />}
          {safeTab === "Skills" && <SkillsTab skills={skills} />}
        </div>
      </SectionCard>

      {!isOwner && profile?.resume?.url && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#fff" }}
        >
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#fee2e2" }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: "#ef4444" }}
                >
                  PDF
                </span>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "#0f172a" }}>
                  {profile.resume.name || "Resume.pdf"}
                </p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  {profile.resume.size
                    ? profile.resume.size < 1024 * 1024
                      ? `${(profile.resume.size / 1024).toFixed(0)} KB`
                      : `${(profile.resume.size / (1024 * 1024)).toFixed(1)} MB`
                    : "PDF file"}
                </p>
              </div>
            </div>
            <a
              href={profile.resume.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ backgroundColor: "#60a5fa" }}
            >
              View Resume
            </a>
          </div>
        </div>
      )}
    </>
  );
}
