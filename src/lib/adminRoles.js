export const TOP_TIER = ["Founder", "Co-Founder", "Developer"];
export const MID_TIER = ["Managing Head", "Technical Head"];
export const UNIQUE_ROLES = ["Founder", "Co-Founder", "Developer"];
export const ALL_ROLES = [...TOP_TIER, ...MID_TIER, "Staff"];

const toArray = (roles) => (Array.isArray(roles) ? roles : roles ? [roles] : []);

export const isTopTier = (roles = []) =>
  toArray(roles).some((r) => TOP_TIER.includes(r));

export const isMidTier = (roles = []) =>
  toArray(roles).some((r) => MID_TIER.includes(r));

export const canManage = (actorRoles = [], targetRoles = []) => {
  if (isTopTier(actorRoles)) return true;
  if (isMidTier(actorRoles)) {
    return !isTopTier(targetRoles) && !isMidTier(targetRoles);
  }
  return false;
};

export const canAdd = (actorRoles = []) =>
  isTopTier(actorRoles) || isMidTier(actorRoles);

export const assignableRoles = (actorRoles = [], takenUniqueRoles = []) => {
  if (isTopTier(actorRoles)) {
    return ALL_ROLES.filter((r) => !UNIQUE_ROLES.includes(r) || !takenUniqueRoles.includes(r));
  }
  if (isMidTier(actorRoles)) {
    return ["Staff"];
  }
  return [];
};

export function generatePasscode(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function generateEmployeeId(existingIds = []) {
  const nums = existingIds
    .map((id) => parseInt((id || "").replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `JA-${String(next).padStart(4, "0")}`;
}