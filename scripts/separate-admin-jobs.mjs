#!/usr/bin/env node
/**
 * Keeps jobs posted from the ADMIN panel separate from EMPLOYER accounts.
 *
 * Rule: a job with postedByAdmin === true belongs to the platform, not to any
 * employer. It gets employerUid = "platform" and companyId = "platform", so it
 * can never show in an employer dashboard. The applications for those jobs get
 * the same owner, so no employer can see them either (admins still can).
 *
 * Usage (from the project folder):
 *   node scripts/separate-admin-jobs.mjs              dry run: prints the plan, writes nothing
 *   node scripts/separate-admin-jobs.mjs --confirm    applies the plan
 *
 * Safe to run more than once. It never deletes anything.
 */
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export const PLATFORM = "platform";
// The cut-off id that was hardcoded in admincreatejob/page.js
export const OLD_TRUNCATED_ID = "yQJi0KNN9EVOkzJNntMtUnV";

const short = (id) =>
  id ? `${String(id).slice(0, 6)}… (${String(id).length} chars)` : "(none)";

/** Decide what to change on one job. Returns null if it is not an admin job. */
export function planJob(data, employerNames) {
  const isAdminJob =
    data.postedByAdmin === true ||
    data.employerUid === OLD_TRUNCATED_ID ||
    data.companyId === OLD_TRUNCATED_ID;
  if (!isAdminJob) return null;

  const updates = {};
  if (data.employerUid !== PLATFORM) updates.employerUid = PLATFORM;
  if (data.companyId !== PLATFORM) updates.companyId = PLATFORM;
  const wantPostedBy = data.postedByAdminUid || PLATFORM;
  if (data.postedBy !== wantPostedBy) updates.postedBy = wantPostedBy;

  // If the owner was a REAL employer, the job was showing in that dashboard.
  const wasShownTo =
    employerNames.get(data.employerUid) ||
    employerNames.get(data.companyId) ||
    null;

  return { updates, wasShownTo };
}

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const [key, ...vals] = t.split("=");
    if (key && !process.env[key]) {
      process.env[key] = vals.join("=").replace(/^["']|["']$/g, "");
    }
  }
}

async function initAdmin() {
  const { initializeApp, cert, getApps } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  if (!getApps().length) {
    const { FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY } = process.env;
    if (!FIREBASE_ADMIN_PROJECT_ID || !FIREBASE_ADMIN_CLIENT_EMAIL || !FIREBASE_ADMIN_PRIVATE_KEY) {
      throw new Error("Missing FIREBASE_ADMIN_* values in .env.local");
    }
    initializeApp({
      credential: cert({
        projectId: FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: Buffer.from(FIREBASE_ADMIN_PRIVATE_KEY, "base64").toString("utf8"),
      }),
    });
  }
  return getFirestore();
}

async function main() {
  const confirm = process.argv.includes("--confirm");
  loadEnvLocal();
  const db = await initAdmin();

  console.log("\n========================================");
  console.log(confirm ? " Separate admin jobs: LIVE RUN" : " Separate admin jobs: DRY RUN (nothing is written)");
  console.log("========================================");
  console.log(` Target Firebase project: ${process.env.FIREBASE_ADMIN_PROJECT_ID}\n`);

  const empSnap = await db.collection("employers").get();
  const employerNames = new Map();
  empSnap.forEach((d) => employerNames.set(d.id, d.data().company || "(no name)"));

  const jobsSnap = await db.collection("jobs").get();
  const adminJobIds = [];
  const orphans = [];
  let jobsChanged = 0;
  let mixed = 0;

  console.log("==> Jobs");
  for (const doc of jobsSnap.docs) {
    const data = doc.data();
    const plan = planJob(data, employerNames);

    if (!plan) {
      if (data.employerUid && !employerNames.has(data.employerUid)) {
        orphans.push(`${doc.id} "${String(data.title || "").slice(0, 40)}" owner ${short(data.employerUid)}`);
      }
      continue;
    }

    adminJobIds.push(doc.id);
    const title = String(data.title || "").slice(0, 40);
    const changes = Object.keys(plan.updates);
    let line = `  [admin job] ${doc.id} "${title}"  owner was ${short(data.employerUid)}`;
    if (plan.wasShownTo) {
      line += `  <-- MIXED: was showing in the "${plan.wasShownTo}" employer dashboard`;
      mixed++;
    }
    line += changes.length ? `  -> set ${changes.join(", ")} to the platform` : "  (already OK)";
    console.log(line);

    if (changes.length) {
      jobsChanged++;
      if (confirm) await doc.ref.update(plan.updates);
    }
  }

  console.log("\n==> Applications to admin jobs");
  let appsChanged = 0;
  for (const jobId of adminJobIds) {
    const apps = await db.collection("applications").where("jobId", "==", jobId).get();
    for (const a of apps.docs) {
      const d = a.data();
      const updates = {};
      if (d.employerUid !== PLATFORM) updates.employerUid = PLATFORM;
      if (d.companyId !== PLATFORM) updates.companyId = PLATFORM;
      if (!Object.keys(updates).length) continue;
      appsChanged++;
      console.log(`  [application] ${a.id} (job ${jobId}) owner was ${short(d.employerUid)} -> platform`);
      if (confirm) await a.ref.update(updates);
    }
  }

  if (orphans.length) {
    console.log("\n==> Jobs with no matching employer that are NOT admin jobs (check these by hand)");
    orphans.forEach((o) => console.log("  " + o));
  }

  console.log("\n========================================");
  console.log(` Admin jobs found: ${adminJobIds.length}`);
  console.log(` Jobs ${confirm ? "changed" : "that would change"}: ${jobsChanged}`);
  console.log(` Of those, shown in an employer dashboard before: ${mixed}`);
  console.log(` Applications ${confirm ? "changed" : "that would change"}: ${appsChanged}`);
  console.log("========================================\n");
  if (!confirm) console.log(" Dry run only. Add --confirm to apply.\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error("Failed:", e.message);
    process.exit(1);
  });
}
