export default function SkillsTab({ skills = [] }) {
  if (skills.length === 0) {
    return (
      <div className="flex flex-col gap-3 sm:gap-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-900">Skills</h3>
        <p className="text-xs sm:text-sm text-gray-400 italic">
          No skills added yet — click "Edit Profile" to add skills.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <h3 className="text-sm sm:text-base font-bold text-gray-900">Skills</h3>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-50 border-[1.5px] border-slate-200 text-slate-700"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
