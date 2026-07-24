"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import {
  listenToConversations,
  listenToMessages,
  sendMessage,
  markConversationRead,
} from "@/lib/messaging";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  IoChatbubbleOutline,
  IoSendOutline,
  IoArrowBackOutline,
  IoMailOutline,
  IoArchiveOutline,
  IoWarningOutline,
  IoEllipsisVertical,
  IoTrashOutline,
} from "react-icons/io5";

function timeAgo(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatTime(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getColorClass(uid) {
  if (!uid) return { bg: "bg-emerald-50", text: "text-emerald-500" };
  const classes = [
    { bg: "bg-emerald-50", text: "text-emerald-500" },
    { bg: "bg-violet-50", text: "text-violet-400" },
    { bg: "bg-blue-50", text: "text-[#004aac]" },
    { bg: "bg-rose-50", text: "text-rose-400" },
    { bg: "bg-amber-50", text: "text-amber-500" },
  ];
  return classes[uid.charCodeAt(0) % classes.length];
}

function Avatar({ name, photoURL, uid, size = 40 }) {
  const [imgErr, setImgErr] = useState(false);
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : uid
      ? uid[0].toUpperCase()
      : "U";
  const color = getColorClass(uid);
  const px = `${size}px`;
  if (photoURL && !imgErr) {
    return (
      <img
        src={photoURL}
        alt={name || "user"}
        onError={() => setImgErr(true)}
        className="rounded-full object-cover shrink-0"
        style={{ width: px, height: px }}
      />
    );
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold shrink-0 ${color.bg} ${color.text}`}
      style={{ width: px, height: px, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

async function fetchSenderInfo(uid) {
  let name = "",
    photoURL = "",
    company = "";
  try {
    const empSnap = await getDoc(doc(db, "employers", uid));
    if (empSnap.exists()) {
      const d = empSnap.data();
      name =
        `${d.firstName || ""} ${d.lastName || ""}`.trim() ||
        d.name ||
        d.displayName ||
        d.companyName ||
        "";
      company = d.company || d.companyName || "";
      photoURL =
        d.profilePicture ||
        d.profilePhoto ||
        d.logo ||
        d.photo ||
        d.photoURL ||
        "";
      return { name, photoURL, company };
    }
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      const d = userSnap.data();
      name =
        `${d.firstName || ""} ${d.lastName || ""}`.trim() ||
        d.name ||
        d.displayName ||
        "";
      photoURL =
        d.profilePicture || d.profilePhoto || d.photo || d.photoURL || "";
      return { name, photoURL, company: "" };
    }
  } catch (e) {
    console.error("fetchSenderInfo error:", e);
  }
  return { name, photoURL, company };
}

async function updateConversationFolder(convId, folder) {
  try {
    await updateDoc(doc(db, "conversations", convId), { folder });
  } catch (e) {
    console.error("updateConversationFolder error:", e);
  }
}

const TABS = [
  { id: "inbox", label: "Inbox", icon: IoMailOutline },
  { id: "archive", label: "Archive", icon: IoArchiveOutline },
  { id: "spam", label: "Spam", icon: IoWarningOutline },
];

function ContextMenu({ x, y, convFolder, onMove, onDelete, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);
  const moveOptions = TABS.filter((t) => t.id !== convFolder);
  return (
    <div
      ref={ref}
      className="fixed z-9999 bg-white rounded-xl shadow-xl border border-slate-200 py-1 min-w-40"
      style={{ top: y, left: x }}
    >
      {moveOptions.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => {
            onMove(id);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer text-left"
        >
          <Icon size={14} className="text-slate-400" />
          Move to {label}
        </button>
      ))}
      <div className="my-1 border-t border-slate-100" />
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-rose-500 hover:bg-rose-50 transition-colors border-none bg-transparent cursor-pointer text-left"
      >
        <IoTrashOutline size={14} />
        Delete chat
      </button>
    </div>
  );
}

function MobileActionSheet({ convFolder, onMove, onDelete, onClose }) {
  const moveOptions = TABS.filter((t) => t.id !== convFolder);
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-9998" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-9999 bg-white rounded-t-2xl pb-8 pt-2">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <p className="text-[13px] font-semibold text-slate-500 px-5 mb-2">
          Move conversation
        </p>
        {moveOptions.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              onMove(id);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-5 py-3.5 text-[15px] font-medium text-slate-800 hover:bg-slate-50 border-none bg-transparent cursor-pointer text-left"
          >
            <Icon size={18} className="text-slate-500" />
            Move to {label}
          </button>
        ))}
        <div className="mx-5 my-2 border-t border-slate-100" />
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-[15px] font-medium text-rose-500 hover:bg-rose-50 border-none bg-transparent cursor-pointer text-left"
        >
          <IoTrashOutline size={18} />
          Delete chat
        </button>
      </div>
    </>
  );
}

function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-9998" onClick={onCancel} />
      <div className="fixed z-9999 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-75">
        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-3 mx-auto">
          <IoTrashOutline size={20} className="text-rose-400" />
        </div>
        <h3 className="text-[15px] font-bold text-slate-900 text-center mb-1">
          Delete conversation?
        </h3>
        <p className="text-[12px] text-slate-400 text-center mb-5">
          This will permanently delete the chat for both sides.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 bg-transparent cursor-pointer hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-rose-600"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}

export default function ApplicantMessagesPage() {
  const [tab, setTab] = useState("inbox");
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [otherUserData, setOtherUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [mobileSheet, setMobileSheet] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fetchedUids = useRef(new Set());
  const longPressTimer = useRef(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const d = snap.data();
            setCurrentUserData({
              name: `${d.firstName || ""} ${d.lastName || ""}`.trim(),
              photoURL:
                d.profilePicture ||
                d.profilePhoto ||
                d.photo ||
                d.photoURL ||
                user.photoURL ||
                "",
            });
          }
        } catch (e) {}
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = listenToConversations(currentUser.uid, async (convs) => {
      const applicantConvs = convs.filter(
        (c) =>
          c.participantRoles?.[currentUser.uid] === "applicant" ||
          !c.participantRoles,
      );
      setConversations(applicantConvs);
      setLoading(false);
      const uidsToFetch = applicantConvs
        .map((c) => c.participants.find((p) => p !== currentUser.uid))
        .filter((uid) => uid && !fetchedUids.current.has(uid));
      if (!uidsToFetch.length) return;
      uidsToFetch.forEach((uid) => fetchedUids.current.add(uid));
      const results = await Promise.all(
        uidsToFetch.map((uid) =>
          fetchSenderInfo(uid).then((info) => [uid, info]),
        ),
      );
      setOtherUserData((prev) => ({ ...prev, ...Object.fromEntries(results) }));
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedConv || !currentUser) return;
    const unsub = listenToMessages(selectedConv.id, (msgs) => {
      setMessages(msgs);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        80,
      );
    });
    markConversationRead(selectedConv.id, currentUser.uid).catch(() => {});
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? {
              ...c,
              unreadCount: { ...(c.unreadCount || {}), [currentUser.uid]: 0 },
            }
          : c,
      ),
    );
    return () => unsub();
  }, [selectedConv?.id, currentUser]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedConv || sending) return;
    setSending(true);
    try {
      const otherUid = selectedConv.participants.find(
        (p) => p !== currentUser.uid,
      );
      await sendMessage(selectedConv.id, inputText.trim(), otherUid);
      setInputText("");
      if (textareaRef.current) textareaRef.current.style.height = "36px";
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setInputText(e.target.value);
    e.target.style.height = "36px";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  const handleSelectConv = (conv) => {
    setSelectedConv(conv);
    if (currentUser) {
      markConversationRead(conv.id, currentUser.uid).catch(() => {});
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id
            ? {
                ...c,
                unreadCount: { ...(c.unreadCount || {}), [currentUser.uid]: 0 },
              }
            : c,
        ),
      );
    }
  };

  const handleMoveConv = async (convId, folder) => {
    await updateConversationFolder(convId, folder);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, folder } : c)),
    );
    if (selectedConv?.id === convId) {
      setSelectedConv(null);
      setMessages([]);
    }
  };

  const handleDeleteConv = async (convId) => {
    try {
      await deleteDoc(doc(db, "conversations", convId));
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (selectedConv?.id === convId) {
        setSelectedConv(null);
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    }
    setDeleteTarget(null);
  };

  const openContextMenu = useCallback((e, conv) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(
      e.clientX ?? e.touches?.[0]?.clientX ?? 0,
      window.innerWidth - 170,
    );
    const y = Math.min(
      e.clientY ?? e.touches?.[0]?.clientY ?? 0,
      window.innerHeight - 160,
    );
    setContextMenu({ x, y, conv });
  }, []);

  const handleTouchStart = useCallback(
    (e, conv) => {
      longPressTimer.current = setTimeout(() => openContextMenu(e, conv), 500);
    },
    [openContextMenu],
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const getOtherUid = (conv) =>
    conv?.participants?.find((p) => p !== currentUser?.uid);

  const tabConvs = conversations.filter((c) => (c.folder || "inbox") === tab);

  const myName =
    currentUserData?.name ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "You";
  const otherUidForPanel = selectedConv ? getOtherUid(selectedConv) : null;

  const InputBar = (isMobile = false) => (
    <div
      className={`${isMobile ? "px-3 py-2" : "px-2 md:px-4 py-2"} border-t border-slate-100 bg-white flex items-end gap-2 shrink-0`}
    >
      <div className="flex-1 flex items-end rounded-xl px-3 py-1.5 border-[1.5px] border-slate-200 bg-slate-50 focus-within:border-[#004aac] transition-colors">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleTextareaChange}
          onKeyDown={handleKey}
          placeholder="Write a message..."
          className="flex-1 bg-transparent text-[13px] text-slate-800 outline-none resize-none placeholder:text-slate-400 font-[inherit]"
          style={{ height: 36, maxHeight: 100, paddingTop: 4 }}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!inputText.trim() || sending}
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-none transition-all ${
          inputText.trim()
            ? "bg-[#004aac] text-white cursor-pointer hover:bg-blue-500"
            : "bg-slate-100 text-slate-400 cursor-default"
        }`}
      >
        {sending ? (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <IoSendOutline size={15} />
        )}
      </button>
    </div>
  );

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-0 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <Avatar
            name={myName}
            photoURL={currentUserData?.photoURL}
            uid={currentUser?.uid}
            size={42}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-900 truncate leading-tight">
              {myName}
            </p>
            <p className="text-[12px] text-slate-400">Job Seeker</p>
          </div>
        </div>
        <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mb-3">
          {TABS.map(({ id, label, icon: Icon }) => {
            const unread = conversations.filter(
              (c) =>
                (c.folder || "inbox") === id &&
                (c.unreadCount?.[currentUser?.uid] || 0) > 0,
            ).length;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all border-none cursor-pointer relative ${
                  tab === id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "bg-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={13} />
                {label}
                {unread > 0 && (
                  <span className="absolute top-0.5 right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[#004aac] text-white text-[8px] font-bold flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-16">
            <div className="w-5 h-5 rounded-full border-2 border-blue-200 border-t-[#004aac] animate-spin" />
          </div>
        ) : tabConvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 px-4">
            <IoChatbubbleOutline size={20} className="text-slate-300" />
            <p className="text-[12px] text-slate-400 text-center">
              {tab === "inbox"
                ? "No messages yet. Employers will reach out here."
                : tab === "archive"
                  ? "No archived conversations."
                  : "No spam."}
            </p>
          </div>
        ) : (
          tabConvs.map((conv) => {
            const otherUid = getOtherUid(conv);
            const other = otherUserData[otherUid] || {};
            const unread = conv.unreadCount?.[currentUser?.uid] || 0;
            const isSelected = selectedConv?.id === conv.id;
            return (
              <div
                key={conv.id}
                className="relative group"
                onContextMenu={(e) => openContextMenu(e, conv)}
                onTouchStart={(e) => handleTouchStart(e, conv)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
              >
                <button
                  onClick={() => handleSelectConv(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 pr-12 text-left border-none cursor-pointer transition-all border-b border-slate-50 border-l-2 ${
                    isSelected
                      ? "bg-blue-50 border-l-[#004aac]"
                      : "bg-transparent hover:bg-slate-50 border-l-transparent"
                  }`}
                >
                  <Avatar
                    name={other.name}
                    photoURL={other.photoURL}
                    uid={otherUid}
                    size={42}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-[13px] truncate ${unread > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}
                      >
                        {other.name || "Employer"}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {timeAgo(conv.lastMessageAt)}
                      </span>
                    </div>
                    {other.company && (
                      <p className="text-[11px] text-emerald-600 font-medium truncate mb-0.5">
                        {other.company}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-[12px] truncate ${unread > 0 ? "text-slate-600 font-medium" : "text-slate-400"}`}
                      >
                        {conv.lastMessage || "No messages yet"}
                      </p>
                      {unread > 0 && (
                        <span className="shrink-0 min-w-4.5 h-4.5 px-1 rounded-full bg-[#004aac] text-white text-[9px] font-bold flex items-center justify-center">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const isMobile = window.innerWidth < 768;
                    if (isMobile) setMobileSheet(conv);
                    else openContextMenu(e, conv);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 md:opacity-0 md:group-hover:opacity-100 opacity-100 w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border-none cursor-pointer transition-all text-slate-500"
                >
                  <IoEllipsisVertical size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      <div
        className="hidden md:flex flex-col pr-3"
        style={{ height: "calc(100dvh - 80px)" }}
      >
        <div className="shrink-0" style={{ padding: "12px 0 8px 15px" }}>
          <h1 className="text-[22px] font-bold text-slate-900">Messages</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Employers will reach out to you here
          </p>
        </div>
        <div
          className="flex flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm mb-4"
          style={{ minHeight: 0 }}
        >
          <div className="flex flex-col w-72.5 shrink-0 border-r border-slate-100 overflow-hidden">
            {SidebarContent}
          </div>
          <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
            {selectedConv ? (
              <>
                <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-100 shrink-0">
                  <Avatar
                    name={otherUserData[otherUidForPanel]?.name}
                    photoURL={otherUserData[otherUidForPanel]?.photoURL}
                    uid={otherUidForPanel}
                    size={40}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-slate-900 leading-tight truncate">
                      {otherUserData[otherUidForPanel]?.name || "Employer"}
                    </p>
                    {otherUserData[otherUidForPanel]?.company && (
                      <span className="text-[12px] text-emerald-600 font-medium">
                        {otherUserData[otherUidForPanel].company}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => openContextMenu(e, selectedConv)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 border-none cursor-pointer text-slate-500 bg-transparent"
                  >
                    <IoEllipsisVertical size={16} />
                  </button>
                </div>
                <div
                  className="flex-1 overflow-y-auto bg-slate-50"
                  style={{ minHeight: 0 }}
                >
                  <div className="flex flex-col gap-2 px-6 py-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 gap-3">
                        <IoChatbubbleOutline
                          size={32}
                          className="text-slate-200"
                        />
                        <p className="text-[13px] text-slate-400">
                          No messages yet — say hello!
                        </p>
                      </div>
                    ) : (
                      messages.map((msg, i) => {
                        const isMe = msg.senderId === currentUser?.uid;
                        const isFirstInGroup =
                          messages[i - 1]?.senderId !== msg.senderId;
                        const senderName = isMe
                          ? myName
                          : otherUserData[otherUidForPanel]?.name || "Employer";
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2 items-end ${isMe ? "flex-row-reverse" : "flex-row"}`}
                          >
                            <div className="shrink-0" style={{ width: 28 }}>
                              {!isMe && isFirstInGroup && (
                                <Avatar
                                  name={otherUserData[otherUidForPanel]?.name}
                                  photoURL={
                                    otherUserData[otherUidForPanel]?.photoURL
                                  }
                                  uid={otherUidForPanel}
                                  size={28}
                                />
                              )}
                            </div>
                            <div
                              className={`flex flex-col max-w-[60%] gap-0.5 ${isMe ? "items-end" : "items-start"}`}
                            >
                              {isFirstInGroup && (
                                <p className="text-[10px] font-semibold text-slate-500 px-1 mb-0.5">
                                  {isMe ? "You" : senderName}
                                  <span className="font-normal text-slate-400 ml-1.5">
                                    {formatTime(msg.createdAt)}
                                  </span>
                                </p>
                              )}
                              <div
                                className={`px-3 py-2 text-[13px] leading-relaxed ${isMe ? "bg-[#004aac] text-white shadow-sm shadow-blue-200" : "bg-white text-slate-800 border border-slate-200 shadow-sm"}`}
                                style={{
                                  borderRadius: isMe
                                    ? isFirstInGroup
                                      ? "16px 16px 4px 16px"
                                      : "16px 4px 4px 16px"
                                    : isFirstInGroup
                                      ? "16px 16px 16px 4px"
                                      : "4px 16px 16px 4px",
                                }}
                              >
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>
                </div>
                {InputBar(false)}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50 h-full">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <IoChatbubbleOutline size={30} className="text-[#004aac]" />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-bold text-slate-800 mb-1">
                    Your messages
                  </p>
                  <p className="text-[13px] text-slate-400">
                    Select a conversation to read it
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="md:hidden flex flex-col bg-white"
        style={{
          position: "fixed",
          top: "56px",
          left: 0,
          right: 0,
          bottom: "56px",
          overflow: "hidden",
          contain: "strict",
        }}
      >
        {!selectedConv ? (
          <>
            <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-100 shrink-0">
              <h1 className="text-[18px] font-bold text-slate-900">Messages</h1>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Employers will reach out to you here
              </p>
            </div>
            <div
              className="flex-1 overflow-hidden bg-white"
              style={{ minHeight: 0 }}
            >
              {SidebarContent}
            </div>
          </>
        ) : (
          <div className="flex flex-col h-135 bg-white">
            <div className="flex items-center gap-3 px-3 py-2.5 bg-white border-b border-slate-100 shrink-0">
              <button
                onClick={() => {
                  setSelectedConv(null);
                  setMessages([]);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 border-none cursor-pointer text-slate-600 shrink-0"
              >
                <IoArrowBackOutline size={18} />
              </button>
              <Avatar
                name={otherUserData[otherUidForPanel]?.name}
                photoURL={otherUserData[otherUidForPanel]?.photoURL}
                uid={otherUidForPanel}
                size={36}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-900 leading-tight truncate">
                  {otherUserData[otherUidForPanel]?.name || "Employer"}
                </p>
                {otherUserData[otherUidForPanel]?.company && (
                  <span className="text-[11px] text-emerald-600 font-medium">
                    {otherUserData[otherUidForPanel].company}
                  </span>
                )}
              </div>
              <button
                onClick={() => setMobileSheet(selectedConv)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 border-none cursor-pointer text-slate-600 shrink-0"
              >
                <IoEllipsisVertical size={16} />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto bg-slate-50"
              style={{ minHeight: 0 }}
            >
              <div className="flex flex-col gap-2 px-3 py-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <IoChatbubbleOutline size={32} className="text-slate-200" />
                    <p className="text-[13px] text-slate-400">
                      No messages yet — say hello!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.senderId === currentUser?.uid;
                    const isFirstInGroup =
                      messages[i - 1]?.senderId !== msg.senderId;
                    const senderName = isMe
                      ? myName
                      : otherUserData[otherUidForPanel]?.name || "Employer";
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 items-end ${isMe ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div className="shrink-0" style={{ width: 26 }}>
                          {!isMe && isFirstInGroup && (
                            <Avatar
                              name={otherUserData[otherUidForPanel]?.name}
                              photoURL={
                                otherUserData[otherUidForPanel]?.photoURL
                              }
                              uid={otherUidForPanel}
                              size={26}
                            />
                          )}
                        </div>
                        <div
                          className={`flex flex-col max-w-[82%] gap-0.5 ${isMe ? "items-end" : "items-start"}`}
                        >
                          {isFirstInGroup && (
                            <p className="text-[10px] font-semibold text-slate-500 px-1 mb-0.5">
                              {isMe ? "You" : senderName}
                              <span className="font-normal text-slate-400 ml-1.5">
                                {formatTime(msg.createdAt)}
                              </span>
                            </p>
                          )}
                          <div
                            className={`px-3 py-2 text-[13px] leading-relaxed ${isMe ? "bg-[#004aac] text-white shadow-sm shadow-blue-200" : "bg-white text-slate-800 border border-slate-200 shadow-sm"}`}
                            style={{
                              borderRadius: isMe
                                ? isFirstInGroup
                                  ? "16px 16px 4px 16px"
                                  : "16px 4px 4px 16px"
                                : isFirstInGroup
                                  ? "16px 16px 16px 4px"
                                  : "4px 16px 16px 4px",
                            }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            {InputBar(true)}
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          convFolder={contextMenu.conv.folder || "inbox"}
          onMove={(folder) => {
            handleMoveConv(contextMenu.conv.id, folder);
            setContextMenu(null);
          }}
          onDelete={() => {
            setDeleteTarget(contextMenu.conv);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {mobileSheet && (
        <MobileActionSheet
          convFolder={mobileSheet.folder || "inbox"}
          onMove={(folder) => {
            handleMoveConv(mobileSheet.id, folder);
            setMobileSheet(null);
          }}
          onDelete={() => {
            setDeleteTarget(mobileSheet);
            setMobileSheet(null);
          }}
          onClose={() => setMobileSheet(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          onConfirm={() => handleDeleteConv(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
