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

// Must match firestore.rules: Owner/Admin edit any company job; a Recruiter
// edits only jobs they posted. (Run the migration first so old jobs have
// postedBy. There are no Recruiters before the team feature exists.)
export const canEditJob = (role, job, currentUid) => {
  if (["Owner", "Admin"].includes(role)) return true;
  if (role === "Recruiter") return !!job?.postedBy && job.postedBy === currentUid;
  return false;
};

export const canDeleteJob = (role) => ["Owner", "Admin"].includes(role);

export const canUpdateJobStatus = (role, job, currentUid) =>
  canEditJob(role, job, currentUid);

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

// ---------------------------------------------------------------------------
// Member management rules. Plain functions with no browser code, so the same
// checks can run in the UI AND in the server API routes (firebase-admin).
// The server must always re-check; the UI check is only for hiding buttons.
// ---------------------------------------------------------------------------

// A member can act only if not suspended and not banned.
export const isActiveMember = (emp) =>
  !!emp && emp.status !== "suspended" && emp.banned !== true;

// members: every member doc of the company, e.g. [{ uid, companyRole, status }]
export const countActiveOwners = (members = []) =>
  members.filter((m) => m.companyRole === "Owner" && m.status !== "suspended")
    .length;

// Can `actor` change `target`'s role to `newRole`?
export const canChangeMemberRole = (actor, target, newRole, members = []) => {
  if (!isActiveMember(actor) || !canManageTeam(actor.companyRole)) return false;
  if (!EMPLOYER_ROLES.includes(newRole) || newRole === "Owner") return false;
  if (target.uid === actor.uid) return false; // nobody edits their own role
  // Only an Owner can touch another Owner, and the last Owner can never be demoted.
  if (target.companyRole === "Owner") {
    if (actor.companyRole !== "Owner") return false;
    if (countActiveOwners(members) <= 1) return false;
  }
  return assignableCompanyRoles(actor.companyRole).includes(newRole);
};

// Suspend / reactivate / remove share the same protections.
export const canSuspendMember = (actor, target, members = []) => {
  if (!isActiveMember(actor) || !canManageTeam(actor.companyRole)) return false;
  if (target.uid === actor.uid) return false;
  if (target.companyRole === "Owner") {
    if (actor.companyRole !== "Owner") return false;
    if (countActiveOwners(members) <= 1) return false;
  }
  // An Admin cannot act on another Admin; only an Owner can.
  if (target.companyRole === "Admin" && actor.companyRole !== "Owner") return false;
  return true;
};

export const canRemoveMember = canSuspendMember;
