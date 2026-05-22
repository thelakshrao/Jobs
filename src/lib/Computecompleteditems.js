const filled = (v) => typeof v === "string" && v.trim().length > 0;
const hasItems = (arr) => Array.isArray(arr) && arr.length > 0;

export function computeCompletedItems({
  profile,
  about,
  experiences,
  educations,
  resumeURL,
}) {
  const basicInfo =
    filled(profile.name) &&
    filled(profile.title) &&
    filled(profile.location) &&
    (filled(profile.phone) || filled(profile.email));

  const aboutDone =
    filled(about.description) &&
    filled(about.experience) &&
    filled(about.expectedSalary) &&
    filled(about.availability);

  const skills = Array.isArray(about.skills) ? about.skills.length >= 3 : false;

  const experience =
    hasItems(experiences) &&
    experiences.some((e) => filled(e.title) && filled(e.company));

  const education =
    hasItems(educations) &&
    educations.some((e) => filled(e.type) && filled(e.institution));

  const links =
    filled(profile.linkedin) ||
    filled(profile.github) ||
    filled(profile.portfolio) ||
    filled(profile.twitter);

  const resume = filled(resumeURL);

  return {
    basicInfo,
    about: aboutDone,
    skills,
    experience,
    education,
    links,
    resume,
  };
}
