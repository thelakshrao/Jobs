import { messaging, VAPID_KEY, db, auth } from "./firebase";
import { getToken, onMessage } from "firebase/messaging";
import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, where, orderBy, serverTimestamp, getDocs
} from "firebase/firestore";

export async function requestNotificationPermission() {
  if (!messaging) return false;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;
  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    const user = auth.currentUser;
    if (user && token) {
      await updateDoc(doc(db, "users", user.uid), { fcmToken: token });
    }
    return true;
  } catch (err) {
    console.error("FCM token error:", err);
    return false;
  }
}

export function onForegroundMessage(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}

export function listenToUnreadCount(uid, onCount) {
  const q = query(
    collection(db, "notifications", uid, "items"),
    where("read", "==", false)
  );
  return onSnapshot(q, (snap) => onCount(snap.size));
}

export function listenToNotifications(uid, onData) {
  const q = query(
    collection(db, "notifications", uid, "items"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function markNotificationRead(uid, notifId) {
  await updateDoc(doc(db, "notifications", uid, "items", notifId), {
    read: true,
  });
}

export async function markAllNotificationsRead(uid) {
  const q = query(
    collection(db, "notifications", uid, "items"),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
}

export async function createNotification(recipientUid, { type, title, body, link }) {
  await addDoc(collection(db, "notifications", recipientUid, "items"), {
    type,
    title,
    body,
    link,
    read: false,
    createdAt: serverTimestamp(),
  });
}