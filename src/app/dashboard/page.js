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
  orderBy,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  HardHat,
} from "lucide-react";
import ProfileStrength from "@/profileComponents/ProfileStrength";

function timeAgo(dateStr) {
  if (!dateStr) return null;
  // Firestore Timestamps come through as { seconds, nanoseconds } objects
  // (or with a .toDate() method) rather than plain date strings.
  const date =
    typeof dateStr?.toDate === "function"
      ? dateStr.toDate()
      : typeof dateStr?.seconds === "number"
        ? new Date(dateStr.seconds * 1000)
        : new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const diff = new Date() - date;
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  if (weeks === 1) return "1 week ago";
  if (weeks < 4) return `${weeks} weeks ago`;
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SAR: "ر.س",
  CAD: "C$",
  AUD: "A$",
  SGD: "S$",
  MYR: "RM",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  CHF: "Fr",
  QAR: "ر.ق",
  KWD: "د.ك",
  BHD: "BD",
  OMR: "ر.ع.",
};

function formatSalary(job) {
  const code = job.currencies?.[0] || "INR";
  const sym = CURRENCY_SYMBOLS[code] || code;
  if (job.payStructure === "Negotiable") return "Negotiable";
  if (job.payStructure === "Salary Range" && job.salaryMin && job.salaryMax)
    return `${sym}${Number(job.salaryMin).toLocaleString()} – ${sym}${Number(job.salaryMax).toLocaleString()}`;
  if (job.payStructure === "Fixed" && job.fixedSalary)
    return `${sym}${Number(job.fixedSalary).toLocaleString()} / yr`;
  if (job.payStructure === "Hourly" && job.hourlyRate)
    return `${sym}${job.hourlyRate} / hr`;
  return null;
}

function formatRate(project) {
  if (project.rateType === "On Discussion") return "On Discussion";
  if (project.rateAmount)
    return `₹${Number(project.rateAmount).toLocaleString()} ${project.rateType || ""}`.trim();
  return null;
}

function JobCardHorizontal({ job, isSaved, onSaveToggle, onClick }) {
  const location = [job.location, job.targetCountry].filter(Boolean).join(", ");
  const posted = timeAgo(job.publishedAt || job.createdAt);
  const salary = formatSalary(job);

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
        minWidth: 280,
        width: 280,
        minHeight: 190,
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
            className="text-[13px] truncate"
            style={{ fontWeight: 700, color: "#334155" }}
          >
            {job.companyName || "Company"}
          </p>
          {salary && (
            <p
              className="text-[13px] mt-1"
              style={{ fontWeight: 800, color: "#60A5FA" }}
            >
              {salary}
            </p>
          )}
          {location && (
            <p
              className="text-xs truncate flex items-center gap-1 mt-0.5"
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
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full inline-block"
            style={{
              color: "#60a5fa",
              backgroundColor: "#eff6ff",
              fontWeight: 700,
            }}
          >
            {posted}
          </span>
        )}
      </div>
    </div>
  );
}

function ProjectCardHorizontal({ project, isSaved, onSaveToggle, onClick }) {
  const location = [project.location, project.state].filter(Boolean).join(", ");
  const posted = timeAgo(project.publishedAt || project.createdAt);
  const rate = formatRate(project);

  const handleSave = async (e) => {
    e.stopPropagation();
    const { auth: fbAuth, db: fbDb } = await import("@/lib/firebase");
    const user = fbAuth.currentUser;
    if (!user) return;
    const ref = doc(fbDb, "savedProjects", `${user.uid}_${project.id}`);
    if (isSaved) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        applicantUid: user.uid,
        projectId: project.id,
        savedAt: new Date().toISOString(),
      });
    }
    onSaveToggle(project.id);
  };

  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-slate-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between gap-3"
      style={{
        minWidth: 280,
        width: 280,
        minHeight: 190,
        flexShrink: 0,
        backgroundColor: "#f8fafc",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {project.urgent && (
            <span
              className="inline-block mb-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}
            >
              Urgent hiring
            </span>
          )}
          <h3
            className="text-[15px] leading-snug"
            style={{ fontWeight: 800, color: "#0f172a" }}
          >
            {project.title}
          </h3>
          <p
            className="text-[13px] truncate"
            style={{ fontWeight: 700, color: "#334155" }}
          >
            {project.company || "Company"}
          </p>
          {rate && (
            <p
              className="text-[13px] mt-1"
              style={{ fontWeight: 800, color: "#60A5FA" }}
            >
              {rate}
            </p>
          )}
          {location && (
            <p
              className="text-xs truncate flex items-center gap-1 mt-0.5"
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
        {(project.projectType || project.workType) && (
          <div className="flex flex-wrap gap-1">
            {project.projectType && (
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full border bg-white"
                style={{
                  borderColor: "#cbd5e1",
                  color: "#1e293b",
                  fontWeight: 700,
                }}
              >
                {project.projectType}
              </span>
            )}
            {project.workType && (
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full border bg-white"
                style={{
                  borderColor: "#cbd5e1",
                  color: "#1e293b",
                  fontWeight: 700,
                }}
              >
                {project.workType}
              </span>
            )}
          </div>
        )}
        {posted && (
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full inline-block"
            style={{
              color: "#60a5fa",
              backgroundColor: "#eff6ff",
              fontWeight: 700,
            }}
          >
            {posted}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const projScrollRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [userName, setUserName] = useState("");
  const [completedItems, setCompletedItems] = useState({});
  const [isGraduate, setIsGraduate] = useState(true);
  const [isSimple, setIsSimple] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canProjScrollLeft, setCanProjScrollLeft] = useState(false);
  const [canProjScrollRight, setCanProjScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  const scroll = (dir) =>
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -260 : 260,
      behavior: "smooth",
    });

  const checkProjScroll = () => {
    const el = projScrollRef.current;
    if (!el) return;
    setCanProjScrollLeft(el.scrollLeft > 4);
    setCanProjScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  const scrollProj = (dir) =>
    projScrollRef.current?.scrollBy({
      left: dir === "left" ? -260 : 260,
      behavior: "smooth",
    });

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
    const el = projScrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkProjScroll);
    const t = setTimeout(checkProjScroll, 150);
    return () => {
      el.removeEventListener("scroll", checkProjScroll);
      clearTimeout(t);
    };
  }, [projects]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Jobs + saved jobs + user profile — unchanged from the working version.
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
        const today = new Date().toISOString().split("T")[0];
        setJobs(
          jobsSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter(
              (job) =>
                !job.applicationDeadline || job.applicationDeadline >= today,
            ),
        );
        setSavedJobs(savedSnap.docs.map((d) => d.data().jobId));

        if (userSnap.exists()) {
          const data = userSnap.data();
          const about = data.about || {};
          setUserName(
            data.firstName || about.firstName || data.name?.split(" ")[0] || "",
          );
          const profileType = data.profileType || "";
          const eduLevel = about.educationLevel || data.educationLevel || "";
          const simple = profileType === "simple" || eduLevel === "simple";
          setIsSimple(simple);
          setIsGraduate(!simple && eduLevel !== "");
          if (!simple) {
            setCompletedItems({
              basicInfo: !!(
                (data.firstName || about.firstName || data.name) &&
                (data.phone || data.phoneNumber || about.phone)
              ),
              about: !!(
                about.description ||
                about.currentRole ||
                about.bio ||
                data.bio
              ),
              skills:
                !!(Array.isArray(about.skills) && about.skills.length > 0) ||
                !!(Array.isArray(data.skills) && data.skills.length > 0),
              experience:
                !!(
                  Array.isArray(data.experience) && data.experience.length > 0
                ) ||
                !!(
                  Array.isArray(about.experience) && about.experience.length > 0
                ) ||
                !!about.currentRole,
              education:
                !!(
                  Array.isArray(data.education) && data.education.length > 0
                ) ||
                !!about.educationLevel ||
                !!about.institution,
              links: !!(
                data.linkedin ||
                data.github ||
                data.portfolio ||
                about.linkedin ||
                about.github
              ),
              resume: !!(data.resumeUrl || data.resume || about.resume),
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }

      // Projects + saved projects are fetched separately and isolated:
      // a problem here won't take down the Jobs section above.
      try {
        const projectsSnap = await getDocs(
          query(collection(db, "projects"), orderBy("createdAt", "desc")),
        );
        setProjects(projectsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Failed to load projects:", err);
      }

      try {
        const savedProjSnap = await getDocs(
          query(
            collection(db, "savedProjects"),
            where("applicantUid", "==", user.uid),
          ),
        );
        setSavedProjects(savedProjSnap.docs.map((d) => d.data().projectId));
      } catch (err) {
        console.error("Failed to load saved projects:", err);
      }
    });
    return () => unsub();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="w-7 h-7 border-[3px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#60a5fa", borderTopColor: "transparent" }}
        />
      </div>
    );

  return (
    <div
      className="min-h-screen pb-20 md:pb-6 px-4 sm:px-6"
      style={{
        backgroundColor: "#f8fafc",
        fontFamily: "'Inter','DM Sans',system-ui,sans-serif",
        paddingTop: "12px",
      }}
    >
      {userName && (
        <p className="text-xl font-bold text-slate-900 mb-3 md:mb-6 md:mt-2">
          Welcome back, {userName}
        </p>
      )}

      {!isSimple && (
        <div className="xl:hidden mb-3">
          <ProfileStrength
            completedItems={completedItems}
            isGraduate={isGraduate}
            mobileOnly={true}
            onImprove={() => router.push("/dashboard/profile")}
          />
        </div>
      )}

      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 px-6 text-center shadow-sm">
              <span style={{ fontSize: 32 }}>☞</span>
              <p className="text-base font-bold text-slate-700 mt-3 mb-1">
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
                <h2
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: "#60a5fa" }}
                >
                  Jobs for you
                </h2>
                <div className="flex items-center gap-2">
                  {(canScrollLeft || canScrollRight) && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 disabled:opacity-25 hover:bg-slate-50"
                      >
                        <ChevronLeft size={14} className="text-slate-500" />
                      </button>
                      <button
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 disabled:opacity-25 hover:bg-slate-50"
                      >
                        <ChevronRight size={14} className="text-slate-500" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => router.push("/dashboard/jobs")}
                    className="flex items-center gap-1 text-xs font-semibold hover:opacity-75 transition-opacity"
                    style={{ color: "#60a5fa" }}
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
                      setSavedJobs((p) =>
                        p.includes(id) ? p.filter((j) => j !== id) : [...p, id],
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

          {projects.length > 0 && (
            <div
              className="bg-white rounded-2xl border border-slate-200 p-4"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-sm font-bold uppercase tracking-wide flex items-center gap-1.5"
                  style={{ color: "#60a5fa" }}
                >
                  <HardHat size={14} />
                  Projects for you
                </h2>
                <div className="flex items-center gap-2">
                  {(canProjScrollLeft || canProjScrollRight) && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => scrollProj("left")}
                        disabled={!canProjScrollLeft}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 disabled:opacity-25 hover:bg-slate-50"
                      >
                        <ChevronLeft size={14} className="text-slate-500" />
                      </button>
                      <button
                        onClick={() => scrollProj("right")}
                        disabled={!canProjScrollRight}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 disabled:opacity-25 hover:bg-slate-50"
                      >
                        <ChevronRight size={14} className="text-slate-500" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => router.push("/dashboard/projects")}
                    className="flex items-center gap-1 text-xs font-semibold hover:opacity-75 transition-opacity"
                    style={{ color: "#60a5fa" }}
                  >
                    View all <ArrowRight size={13} />
                  </button>
                </div>
              </div>
              <div
                ref={projScrollRef}
                className="flex gap-3 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {projects.slice(0, 8).map((project) => (
                  <ProjectCardHorizontal
                    key={project.id}
                    project={project}
                    isSaved={savedProjects.includes(project.id)}
                    onSaveToggle={(id) =>
                      setSavedProjects((p) =>
                        p.includes(id) ? p.filter((j) => j !== id) : [...p, id],
                      )
                    }
                    onClick={() =>
                      router.push(`/dashboard/projects?projectId=${project.id}`)
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
      </div>
    </div>
  );
}