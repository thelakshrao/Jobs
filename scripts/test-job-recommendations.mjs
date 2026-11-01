import assert from "node:assert/strict";
import {
  buildProfile,
  getRecommendedJobs,
  matchTitles,
  normalizeText,
} from "../src/lib/jobRecommendations.js";

console.log("Running job recommendations test suite...\n");

// Profile as saved from the profile page in the screenshots
const user = {
  title: "Full Stack Developer",
  country: "India",
  state: "Haryana",
  city: "Jakhal",
  experiences: [],
  about: {
    isFresher: true,
    hasFreelanceExp: true,
    freelanceExperience: "1+ year",
    freelanceRole: "WEb developer",
    skills: ["React", "Node.js", "JavaScript", "MongoDB"],
    lookingForRoles: [
      "Software Developer",
      "Frontend Developer",
      "Web Developer",
      "Java Developer",
      "React Developer",
      "Full Stack Developer",
      "Backend Developer",
      "Data Analyst",
      "UI/UX Designer",
      "Python Developer",
    ],
  },
};
const profile = buildProfile(user);
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

const jobs = [
  { id: "1", title: "Frontend Developer", experienceLevel: "Entry Level (0-1 yr)", workType: "Remote", targetCountry: "India", description: "Build UI with React and JavaScript", createdAt: daysAgo(2) },
  { id: "2", title: "Software Developer", experienceLevel: "Fresher / No Experience", targetCountry: "India", description: "Node.js services", createdAt: daysAgo(5) },
  { id: "3", title: "Social Media Manager", experienceLevel: "Mid Level (2-5 yrs)", targetCountry: "India", description: "Run Instagram and content calendars", createdAt: daysAgo(1) },
  { id: "4", title: "Project Manager", experienceLevel: "Manager", targetCountry: "India", createdAt: daysAgo(1) },
  { id: "5", title: "Senior Software Engineer", experienceLevel: "Lead (8+ yrs)", description: "React Node.js JavaScript MongoDB", createdAt: daysAgo(3) },
  { id: "6", title: "Data Entry Operator", experienceLevel: "Entry Level (0-1 yr)", targetCountry: "India", createdAt: daysAgo(1) },
  { id: "7", title: "Graphic Designer", experienceLevel: "Entry Level (0-1 yr)", description: "Photoshop", createdAt: daysAgo(1) },
];

// 1. normalising
assert.equal(normalizeText("Front-End  Dev"), "frontend dev");
assert.equal(normalizeText("Node.js"), "node");
assert.equal(normalizeText("UI/UX"), "uiux");

// 2. title matching
assert.equal(matchTitles("Senior Frontend Developer", "Frontend Developer"), "exact");
assert.equal(matchTitles("Front end Engineer", "Frontend Developer"), "exact");
assert.equal(matchTitles("Social Media Manager", "Project Manager"), null);
assert.equal(matchTitles("Data Entry Operator", "Data Analyst"), "close");
assert.equal(matchTitles("Graphic Designer", "UI/UX Designer"), null);
assert.equal(matchTitles("UX Designer", "UI/UX Designer"), "exact");
assert.equal(matchTitles("Java Developer", "JavaScript Developer"), null);

// 3. recommendations
const out = getRecommendedJobs(jobs, profile);
const ids = out.map((r) => r.job.id);
console.log(out.map((r) => `${r.score}\t${r.job.title}\t${r.reason}`).join("\n"));
assert.ok(ids.includes("1"), "Frontend Developer shown");
assert.ok(ids.includes("2"), "Software Developer shown");
assert.ok(!ids.includes("3"), "Social Media Manager hidden");
assert.ok(!ids.includes("4"), "Project Manager hidden");
assert.ok(!ids.includes("7"), "Graphic Designer hidden");
assert.ok(!ids.includes("6"), "Data Entry Operator hidden");
assert.ok(ids.indexOf("1") < ids.indexOf("5") || !ids.includes("5"), "Entry job ranks above Lead job");
assert.ok(out[0].reason.startsWith("Matches your role"), "has a reason line");

// 4. profile with nothing -> nothing recommended
assert.deepEqual(getRecommendedJobs(jobs, buildProfile({})), []);

// 5. no picked roles: the profile title is used instead
const titleOnly = buildProfile({ title: "Frontend Developer", about: { isFresher: true } });
assert.ok(getRecommendedJobs(jobs, titleOnly).some((r) => r.job.id === "1"));

console.log("\nAll tests passed.");
