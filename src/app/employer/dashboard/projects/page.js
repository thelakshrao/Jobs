"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Plus,
  MapPin,
  Users,
  LayoutGrid,
  Trash2,
  Pencil,
  CalendarX,
  UserCheck,
  CheckCircle,
  Clock,
} from "lucide-react";
import EmployerSidebar from "@/employerComponets/EmployerSidebar";
import DashboardNavbar from "@/employerComponets/DashboardNavbar";

const BRAND = "#003882";
const BRAND_HOVER = "#002a63";
const BRAND_TINT = "#eaf1fb";

const todayStr = () => new Date().toISOString().split("T")[0];

const formatDeadline = (deadline) => {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const deadlineDays = (deadline) => {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
};

export default function AllProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      try {
        const snap = await getDocs(
          query(
            collection(db, "projects"),
            where("employerUid", "==", user.uid),
          ),
        );
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProjects(loaded);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "projects", deleteConfirm));
      setProjects((prev) => prev.filter((p) => p.id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const today = todayStr();
  const totalProjects = projects.length;
  const totalApplicants = projects.reduce(
    (s, p) => s + (Number(p.applicants) || 0),
    0,
  );
  const activeCount = projects.filter(
    (p) => !p.deadline || p.deadline >= today,
  ).length;
  const expiredCount = projects.filter(
    (p) => p.deadline && p.deadline < today,
  ).length;
  const locationsCount = new Set(
    projects.map((p) => p.state || p.location).filter(Boolean),
  ).size;

  const statCards = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: LayoutGrid,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
    {
      label: "Total Applicants",
      value: totalApplicants,
      icon: UserCheck,
      color: "text-[#003882]",
      bg: "bg-[#eaf1fb]",
    },
    {
      label: "Active Projects",
      value: activeCount,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Expired Projects",
      value: expiredCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Locations",
      value: locationsCount,
      icon: MapPin,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
  ];

  if (loading) {
    return (
      <>
        <EmployerSidebar />
        <DashboardNavbar />
        <main className="md:ml-64 pt-14 min-h-screen bg-[#e8eaed] flex items-center justify-center">
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: BRAND, borderTopColor: "transparent" }}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <EmployerSidebar />
      <DashboardNavbar />
      <main className="md:ml-64 pt-14 min-h-screen bg-[#e8eaed] pb-16">
        <div className="px-4 md:px-6 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-[#003882]">
                All Projects
              </h1>
              <p className="text-sm font-semibold text-slate-400 mt-0.5">
                {totalProjects === 0
                  ? "No projects posted yet"
                  : `${totalProjects} project${totalProjects !== 1 ? "s" : ""} posted`}
              </p>
            </div>
            <Link
              href="/employer/dashboard/create-project"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-black rounded-xl transition-colors no-underline shadow-md"
              style={{
                backgroundColor: BRAND,
                boxShadow: "0 8px 20px rgba(0,56,130,0.25)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = BRAND_HOVER)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = BRAND)
              }
            >
              <Plus size={15} strokeWidth={2.5} />
              Add New Project
            </Link>
          </div>

          {totalProjects > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-slate-200 px-4 py-4 shadow-sm"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${bg}`}
                  >
                    <Icon size={15} className={color} />
                  </div>
                  <p className="text-2xl font-black text-slate-900 leading-none mb-1">
                    {value}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 leading-tight">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {totalProjects === 0 ? (
            <div
              className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-24 px-6 text-center"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
            >
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
                <LayoutGrid size={28} className="text-slate-400" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">
                Post your first project
              </h2>
              <p className="text-sm font-semibold text-slate-400 max-w-xs mb-7 leading-relaxed">
                Find skilled workers for your construction or service projects.
                Post now and start receiving applicants.
              </p>
              <Link
                href="/employer/dashboard/create-project"
                className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-black rounded-xl transition-colors no-underline shadow-md"
                style={{
                  backgroundColor: BRAND,
                  boxShadow: "0 8px 20px rgba(0,56,130,0.25)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = BRAND_HOVER)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BRAND)
                }
              >
                <Plus size={15} /> Add New Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => {
                const isExpired = project.deadline && project.deadline < today;
                const days = deadlineDays(project.deadline);
                const isClosingSoon = !isExpired && days !== null && days <= 3;

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3"
                    style={{
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      opacity: isExpired ? 0.65 : 1,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <MapPin size={11} />
                        {project.location}
                        {project.state ? `, ${project.state}` : ""}
                        {project.country ? `, ${project.country}` : ""}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {project.urgent && !isExpired && (
                          <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                            Urgent hiring
                          </span>
                        )}
                        {isExpired ? (
                          <span className="bg-slate-200 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CalendarX size={9} />
                            Expired
                          </span>
                        ) : isClosingSoon ? (
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CalendarX size={9} />
                            {days === 0 ? "Last day" : `${days}d left`}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-0.5">
                        {project.company}
                      </p>
                      <h3 className="text-xl font-black text-slate-900">
                        {project.title}
                      </h3>
                    </div>

                    <div className="text-xs font-semibold text-slate-500">
                      <span>
                        <strong className="text-slate-700">Rate:</strong>{" "}
                        {project.rateType === "On Discussion"
                          ? "On Discussion"
                          : `₹${project.rateAmount} ${project.rateType}`}
                      </span>
                      <span className="mx-2">·</span>
                      <span>
                        <strong className="text-slate-700">
                          Workers needed:
                        </strong>{" "}
                        {project.workersRequired}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <UserCheck size={12} style={{ color: BRAND }} />
                        <span>
                          <strong className="text-slate-700">
                            {project.applicants || 0}
                          </strong>{" "}
                          applicant{(project.applicants || 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {project.deadline && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <CalendarX
                          size={11}
                          className={
                            isExpired ? "text-slate-400" : "text-amber-500"
                          }
                        />
                        <span>
                          <strong className="text-slate-700">Deadline:</strong>{" "}
                          {formatDeadline(project.deadline)}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <span
                        className="text-[11px] font-bold px-3 py-1 rounded-full"
                        style={{ border: `1px solid ${BRAND}`, color: BRAND }}
                      >
                        {project.projectType}
                      </span>
                      <span className="border border-red-400 text-red-500 text-[11px] font-bold px-3 py-1 rounded-full">
                        {project.workType}
                      </span>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black"
                          style={{ backgroundColor: BRAND_TINT, color: BRAND }}
                        >
                          {project.company?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-700 max-w-28 truncate">
                          {project.company}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/employer/dashboard/projects/create?edit=${project.id}`}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors no-underline"
                        >
                          <Pencil size={12} />
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(project.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-4">
              <Trash2 size={18} className="text-red-500" />
            </div>
            <h2 className="text-lg font-black text-slate-900 mb-1">
              Delete this project?
            </h2>
            <p className="text-sm font-semibold text-slate-500 mb-5 leading-relaxed">
              This is permanent and cannot be undone. All applicant data linked
              to this project will also be removed from your view.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirmed}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-black text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-sm font-black text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
