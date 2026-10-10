import { db, auth } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  where,
  getDoc,
} from "firebase/firestore";
import { createNotification } from "./notifications";

export async function getOrCreateConversation(
  myUid,
  myRole,
  otherUid,
  otherRole,
  options = {},
) {
  const companyId = options.companyId || null;
  const companyName = options.companyName || "";

  // Check if existing conversation matches participants
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", myUid),
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) =>
    d.data().participants?.includes(otherUid),
  );
  if (existing) {
    // If companyId is missing on existing, patch it if we have it
    if (companyId && !existing.data().companyId) {
      updateDoc(existing.ref, { companyId, companyName }).catch(() => {});
    }
    return existing.id;
  }

  // Also check if company already has a conversation with this applicant
  if (companyId) {
    try {
      const compQ = query(
        collection(db, "conversations"),
        where("companyId", "==", companyId),
      );
      const compSnap = await getDocs(compQ);
      const compExisting = compSnap.docs.find((d) =>
        d.data().participants?.includes(otherUid),
      );
      if (compExisting) return compExisting.id;
    } catch (e) {
      // Ignore if index / query not ready
    }
  }

  const payload = {
    participants: [myUid, otherUid],
    participantRoles: { [myUid]: myRole, [otherUid]: otherRole },
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    unreadCount: { [myUid]: 0, [otherUid]: 0 },
  };
  if (companyId) payload.companyId = companyId;
  if (companyName) payload.companyName = companyName;

  const ref = await addDoc(collection(db, "conversations"), payload);
  return ref.id;
}

export function listenToMessages(conversationId, onData) {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function sendMessage(conversationId, text, recipientUid) {
  const myUid = auth.currentUser.uid;

  await addDoc(
    collection(db, "conversations", conversationId, "messages"),
    {
      senderId: myUid,
      text,
      createdAt: serverTimestamp(),
      read: false,
    },
  );

  const convRef = doc(db, "conversations", conversationId);
  const convSnap = await getDoc(convRef);
  const convData = convSnap.data() || {};
  const unread = convData.unreadCount || {};
  await updateDoc(convRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    unreadCount: { ...unread, [recipientUid]: (unread[recipientUid] || 0) + 1 },
  });

  let senderName = convData.companyName || "Someone";
  try {
    const userDoc = await getDoc(doc(db, "users", myUid));
    if (userDoc.exists()) {
      const d = userDoc.data();
      senderName =
        `${d.firstName || ""} ${d.lastName || ""}`.trim() ||
        d.name ||
        convData.companyName ||
        "Someone";
    }
  } catch (e) {
    // Graceful fallback without crashing
  }

  await createNotification(recipientUid, {
    type: "message",
    title: `${senderName} sent you a message`,
    body: text.length > 60 ? text.slice(0, 60) + "…" : text,
    link: `/dashboard/messages?chat=${conversationId}`,
  });
}

export function listenToConversations(uid, onData) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Merges two listeners for employer inbox:
 * 1. participants array-contains uid
 * 2. companyId == companyId
 * De-duplicated by conversation id.
 */
export function listenToEmployerConversations(uid, companyId, onData) {
  let convsByUid = [];
  let convsByCompany = [];

  const mergeAndEmit = () => {
    const map = new Map();
    for (const c of convsByCompany) map.set(c.id, c);
    for (const c of convsByUid) map.set(c.id, c);
    const list = Array.from(map.values()).sort((a, b) => {
      const tA =
        a.lastMessageAt?.toMillis?.() ||
        new Date(a.lastMessageAt || 0).getTime();
      const tB =
        b.lastMessageAt?.toMillis?.() ||
        new Date(b.lastMessageAt || 0).getTime();
      return tB - tA;
    });
    onData(list);
  };

  const q1 = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc"),
  );
  const unsub1 = onSnapshot(
    q1,
    (snap) => {
      convsByUid = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      mergeAndEmit();
    },
    (err) => {
      console.error("listenToEmployerConversations q1 error:", err);
    },
  );

  let unsub2 = () => {};
  if (companyId) {
    const q2 = query(
      collection(db, "conversations"),
      where("companyId", "==", companyId),
      orderBy("lastMessageAt", "desc"),
    );
    unsub2 = onSnapshot(
      q2,
      (snap) => {
        convsByCompany = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        mergeAndEmit();
      },
      (err) => {
        // Query may fail before index or if collection is empty
        console.warn("listenToEmployerConversations q2 fallback:", err?.message);
      },
    );
  }

  return () => {
    unsub1();
    unsub2();
  };
}

export async function markConversationRead(conversationId, uid) {
  try {
    const convRef = doc(db, "conversations", conversationId);
    const convSnap = await getDoc(convRef);
    if (!convSnap.exists()) return;
    const unread = convSnap.data()?.unreadCount || {};
    await updateDoc(convRef, {
      unreadCount: { ...unread, [uid]: 0 },
    });
  } catch (e) {
    console.error("markConversationRead error:", e);
  }
}