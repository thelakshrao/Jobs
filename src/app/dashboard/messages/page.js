"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import {
  listenToConversations,
  listenToMessages,
  sendMessage,
  getOrCreateConversation,
  markConversationRead,
} from "@/lib/messaging";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import {
  IoChatbubbleOutline,
  IoSendOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoArrowBackOutline,
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

function Avatar({ name, photoURL, uid, slug, size = 40 }) {
  const [imgErr, setImgErr] = useState(false);
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : slug
      ? slug[0].toUpperCase()
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

function RoleBadge({ role }) {
  if (!role) return null;
  const isEmployer = role !== "Applicant";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
        isEmployer
          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
          : "bg-blue-50 text-blue-500 border-blue-200"
      }`}
    >
      {role}
    </span>
  );
}

async function fetchUserInfo(uid) {
  let name = "",
    role = "",
    slug = "",
    photoURL = "";
  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      const d = userSnap.data();
      name = `${d.firstName || ""} ${d.lastName || ""}`.trim();
      role = "Applicant";
      slug = d.slug || "";
      photoURL =
        d.profilePicture ||
        d.profilePhoto ||
        d.photo ||
        d.avatar ||
        d.image ||
        d.photoURL ||
        "";
    } else {
      const empSnap = await getDoc(doc(db, "employers", uid));
      if (empSnap.exists()) {
        const d = empSnap.data();
        name = `${d.firstName || ""} ${d.lastName || ""}`.trim();
        role = d.company || "Employer";
        slug = d.slug || "";
        photoURL =
          d.profilePicture ||
          d.profilePhoto ||
          d.logo ||
          d.photo ||
          d.photoURL ||
          "";
      }
    }
  } catch (e) {
    console.error("fetchUserInfo error:", e);
  }
  return { name, role, slug, photoURL };
}

export default function MessagesPage() {
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
  const [peopleResults, setPeopleResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fetchedUids = useRef(new Set());
  const searchInputRef = useRef(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        const info = await fetchUserInfo(user.uid);
        setCurrentUserData({
          ...info,
          photoURL: info.photoURL || user.photoURL || "",
        });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = listenToConversations(currentUser.uid, async (convs) => {
      setConversations(convs);
      setLoading(false);
      const uidsToFetch = convs
        .map((conv) => conv.participants.find((p) => p !== currentUser.uid))
        .filter((uid) => uid && !fetchedUids.current.has(uid));
      if (uidsToFetch.length === 0) return;
      uidsToFetch.forEach((uid) => fetchedUids.current.add(uid));
      const results = await Promise.all(
        uidsToFetch.map((uid) =>
          fetchUserInfo(uid).then((info) => [uid, info]),
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

  useEffect(() => {
    if (!search.trim() || !searchMode) {
      setPeopleResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const results = [];
        const q = search.toLowerCase();
        const usersSnap = await getDocs(collection(db, "users"));
        usersSnap.forEach((d) => {
          if (d.id === currentUser?.uid) return;
          const data = d.data();
          const name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
          const slug = (data.slug || "").toLowerCase();
          if (name.toLowerCase().includes(q) || slug.includes(q)) {
            results.push({
              uid: d.id,
              name,
              role: "Applicant",
              slug: data.slug || "",
              photoURL:
                data.profilePicture ||
                data.profilePhoto ||
                data.photo ||
                data.avatar ||
                data.photoURL ||
                "",
            });
          }
        });
        try {
          const empSnap = await getDocs(collection(db, "employers"));
          empSnap.forEach((d) => {
            if (d.id === currentUser?.uid) return;
            const data = d.data();
            const name =
              `${data.firstName || ""} ${data.lastName || ""}`.trim();
            const slug = (data.slug || "").toLowerCase();
            if (name.toLowerCase().includes(q) || slug.includes(q)) {
              results.push({
                uid: d.id,
                name,
                role: data.company || "Employer",
                slug: data.slug || "",
                photoURL:
                  data.profilePicture ||
                  data.logo ||
                  data.photo ||
                  data.photoURL ||
                  "",
              });
            }
          });
        } catch (empErr) {
          console.warn("Employer search skipped:", empErr);
        }
        setPeopleResults(results.slice(0, 6));
      } catch (e) {
        console.error("Search error:", e);
      }
      setSearching(false);
    }, 350);
    return () => clearTimeout(t);
  }, [search, currentUser, searchMode]);

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
    setPeopleResults([]);
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

  const handleBack = () => {
    setSelectedConv(null);
    setMessages([]);
  };

  const startConversation = async (result) => {
    try {
      const convId = await getOrCreateConversation(
        currentUser.uid,
        "applicant",
        result.uid,
        "applicant",
      );
      setOtherUserData((prev) => ({
        ...prev,
        [result.uid]: {
          name: result.name,
          role: result.role,
          slug: result.slug,
          photoURL: result.photoURL,
        },
      }));
      setSelectedConv({
        id: convId,
        participants: [currentUser.uid, result.uid],
        unreadCount: {},
        lastMessage: "",
      });
      setSearch("");
      setSearchMode(false);
      setPeopleResults([]);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredConvs = conversations.filter((conv) => {
    if (!search.trim() || searchMode) return true;
    const otherUid = conv.participants.find((p) => p !== currentUser?.uid);
    const other = otherUserData[otherUid] || {};
    const q = search.toLowerCase();
    return (
      (other.name || "").toLowerCase().includes(q) ||
      (other.slug || "").toLowerCase().includes(q)
    );
  });

  const getOtherUid = (conv) =>
    conv?.participants?.find((p) => p !== currentUser?.uid);

  const myName =
    currentUserData?.name ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "You";
  const mySlug = currentUserData?.slug || "";

  const Sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            key={currentUser?.uid}
            name={myName}
            photoURL={currentUserData?.photoURL}
            uid={currentUser?.uid}
            slug={mySlug}
            size={44}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-900 truncate leading-tight">
              {myName}
            </p>
            {mySlug ? (
              <p className="text-[12px] text-slate-400 truncate">@{mySlug}</p>
            ) : (
              <p className="text-[12px] text-slate-400">Job Seeker</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-blue-300 transition-colors">
          <IoSearchOutline size={14} className="text-slate-400 shrink-0" />
          <input
            ref={searchInputRef}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.trim()) setSearchMode(true);
              else setSearchMode(false);
            }}
            onFocus={() => {
              if (search.trim()) setSearchMode(true);
            }}
            placeholder="Search by username"
            className="flex-1 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setSearchMode(false);
                setPeopleResults([]);
              }}
              className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer flex"
            >
              <IoCloseOutline size={13} />
            </button>
          )}
        </div>
        {searchMode && search && (
          <div className="mt-2 flex flex-col gap-1">
            {searching ? (
              <div className="flex justify-center py-3">
                <div className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-400 animate-spin" />
              </div>
            ) : peopleResults.length > 0 ? (
              peopleResults.map((r) => (
                <button
                  key={r.uid}
                  onClick={() => startConversation(r)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-100 bg-white hover:bg-blue-50 hover:border-blue-100 transition-all cursor-pointer text-left w-full"
                >
                  <Avatar
                    key={r.uid}
                    name={r.name}
                    photoURL={r.photoURL}
                    uid={r.uid}
                    slug={r.slug}
                    size={32}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">
                      {r.name}
                    </p>
                    {r.slug && (
                      <p className="text-[11px] text-slate-400 truncate">
                        @{r.slug}
                      </p>
                    )}
                  </div>
                  <RoleBadge role={r.role} />
                </button>
              ))
            ) : (
              <p className="text-[12px] text-slate-400 text-center py-2">
                No users found
              </p>
            )}
          </div>
        )}
      </div>

      {!searchMode && (
        <div className="flex-1 overflow-y-auto">
          <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Last chats
          </p>
          {loading ? (
            <div className="flex justify-center items-center h-16">
              <div className="w-5 h-5 rounded-full border-2 border-blue-200 border-t-blue-400 animate-spin" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2">
              <IoChatbubbleOutline size={20} className="text-slate-300" />
              <p className="text-[12px] text-slate-400">No conversations yet</p>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const otherUid = getOtherUid(conv);
              const other = otherUserData[otherUid] || {};
              const unread = conv.unreadCount?.[currentUser?.uid] || 0;
              const isSelected = selectedConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-none cursor-pointer transition-all border-b border-slate-50 border-l-2 ${
                    isSelected
                      ? "bg-blue-50 border-l-blue-400"
                      : "bg-transparent hover:bg-slate-50 border-l-transparent"
                  }`}
                >
                  <Avatar
                    key={otherUid}
                    name={other.name}
                    photoURL={other.photoURL}
                    uid={otherUid}
                    slug={other.slug}
                    size={42}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-[13px] truncate ${unread > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}
                      >
                        {other.name || other.slug || "User"}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">
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
                        <span className="shrink-0 min-w-4.5 h-4.5 px-1 rounded-full bg-blue-400 text-white text-[9px] font-bold flex items-center justify-center">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );

  const otherUidForPanel = selectedConv ? getOtherUid(selectedConv) : null;

  const ChatPanel = selectedConv ? (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-3 md:px-6 py-2.5 border-b border-slate-100 shrink-0 bg-white z-20 sticky top-0">
        <button
          onClick={handleBack}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 border-none cursor-pointer text-slate-600 shrink-0"
        >
          <IoArrowBackOutline size={18} />
        </button>
        <Avatar
          key={otherUidForPanel}
          name={otherUserData[otherUidForPanel]?.name}
          photoURL={otherUserData[otherUidForPanel]?.photoURL}
          uid={otherUidForPanel}
          slug={otherUserData[otherUidForPanel]?.slug}
          size={36}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-900 leading-tight truncate">
            {otherUserData[otherUidForPanel]?.name ||
              otherUserData[otherUidForPanel]?.slug ||
              "User"}
          </p>
          <div className="flex items-center gap-2">
            {otherUserData[otherUidForPanel]?.slug && (
              <span className="text-[11px] text-slate-400">
                @{otherUserData[otherUidForPanel]?.slug}
              </span>
            )}
            <RoleBadge role={otherUserData[otherUidForPanel]?.role} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-0 md:px-6 py-3 flex flex-col gap-2 bg-slate-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
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
              : otherUserData[otherUidForPanel]?.name || "User";
            return (
              <div
                key={msg.id}
                className={`flex gap-2 items-end px-2 md:px-0 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="shrink-0" style={{ width: 30 }}>
                  {!isMe && isFirstInGroup && (
                    <Avatar
                      key={otherUidForPanel}
                      name={otherUserData[otherUidForPanel]?.name}
                      photoURL={otherUserData[otherUidForPanel]?.photoURL}
                      uid={otherUidForPanel}
                      slug={otherUserData[otherUidForPanel]?.slug}
                      size={30}
                    />
                  )}
                </div>
                <div
                  className={`flex flex-col max-w-[80%] md:max-w-[60%] gap-0.5 ${isMe ? "items-end" : "items-start"}`}
                >
                  {isFirstInGroup && (
                    <p className="text-[11px] font-semibold text-slate-500 px-1 mb-0.5">
                      {isMe ? "You" : senderName}
                      <span className="font-normal text-slate-400 ml-2">
                        {formatTime(msg.createdAt)}
                      </span>
                    </p>
                  )}
                  <div
                    className={`px-3 py-2 text-[13px] leading-relaxed ${
                      isMe
                        ? "bg-blue-400 text-white shadow-sm shadow-blue-200"
                        : "bg-white text-slate-800 border border-slate-200 shadow-sm"
                    }`}
                    style={{
                      borderRadius: isMe
                        ? isFirstInGroup
                          ? "18px 18px 4px 18px"
                          : "18px 4px 4px 18px"
                        : isFirstInGroup
                          ? "18px 18px 18px 4px"
                          : "4px 18px 18px 4px",
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

      <div className="px-2 md:px-5 py-1.5 md:py-2 pb-2 border-t border-slate-100 bg-white flex items-end gap-2 shrink-0">
        <div className="flex-1 flex items-end rounded-xl px-3 py-1.5 border-[1.5px] border-slate-200 bg-slate-50 focus-within:border-blue-400 transition-colors">
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
              ? "bg-blue-400 text-white cursor-pointer hover:bg-blue-500"
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
    </div>
  ) : (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50 h-full">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
        <IoChatbubbleOutline size={30} className="text-blue-400" />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-slate-800 mb-1">
          Your messages
        </p>
        <p className="text-[13px] text-slate-400">
          Search for someone or select a conversation
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="flex flex-col md:h-screen md:pr-3"
      style={{ marginLeft: "0px", height: "calc(100dvh - 150px)" }}
    >
      <div
        className="hidden md:block mb-3"
        style={{ padding: "16px 0px 0px 15px" }}
      >
        <h1 className="text-[22px] font-bold text-slate-900">Messages</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          Chat with employers and applicants in real time
        </p>
      </div>

      {!selectedConv && (
        <div className="md:hidden px-4 pt-3 pb-2 bg-white border-b border-slate-100">
          <h1 className="text-[18px] font-bold text-slate-900">Messages</h1>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Chat with employers and applicants
          </p>
        </div>
      )}

      <div
        className="flex flex-1 overflow-hidden md:rounded-2xl md:border md:border-slate-200 bg-white md:shadow-sm md:mb-4"
        style={{ minHeight: 0 }}
      >
        <div
          className={`
            ${selectedConv ? "hidden md:flex" : "flex"}
            flex-col w-full md:w-72.5 md:shrink-0 md:border-r md:border-slate-100
            overflow-hidden
          `}
        >
          {Sidebar}
        </div>

        <div
          className={`
            ${selectedConv ? "flex" : "hidden md:flex"}
            flex-1 flex-col min-w-0 overflow-hidden
          `}
        >
          {ChatPanel}
        </div>
      </div>
    </div>
  );
}
