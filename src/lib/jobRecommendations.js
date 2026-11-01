// Recommended jobs: a plain points-based score.
//
// No Firebase and no React in this file, so the same code can move to a
// backend API later without any change.
//
// Usage:
//   const profile = buildProfile(userDocData);
//   const list = getRecommendedJobs(jobs, profile);
//   // list = [{ job, score, reason, reasons[] }, ...] best first

export const MIN_SCORE = 30;

const POINTS = {
  roleExact: 50, // job title matches a role the person picked
  roleClose: 25, // job title is close to a picked role
  historyExact: 20, // matches a past title, current title or freelance role
  historyClose: 10,
  perSkill: 5,
  maxSkills: 20,
  experienceFit: 10,
  experienceMiss: -10,
  preference: 10,
  maxRecency: 5,
};

// A job with no title match must still match at least this many skills
const SKILL_ONLY_MIN = 3;

// ---------------------------------------------------------------- text helpers

// Spellings that should count as the same word
const PHRASE_ALIASES = [
  [/\bfront[\s-]*end\b/g, "frontend"],
  [/\bback[\s-]*end\b/g, "backend"],
  [/\bfull[\s-]*stack\b/g, "fullstack"],
  [/\bui\s*\/?\s*ux\b/g, "uiux"],
  [/\bux\s*\/?\s*ui\b/g, "uiux"],
  [/\bqa\s*\/?\s*test\b/g, "qa test"],
  [/\bnode\s*js\b/g, "node"],
  [/\breact\s*js\b/g, "react"],
  [/\bnext\s*js\b/g, "next"],
  [/\bvue\s*js\b/g, "vue"],
  [/\bangular\s*js\b/g, "angular"],
  [/\bnodejs\b/g, "node"],
  [/\breactjs\b/g, "react"],
  [/\bjs\b/g, "javascript"],
  [/\bweb\s*dev\b/g, "web developer"],
];

const WORD_ALIASES = {
  ui: "uiux",
  ux: "uiux",
  programmer: "developer",
  dev: "developer",
  engineer: "developer", // "developer" and "engineer" are close
  engineering: "developer",
  development: "developer",
  developers: "developer",
  designers: "designer",
  managers: "manager",
  analysts: "analyst",
};

// Words that describe the kind of job but not the field. Two jobs are not
// related just because both say "manager" ("Social Media Manager" must not
// match "Project Manager"). Only the other words decide the field.
const GROUP_WORDS = new Set([
  "developer",
  "designer",
  "analyst",
  "scientist",
  "manager",
  "executive",
  "specialist",
  "officer",
  "associate",
  "assistant",
  "administrator",
  "consultant",
  "coordinator",
  "tester",
  "architect",
]);

// Words that carry no meaning for matching
const NOISE_WORDS = new Set([
  "senior",
  "junior",
  "sr",
  "jr",
  "lead",
  "principal",
  "trainee",
  "intern",
  "fresher",
  "entry",
  "level",
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "for",
  "in",
  "at",
  "to",
  "remote",
  "hybrid",
  "onsite",
  "i",
  "ii",
  "iii",
  "m",
  "f",
  "w",
]);

// Tech words, used so a broad "Software Developer" role is close to any
// technical developer job (and the other way round)
const TECH_WORDS = new Set([
  "frontend",
  "backend",
  "fullstack",
  "web",
  "react",
  "angular",
  "vue",
  "next",
  "node",
  "java",
  "javascript",
  "typescript",
  "python",
  "php",
  "dotnet",
  "net",
  "android",
  "ios",
  "mobile",
  "flutter",
  "devops",
  "cloud",
  "mern",
  "mean",
  "django",
  "spring",
  "golang",
  "ruby",
  "software",
]);

export function normalizeText(input) {
  let s = String(input ?? "").toLowerCase();
  s = s.replace(/c\+\+/g, "cpp").replace(/c#/g, "csharp").replace(/\.net\b/g, "dotnet");
  s = s.replace(/[^a-z0-9+\s/.-]/g, " ");
  s = s.replace(/\.js\b/g, " js"); // node.js -> node js
  for (const [re, to] of PHRASE_ALIASES) s = s.replace(re, to);
  s = s.replace(/[^a-z0-9\s]/g, " ");
  return s.replace(/\s+/g, " ").trim();
}

function tokenize(input) {
  return normalizeText(input)
    .split(" ")
    .filter(Boolean)
    .map((w) => WORD_ALIASES[w] || w);
}

// "Senior Frontend Developer" -> { specific: {frontend}, groups: {developer} }
function titleParts(title) {
  const specific = new Set();
  const groups = new Set();
  for (const w of tokenize(title)) {
    if (NOISE_WORDS.has(w)) continue;
    if (GROUP_WORDS.has(w)) groups.add(w);
    else specific.add(w);
  }
  return { specific, groups };
}

const hasTech = (set) => [...set].some((w) => TECH_WORDS.has(w));

// "exact" | "close" | null
export function matchTitles(jobTitle, role) {
  const j = titleParts(jobTitle);
  const r = titleParts(role);
  if (!j.specific.size && !j.groups.size) return null;
  if (!r.specific.size && !r.groups.size) return null;

  // Role like "Manager" with no field word: compare the kind of job only
  if (!r.specific.size) {
    return [...r.groups].some((g) => j.groups.has(g)) && !j.specific.size
      ? "exact"
      : null;
  }

  const overlap = [...r.specific].filter((w) => j.specific.has(w));
  // Same kind of job (developer / analyst ...). A job with no kind word and
  // extra field words ("Data Entry Operator" vs "Data Analyst") is not exact.
  const groupsCompatible = !r.groups.size
    ? true
    : j.groups.size
      ? [...r.groups].some((g) => j.groups.has(g))
      : j.specific.size === r.specific.size;

  if (overlap.length === r.specific.size) {
    return groupsCompatible ? "exact" : "close";
  }
  if (overlap.length > 0) return "close";

  // Broad "Software Developer" role vs any technical developer job
  const roleBroad = r.specific.size === 1 && r.specific.has("software");
  const jobBroad = j.specific.size === 1 && j.specific.has("software");
  if (roleBroad && hasTech(j.specific) && groupsCompatible) return "close";
  if (jobBroad && hasTech(r.specific) && groupsCompatible) return "close";

  return null;
}

// ------------------------------------------------------------------- the profile

const yearsBetween = (start, end) => {
  const a = new Date(start).getTime();
  const b = end ? new Date(end).getTime() : Date.now();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return 0;
  return (b - a) / (365.25 * 24 * 3600 * 1000);
};

// Reads the shape saved on users/{uid} by the profile pages.
export function buildProfile(user = {}) {
  const about = user.about || {};
  const experiences = Array.isArray(user.experiences) ? user.experiences : [];
  const clean = (arr) =>
    [...new Set((arr || []).map((s) => String(s || "").trim()).filter(Boolean))];

  const roles = clean(about.lookingForRoles);
  const historyTitles = clean([
    ...experiences.map((e) => e?.title),
    about.currentRole,
    user.title,
    about.freelanceRole,
  ]);
  const skills = clean(about.skills);

  const isFresher = about.isFresher === true;
  let years = null;
  if (isFresher) {
    years = 0;
  } else if (experiences.length) {
    years = experiences.reduce(
      (sum, e) => sum + yearsBetween(e?.startDate, e?.current ? null : e?.endDate),
      0,
    );
  } else {
    const n = parseFloat(String(about.experience || "").match(/\d+(\.\d+)?/)?.[0]);
    years = Number.isFinite(n) ? n : null;
  }

  return {
    roles,
    historyTitles,
    skills,
    isFresher,
    years,
    country: normalizeText(user.country),
    state: normalizeText(user.state),
    city: normalizeText(user.city),
    preferences: normalizeText(about.jobPreferences),
  };
}

export function profileHasSignal(profile) {
  return !!(profile && (profile.roles.length || profile.historyTitles.length));
}

// ----------------------------------------------------------------- the job text

function jobText(job) {
  const parts = [
    job.title,
    job.department,
    job.industry,
    job.description,
    job.requirements,
    job.benefits,
  ];
  if (Array.isArray(job.skills)) parts.push(job.skills.join(" "));
  if (Array.isArray(job.detailSections)) {
    for (const s of job.detailSections) parts.push(s?.title, s?.body);
  }
  return ` ${normalizeText(parts.filter(Boolean).join(" "))} `;
}

function toDate(v) {
  if (!v) return null;
  if (typeof v?.toDate === "function") return v.toDate();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ------------------------------------------------------------------- experience

// [min, max] years that each level in EXP_LEVELS stands for
function levelRange(level) {
  const s = String(level || "").toLowerCase();
  if (!s) return null;
  if (/fresher|no experience/.test(s)) return [0, 0];
  if (/entry|0-1|intern/.test(s)) return [0, 1];
  if (/junior|1-2/.test(s)) return [1, 2];
  if (/mid|2-5/.test(s)) return [2, 5];
  if (/senior|5-8/.test(s)) return [5, 8];
  if (/lead|8\+/.test(s)) return [8, 20];
  if (/manager|director|vp|c-suite/.test(s)) return [6, 30];
  return null;
}

function experiencePoints(job, profile) {
  const range = levelRange(job.experienceLevel);
  if (!range || profile.years == null) return 0;
  const [min, max] = range;
  const gap = profile.years < min ? min - profile.years : profile.years > max ? profile.years - max : 0;
  if (gap === 0) return POINTS.experienceFit;
  if (gap <= 1) return 0;
  if (gap <= 2) return Math.round(POINTS.experienceMiss / 2);
  return POINTS.experienceMiss;
}

// ------------------------------------------------------------------ preferences

function preferencePoints(job, profile) {
  const jobCountry = normalizeText(job.targetCountry);
  const jobLocation = normalizeText(job.location);
  const workType = normalizeText(job.workType);

  if (profile.country && jobCountry && jobCountry === profile.country) return POINTS.preference;
  if (profile.city && jobLocation && jobLocation.includes(profile.city)) return POINTS.preference;
  if (profile.state && jobLocation && jobLocation.includes(profile.state)) return POINTS.preference;
  if (workType && profile.preferences && profile.preferences.includes(workType)) return POINTS.preference;
  return 0;
}

function recencyPoints(job) {
  const d = toDate(job.publishedAt || job.createdAt);
  if (!d) return 0;
  const days = (Date.now() - d.getTime()) / 86400000;
  if (days <= 3) return POINTS.maxRecency;
  if (days <= 7) return 4;
  if (days <= 14) return 3;
  if (days <= 30) return 2;
  if (days <= 60) return 1;
  return 0;
}

// ---------------------------------------------------------------------- scoring

function bestMatch(jobTitle, candidates) {
  let best = { level: null, value: null };
  for (const c of candidates) {
    const level = matchTitles(jobTitle, c);
    if (level === "exact") return { level, value: c };
    if (level === "close" && best.level !== "close") best = { level, value: c };
  }
  return best;
}

export function scoreJob(job, profile) {
  let score = 0;
  const reasons = [];

  // 1. Roles the person picked. If none, the titles from the profile are used.
  const roleList = profile.roles.length ? profile.roles : profile.historyTitles;
  const role = bestMatch(job.title, roleList);
  let titleSignal = false;
  if (role.level) {
    titleSignal = true;
    score += role.level === "exact" ? POINTS.roleExact : POINTS.roleClose;
    reasons.push(
      role.level === "exact"
        ? `Matches your role: ${role.value}`
        : `Close to your role: ${role.value}`,
    );
  }

  // 2. Past titles, current title and freelance role (only when roles were picked)
  if (profile.roles.length) {
    const hist = bestMatch(job.title, profile.historyTitles);
    if (hist.level) {
      titleSignal = true;
      score += hist.level === "exact" ? POINTS.historyExact : POINTS.historyClose;
      if (!role.level) reasons.push(`Similar to your experience: ${hist.value}`);
    }
  }

  // 3. Skills found in the job text
  const text = jobText(job);
  const matchedSkills = [];
  for (const skill of profile.skills) {
    const norm = normalizeText(skill);
    if (norm.length < 2) continue;
    if (text.includes(` ${norm} `)) matchedSkills.push(skill);
  }
  score += Math.min(matchedSkills.length * POINTS.perSkill, POINTS.maxSkills);
  if (matchedSkills.length) {
    reasons.push(`Skills match: ${matchedSkills.slice(0, 3).join(", ")}`);
  }

  // A job that is only a "close" title match must also match a skill
  // ("Data Entry Operator" must not appear for a Data Analyst role)
  const strongTitle =
    role.level === "exact" ||
    (profile.roles.length > 0 &&
      bestMatch(job.title, profile.historyTitles).level === "exact");
  if (titleSignal && !strongTitle && matchedSkills.length === 0) {
    return { job, score: 0, reason: "", reasons: [], matchedSkills };
  }

  // Without any title match, only a strong skill overlap can qualify
  if (!titleSignal && matchedSkills.length < SKILL_ONLY_MIN) {
    return { job, score: 0, reason: "", reasons: [], matchedSkills };
  }

  // 4. Experience level, 5. preferences, 6. newer jobs
  const exp = experiencePoints(job, profile);
  score += exp;
  if (exp > 0) reasons.push("Fits your experience level");

  const pref = preferencePoints(job, profile);
  score += pref;
  if (pref > 0) reasons.push("Matches your location or work preference");

  score += recencyPoints(job);

  return {
    job,
    score,
    reason: reasons[0] || "",
    reasons,
    matchedSkills,
  };
}

export function getRecommendedJobs(jobs, profile, minScore = MIN_SCORE) {
  if (!Array.isArray(jobs) || !profileHasSignal(profile)) return [];
  const time = (j) => (toDate(j.publishedAt || j.createdAt)?.getTime() || 0);
  return jobs
    .map((job) => scoreJob(job, profile))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score || time(b.job) - time(a.job));
}
