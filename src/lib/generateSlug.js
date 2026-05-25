import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function cleanPrefix(email) {
  const prefix = email.split("@")[0];
  return prefix
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export async function generateUniqueSlug(email) {
  const base = cleanPrefix(email);

  const baseRef = doc(db, "slugs", base);
  const baseSnap = await getDoc(baseRef);
  if (!baseSnap.exists()) return base;

  let i = 1;
  while (true) {
    const candidate = `${base}${i}`;
    const ref = doc(db, "slugs", candidate);
    const snap = await getDoc(ref);
    if (!snap.exists()) return candidate;
    i++;
    if (i > 9999) throw new Error("Could not generate unique slug");
  }
}

export async function reserveSlug(slug, uid) {
  await setDoc(doc(db, "slugs", slug), { uid, createdAt: Date.now() });
  await setDoc(doc(db, "users", uid), { slug }, { merge: true });
}

export async function getUidBySlug(slug) {
  const snap = await getDoc(doc(db, "slugs", slug));
  if (!snap.exists()) return null;
  return snap.data().uid;
}