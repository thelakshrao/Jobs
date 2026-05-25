import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

function cleanPrefix(email) {
  const prefix = email.split("@")[0];
  return prefix.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function generateUniqueSlug(base) {
  const baseSnap = await adminDb.collection("slugs").doc(base).get();
  if (!baseSnap.exists) return base;

  let i = 1;
  while (i <= 9999) {
    const candidate = `${base}${i}`;
    const snap = await adminDb.collection("slugs").doc(candidate).get();
    if (!snap.exists) return candidate;
    i++;
  }
  throw new Error("Could not generate unique slug");
}

export async function POST(req) {
  try {
    const { uid, email } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "uid and email are required" }, { status: 400 });
    }

    const userSnap = await adminDb.collection("users").doc(uid).get();
    if (userSnap.exists && userSnap.data()?.slug) {
      return NextResponse.json({ slug: userSnap.data().slug });
    }

    const base = cleanPrefix(email);
    const slug = await generateUniqueSlug(base);

    await adminDb.collection("slugs").doc(slug).set({ uid, createdAt: Date.now() });
    await adminDb.collection("users").doc(uid).set({ slug }, { merge: true });

    return NextResponse.json({ slug });
  } catch (err) {
    console.error("assign-slug error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}