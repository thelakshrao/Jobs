"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import EmployerSidebar from "@/employerComponets/EmployerSidebar";
import DashboardNavbar from "@/employerComponets/DashboardNavbar";
import {
  listenToConversations,
  listenToMessages,
  sendMessage,
  getOrCreateConversation,
  markConversationRead,
} from "@/lib/messaging";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import {
  IoChatbubbleOutline,
  IoSendOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoArrowBackOutline,
  IoBriefcaseOutline,
  IoTrashOutline,
  IoEllipsisVertical,
} from "react-icons/io5";

const BRAND = "#003882";
const BRAND_HOVER = "#002a63";
const BRAND_TINT = "#eaf1fb";
const BRAND_TINT_BORDER = "#c7d9f0";
const BRAND_SPINNER_TRACK = "#b8c9e0";

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
  if (!uid) return { bg: "bg-blue-50", text: "text-blue-400" };
  const classes = [
    { bg: "bg-blue-50", text: "text-blue-400" },
    { bg: "bg-violet-50", text: "text-violet-400" },
    { bg: "bg-emerald-50", text: "text-emerald-500" },
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

async function fetchApplicantInfo(uid) {
  let name = "",
    photoURL = "",
    slug = "";
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const d = snap.data();
      name =
        `${d.firstName || ""} ${d.lastName || ""}`.trim() ||
        d.name ||
        d.displayName ||
        "";
      slug = d.slug || "";
      photoURL =
        d.profilePicture ||
        d.profilePhoto ||
        d.photo ||
        d.avatar ||
        d.photoURL ||
        "";
    }
  } catch (e) {}
  return { name, photoURL, slug };
}

async function fetchEmployerApplicants(employerUid) {
  const applicants = [];
  const seenUids = new Set();
  try {
    const appsSnap = await getDocs(
      query(
        collection(db, "applications"),
        where("employerUid", "==", employerUid),
      ),
    );
    appsSnap.forEach((d) => {
      const data = d.data();
      const uid = data.applicantUid;
      if (!uid || seenUids.has(uid)) return;
      seenUids.add(uid);
      applicants.push({
        uid,
        name: data.applicantName || "",
        photoURL: data.applicantPhotoURL || "",
        slug: data.applicantSlug || "",
        jobTitle: data.jobTitle || data.position || "",
      });
    });
  } catch (e) {
    console.error("fetchEmployerApplicants error:", e);
  }
  return applicants;
}

function MobileActionSheet({ onDelete, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-9998" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-9999 bg-white rounded-t-2xl pb-8 pt-2">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <p className="text-[13px] font-semibold text-slate-500 px-5 mb-2">
          Conversation
        </p>
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

export default function EmployerMessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [otherUserData, setOtherUserData] = useState({});
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allApplicants, setAllApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mobileSheet, setMobileSheet] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fetchedUids = useRef(new Set());

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, "employers", user.uid));
          if (snap.exists()) {
            const d = snap.data();
            setCurrentUserData({
              name:
                `${d.firstName || ""} ${d.lastName || ""}`.trim() ||
                d.name ||
                d.displayName ||
                "",
              photoURL:
                d.profilePicture ||
                d.profilePhoto ||
                d.logo ||
                d.photo ||
                d.photoURL ||
                user.photoURL ||
                "",
              company: d.company || d.companyName || "",
            });
          }
        } catch (e) {}
        setLoadingApplicants(true);
        const applicants = await fetchEmployerApplicants(user.uid);
        if (applicants.length > 0) {
          const enriched = await Promise.all(
            applicants.map(async (a) => {
              if (a.name) return a;
              const info = await fetchApplicantInfo(a.uid);
              return { ...a, ...info };
            }),
          );
          setAllApplicants(enriched);
        } else {
          setAllApplicants(applicants);
        }
        setLoadingApplicants(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = listenToConversations(currentUser.uid, async (convs) => {
      const employerConvs = convs.filter(
        (c) =>
          c.participantRoles?.[currentUser.uid] === "employer" ||
          !c.participantRoles,
      );
      setConversations(employerConvs);
      setLoading(false);
      const uidsToFetch = employerConvs
        .map((c) => c.participants.find((p) => p !== currentUser.uid))
        .filter((uid) => uid && !fetchedUids.current.has(uid));
      if (!uidsToFetch.length) return;
      uidsToFetch.forEach((uid) => fetchedUids.current.add(uid));
      const results = await Promise.all(
        uidsToFetch.map((uid) =>
          fetchApplicantInfo(uid).then((info) => [uid, info]),
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
    setSearch("");
    setSearchMode(false);
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

  const startConversation = async (applicant) => {
    try {
      const convId = await getOrCreateConversation(
        currentUser.uid,
        "employer",
        applicant.uid,
        "applicant",
      );
      setOtherUserData((prev) => ({
        ...prev,
        [applicant.uid]: {
          name: applicant.name,
          slug: applicant.slug,
          photoURL: applicant.photoURL,
        },
      }));
      setSelectedConv({
        id: convId,
        participants: [currentUser.uid, applicant.uid],
        participantRoles: {
          [currentUser.uid]: "employer",
          [applicant.uid]: "applicant",
        },
        unreadCount: {},
        lastMessage: "",
      });
      setSearch("");
      setSearchMode(false);
    } catch (e) {
      console.error(e);
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

  const filteredApplicants = search.trim()
    ? allApplicants.filter((a) => {
        const q = search.toLowerCase();
        return (
          (a.name || "").toLowerCase().includes(q) ||
          (a.slug || "").toLowerCase().includes(q) ||
          (a.jobTitle || "").toLowerCase().includes(q)
        );
      })
    : [];

  const getOtherUid = (conv) =>
    conv?.participants?.find((p) => p !== currentUser?.uid);
  const myName =
    currentUserData?.name ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "You";
  const otherUidForPanel = selectedConv ? getOtherUid(selectedConv) : null;

  const InputBar = (
    <div className="px-3 py-2 border-t border-slate-100 bg-[#e8eaed] flex items-end gap-2 shrink-0">
      <div className="flex-1 flex items-end rounded-xl px-3 py-1.5 border-[1.5px] border-slate-200 bg-slate-50 transition-colors focus-within:border-[#003882]">
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
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-none transition-all"
        style={{
          backgroundColor: inputText.trim() ? BRAND : "#f1f5f9",
          color: inputText.trim() ? "#fff" : "#94a3b8",
          cursor: inputText.trim() ? "pointer" : "default",
        }}
        onMouseEnter={(e) => {
          if (inputText.trim())
            e.currentTarget.style.backgroundColor = BRAND_HOVER;
        }}
        onMouseLeave={(e) => {
          if (inputText.trim()) e.currentTarget.style.backgroundColor = BRAND;
        }}
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
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            name={myName}
            photoURL={currentUserData?.photoURL}
            uid={currentUser?.uid}
            size={44}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-900 truncate leading-tight">
              {myName}
            </p>
            {currentUserData?.company && (
              <p
                className="text-[12px] font-medium truncate"
                style={{ color: BRAND }}
              >
                {currentUserData.company}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 transition-colors focus-within:border-[#003882]">
          <IoSearchOutline size={14} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchMode(!!e.target.value.trim());
            }}
            placeholder="Search applicants..."
            className="flex-1 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setSearchMode(false);
              }}
              className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer flex"
            >
              <IoCloseOutline size={13} />
            </button>
          )}
        </div>
        {searchMode && (
          <div className="mt-2 flex flex-col gap-1 max-h-60 overflow-y-auto">
            {loadingApplicants ? (
              <div className="flex justify-center py-3">
                <div
                  className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{
                    borderColor: BRAND_SPINNER_TRACK,
                    borderTopColor: BRAND,
                  }}
                />
              </div>
            ) : filteredApplicants.length > 0 ? (
              filteredApplicants.map((a) => (
                <button
                  key={a.uid}
                  onClick={() => startConversation(a)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-100 bg-white transition-all cursor-pointer text-left w-full"
                  style={{}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_TINT;
                    e.currentTarget.style.borderColor = BRAND_TINT_BORDER;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.borderColor = "#f1f5f9";
                  }}
                >
                  <Avatar
                    name={a.name}
                    photoURL={a.photoURL}
                    uid={a.uid}
                    size={32}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">
                      {a.name}
                    </p>
                    {a.jobTitle && (
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <IoBriefcaseOutline size={10} />
                        {a.jobTitle}
                      </p>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-[12px] text-slate-400 text-center py-2">
                No applicants found
              </p>
            )}
          </div>
        )}
      </div>
      {!searchMode && (
        <div className="flex-1 overflow-y-auto">
          <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Conversations
          </p>
          {loading ? (
            <div className="flex justify-center items-center h-16">
              <div
                className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{
                  borderColor: BRAND_SPINNER_TRACK,
                  borderTopColor: BRAND,
                }}
              />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2 px-4">
              <IoChatbubbleOutline size={20} className="text-slate-300" />
              <p className="text-[12px] text-slate-400 text-center">
                Search for an applicant to start a conversation
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUid = getOtherUid(conv);
              const other = otherUserData[otherUid] || {};
              const unread = conv.unreadCount?.[currentUser?.uid] || 0;
              const isSelected = selectedConv?.id === conv.id;
              return (
                <div key={conv.id} className="relative group">
                  <button
                    onClick={() => handleSelectConv(conv)}
                    className="w-full flex items-center gap-3 px-4 py-3 pr-12 text-left border-none cursor-pointer transition-all border-b border-slate-50 border-l-2 hover:bg-slate-50"
                    style={{
                      backgroundColor: isSelected ? BRAND_TINT : "transparent",
                      borderLeftColor: isSelected ? BRAND : "transparent",
                    }}
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
                          {other.name || other.slug || "Applicant"}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {timeAgo(conv.lastMessageAt)}
                        </span>
                      </div>
                      {other.slug && (
                        <p className="text-[11px] text-slate-400 truncate mb-0.5">
                          @{other.slug}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-[12px] truncate ${unread > 0 ? "text-slate-600 font-medium" : "text-slate-400"}`}
                        >
                          {conv.lastMessage || "No messages yet"}
                        </p>
                        {unread > 0 && (
                          <span
                            className="shrink-0 min-w-[4.5 h-4.5 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                            style={{ backgroundColor: BRAND }}
                          >
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
                      else setDeleteTarget(conv);
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
      )}
    </div>
  );

  const MessagesArea = (
    <>
      <div className="flex items-center gap-3 px-3 md:px-6 py-3 border-b border-slate-100 shrink-0 bg-white">
        <button
          onClick={() => {
            setSelectedConv(null);
            setMessages([]);
          }}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 border-none cursor-pointer text-slate-600 shrink-0"
        >
          <IoArrowBackOutline size={18} />
        </button>
        <Avatar
          name={otherUserData[otherUidForPanel]?.name}
          photoURL={otherUserData[otherUidForPanel]?.photoURL}
          uid={otherUidForPanel}
          size={40}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-slate-900 leading-tight truncate">
            {otherUserData[otherUidForPanel]?.name || "Applicant"}
          </p>
          {otherUserData[otherUidForPanel]?.slug && (
            <span className="text-[12px] text-slate-400">
              @{otherUserData[otherUidForPanel].slug}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            const isMobile = window.innerWidth < 768;
            if (isMobile) setMobileSheet(selectedConv);
            else setDeleteTarget(selectedConv);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 border-none cursor-pointer text-slate-600 shrink-0"
        >
          <IoEllipsisVertical size={16} />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto bg-slate-50"
        style={{ minHeight: 0 }}
      >
        <div className="flex flex-col gap-2 px-2 md:px-6 py-3">
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
              const isFirstInGroup = messages[i - 1]?.senderId !== msg.senderId;
              const senderName = isMe
                ? myName
                : otherUserData[otherUidForPanel]?.name || "Applicant";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 items-end ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="shrink-0" style={{ width: 26 }}>
                    {!isMe && isFirstInGroup && (
                      <Avatar
                        name={otherUserData[otherUidForPanel]?.name}
                        photoURL={otherUserData[otherUidForPanel]?.photoURL}
                        uid={otherUidForPanel}
                        size={26}
                      />
                    )}
                  </div>
                  <div
                    className={`flex flex-col max-w-[82%] md:max-w-[60%] gap-0.5 ${isMe ? "items-end" : "items-start"}`}
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
                      className={`px-3 py-2 text-[13px] leading-relaxed ${isMe ? "text-white shadow-sm" : "bg-white text-slate-800 border border-slate-200 shadow-sm"}`}
                      style={{
                        backgroundColor: isMe ? BRAND : undefined,
                        boxShadow: isMe
                          ? "0 1px 4px rgba(0,56,130,0.18)"
                          : undefined,
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

      {InputBar}
    </>
  );

  return (
    <>
      <EmployerSidebar />
      <DashboardNavbar />

      <div
        style={{
          marginLeft: "268px",
          marginTop: "60px",
          height: "calc(100vh - 60px)",
          overflow: "hidden",
          backgroundColor: "#e8eaed",
          padding: "20px 24px 0",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
        className="hidden md:flex"
      >
        <div style={{ flexShrink: 0 }}>
          <h1 className="text-[22px] font-bold text-[#003882]">Messages</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Message applicants who applied to your jobs
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
              <div className="flex flex-col h-full">{MessagesArea}</div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: BRAND_TINT }}
                >
                  <IoChatbubbleOutline size={30} style={{ color: BRAND }} />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-bold text-[#003882] mb-1">
                    Message your applicants
                  </p>
                  <p className="text-[13px] text-slate-400">
                    Search by name to start a conversation
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
          bottom: "60px",
          overflow: "hidden",
        }}
      >
        {!selectedConv ? (
          <>
            <div className="px-4 pt-3 pb-2 bg-[#e8eaed] border-b border-slate-100 shrink-0">
              <h1 className="text-[18px] font-bold text-[#003882]">Messages</h1>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Message applicants who applied to your jobs
              </p>
            </div>
            <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
              {SidebarContent}
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full">{MessagesArea}</div>
        )}
      </div>

      {mobileSheet && (
        <MobileActionSheet
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
