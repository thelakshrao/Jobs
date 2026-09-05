import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

const COLLECTION = "helpMessages";

function sortByCreatedAtDesc(docs) {
  return docs.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
}

export async function submitHelpMessage({ type, subject, message, role }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to submit this.");

  let name = "Someone";
  let email = user.email || "";

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const d = userDoc.data();
      name = `${d.firstName || ""} ${d.lastName || ""}`.trim() || name;
    } else {
      const empDoc = await getDoc(doc(db, "employers", user.uid));
      if (empDoc.exists()) {
        const d = empDoc.data();
        name =
          `${d.firstName || ""} ${d.lastName || ""}`.trim() ||
          d.company ||
          d.companyName ||
          name;
      }
    }
  } catch (err) {
    console.error("Could not resolve sender profile for help message:", err);
  }

  await addDoc(collection(db, COLLECTION), {
    uid: user.uid,
    role: role || "unknown",
    name,
    email,
    type,
    subject,
    message,
    status: "open",
    createdAt: serverTimestamp(),
  });
}

export function listenToMyHelpMessages(uid, onData) {
  const q = query(collection(db, COLLECTION), where("uid", "==", uid));
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(sortByCreatedAtDesc(docs));
    },
    (err) => {
      console.error("listenToMyHelpMessages failed:", err);
      onData([]);
    },
  );
}

export function listenToHelpMessages(type, onData) {
  const q = query(collection(db, COLLECTION), where("type", "==", type));
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(sortByCreatedAtDesc(docs));
    },
    (err) => {
      console.error("listenToHelpMessages failed:", err);
      onData([]);
    },
  );
}

export async function markHelpMessageStatus(id, status) {
  await updateDoc(doc(db, COLLECTION, id), { status });
}