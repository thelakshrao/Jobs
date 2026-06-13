"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Bookmark,
  Briefcase,
  MapPin,
  ChevronRight,
  Search,
} from "lucide-react";
import SearchNavbar from "@/dashboardComponents/SearchNavbar";
import ProfileStrength from "@/profileComponents/ProfileStrength";
import { computeCompletedItems } from "@/lib/Computecompleteditems";
import { DEFAULT_PROFILE, DEFAULT_ABOUT } from "@/profileComponents/shared";

const BLUE = "#60a5fa";

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const d = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const diff = (new Date() - d) / (1000 * 60 * 60 * 24);
  if (diff < 1) return "Today";
  if (diff < 2) return "Yesterday";
  if (diff < 7) return `${Math.floor(diff)}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const STATUS_COLORS = {
  Applied: { bg: "#eff6ff", text: "#60a5fa", border: "#bfdbfe" },
  Shortlisted: { bg: "#fefce8", text: "#854d0e", border: "#fde047" },
  Rejected: { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" },
  Hired: { bg: "#f0fdf4", text: "#166534", border: "#86efac" },
};

const TABS = ["Saved", "Applied"];

export default function MyJobsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Applied");
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [resumeURL, setResumeURL] = useState("");
  const [profileSlug, setProfileSlug] = useState(null);

  const isGraduate = about.educationLevel === "graduate";
  const isSimple = profile.profileType === "simple";
  const completedItems = computeCompletedItems({
    profile,
    about,
    experiences,
    educations,
    resumeURL,
  });
  const showStrength = isGraduate && !isSimple;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/dashboard/login");
        return;
      }
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfile({ ...DEFAULT_PROFILE, ...data });
          setAbout({ ...DEFAULT_ABOUT, ...(data.about || {}) });
          setExperiences(data.experiences || []);
          setEducations(data.educations || []);
          setResumeURL(data.resumeURL || data.resume?.url || "");
          setProfileSlug(data.slug || null);
        }

        const savedSnap = await getDocs(
          query(
            collection(db, "savedJobs"),
            where("applicantUid", "==", user.uid),
          ),
        );
        const savedJobIds = savedSnap.docs.map((d) => d.data().jobId);
        const savedJobDetails = await Promise.all(
          savedJobIds.map(async (jobId) => {
            const jobDoc = await getDoc(doc(db, "jobs", jobId));
            if (!jobDoc.exists()) return null;
            return { id: jobDoc.id, ...jobDoc.data() };
          }),
        );
        setSavedJobs(savedJobDetails.filter(Boolean));

        const appliedSnap = await getDocs(
          query(
            collection(db, "applications"),
            where("applicantUid", "==", user.uid),
          ),
        );
        const apps = appliedSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const dateA = a.appliedAt?.toDate
              ? a.appliedAt.toDate()
              : new Date(a.appliedAt || 0);
            const dateB = b.appliedAt?.toDate
              ? b.appliedAt.toDate()
              : new Date(b.appliedAt || 0);
            return dateB - dateA;
          });
        setAppliedJobs(apps);
      } catch (err) {
        console.error("My jobs fetch error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const counts = { Saved: savedJobs.length, Applied: appliedJobs.length };
  const now = new Date();
  const recentApplied = appliedJobs.filter((a) => {
    const d = a.appliedAt?.toDate
      ? a.appliedAt.toDate()
      : new Date(a.appliedAt);
    return (now - d) / (1000 * 60 * 60 * 24) <= 14;
  });
  const olderApplied = appliedJobs.filter((a) => {
    const d = a.appliedAt?.toDate
      ? a.appliedAt.toDate()
      : new Date(a.appliedAt);
    return (now - d) / (1000 * 60 * 60 * 24) > 14;
  });
  const isEmpty =
    (activeTab === "Saved" && savedJobs.length === 0) ||
    (activeTab === "Applied" && appliedJobs.length === 0);

  const goToProfile = () =>
    profileSlug
      ? router.push(`/dashboard/${profileSlug}`)
      : router.push("/dashboard/profile");

  return (
    <>
      <SearchNavbar />
      <main className="min-h-screen bg-[#f8fafc] pb-16 md:pb-0">
        <div className="w-full max-w-6xl mx-auto pt-3 md:pt-6">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 px-3 sm:px-6">
            My jobs
          </h1>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0 w-full">
              {showStrength && (
                <div className="lg:hidden mb-3">
                  <ProfileStrength
                    completedItems={completedItems}
                    isGraduate={isGraduate}
                    mobileOnly={true}
                    onImprove={goToProfile}
                  />
                </div>
              )}

              <div className="px-3 sm:px-6">
                <div className="flex border-b border-slate-200 mb-6 gap-6">
                  {TABS.map((tab) => {
                    const active = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="pb-3 text-sm md:text-base font-black flex items-center gap-1.5 transition-colors"
                        style={{
                          color: active ? BLUE : "#94a3b8",
                          borderBottom: active
                            ? `2px solid ${BLUE}`
                            : "2px solid transparent",
                          marginBottom: "-1px",
                        }}
                      >
                        <span className="text-sm md:text-base font-black">
                          {counts[tab]}
                        </span>
                        {tab}
                      </button>
                    );
                  })}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div
                      className="w-7 h-7 border-[3px] rounded-full animate-spin"
                      style={{ borderColor: "#bfdbfe", borderTopColor: BLUE }}
                    />
                  </div>
                ) : isEmpty ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: "#eff6ff" }}
                    >
                      {activeTab === "Saved" ? (
                        <Bookmark size={28} style={{ color: BLUE }} />
                      ) : (
                        <Briefcase size={28} style={{ color: BLUE }} />
                      )}
                    </div>
                    <p className="text-lg font-black text-slate-800 mb-1">
                      {activeTab === "Saved"
                        ? "No saved jobs yet"
                        : "No applications yet"}
                    </p>
                    <p className="text-sm font-semibold text-slate-400 mb-6 max-w-xs">
                      {activeTab === "Saved"
                        ? "Save jobs you're interested in and find them here."
                        : "Jobs you apply to will appear here."}
                    </p>
                    <Link
                      href="/dashboard/jobs"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                      style={{ backgroundColor: BLUE }}
                    >
                      <Search size={14} />
                      Browse jobs
                    </Link>
                  </div>
                ) : activeTab === "Saved" ? (
                  <div className="flex flex-col gap-3">
                    {savedJobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/dashboard/jobs?jobId=${job.id}`}
                        className="bg-white rounded-2xl border px-5 py-4 flex items-start gap-4 transition-all group"
                        style={{
                          borderColor: "#e2e8f0",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = BLUE)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = "#e2e8f0")
                        }
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: "#eff6ff" }}
                        >
                          <Briefcase size={18} style={{ color: BLUE }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg md:text-xl font-black text-slate-900 leading-tight">
                            {job.title}
                          </p>
                          <p className="text-sm font-semibold text-slate-500 mt-0.5">
                            {job.companyName || "Company"}
                          </p>
                          {(job.location || job.targetCountry) && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin size={10} />
                              {[job.location, job.targetCountry]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          size={16}
                          className="shrink-0 mt-1"
                          style={{ color: "#bfdbfe" }}
                        />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {recentApplied.length > 0 && (
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                          Last 14 days
                        </p>
                        <div className="flex flex-col gap-2">
                          {recentApplied.map((app) => (
                            <AppliedCard key={app.id} app={app} />
                          ))}
                        </div>
                      </div>
                    )}
                    {olderApplied.length > 0 && (
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                          Older
                        </p>
                        <div className="flex flex-col gap-2">
                          {olderApplied.map((app) => (
                            <AppliedCard key={app.id} app={app} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {showStrength && (
              <div className="hidden lg:block shrink-0 w-72">
                <ProfileStrength
                  completedItems={completedItems}
                  isGraduate={isGraduate}
                  onImprove={goToProfile}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function AppliedCard({ app }) {
  const sc = STATUS_COLORS[app.status] || STATUS_COLORS.Applied;
  const when = timeAgo(app.appliedAt);
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-start gap-4"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: "#eff6ff" }}
      >
        <Briefcase size={18} style={{ color: BLUE }} />
      </div>
      <div className="flex-1 min-w-0">
        <span
          className="text-[11px] font-black px-2.5 py-1 rounded-full inline-block mb-1.5"
          style={{
            backgroundColor: sc.bg,
            color: sc.text,
            border: `1px solid ${sc.border}`,
          }}
        >
          {app.status || "Applied"}
        </span>
        <Link
          href={`/dashboard/jobs?jobId=${app.jobId}`}
          className="block text-lg md:text-xl font-black text-slate-900 leading-tight hover:underline underline-offset-2"
        >
          {app.jobTitle}
        </Link>
        <p className="text-sm font-semibold text-slate-500 mt-0.5">
          {app.companyName}
        </p>
        {app.applicantLocation && (
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
            <MapPin size={10} />
            {app.applicantLocation}
          </p>
        )}
        {when && (
          <p className="text-xs text-slate-400 mt-1.5">Applied {when}</p>
        )}
      </div>
    </div>
  );
}
