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
  Briefcase,
} from "lucide-react";
import ProfileStrength from "@/profileComponents/ProfileStrength";
import { computeCompletedItems } from "@/lib/Computecompleteditems";
import PromoBannerCarousel from "@/components/PromoBannerCarousel";
import { CURRENCIES } from "@/app/employer/dashboard/create-job/constants";

function timeAgo(dateStr) {
  if (!dateStr) return null;
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


function getSymbol(code) {
  return CURRENCIES.find((c) => c.code === code)?.symbol || code || "₹";
}

function formatSalary(job) {
  const code = job.currencies?.[0] || "INR";
  const sym = getSymbol(code);
  if (job.payStructure === "Negotiable") return "Negotiable";
  if (job.payStructure === "Salary Range" && job.salaryMin && job.salaryMax)
    return `${sym}${Number(job.salaryMin).toLocaleString()} – ${sym}${Number(job.salaryMax).toLocaleString()} ${job.salaryUnit || ""}`.trim();
  if (job.payStructure === "Fixed" && job.fixedSalary)
    return `${sym}${Number(job.fixedSalary).toLocaleString()} ${job.salaryUnit || ""}`.trim();
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
function JobCardHorizontal({
  job,
  isSaved,
  onSaveToggle,
  onClick,
  onAuthRequired,
}) {
  const location = [job.location, job.targetCountry].filter(Boolean).join(", ");
  const posted = timeAgo(job.publishedAt || job.createdAt);
  const salary = formatSalary(job);
  const handleSave = async (e) => {
    e.stopPropagation();
    const { auth: fbAuth, db: fbDb } = await import("@/lib/firebase");
    const user = fbAuth.currentUser;
    if (!user) {
      onAuthRequired();
      return;
    }
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
      className="rounded-2xl border-2 border-gray-200 p-5 cursor-pointer hover:border-[#004AAC]/50 hover:shadow-md transition-all flex flex-col justify-between gap-3"
      style={{
        minWidth: 280,
        width: 280,
        minHeight: 190,
        flexShrink: 0,
        backgroundColor: "#F7F8FA",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {job.urgency === "High" && (
            <span
              className="inline-block mb-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#D6E3F7", color: "#004AAC" }}
            >
              Easily apply
            </span>
          )}
          <h3
            className="text-[15px] leading-snug"
            style={{ fontWeight: 800, color: "#0A0E17" }}
          >
            {job.title}
          </h3>
          <p
            className="text-[13px] truncate"
            style={{ fontWeight: 700, color: "#374151" }}
          >
            {job.companyName || "Company"}
          </p>
          {salary && (
            <p
              className="text-[13px] mt-1"
              style={{ fontWeight: 800, color: "#004AAC" }}
            >
              {salary}
            </p>
          )}
          {location && (
            <p
              className="text-xs truncate flex items-center gap-1 mt-0.5"
              style={{ fontWeight: 600, color: "#6B7280" }}
            >
              <MapPin size={10} className="shrink-0 text-gray-400" />
              {location}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors shrink-0 bg-white cursor-pointer"
        >
          {isSaved ? (
            <BookmarkCheck size={14} style={{ color: "#004AAC" }} />
          ) : (
            <Bookmark size={14} className="text-gray-400" />
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
                  borderColor: "#D1D5DB",
                  color: "#0A0E17",
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
              color: "#004AAC",
              backgroundColor: "#EAF1FC",
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
function ProjectCardHorizontal({
  project,
  isSaved,
  onSaveToggle,
  onClick,
  onAuthRequired,
}) {
  const location = [project.location, project.state].filter(Boolean).join(", ");
  const posted = timeAgo(project.publishedAt || project.createdAt);
  const rate = formatRate(project);
  const handleSave = async (e) => {
    e.stopPropagation();
    const { auth: fbAuth, db: fbDb } = await import("@/lib/firebase");
    const user = fbAuth.currentUser;
    if (!user) {
      onAuthRequired();
      return;
    }
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
      className="rounded-2xl border-2 border-gray-200 p-5 cursor-pointer hover:border-[#004AAC]/50 hover:shadow-md transition-all flex flex-col justify-between gap-3"
      style={{
        minWidth: 280,
        width: 280,
        minHeight: 190,
        flexShrink: 0,
        backgroundColor: "#F7F8FA",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {project.urgent && (
            <span
              className="inline-block mb-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#D6E3F7", color: "#004AAC" }}
            >
              Urgent hiring
            </span>
          )}
          <h3
            className="text-[15px] leading-snug"
            style={{ fontWeight: 800, color: "#0A0E17" }}
          >
            {project.title}
          </h3>
          <p
            className="text-[13px] truncate"
            style={{ fontWeight: 700, color: "#374151" }}
          >
            {project.company || "Company"}
          </p>
          {rate && (
            <p
              className="text-[13px] mt-1"
              style={{ fontWeight: 800, color: "#004AAC" }}
            >
              {rate}
            </p>
          )}
          {location && (
            <p
              className="text-xs truncate flex items-center gap-1 mt-0.5"
              style={{ fontWeight: 600, color: "#6B7280" }}
            >
              <MapPin size={10} className="shrink-0 text-gray-400" />
              {location}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors shrink-0 bg-white cursor-pointer"
        >
          {isSaved ? (
            <BookmarkCheck size={14} style={{ color: "#004AAC" }} />
          ) : (
            <Bookmark size={14} className="text-gray-400" />
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
                  borderColor: "#D1D5DB",
                  color: "#0A0E17",
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
                  borderColor: "#D1D5DB",
                  color: "#0A0E17",
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
              color: "#004AAC",
              backgroundColor: "#EAF1FC",
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
function LoginPromptModal({ onClose, router }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: "#EAF1FC" }}
        >
          <Briefcase size={22} style={{ color: "#004AAC" }} />
        </div>
        <h2 className="text-lg font-black text-gray-900 mb-1">
          Sign in to continue
        </h2>
        <p className="text-sm font-medium text-gray-500 mb-5">
          Create an account or sign in to save jobs, apply, and track your
          applications.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/login")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "#004AAC" }}
          >
            Sign in
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
export default function DashboardHome() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const projScrollRef = useRef(null);
  const [authed, setAuthed] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [userName, setUserName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [completedItems, setCompletedItems] = useState({});
  const [isGraduate, setIsGraduate] = useState(true);
  const [isSimple, setIsSimple] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canProjScrollLeft, setCanProjScrollLeft] = useState(false);
  const [canProjScrollRight, setCanProjScrollRight] = useState(false);
  const projectsToday = new Date().toISOString().split("T")[0];
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
        setAuthed(false);
        setLoading(false);
        try {
          const [jobsSnap, projectsSnap] = await Promise.all([
            getDocs(
              query(collection(db, "jobs"), where("status", "==", "Open")),
            ),
            getDocs(
              query(collection(db, "projects"), orderBy("createdAt", "desc")),
            ),
          ]);
          const today = new Date().toISOString().split("T")[0];
          setJobs(
            jobsSnap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter((job) => {
                if (job.status === "closed" || job.status === "draft")
                  return false;
                if (job.applicationDeadline && job.applicationDeadline < today)
                  return false;
                return true;
              }),
          );
          setProjects(
            projectsSnap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter((p) => !p.deadline || p.deadline >= today),
          );
        } catch (err) {
          console.error(err);
        }
        return;
      }
      setAuthed(true);
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
            .filter((job) => {
              if (job.status === "closed" || job.status === "draft")
                return false;
              if (job.applicationDeadline && job.applicationDeadline < today)
                return false;
              return true;
            }),
        );
        setSavedJobs(savedSnap.docs.map((d) => d.data().jobId));
        if (userSnap.exists()) {
          const data = userSnap.data();
          const about = data.about || {};
          const name =
            data.firstName || about.firstName || data.name?.split(" ")[0] || "";
          setUserName(name);
          setIsNewUser(!name);
          const profileType = data.profileType || "";
          const eduLevel = about.educationLevel || data.educationLevel || "";
          const simple = profileType === "simple" || eduLevel === "simple";
          setIsSimple(simple);
          const isFresher = about.isFresher === true;
          setIsGraduate(!simple && eduLevel === "graduate" && !isFresher);
          if (!simple) {
            const profile = {
              name: data.name || data.firstName || "",
              title: data.title || about.currentRole || "",
              location: data.location || about.location || "",
              phone: data.phone || data.phoneNumber || about.phone || "",
              email: data.email || "",
              linkedin: data.linkedin || about.linkedin || "",
              github: data.github || about.github || "",
              portfolio: data.portfolio || about.portfolio || "",
              twitter: data.twitter || about.twitter || "",
            };
            const experiences = data.experiences || [];
            const educations = data.educations || [];
            const resumeURL =
              data.resumeURL || data.resume?.url || data.resumeUrl || "";
            setCompletedItems(
              computeCompletedItems({
                profile,
                about,
                experiences,
                educations,
                resumeURL,
              }),
            );
          }
        } else {
          setIsNewUser(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
      try {
        const projectsSnap = await getDocs(
          query(collection(db, "projects"), orderBy("createdAt", "desc")),
        );
        setProjects(
          projectsSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((p) => !p.deadline || p.deadline >= projectsToday),
        );
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
          style={{ borderColor: "#004AAC", borderTopColor: "transparent" }}
        />
      </div>
    );
  const handleAuthRequired = () => setShowLoginPrompt(true);
  return (
    <div
      className="min-h-screen pb-20 md:pb-6 px-4 sm:px-6"
      style={{
        backgroundColor: "#ffffff",
        fontFamily: "'Inter','Outfit',system-ui,sans-serif",
        paddingTop: "12px",
        scrollPaddingTop: "80px",
      }}
    >
      {showLoginPrompt && (
        <LoginPromptModal
          onClose={() => setShowLoginPrompt(false)}
          router={router}
        />
      )}
      {authed === false && (
        <div
          className="rounded-2xl mt-5 p-6 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background: "linear-gradient(135deg, #EAF1FC 0%, #D6E3F7 100%)",
            border: "1px solid #B7C9F5",
          }}
        >
          <div>
            <h1 className="text-xl font-black text-gray-900 mb-1">
              Find your next opportunity 🚀
            </h1>
            <p className="text-sm font-semibold text-gray-500 max-w-md">
              Discover jobs and projects matched to your skills. Sign in to
              apply, save, and track your applications.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => router.push("/login")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: "#004AAC" }}
            >
              Sign in
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>
      )}
      {authed === true && isNewUser && (
        <div
          className="rounded-2xl mt-5 p-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background: "linear-gradient(135deg, #EAF1FC 0%, #D6E3F7 100%)",
            border: "1px solid #B7C9F5",
          }}
        >
          <div>
            <h1 className="text-lg font-black text-gray-900 mb-1">
              Welcome to JobsAbroad! 👋
            </h1>
            <p className="text-sm font-semibold text-gray-500">
              Complete your profile to get noticed by employers and start
              applying to jobs.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/profile")}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "#004AAC" }}
          >
            Complete profile
          </button>
        </div>
      )}
      <div className="flex gap-5 items-start mt-4">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {authed === true && !isNewUser && (
            <PromoBannerCarousel router={router} userName={userName} />
          )}
          {authed === true && !isSimple && (
            <div className="xl:hidden">
              <ProfileStrength
                completedItems={completedItems}
                isGraduate={isGraduate}
                mobileOnly={true}
                onImprove={() => router.push("/dashboard/profile")}
              />
            </div>
          )}
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-gray-200 flex flex-col items-center justify-center py-16 px-6 text-center shadow-sm">
              <span style={{ fontSize: 32 }}>☞</span>
              <p className="text-base font-bold text-gray-700 mt-3 mb-1">
                No jobs available right now
              </p>
              <p className="text-sm text-gray-400">Check back soon!</p>
            </div>
          ) : (
            <div
              className="bg-white rounded-2xl border-2 border-gray-200 p-4"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: "#004AAC" }}
                >
                  Jobs for you
                </h2>
                <div className="flex items-center gap-2">
                  {(canScrollLeft || canScrollRight) && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 disabled:opacity-25 hover:bg-gray-50 cursor-pointer"
                      >
                        <ChevronLeft size={14} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 disabled:opacity-25 hover:bg-gray-50 cursor-pointer"
                      >
                        <ChevronRight size={14} className="text-gray-500" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => router.push("/dashboard/jobs")}
                    className="flex items-center gap-1 text-xs font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                    style={{ color: "#004AAC" }}
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
                    onAuthRequired={handleAuthRequired}
                  />
                ))}
              </div>
            </div>
          )}
          {projects.length > 0 && (
            <div
              className="bg-white rounded-2xl border-2 border-gray-200 p-4"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-sm font-bold uppercase tracking-wide flex items-center gap-1.5"
                  style={{ color: "#004AAC" }}
                >
                  <HardHat size={14} /> Projects for you
                </h2>
                <div className="flex items-center gap-2">
                  {(canProjScrollLeft || canProjScrollRight) && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => scrollProj("left")}
                        disabled={!canProjScrollLeft}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 disabled:opacity-25 hover:bg-gray-50 cursor-pointer"
                      >
                        <ChevronLeft size={14} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => scrollProj("right")}
                        disabled={!canProjScrollRight}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 disabled:opacity-25 hover:bg-gray-50 cursor-pointer"
                      >
                        <ChevronRight size={14} className="text-gray-500" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => router.push("/dashboard/projects")}
                    className="flex items-center gap-1 text-xs font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                    style={{ color: "#004AAC" }}
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
                    onAuthRequired={handleAuthRequired}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        {authed === true && !isSimple && (
          <div
            className="hidden xl:block shrink-0 mt-4"
            style={{ width: "280px" }}
          >
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
