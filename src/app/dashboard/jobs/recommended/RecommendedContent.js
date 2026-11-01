"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import JobCard from "@/dashboardComponents/jobs/JobCard";
import JobDetail from "@/dashboardComponents/jobs/JobDetail";
import { buildProfile, getRecommendedJobs, profileHasSignal } from "@/lib/jobRecommendations";
import { Sparkles, UserCog, X } from "lucide-react";

const BLUE = "#004aac";

function EmptyState({ icon: Icon, title, text, href, button }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-24 px-6 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "#e8f0fb" }}
      >
        <Icon size={24} style={{ color: BLUE }} />
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">{title}</h2>
      <p className="text-sm text-slate-500 mb-5 max-w-sm">{text}</p>
      <Link
        href={href}
        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
        style={{ backgroundColor: BLUE }}
      >
        {button}
      </Link>
    </div>
  );
}

export default function RecommendedContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("jobId");

  const [jobs, setJobs] = useState([]);
  const [userData, setUserData] = useState(null);
  const [selectedId, setSelectedId] = useState(preselectedId);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Wait for login, then load the profile, the open jobs and the saved jobs
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [userSnap, jobsSnap, savedSnap] = await Promise.all([
          getDoc(doc(db, "users", user.uid)),
          getDocs(query(collection(db, "jobs"), where("status", "==", "Open"))),
          getDocs(query(collection(db, "savedJobs"), where("applicantUid", "==", user.uid))),
        ]);
        const today = new Date().toISOString().split("T")[0];
        setUserData(userSnap.exists() ? userSnap.data() : {});
        setJobs(
          jobsSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((j) => !j.applicationDeadline || j.applicationDeadline >= today),
        );
        setSavedJobs(savedSnap.docs.map((d) => d.data().jobId));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const profile = useMemo(() => (userData ? buildProfile(userData) : null), [userData]);
  const recommended = useMemo(
    () => (profile ? getRecommendedJobs(jobs, profile) : []),
    [jobs, profile],
  );

  const selected =
    recommended.find((r) => r.job.id === selectedId)?.job ||
    recommended[0]?.job ||
    null;

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileDrawerOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleCardClick = (job) => {
    setSelectedId(job.id);
    if (window.innerWidth < 1024) setMobileDrawerOpen(true);
  };

  const saveToggle = (id) =>
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id],
    );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-7 h-7 border-[3px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: BLUE, borderTopColor: "transparent" }}
        />
      </div>
    );

  const noSignal = !profile || !profileHasSignal(profile);

  return (
    <div
      className="min-h-screen pt-4 pb-20 md:pb-6 px-4 sm:px-6"
      style={{
        backgroundColor: "#ffffff",
        fontFamily: "'Inter','DM Sans',system-ui,sans-serif",
      }}
    >
      <div className="mb-4">
        <h1 className="text-lg font-bold text-slate-900">
          {noSignal
            ? "Recommended jobs"
            : `${recommended.length} job${recommended.length === 1 ? "" : "s"} recommended for you`}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Based on the roles and skills in your profile
        </p>
      </div>

      {noSignal ? (
        <EmptyState
          icon={UserCog}
          title="Add the roles you're looking for"
          text="Complete your profile to get recommendations. Pick the roles you want and add your skills."
          href="/dashboard/profile"
          button="Complete your profile"
        />
      ) : recommended.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No matches yet"
          text="No open job matches your profile right now. Check all jobs, or add more roles and skills to your profile."
          href="/dashboard/jobs"
          button="See all jobs"
        />
      ) : (
        <div className="flex gap-4 items-start">
          <div
            className="shrink-0 flex flex-col gap-3 w-full lg:w-95 lg:sticky lg:top-6 overflow-y-auto pr-1"
            style={{ maxHeight: "calc(100vh - 140px)" }}
          >
            {recommended.map(({ job, reason }) => (
              <JobCard
                key={job.id}
                job={job}
                reason={reason}
                isSelected={selected?.id === job.id}
                isSaved={savedJobs.includes(job.id)}
                onClick={() => handleCardClick(job)}
                onSaveToggle={saveToggle}
              />
            ))}
          </div>

          <div
            className="hidden lg:block flex-1 min-w-0 sticky top-6 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 140px)" }}
          >
            {selected && (
              <JobDetail
                key={selected.id}
                job={selected}
                isSaved={savedJobs.includes(selected.id)}
                onSaveToggle={saveToggle}
              />
            )}
          </div>
        </div>
      )}

      {mobileDrawerOpen && selected && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-50 lg:hidden flex flex-col rounded-t-3xl overflow-hidden"
            style={{
              backgroundColor: "#fff",
              maxHeight: "92vh",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
              animation: "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
              <div />
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-0">
              <JobDetail
                key={selected.id}
                job={selected}
                isSaved={savedJobs.includes(selected.id)}
                onSaveToggle={saveToggle}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
