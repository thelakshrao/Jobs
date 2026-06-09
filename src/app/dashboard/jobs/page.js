"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import JobCard from "@/dashboardComponents/jobs/JobCard";
import JobDetail from "@/dashboardComponents/jobs/JobDetail";
import { Briefcase } from "lucide-react";

export default function JobsPage() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("jobId");

  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, "jobs"), where("status", "==", "Open"));
        const snap = await getDocs(q);
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setJobs(loaded);
        setFiltered(loaded);
        if (preselectedId) {
          const match = loaded.find((j) => j.id === preselectedId);
          setSelectedJob(match || loaded[0] || null);
        } else {
          setSelectedJob(loaded[0] || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [preselectedId]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "savedJobs"),
          where("applicantUid", "==", user.uid),
        );
        const snap = await getDocs(q);
        setSavedJobs(snap.docs.map((d) => d.data().jobId));
      } catch (err) {
        console.error(err);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { title = "", location = "" } = e.detail || {};
      const result = jobs.filter((job) => {
        const matchTitle =
          !title ||
          job.title?.toLowerCase().includes(title.toLowerCase()) ||
          job.companyName?.toLowerCase().includes(title.toLowerCase());
        const matchLocation =
          !location ||
          job.location?.toLowerCase().includes(location.toLowerCase()) ||
          job.targetCountry?.toLowerCase().includes(location.toLowerCase());
        return matchTitle && matchLocation;
      });
      setFiltered(result);
      setSelectedJob(result.length > 0 ? result[0] : null);
    };
    window.addEventListener("jobSearch", handler);
    return () => window.removeEventListener("jobSearch", handler);
  }, [jobs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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
      <div className="mb-4">
        <h1 className="text-lg font-bold text-slate-900">
          {filtered.length} jobs found
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Matching your profile</p>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-24 px-6 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "#eff6ff" }}
          >
            <Briefcase size={24} style={{ color: "#60a5fa" }} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            No jobs found
          </h2>
          <p className="text-sm text-slate-500">
            Try different keywords or location
          </p>
        </div>
      ) : (
        <div className="flex gap-4 items-start">
          <div className="shrink-0 flex flex-col gap-3 w-full lg:w-95">
            {filtered.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                isSaved={savedJobs.includes(job.id)}
                onClick={() => setSelectedJob(job)}
                onSaveToggle={(id) =>
                  setSavedJobs((prev) =>
                    prev.includes(id)
                      ? prev.filter((j) => j !== id)
                      : [...prev, id],
                  )
                }
              />
            ))}
          </div>

          <div className="hidden lg:block flex-1 min-w-0 sticky top-6">
            {selectedJob && (
              <JobDetail
                key={selectedJob.id}
                job={selectedJob}
                isSaved={savedJobs.includes(selectedJob.id)}
                onSaveToggle={(id) =>
                  setSavedJobs((prev) =>
                    prev.includes(id)
                      ? prev.filter((j) => j !== id)
                      : [...prev, id],
                  )
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
