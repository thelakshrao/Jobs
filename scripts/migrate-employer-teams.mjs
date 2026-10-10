#!/usr/bin/env node
/**
 * Migration Script: Foundation for Employer Team Management
 *
 * Usage:
 *   node scripts/migrate-employer-teams.mjs --dry-run
 *   node scripts/migrate-employer-teams.mjs
 *   node scripts/migrate-employer-teams.mjs --service-account=path/to/serviceAccountKey.json
 *
 * What it does (Idempotent - safe to run multiple times):
 * 1. Backfills "employers" documents:
 *    - Sets companyId = doc.id (if missing)
 *    - Sets companyRole = "Owner" (if missing)
 *    - Sets status = "active" (if missing)
 * 2. Backfills "companies" collection:
 *    - Creates companies/{companyId} copying ONLY public company-level fields:
 *      (company, website, logo/profilePicture, description, industry, location, verified)
 *    - Never copies personal fields (firstName, lastName, email, phone, dialCode, consent flags, banned, uid)
 * 3. Backfills "jobs":
 *    - Sets companyId = employerUid || doc.id (if missing)
 *    - Sets employerUid = companyId
 *    - Sets postedBy = employerUid (if missing)
 *    - Sets applicants = 0 (if missing)
 * 4. Backfills "projects":
 *    - Sets companyId = employerUid || doc.id (if missing)
 *    - Sets employerUid = companyId
 *    - Sets postedBy = employerUid (if missing)
 *    - Sets applicants = 0 (if missing)
 * 5. Backfills "applications":
 *    - Sets companyId = employerUid (if missing)
 * 6. Backfills "conversations":
 *    - Finds employer participant and backfills companyId and companyName (if missing)
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

const isDryRun = process.argv.includes("--dry-run");

// Parse service account arg if provided
const saArg = process.argv.find((arg) => arg.startsWith("--service-account="));
const saPath = saArg ? saArg.split("=")[1] : null;

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...vals] = trimmed.split("=");
      if (key && !process.env[key]) {
        process.env[key] = vals.join("=").replace(/^["']|["']$/g, "");
      }
    }
  }
}

loadEnvLocal();

function initAdmin() {
  if (getApps().length) return getFirestore();

  if (saPath && fs.existsSync(saPath)) {
    const sa = JSON.parse(fs.readFileSync(saPath, "utf-8"));
    initializeApp({ credential: cert(sa) });
    return getFirestore();
  }

  if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    const privateKey = Buffer.from(
      process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      "base64",
    ).toString("utf8");
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    });
    return getFirestore();
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp();
    return getFirestore();
  }

  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
    return getFirestore();
  }

  throw new Error(
    "Could not initialize firebase-admin. Please provide --service-account=path/to/key.json or set GOOGLE_APPLICATION_CREDENTIALS.",
  );
}

async function runMigration() {
  console.log(`\n========================================`);
  console.log(` Starting Employer Teams Migration`);
  console.log(` Mode: ${isDryRun ? "DRY RUN (No writes)" : "LIVE EXECUTION"}`);
  console.log(`========================================\n`);

  const db = initAdmin();

  // 1. Migrate employers
  console.log("==> Step 1: Scanning 'employers' collection...");
  const employersSnap = await db.collection("employers").get();
  let employersUpdated = 0;
  const employerMap = new Map(); // uid -> data

  for (const doc of employersSnap.docs) {
    const data = doc.data();
    employerMap.set(doc.id, { id: doc.id, ...data });

    const updates = {};
    if (!data.companyId) updates.companyId = doc.id;
    if (!data.companyRole) updates.companyRole = "Owner";
    if (!data.status) updates.status = "active";

    if (Object.keys(updates).length > 0) {
      employersUpdated++;
      console.log(`  [employers/${doc.id}] Add: ${JSON.stringify(updates)}`);
      if (!isDryRun) {
        await doc.ref.set(updates, { merge: true });
      }
    }
  }
  console.log(
    `  Scanned ${employersSnap.size} employers. ${employersUpdated} needed backfill.\n`,
  );

  // 2. Backfill companies
  console.log("==> Step 2: Backfilling 'companies' collection...");
  let companiesCreated = 0;
  for (const [uid, emp] of employerMap.entries()) {
    const companyId = emp.companyId || uid;
    // Only create company doc for owners or primary companyId
    if (emp.companyRole && emp.companyRole !== "Owner" && companyId !== uid) {
      continue;
    }

    const companyDocRef = db.collection("companies").doc(companyId);
    const existingCompSnap = await companyDocRef.get();

    if (!existingCompSnap.exists) {
      companiesCreated++;
      // Copy ONLY public company-level fields
      const companyPayload = {
        company: emp.company || emp.companyName || "",
        website: emp.website || "",
        logo:
          emp.profilePicture ||
          emp.profilePhoto ||
          emp.logo ||
          emp.photoURL ||
          "",
        description: emp.description || "",
        industry: emp.industry || "",
        location: emp.location || "",
        verified: Boolean(emp.verified),
        createdAt: emp.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log(
        `  [companies/${companyId}] Create: ${JSON.stringify(companyPayload)}`,
      );
      if (!isDryRun) {
        await companyDocRef.set(companyPayload);
      }
    }
  }
  console.log(`  Created ${companiesCreated} missing company documents.\n`);

  // 3. Migrate jobs
  console.log("==> Step 3: Scanning 'jobs' collection...");
  const jobsSnap = await db.collection("jobs").get();
  let jobsUpdated = 0;

  for (const doc of jobsSnap.docs) {
    const data = doc.data();
    const updates = {};

    const targetCompanyId = data.companyId || data.employerUid || doc.id;
    if (!data.companyId) updates.companyId = targetCompanyId;
    if (data.employerUid !== targetCompanyId)
      updates.employerUid = targetCompanyId;
    if (!data.postedBy) updates.postedBy = data.employerUid || null;
    if (data.applicants === undefined || data.applicants === null) {
      updates.applicants = 0;
    }

    if (Object.keys(updates).length > 0) {
      jobsUpdated++;
      console.log(`  [jobs/${doc.id}] Add: ${JSON.stringify(updates)}`);
      if (!isDryRun) {
        await doc.ref.set(updates, { merge: true });
      }
    }
  }
  console.log(
    `  Scanned ${jobsSnap.size} jobs. ${jobsUpdated} needed backfill.\n`,
  );

  // 4. Migrate projects
  console.log("==> Step 4: Scanning 'projects' collection...");
  const projectsSnap = await db.collection("projects").get();
  let projectsUpdated = 0;

  for (const doc of projectsSnap.docs) {
    const data = doc.data();
    const updates = {};

    const targetCompanyId = data.companyId || data.employerUid || doc.id;
    if (!data.companyId) updates.companyId = targetCompanyId;
    if (data.employerUid !== targetCompanyId)
      updates.employerUid = targetCompanyId;
    if (!data.postedBy) updates.postedBy = data.employerUid || null;
    if (data.applicants === undefined || data.applicants === null) {
      updates.applicants = 0;
    }

    if (Object.keys(updates).length > 0) {
      projectsUpdated++;
      console.log(`  [projects/${doc.id}] Add: ${JSON.stringify(updates)}`);
      if (!isDryRun) {
        await doc.ref.set(updates, { merge: true });
      }
    }
  }
  console.log(
    `  Scanned ${projectsSnap.size} projects. ${projectsUpdated} needed backfill.\n`,
  );

  // 5. Migrate applications
  console.log("==> Step 5: Scanning 'applications' collection...");
  const appsSnap = await db.collection("applications").get();
  let appsUpdated = 0;

  for (const doc of appsSnap.docs) {
    const data = doc.data();
    const updates = {};

    if (!data.companyId && data.employerUid) {
      updates.companyId = data.employerUid;
    }

    if (Object.keys(updates).length > 0) {
      appsUpdated++;
      console.log(`  [applications/${doc.id}] Add: ${JSON.stringify(updates)}`);
      if (!isDryRun) {
        await doc.ref.set(updates, { merge: true });
      }
    }
  }
  console.log(
    `  Scanned ${appsSnap.size} applications. ${appsUpdated} needed backfill.\n`,
  );

  // 6. Migrate conversations
  console.log("==> Step 6: Scanning 'conversations' collection...");
  const convsSnap = await db.collection("conversations").get();
  let convsUpdated = 0;

  for (const doc of convsSnap.docs) {
    const data = doc.data();
    const participants = data.participants || [];
    const updates = {};

    if (!data.companyId || !data.companyName) {
      // Find the participant that corresponds to an employer
      for (const pUid of participants) {
        const emp = employerMap.get(pUid);
        if (emp) {
          if (!data.companyId) updates.companyId = emp.companyId || pUid;
          if (!data.companyName)
            updates.companyName = emp.company || emp.companyName || "";
          break;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      convsUpdated++;
      console.log(
        `  [conversations/${doc.id}] Add: ${JSON.stringify(updates)}`,
      );
      if (!isDryRun) {
        await doc.ref.set(updates, { merge: true });
      }
    }
  }
  console.log(
    `  Scanned ${convsSnap.size} conversations. ${convsUpdated} needed backfill.\n`,
  );

  console.log(`========================================`);
  console.log(
    ` Migration Completed Successfully${isDryRun ? " (DRY RUN)" : ""}.`,
  );
  console.log(`========================================\n`);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
