export const BLUE = "#60a5fa";
export const BLUE_DARK = "#3b82f6";
export const BLUE_BG = "#eff6ff";
export const BLUE_BG_HOVER = "#dbeafe";

export const defaultProfile = {
  name: "",
  title: "",
  bio: "",
  location: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  twitter: "",
  portfolio: "",
  openToWork: false,
  photoURL: "",
  gender: "",
};

export const defaultAbout = {
  description: "",
  experience: "",
  currentRole: "",
  expectedSalary: "",
  languages: "",
  availability: "",
  jobPreferences: "",
  skills: [],
  educationLevel: null,
  onboardingDone: false,
};

export const strengthItems = [
  { label: "Add your resume", key: "resume" },
  { label: "Add skills", key: "skills" },
  { label: "Add portfolio link", key: "portfolio" },
  { label: "Verify email", key: "email" },
  { label: "Add work experience", key: "experience" },
];

export const GRADUATE_TABS = ["About", "Experience", "Education", "Skills"];
export const SCHOOL_TABS = ["About", "Skills"];
export const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export const EXPERIENCE_OPTIONS = [
  "Fresher (0 years)",
  "Less than 1 year",
  "1+ year",
  "2+ years",
  "3+ years",
  "4+ years",
  "5+ years",
  "6+ years",
  "7+ years",
  "8+ years",
  "9+ years",
  "10+ years",
];

export const SALARY_OPTIONS = [
  "Below ₹2 LPA",
  "₹2 – 4 LPA",
  "₹4 – 6 LPA",
  "₹6 – 8 LPA",
  "₹8 – 12 LPA",
  "₹12 – 18 LPA",
  "₹18 – 25 LPA",
  "₹25 – 40 LPA",
  "₹40+ LPA",
  "Open to discussion",
];

export const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "English, Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Other",
];

export const AVAILABILITY_OPTIONS = [
  "Immediately",
  "Within 2 weeks",
  "Within 1 month",
  "Within 2 months",
  "Within 3 months",
  "Currently employed – notice period",
];

export const JOB_PREF_KEYWORDS = [
  "Remote",
  "On-site",
  "Hybrid",
  "Full-time",
  "Part-time",
  "Freelance",
  "Contract",
  "Internship",
  "Bangalore",
  "Mumbai",
  "Delhi / NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Gurgaon",
  "Noida",
  "Kolkata",
  "Any Location",
];

// Stream options - predefined list; user can also type custom
export const STREAM_OPTIONS_GRADUATE = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "MBA / Business Administration",
  "Commerce",
  "Arts / Humanities",
  "Science",
  "Law",
  "Medicine / MBBS",
  "Architecture",
  "Design",
  "Other",
];

export const EDU_TYPE_GRADUATE = [
  "10th (Matriculation)",
  "12th (Intermediate)",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD / Doctorate",
];