"use client";
import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ProfileStrength from "@/profileComponents/ProfileStrength";

function JobCardHorizontal({ job, isSaved, onSaveToggle, onClick }) {
  const location = [job.location, job.targetCountry].filter(Boolean).join(", ");

  function timeAgo(dateStr) {
    if (!dateStr) return null;
    const diff = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
    if (diff < 1) return "Today";
    if (diff < 2) return "1 day ago";
    if (diff < 7) return `${Math.floor(diff)} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  const posted = timeAgo(job.publishedAt || job.createdAt);

  const handleSave = async (e) => {
    e.stopPropagation();
    const { auth: fbAuth, db: fbDb } = await import("@/lib/firebase");
    const user = fbAuth.currentUser;
    if (!user) return;
    const ref = doc(fbDb, "savedJobs", `${user.uid}_${job.id}`);
    if (isSaved) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        applicantUid: user.uid,
        jobId: job.id,
        savedAt: new Date().toISOString(),
      });
    }
    onSaveToggle(job.id);
  };

  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-slate-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between gap-3"
      style={{
        minWidth: 240,
        width: 240,
        minHeight: 170,
        flexShrink: 0,
        backgroundColor: "#f8fafc",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {job.urgency === "High" && (
            <span
              className="inline-block mb-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}
            >
              Easily apply
            </span>
          )}
          <h3
            className="text-[15px] leading-snug"
            style={{ fontWeight: 800, color: "#0f172a" }}
          >
            {job.title}
          </h3>
          <p
            className="text-[13px] mt-0.5"
            style={{ fontWeight: 700, color: "#334155" }}
          >
            {job.companyName || "Company"}
          </p>
          {location && (
            <p
              className="text-xs mt-0.5 flex items-center gap-1"
              style={{ fontWeight: 600, color: "#64748b" }}
            >
              <MapPin size={10} className="shrink-0 text-slate-400" />
              {location}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors shrink-0 bg-white"
        >
          {isSaved ? (
            <BookmarkCheck size={14} style={{ color: "#60a5fa" }} />
          ) : (
            <Bookmark size={14} className="text-slate-400" />
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {job.perks?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.perks.slice(0, 2).map((p) => (
              <span
                key={p}
                className="text-[11px] px-2.5 py-0.5 rounded-full border bg-white"
                style={{
                  borderColor: "#cbd5e1",
                  color: "#1e293b",
                  fontWeight: 700,
                }}
              >
                {p}
              </span>
            ))}
          </div>
        )}
        {posted && (
          <p
            className="text-[11px]"
            style={{ color: "#94a3b8", fontWeight: 600 }}
          >
            {posted}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [userName, setUserName] = useState("");
  const [completedItems, setCompletedItems] = useState({});
  const [isGraduate, setIsGraduate] = useState(true);
  const [isSimple, setIsSimple] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    const t = setTimeout(checkScroll, 150);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      clearTimeout(t);
    };
  }, [jobs]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [jobsSnap, savedSnap, userSnap] = await Promise.all([
          getDocs(query(collection(db, "jobs"), where("status", "==", "Open"))),
          getDocs(
            query(
              collection(db, "savedJobs"),
              where("applicantUid", "==", user.uid),
            ),
          ),
          getDoc(doc(db, "users", user.uid)),
        ]);

        setJobs(jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setSavedJobs(savedSnap.docs.map((d) => d.data().jobId));

        if (userSnap.exists()) {
          const data = userSnap.data();
          const about = data.about || {};

          const firstName =
            data.firstName || about.firstName || data.name?.split(" ")[0] || "";
          setUserName(firstName);

          const profileType = data.profileType || "";
          const eduLevel = about.educationLevel || data.educationLevel || "";
          const simple = profileType === "simple" || eduLevel === "simple";
          setIsSimple(simple);
          setIsGraduate(!simple && eduLevel !== "");

          if (!simple) {
            const basicInfo = !!(
              (data.firstName || about.firstName || data.name) &&
              (data.phone || data.phoneNumber || about.phone)
            );
            const aboutDone = !!(
              about.description ||
              about.currentRole ||
              about.bio ||
              data.bio
            );
            const skillsDone = !!(
              (Array.isArray(data.skills) && data.skills.length > 0) ||
              (Array.isArray(data.skillsData) && data.skillsData.length > 0) ||
              (Array.isArray(about.skills) && about.skills.length > 0) ||
              (typeof data.skills === "string" &&
                data.skills.trim().length > 0) ||
              (typeof about.skills === "string" &&
                about.skills.trim().length > 0)
            );
            const expDone = !!(
              (Array.isArray(data.experience) && data.experience.length > 0) ||
              (Array.isArray(data.experienceData) &&
                data.experienceData.length > 0) ||
              (Array.isArray(about.experience) &&
                about.experience.length > 0) ||
              about.currentRole
            );
            const eduDone = !!(
              (Array.isArray(data.education) && data.education.length > 0) ||
              (Array.isArray(data.educationData) &&
                data.educationData.length > 0) ||
              about.educationLevel ||
              about.institution ||
              about.degree
            );
            const linksDone = !!(
              data.linkedin ||
              data.github ||
              data.portfolio ||
              data.twitter ||
              about.linkedin ||
              about.github ||
              about.portfolio ||
              (Array.isArray(data.links) && data.links.length > 0)
            );
            const resumeDone = !!(
              data.resumeUrl ||
              data.resume ||
              about.resume ||
              about.resumeUrl
            );

            setCompletedItems({
              basicInfo,
              about: aboutDone,
              skills: skillsDone,
              experience: expDone,
              education: eduDone,
              links: linksDone,
              resume: resumeDone,
            });
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="w-7 h-7 border-[3px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#60a5fa", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-4 pb-20 md:pb-6 px-4 sm:px-6"
      style={{
        backgroundColor: "#f8fafc",
        fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      }}
    >
      {userName && (
        <p className="text-lg font-bold text-slate-900 mb-5">
          Welcome back, {userName}
        </p>
      )}

      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 px-6 text-center shadow-sm">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ backgroundColor: "#eff6ff" }}
              >
                <span style={{ fontSize: 24 }}>💼</span>
              </div>
              <p className="text-base font-bold text-slate-700 mb-1">
                No jobs available right now
              </p>
              <p className="text-sm text-slate-400">Check back soon!</p>
            </div>
          ) : (
            <div
              className="bg-white rounded-2xl border border-slate-200 p-4"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                  Jobs for you
                </h2>
                <div className="flex items-center gap-2">
                  {(canScrollLeft || canScrollRight) && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 transition-all disabled:opacity-25 hover:bg-slate-50"
                      >
                        <ChevronLeft size={14} className="text-slate-500" />
                      </button>
                      <button
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 transition-all disabled:opacity-25 hover:bg-slate-50"
                      >
                        <ChevronRight size={14} className="text-slate-500" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => router.push("/dashboard/jobs")}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-500 transition-colors"
                  >
                    View all <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {jobs.slice(0, 8).map((job) => (
                  <JobCardHorizontal
                    key={job.id}
                    job={job}
                    isSaved={savedJobs.includes(job.id)}
                    onSaveToggle={(id) =>
                      setSavedJobs((prev) =>
                        prev.includes(id)
                          ? prev.filter((j) => j !== id)
                          : [...prev, id],
                      )
                    }
                    onClick={() =>
                      router.push(`/dashboard/jobs?jobId=${job.id}`)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {!isSimple && (
          <div className="hidden xl:block shrink-0" style={{ width: "280px" }}>
            <ProfileStrength
              completedItems={completedItems}
              isGraduate={isGraduate}
              onImprove={() => router.push("/dashboard/profile")}
            />
          </div>
        )}
        {isSimple && (
          <div className="hidden xl:block shrink-0" style={{ width: "280px" }}>
          </div>
        )}
      </div>
    </div>
  );
}
