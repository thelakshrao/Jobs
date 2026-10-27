export const MIN_SECTIONS = 2;
export const MAX_SECTIONS = 6;
export const MAX_TITLE_LENGTH = 60;
export const MAX_BODY_LENGTH = 5000;

let idCounter = 0;
export function newSection(title = "", body = "") {
  idCounter += 1;
  const uniqueId = `sec_${Date.now()}_${idCounter}_${Math.random().toString(36).slice(2, 7)}`;
  return {
    id: uniqueId,
    title,
    body,
  };
}

export function buildPlainDescription(sections = []) {
  if (!Array.isArray(sections)) return "";
  return sections
    .filter((s) => s && (s.title?.trim() || s.body?.trim()))
    .map((s) => {
      const title = (s.title || "").trim();
      const body = (s.body || "").trim();
      if (title && body) {
        return `${title}\n${body}`;
      }
      return title || body;
    })
    .join("\n\n");
}

export function legacyToSections(job = {}) {
  const sections = [];

  if (job?.description && typeof job.description === "string" && job.description.trim()) {
    sections.push(newSection("Job description", job.description.trim()));
  }
  if (job?.requirements && typeof job.requirements === "string" && job.requirements.trim()) {
    sections.push(newSection("Requirements", job.requirements.trim()));
  }
  if (job?.benefits && typeof job.benefits === "string" && job.benefits.trim()) {
    sections.push(newSection("Benefits", job.benefits.trim()));
  }

  if (sections.length === 0) {
    return [newSection(), newSection()];
  }

  return sections;
}

export function validateSections(sections) {
  const errors = [];

  if (!Array.isArray(sections) || sections.length < MIN_SECTIONS) {
    errors.push(`A job must have at least ${MIN_SECTIONS} sections.`);
  } else if (sections.length > MAX_SECTIONS) {
    errors.push(`A job cannot have more than ${MAX_SECTIONS} sections.`);
  }

  if (Array.isArray(sections)) {
    sections.forEach((sec, idx) => {
      const num = idx + 1;
      const title = (sec?.title || "").trim();
      const rawTitle = sec?.title || "";
      const body = (sec?.body || "").trim();
      const rawBody = sec?.body || "";

      if (!title) {
        errors.push(`Section ${num}: title is required.`);
      } else if (rawTitle.length > MAX_TITLE_LENGTH) {
        errors.push(`Section ${num}: title must not exceed ${MAX_TITLE_LENGTH} characters.`);
      }

      if (!body) {
        errors.push(`Section ${num}: body is required.`);
      } else if (rawBody.length > MAX_BODY_LENGTH) {
        errors.push(`Section ${num}: body must not exceed ${MAX_BODY_LENGTH} characters.`);
      }
    });
  }

  return errors;
}
