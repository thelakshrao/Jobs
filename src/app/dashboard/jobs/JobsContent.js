"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import JobCard from "@/dashboardComponents/jobs/JobCard";
import JobDetail from "@/dashboardComponents/jobs/JobDetail";
import { Briefcase, X } from "lucide-react";

const BLUE = "#004aac";

export default function JobsContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("jobId");
  const urlKeyword = searchParams.get("q") || searchParams.get("search") || "";
  const urlLocation = searchParams.get("location") || "";
  const urlJobType = searchParams.get("jobType") || "";
  const urlWorkType = searchParams.get("workType") || "";
  const urlDepartment = searchParams.get("department") || "";

  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "jobs"), where("status", "==", "Open")),
        );
        const today = new Date().toISOString().split("T")[0];
        const loaded = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter(
            (job) =>
              !job.applicationDeadline || job.applicationDeadline >= today,
          );
        setJobs(loaded);
        setFiltered(loaded);
        if (preselectedId) {
          const match = loaded.find((j) => j.id === preselectedId);
          setSelectedJob(match || loaded[0] || null);
          if (match && window.innerWidth < 1024) setMobileDrawerOpen(true);
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
    if (!jobs.length) return;
    if (
      !urlKeyword &&
      !urlLocation &&
      !urlJobType &&
      !urlWorkType &&
      !urlDepartment
    )
      return;

    const keyword = urlKeyword.toLowerCase();
    const loc = urlLocation.toLowerCase();

    const result = jobs.filter((job) => {
      const matchKeyword =
        !keyword ||
        job.title?.toLowerCase().includes(keyword) ||
        job.companyName?.toLowerCase().includes(keyword);
      const matchLocation =
        !loc ||
        job.location?.toLowerCase().includes(loc) ||
        job.targetCountry?.toLowerCase().includes(loc);
      const jobTypeValue = job.jobType || job.type;
      const matchJobType = !urlJobType || jobTypeValue === urlJobType;
      const matchWorkType = !urlWorkType || job.workType === urlWorkType;
      const matchDepartment =
        !urlDepartment || job.department === urlDepartment;
      return (
        matchKeyword &&
        matchLocation &&
        matchJobType &&
        matchWorkType &&
        matchDepartment
      );
    });

    setFiltered(result);

    if (preselectedId) {
      const stillPresent = result.find((j) => j.id === preselectedId);
      if (stillPresent) {
        setSelectedJob(stillPresent);
        return;
      }
    }
    setSelectedJob(result[0] || null);
  }, [
    jobs,
    urlKeyword,
    urlLocation,
    urlJobType,
    urlWorkType,
    urlDepartment,
    preselectedId,
  ]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      try {
        const snap = await getDocs(
          query(
            collection(db, "savedJobs"),
            where("applicantUid", "==", user.uid),
          ),
        );
        setSavedJobs(snap.docs.map((d) => d.data().jobId));
      } catch (err) {
        console.error(err);
      }
    });
    return () => unsub();
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

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileDrawerOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleCardClick = (job) => {
    setSelectedJob(job);
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
          {filtered.length} jobs found
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Matching your profile</p>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-24 px-6 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "#e8f0fb" }}
          >
            <Briefcase size={24} style={{ color: BLUE }} />
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
          <div
            className="shrink-0 flex flex-col gap-3 w-full lg:w-95 lg:sticky lg:top-6 overflow-y-auto pr-1"
            style={{ maxHeight: "calc(100vh - 140px)" }}
          >
            {filtered.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
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
            {selectedJob && (
              <JobDetail
                key={selectedJob.id}
                job={selectedJob}
                isSaved={savedJobs.includes(selectedJob.id)}
                onSaveToggle={saveToggle}
              />
            )}
          </div>
        </div>
      )}

      {mobileDrawerOpen && selectedJob && (
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
                key={selectedJob.id}
                job={selectedJob}
                isSaved={savedJobs.includes(selectedJob.id)}
                onSaveToggle={saveToggle}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}