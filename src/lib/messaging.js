import { db, auth } from "./firebase";
import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, orderBy, serverTimestamp, getDocs,
  where, getDoc
} from "firebase/firestore";
import { createNotification } from "./notifications";

export async function getOrCreateConversation(myUid, myRole, otherUid, otherRole) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", myUid)
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) =>
    d.data().participants.includes(otherUid)
  );
  if (existing) return existing.id;

  const ref = await addDoc(collection(db, "conversations"), {
    participants: [myUid, otherUid],
    participantRoles: { [myUid]: myRole, [otherUid]: otherRole },
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    unreadCount: { [myUid]: 0, [otherUid]: 0 },
  });
  return ref.id;
}

export function listenToMessages(conversationId, onData) {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc")
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
    }
  );

  const convRef = doc(db, "conversations", conversationId);
  const convSnap = await getDoc(convRef);
  const unread = convSnap.data()?.unreadCount || {};
  await updateDoc(convRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    unreadCount: { ...unread, [recipientUid]: (unread[recipientUid] || 0) + 1 },
  });

  let senderName = "Someone";
  const userDoc = await getDoc(doc(db, "users", myUid));
  if (userDoc.exists()) {
    senderName = `${userDoc.data().firstName} ${userDoc.data().lastName}`;
  } else {
    const empDoc = await getDoc(doc(db, "employers", myUid));
    if (empDoc.exists()) {
      senderName = `${empDoc.data().firstName} ${empDoc.data().lastName}`;
    }
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
    orderBy("lastMessageAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
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