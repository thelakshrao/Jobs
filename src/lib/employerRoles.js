export const EMPLOYER_ROLES = ["Owner", "Admin", "Recruiter", "Viewer"];

export const ROLE_BADGE_STYLE = {
  Owner: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Admin: "bg-purple-50 text-purple-700 border-purple-200",
  Recruiter: "bg-blue-50 text-blue-700 border-blue-200",
  Viewer: "bg-slate-100 text-slate-600 border-slate-200",
};

export const isOwner = (role) => role === "Owner";
export const isAdmin = (role) => role === "Admin";
export const isRecruiter = (role) => role === "Recruiter";
export const isViewer = (role) => role === "Viewer";

export const canManageTeam = (role) => ["Owner", "Admin"].includes(role);

export const canEditCompany = (role) => ["Owner", "Admin"].includes(role);

export const canPostJob = (role) =>
  ["Owner", "Admin", "Recruiter"].includes(role);

export const canEditJob = (role, job, currentUid) => {
  if (["Owner", "Admin"].includes(role)) return true;
  if (role === "Recruiter") {
    // Recruiters can edit if they posted it, or if legacy doc has no postedBy
    return !job?.postedBy || job.postedBy === currentUid;
  }
  return false;
};

export const canDeleteJob = (role) => ["Owner", "Admin"].includes(role);

export const canUpdateJobStatus = (role, job, currentUid) => {
  if (["Owner", "Admin"].includes(role)) return true;
  if (role === "Recruiter") {
    return !job?.postedBy || job.postedBy === currentUid;
  }
  return false;
};

// Recruiters may still update applications for all company jobs
export const canManageApplicants = (role) =>
  ["Owner", "Admin", "Recruiter"].includes(role);

export const canViewCompanyData = (role) =>
  ["Owner", "Admin", "Recruiter", "Viewer"].includes(role);

export const assignableCompanyRoles = (actorRole) => {
  if (actorRole === "Owner") {
    return ["Admin", "Recruiter", "Viewer"];
  }
  if (actorRole === "Admin") {
    return ["Recruiter", "Viewer"];
  }
  return [];
};
