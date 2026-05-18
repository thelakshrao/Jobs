import {
  IoLocationOutline,
  IoMailOutline,
  IoCallOutline,
  IoLogoLinkedin,
  IoLogoGithub,
  IoGlobeOutline,
  IoLogoTwitter,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoAddOutline,
  IoTrashOutline,
  IoPencilOutline,
} from "react-icons/io5";
import {
  BLUE,
  Field,
  NativeSelect,
  StreamField,
  KeywordPicker,
  BtnPrimary,
  BtnGhost,
  PlaceholderRow,
  GENDERS,
  EXPERIENCE_OPTIONS,
  SALARY_OPTIONS,
  LANGUAGE_OPTIONS,
  AVAILABILITY_OPTIONS,
  EDU_TYPE_GRADUATE,
} from "./shared";

function MiniExpRow({ exp, onEdit, onDelete }) {
  return (
    <div
      className="flex gap-3 items-start p-3 rounded-xl mb-2"
      style={{ backgroundColor: "#f8fafc", border: "1.5px solid #f1f5f9" }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ backgroundColor: BLUE }}
      >
        {exp.company ? exp.company.slice(0, 2).toUpperCase() : "CO"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{exp.title}</p>
        <p className="text-xs font-semibold" style={{ color: BLUE }}>
          {exp.company}
        </p>
        <p className="text-xs font-semibold" style={{ color: "#64748b" }}>
          {exp.startDate
            ? new Date(exp.startDate).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : ""}
          {exp.startDate && (exp.endDate || exp.current) ? " – " : ""}
          {exp.current
            ? "Present"
            : exp.endDate
              ? new Date(exp.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : ""}
          {exp.location ? ` · ${exp.location}` : ""}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onEdit}
          style={{ color: "#94a3b8" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = BLUE)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          <IoPencilOutline size={14} />
        </button>
        <button
          onClick={onDelete}
          style={{ color: "#94a3b8" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          <IoTrashOutline size={14} />
        </button>
      </div>
    </div>
  );
}

function MiniEduRow({ edu, onEdit, onDelete }) {
  return (
    <div
      className="flex gap-3 items-start p-3 rounded-xl mb-2"
      style={{ backgroundColor: "#f8fafc", border: "1.5px solid #f1f5f9" }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ backgroundColor: "#8b5cf6" }}
      >
        {edu.institution ? edu.institution.slice(0, 2).toUpperCase() : "ED"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{edu.type}</p>
        <p className="text-xs text-gray-600">{edu.institution}</p>
        {edu.stream && (
          <p className="text-xs font-medium" style={{ color: "#8b5cf6" }}>
            {edu.stream}
          </p>
        )}
        <p className="text-xs font-semibold" style={{ color: "#64748b" }}>
          {edu.startYear}
          {edu.startYear && edu.endYear ? " – " : ""}
          {edu.endYear}
          {edu.percentage ? ` · ${edu.percentage}` : ""}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onEdit}
          style={{ color: "#94a3b8" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = BLUE)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          <IoPencilOutline size={14} />
        </button>
        <button
          onClick={onDelete}
          style={{ color: "#94a3b8" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          <IoTrashOutline size={14} />
        </button>
      </div>
    </div>
  );
}

function ExpForm({ value, onChange, onSave, onCancel }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 mb-2"
      style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#fafafa" }}
    >
      <div className="flex gap-3">
        <Field
          label="Job Title / Role"
          value={value.title || ""}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Full Stack Developer"
        />
        <Field
          label="Company Name"
          value={value.company || ""}
          onChange={(e) => onChange({ ...value, company: e.target.value })}
          placeholder="TechCorp Solutions"
        />
      </div>
      <div className="flex gap-3">
        <Field
          label="Job Location"
          value={value.location || ""}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
          placeholder="Bangalore, India"
        />
        <input
          type="month"
          value={value.startDate || ""}
          onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          className="rounded-xl px-3 py-2 text-sm outline-none flex-1"
          style={{ border: "1.5px solid #e2e8f0", color: "#0f172a" }}
        />

        <input
          type="month"
          value={value.endDate || ""}
          onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          disabled={value.current}
          className="rounded-xl px-3 py-2 text-sm outline-none flex-1"
          style={{
            border: "1.5px solid #e2e8f0",
            color: value.current ? "#94a3b8" : "#0f172a",
            backgroundColor: value.current ? "#f8fafc" : "#fff",
          }}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={!!value.current}
          onChange={(e) =>
            onChange({ ...value, current: e.target.checked, endDate: "" })
          }
          className="accent-blue-400 w-4 h-4"
        />
        I currently work here
      </label>
      <Field
        as="textarea"
        label="Job Description"
        value={value.description || ""}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder={
          "• Developed scalable web applications using MERN stack.\n• Collaborated with cross-functional teams."
        }
        rows={3}
      />
      <div className="flex gap-2">
        <BtnPrimary small onClick={onSave}>
          <IoCheckmarkOutline size={12} /> Save
        </BtnPrimary>
        <button
          onClick={onCancel}
          className="text-xs font-medium px-3 py-1.5 rounded-lg"
          style={{ color: "#64748b", backgroundColor: "#f1f5f9" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function EduForm({ value, onChange, onSave, onCancel }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 mb-2"
      style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#fafafa" }}
    >
      <div className="flex gap-3">
        <NativeSelect
          label="Education Type"
          value={value.type || ""}
          onChange={(e) => onChange({ ...value, type: e.target.value })}
          options={EDU_TYPE_GRADUATE}
        />
        <Field
          label="College / School / University"
          value={value.institution || ""}
          onChange={(e) => onChange({ ...value, institution: e.target.value })}
          placeholder="Delhi Technological University"
        />
      </div>
      <div className="flex gap-3">
        <StreamField
          label="Stream / Branch"
          value={value.stream || ""}
          onChange={(v) => onChange({ ...value, stream: v })}
        />
        <Field
          label="Start Year"
          value={value.startYear || ""}
          onChange={(e) => onChange({ ...value, startYear: e.target.value })}
          placeholder="2019"
        />
        <Field
          label="End Year"
          value={value.endYear || ""}
          onChange={(e) => onChange({ ...value, endYear: e.target.value })}
          placeholder="2023"
        />
        <Field
          label="Percentage / CGPA"
          value={value.percentage || ""}
          onChange={(e) => onChange({ ...value, percentage: e.target.value })}
          placeholder="8.5 CGPA"
        />
      </div>
      <div className="flex gap-2">
        <BtnPrimary small onClick={onSave}>
          <IoCheckmarkOutline size={12} /> Save
        </BtnPrimary>
        <button
          onClick={onCancel}
          className="text-xs font-medium px-3 py-1.5 rounded-lg"
          style={{ color: "#64748b", backgroundColor: "#f1f5f9" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Divider({ title, action }) {
  return (
    <div
      className="flex items-center justify-between pt-4 pb-2 mt-1"
      style={{ borderTop: "1.5px solid #f1f5f9" }}
    >
      <p className="text-sm font-bold text-gray-700">{title}</p>
      {action}
    </div>
  );
}

export default function ProfileCard({
  profile,
  form,
  setForm,
  editing,
  aboutForm,
  setAboutForm,
  experiences,
  educations,
  isGraduate,
  editSection,
  setEditSection,
  expForm,
  setExpForm,
  eduForm,
  setEduForm,
  skills,
  onAddSkill,
  onDeleteSkill,
  skillInput,
  setSkillInput,
  saveExpToFirebase,
  saveEduToFirebase,
}) {
  const handleSaveExp = () => {
    const key = editSection;
    if (key === "exp-new") saveExpToFirebase([...experiences, expForm]);
    else {
      const i = parseInt(key.replace("exp-", ""));
      saveExpToFirebase(experiences.map((e, idx) => (idx === i ? expForm : e)));
    }
  };
  const handleSaveEdu = () => {
    const key = editSection;
    if (key === "edu-new") saveEduToFirebase([...educations, eduForm]);
    else {
      const i = parseInt(key.replace("edu-", ""));
      saveEduToFirebase(educations.map((e, idx) => (idx === i ? eduForm : e)));
    }
  };

  if (!editing) {
    return (
      <div
        className="rounded-2xl p-8 flex-1"
        style={{
          border: "1.5px solid #e2e8f0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex items-start gap-8">
          <div className="relative shrink-0">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
              style={{ backgroundColor: BLUE }}
            >
              {profile.name ? profile.name[0].toUpperCase() : "?"}
            </div>
            {profile.openToWork && (
              <span
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "#dcfce7",
                  color: "#16a34a",
                  whiteSpace: "nowrap",
                  border: "1.5px solid #bbf7d0",
                }}
              >
                Open to work
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-3">
              <h2
                className="text-xl font-extrabold"
                style={{ color: "#0f172a" }}
              >
                {profile.name || "Your Name"}
              </h2>
              {profile.gender && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#f1f5f9", color: "#334155" }}
                >
                  {profile.gender}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: "#94a3b8" }}
              >
                Role
              </span>
              <span className="text-sm font-bold" style={{ color: BLUE }}>
                {profile.title || "—"}
              </span>
            </div>

            <div className="flex items-center gap-5 flex-wrap">
              <span
                className="flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "#1e293b" }}
              >
                <IoLocationOutline size={15} style={{ color: BLUE }} />
                {profile.location || "Add location"}
              </span>
              {profile.email && (
                <span
                  className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "#1e293b" }}
                >
                  <IoMailOutline size={15} style={{ color: BLUE }} />
                  {profile.email}
                </span>
              )}
              {profile.phone && (
                <span
                  className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "#1e293b" }}
                >
                  <IoCallOutline size={15} style={{ color: BLUE }} />
                  {profile.phone}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: "#94a3b8" }}
              >
                BIO
              </span>
              <p
                className="text-sm font-medium leading-relaxed"
                style={{ color: "#1e293b" }}
              >
                {profile.bio || "Add a short bio to introduce yourself…"}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-1">
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = BLUE;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.color = "#1e293b";
                  }}
                >
                  <IoLogoLinkedin size={18} />
                </a>
              )}
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = BLUE;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.color = "#1e293b";
                  }}
                >
                  <IoLogoGithub size={18} />
                </a>
              )}
              {profile.twitter && (
                <a
                  href={profile.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = BLUE;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.color = "#1e293b";
                  }}
                >
                  <IoLogoTwitter size={18} />
                </a>
              )}
              {profile.portfolio && (
                <a
                  href={profile.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = BLUE;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.color = "#1e293b";
                  }}
                >
                  <IoGlobeOutline size={18} />
                </a>
              )}
              {!profile.linkedin &&
                !profile.github &&
                !profile.twitter &&
                !profile.portfolio && (
                  <p className="text-sm italic" style={{ color: "#94a3b8" }}>
                    Add social links…
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-8 flex-1"
      style={{
        border: "1.5px solid #f1f5f9",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shrink-0"
            style={{ backgroundColor: BLUE }}
          >
            {form.name ? form.name[0].toUpperCase() : "?"}
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex gap-3">
              <Field
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Lakshay Yadav"
              />
              <Field
                label="Job Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Full Stack Developer"
              />
              <NativeSelect
                label="Gender"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                options={GENDERS}
              />
            </div>
            <Field
              as="textarea"
              label="Bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Passionate developer with 2+ years…"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Field
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Bangalore, India"
          />
          <Field
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@email.com"
          />
          <Field
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="flex gap-3">
          <Field
            label="LinkedIn URL"
            value={form.linkedin}
            onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            placeholder="linkedin.com/in/you"
          />
          <Field
            label="GitHub URL"
            value={form.github}
            onChange={(e) => setForm({ ...form, github: e.target.value })}
            placeholder="github.com/you"
          />
          <Field
            label="Twitter URL"
            value={form.twitter}
            onChange={(e) => setForm({ ...form, twitter: e.target.value })}
            placeholder="twitter.com/you"
          />
          <Field
            label="Portfolio URL"
            value={form.portfolio}
            onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
            placeholder="yoursite.com"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setForm({ ...form, openToWork: !form.openToWork })}
            className="w-10 h-6 rounded-full transition-all flex items-center px-1"
            style={{ backgroundColor: form.openToWork ? "#22c55e" : "#e2e8f0" }}
          >
            <div
              className="w-4 h-4 rounded-full bg-white transition-all"
              style={{
                transform: form.openToWork
                  ? "translateX(16px)"
                  : "translateX(0)",
              }}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">
            Open to work
          </span>
        </div>

        <Divider
          title="About Me"
          action={
            editSection !== "about" && (
              <button
                onClick={() => setEditSection("about")}
                className="text-xs font-medium flex items-center gap-1"
                style={{ color: BLUE }}
              >
                <IoPencilOutline size={12} /> Edit
              </button>
            )
          }
        />
        {editSection === "about" ? (
          <div
            className="flex flex-col gap-3 p-4 rounded-2xl"
            style={{
              backgroundColor: "#fafafa",
              border: "1.5px solid #e2e8f0",
            }}
          >
            <Field
              as="textarea"
              label="Description"
              value={aboutForm.description}
              onChange={(e) =>
                setAboutForm({ ...aboutForm, description: e.target.value })
              }
              placeholder="I am a Full Stack Developer…"
              rows={2}
            />
            <div className="grid grid-cols-3 gap-3">
              <NativeSelect
                label="Experience"
                value={aboutForm.experience}
                onChange={(e) =>
                  setAboutForm({ ...aboutForm, experience: e.target.value })
                }
                options={EXPERIENCE_OPTIONS}
                placeholder="Select experience"
              />
              <Field
                label="Current Role"
                value={aboutForm.currentRole}
                onChange={(e) =>
                  setAboutForm({ ...aboutForm, currentRole: e.target.value })
                }
                placeholder="Full Stack Developer"
              />
              <NativeSelect
                label="Expected Salary"
                value={aboutForm.expectedSalary}
                onChange={(e) =>
                  setAboutForm({ ...aboutForm, expectedSalary: e.target.value })
                }
                options={SALARY_OPTIONS}
                placeholder="Select range"
              />
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: "#64748b" }}
                >
                  Languages Known
                </label>
                <div
                  className="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-10.5"
                  style={{
                    border: "1.5px solid #e2e8f0",
                    backgroundColor: "#fff",
                  }}
                >
                  {(Array.isArray(aboutForm.languages)
                    ? aboutForm.languages
                    : aboutForm.languages
                      ? aboutForm.languages
                          .split(",")
                          .map((l) => l.trim())
                          .filter(Boolean)
                      : []
                  ).map((lang) => (
                    <span
                      key={lang}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: "#f1f5f9",
                        color: "#0f172a",
                        border: "1.5px solid #e2e8f0",
                      }}
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => {
                          const c = Array.isArray(aboutForm.languages)
                            ? aboutForm.languages
                            : aboutForm.languages
                                .split(",")
                                .map((l) => l.trim())
                                .filter(Boolean);
                          setAboutForm({
                            ...aboutForm,
                            languages: c.filter((l) => l !== lang),
                          });
                        }}
                        style={{ color: "#94a3b8" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#ef4444")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#94a3b8")
                        }
                      >
                        <IoCloseOutline size={11} />
                      </button>
                    </span>
                  ))}
                  <input
                    placeholder="Type & press Enter…"
                    className="text-xs outline-none flex-1 min-w-30 bg-transparent"
                    style={{ color: "#0f172a" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        e.preventDefault();
                        const c = Array.isArray(aboutForm.languages)
                          ? aboutForm.languages
                          : aboutForm.languages
                            ? aboutForm.languages
                                .split(",")
                                .map((l) => l.trim())
                                .filter(Boolean)
                            : [];
                        if (!c.includes(e.target.value.trim()))
                          setAboutForm({
                            ...aboutForm,
                            languages: [...c, e.target.value.trim()],
                          });
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              </div>
              <NativeSelect
                label="Availability"
                value={aboutForm.availability}
                onChange={(e) =>
                  setAboutForm({ ...aboutForm, availability: e.target.value })
                }
                options={AVAILABILITY_OPTIONS}
                placeholder="Select availability"
              />
              <KeywordPicker
                label="Job Preferences"
                value={aboutForm.jobPreferences}
                onChange={(e) =>
                  setAboutForm({ ...aboutForm, jobPreferences: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2 pt-1">
              <BtnPrimary small onClick={() => setEditSection(null)}>
                <IoCheckmarkOutline size={12} /> Done
              </BtnPrimary>
              <button
                onClick={() => setEditSection(null)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ color: "#64748b", backgroundColor: "#f1f5f9" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-4 gap-y-4">
            <div className="col-span-3 flex flex-col gap-1">
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: "#94a3b8" }}
              >
                Description
              </p>
              <p
                className="text-sm font-semibold"
                style={{
                  color: aboutForm.description ? "#0f172a" : "#cbd5e1",
                  fontStyle: aboutForm.description ? "normal" : "italic",
                }}
              >
                {aboutForm.description || "Add a short description…"}
              </p>
            </div>
            {[
              {
                label: "Experience",
                val: aboutForm.experience,
                placeholder: "e.g. 2+ years",
              },
              {
                label: "Current Role",
                val: aboutForm.currentRole,
                placeholder: "e.g. Full Stack Developer",
              },
              {
                label: "Expected Salary",
                val: aboutForm.expectedSalary,
                placeholder: "e.g. ₹8–12 LPA",
              },
              {
                label: "Languages Known",
                val: Array.isArray(aboutForm.languages)
                  ? aboutForm.languages.join(", ")
                  : aboutForm.languages,
                placeholder: "e.g. English, Hindi",
              },
              {
                label: "Availability",
                val: aboutForm.availability,
                placeholder: "e.g. Immediately",
              },
              {
                label: "Job Preferences",
                val: aboutForm.jobPreferences,
                placeholder: "e.g. Remote, Full-time",
              },
            ].map(({ label, val, placeholder }) => (
              <div
                key={label}
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-wide mb-1"
                  style={{ color: "#94a3b8" }}
                >
                  {label}
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: val ? "#0f172a" : "#cbd5e1",
                    fontStyle: val ? "normal" : "italic",
                  }}
                >
                  {val || placeholder}
                </p>
              </div>
            ))}
          </div>
        )}

        {isGraduate && (
          <>
            <Divider
              title="Work Experience"
              action={
                editSection !== "exp-new" && (
                  <button
                    onClick={() => {
                      setExpForm({
                        title: "",
                        company: "",
                        location: "",
                        startDate: "",
                        endDate: "",
                        current: false,
                        description: "",
                      });
                      setEditSection("exp-new");
                    }}
                    className="text-xs font-medium flex items-center gap-1"
                    style={{ color: BLUE }}
                  >
                    <IoAddOutline size={12} /> Add
                  </button>
                )
              }
            />
            {editSection === "exp-new" && (
              <ExpForm
                value={expForm}
                onChange={setExpForm}
                onSave={handleSaveExp}
                onCancel={() => {
                  setExpForm({});
                  setEditSection(null);
                }}
              />
            )}
            {experiences.length === 0 && editSection !== "exp-new" && (
              <p className="text-sm text-gray-300 italic -mt-2">
                No experience added yet.
              </p>
            )}
            {experiences.map((exp, i) =>
              editSection === `exp-${i}` ? (
                <ExpForm
                  key={i}
                  value={expForm}
                  onChange={setExpForm}
                  onSave={handleSaveExp}
                  onCancel={() => {
                    setExpForm({});
                    setEditSection(null);
                  }}
                />
              ) : (
                <MiniExpRow
                  key={i}
                  exp={exp}
                  onEdit={() => {
                    setExpForm(exp);
                    setEditSection(`exp-${i}`);
                  }}
                  onDelete={() =>
                    saveExpToFirebase(experiences.filter((_, idx) => idx !== i))
                  }
                />
              ),
            )}
          </>
        )}

        {isGraduate && (
          <>
            <Divider
              title="Education · most recent first"
              action={
                editSection !== "edu-new" && (
                  <button
                    onClick={() => {
                      setEduForm({
                        type: "",
                        institution: "",
                        stream: "",
                        startYear: "",
                        endYear: "",
                        percentage: "",
                      });
                      setEditSection("edu-new");
                    }}
                    className="text-xs font-medium flex items-center gap-1"
                    style={{ color: BLUE }}
                  >
                    <IoAddOutline size={12} /> Add
                  </button>
                )
              }
            />
            {editSection === "edu-new" && (
              <EduForm
                value={eduForm}
                onChange={setEduForm}
                onSave={handleSaveEdu}
                onCancel={() => {
                  setEduForm({});
                  setEditSection(null);
                }}
              />
            )}
            {educations.length === 0 && editSection !== "edu-new" && (
              <p className="text-sm text-gray-300 italic -mt-2">
                No education added yet.
              </p>
            )}
            {educations.map((edu, i) =>
              editSection === `edu-${i}` ? (
                <EduForm
                  key={i}
                  value={eduForm}
                  onChange={setEduForm}
                  onSave={handleSaveEdu}
                  onCancel={() => {
                    setEduForm({});
                    setEditSection(null);
                  }}
                />
              ) : (
                <MiniEduRow
                  key={i}
                  edu={edu}
                  onEdit={() => {
                    setEduForm(edu);
                    setEditSection(`edu-${i}`);
                  }}
                  onDelete={() =>
                    saveEduToFirebase(educations.filter((_, idx) => idx !== i))
                  }
                />
              ),
            )}
          </>
        )}

        <Divider title="Skills" />
        <div className="flex flex-wrap gap-1.5 -mt-2 mb-1">
          {skills.length === 0 && (
            <p className="text-sm text-gray-300 italic">No skills added yet.</p>
          )}
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                color: "#334155",
              }}
            >
              {skill}
              <button
                onClick={() => onDeleteSkill(skill)}
                style={{ color: "#94a3b8", lineHeight: 1 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
              >
                <IoCloseOutline size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddSkill()}
            placeholder="e.g. React.js, Node.js…"
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              border: "1.5px solid #e2e8f0",
              color: "#0f172a",
              width: "220px",
            }}
          />
          <BtnPrimary small onClick={onAddSkill}>
            <IoAddOutline size={12} /> Add
          </BtnPrimary>
        </div>
      </div>
    </div>
  );
}
