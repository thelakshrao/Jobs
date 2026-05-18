export default function SkillsTab({ skills = [] }) {
  if (skills.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold text-gray-900">Skills</h3>
        <p className="text-sm text-gray-300 italic">
          No skills added yet — click "Edit Profile" to add skills.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-gray-900">Skills</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              color: "#334155",
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
