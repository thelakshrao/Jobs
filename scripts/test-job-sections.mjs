import assert from "node:assert/strict";
import {
  MIN_SECTIONS,
  MAX_SECTIONS,
  MAX_TITLE_LENGTH,
  MAX_BODY_LENGTH,
  newSection,
  buildPlainDescription,
  legacyToSections,
  validateSections,
} from "../src/lib/jobSections.js";

console.log("Running job sections test suite...\n");

// 1. Old job converts
{
  const oldJob = {
    description: "Build robust full-stack applications.",
    requirements: "3+ years of React and Node.js.",
    benefits: "Health insurance, 401k.",
  };
  const sections = legacyToSections(oldJob);
  assert.equal(sections.length, 3, "Old job with 3 fields should convert to 3 sections");
  assert.equal(sections[0].title, "Job description");
  assert.equal(sections[0].body, oldJob.description);
  assert.equal(sections[1].title, "Requirements");
  assert.equal(sections[1].body, oldJob.requirements);
  assert.equal(sections[2].title, "Benefits");
  assert.equal(sections[2].body, oldJob.benefits);
  assert.ok(sections[0].id && sections[1].id && sections[2].id, "Each section must have a unique id");
  console.log("✓ Check 1: Old job converts correctly");
}

// 2. Empty old job gives 2 blank sections
{
  const emptyJob = { description: "", requirements: "   ", benefits: null };
  const sections = legacyToSections(emptyJob);
  assert.equal(sections.length, 2, "Empty job should produce exactly 2 sections");
  assert.equal(sections[0].title, "");
  assert.equal(sections[0].body, "");
  assert.equal(sections[1].title, "");
  assert.equal(sections[1].body, "");
  assert.notEqual(sections[0].id, sections[1].id, "Blank sections should have distinct ids");
  console.log("✓ Check 2: Empty old job gives 2 blank sections");
}

// 3. 1 section fails validation
{
  const oneSection = [newSection("About the role", "Great work here.")];
  const errors = validateSections(oneSection);
  assert.ok(
    errors.some((e) => e.includes(`at least ${MIN_SECTIONS} sections`)),
    "Validation should fail when there are fewer than 2 sections",
  );
  console.log("✓ Check 3: 1 section fails validation (< MIN_SECTIONS)");
}

// 4. 7 sections fail validation
{
  const sevenSections = Array.from({ length: 7 }, (_, i) =>
    newSection(`Section ${i + 1}`, `Details for section ${i + 1}`),
  );
  const errors = validateSections(sevenSections);
  assert.ok(
    errors.some((e) => e.includes(`cannot have more than ${MAX_SECTIONS} sections`)),
    "Validation should fail when there are more than 6 sections",
  );
  console.log("✓ Check 4: 7 sections fail validation (> MAX_SECTIONS)");
}

// 5. Empty title fails validation
{
  const sections = [
    newSection("", "Valid body content"),
    newSection("Valid Title", "Another valid body"),
  ];
  const errors = validateSections(sections);
  assert.ok(
    errors.some((e) => e.includes("title is required")),
    "Validation should fail when section title is empty",
  );
  console.log("✓ Check 5: Empty title fails validation");
}

// 6. 61-character title fails validation
{
  const longTitle = "A".repeat(61);
  const sections = [
    newSection(longTitle, "Valid body"),
    newSection("Valid Title", "Valid body"),
  ];
  const errors = validateSections(sections);
  assert.ok(
    errors.some((e) => e.includes(`title must not exceed ${MAX_TITLE_LENGTH}`)),
    "Validation should fail when section title exceeds 60 characters",
  );
  console.log("✓ Check 6: 61-character title fails validation");
}

// 7. 5001-character body fails validation
{
  const longBody = "B".repeat(5001);
  const sections = [
    newSection("Role Summary", longBody),
    newSection("Valid Title", "Valid body"),
  ];
  const errors = validateSections(sections);
  assert.ok(
    errors.some((e) => e.includes(`body must not exceed ${MAX_BODY_LENGTH}`)),
    "Validation should fail when section body exceeds 5000 characters",
  );
  console.log("✓ Check 7: 5001-character body fails validation");
}

// 8. Plain-text output shape
{
  const sections = [
    newSection("About Us", "We build great software products."),
    newSection("Responsibilities", "1. Write clean code\n2. Collaborate with team"),
  ];
  const plainText = buildPlainDescription(sections);
  const expected = "About Us\nWe build great software products.\n\nResponsibilities\n1. Write clean code\n2. Collaborate with team";
  assert.equal(plainText, expected, "Plain text output should format Title then Body, separated by blank lines");
  console.log("✓ Check 8: Plain-text output shape matches Title\\nBody\\n\\nTitle\\nBody");
}

console.log("\nAll 8 checks passed successfully!");
