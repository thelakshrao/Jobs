import { BLUE, SectionCard } from "./shared";
import AboutTab      from "./AboutTab";
import ExperienceTab from "./ExperienceTab";
import EducationTab  from "./EducationTab";
import SkillsTab     from "./SkillsTab";

const GRADUATE_TABS = ["About", "Experience", "Education", "Skills"];
const SCHOOL_TABS   = ["About", "Skills"];

export default function TabsSection({
  about,
  experiences,
  educations,
  isGraduate,
  activeTab,
  setActiveTab,
}) {
  const TABS     = isGraduate ? GRADUATE_TABS : SCHOOL_TABS;
  const safeTab  = TABS.includes(activeTab) ? activeTab : "About";
  const skills   = about.skills || [];

  return (
    <SectionCard>
      <div className="flex border-b" style={{ borderColor: "#f1f5f9" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-3 text-sm font-semibold transition-all"
            style={{
              color: safeTab === tab ? BLUE : "#64748b",
              borderBottom: safeTab === tab ? `2px solid ${BLUE}` : "2px solid transparent",
              background: "none",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {safeTab === "About"      && <AboutTab      about={about} />}
        {safeTab === "Experience" && <ExperienceTab experiences={experiences} />}
        {safeTab === "Education"  && <EducationTab  educations={educations} />}
        {safeTab === "Skills"     && <SkillsTab     skills={skills} />}
      </div>
    </SectionCard>
  );
}
