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
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import EmployerSidebar from "@/employerComponets/EmployerSidebar";
import DashboardNavbar from "@/employerComponets/DashboardNavbar";
import {
  Plus,
  Trash2,
  Pencil,
  MapPin,
  Briefcase,
  Users,
  Zap,
  LayoutGrid,
} from "lucide-react";

export default function AllProjectsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/employer/onboarding");
        return;
      }
      const empDoc = await getDoc(doc(db, "employers", user.uid));
      if (!empDoc.exists()) {
        router.replace("/employer/onboarding");
        return;
      }
      setChecking(false);
      try {
        const snap = await getDocs(
          query(
            collection(db, "projects"),
            where("employerUid", "==", user.uid),
          ),
        );
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const da = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt || 0);
          const db2 = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt || 0);
          return db2 - da;
        });
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const totalProjects = projects.length;
  const urgentCount = projects.filter((p) => p.urgent).length;
  const totalWorkers = projects.reduce(
    (sum, p) => sum + (Number(p.workersRequired) || 0),
    0,
  );
  const uniqueStates = new Set(projects.map((p) => p.state).filter(Boolean))
    .size;

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "projects", id));
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <EmployerSidebar />
      <DashboardNavbar />
      <main className="md:ml-64 pt-14 min-h-screen bg-[#f8fafc] pb-24 md:pb-8">
        <div className="px-4 md:px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                All Projects
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-1">
                {loading
                  ? "Loading…"
                  : `${totalProjects} project${totalProjects !== 1 ? "s" : ""} posted`}
              </p>
            </div>
            <Link
              href="/employer/dashboard/create-project"
              className="flex items-center gap-2 bg-[#0f0f0f] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors no-underline"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add New Project</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>

          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <StatCard
                icon={<LayoutGrid size={18} />}
                label="Total Projects"
                value={totalProjects}
                color="slate"
              />
              <StatCard
                icon={<Users size={18} />}
                label="Workers Needed"
                value={totalWorkers}
                color="blue"
              />
              <StatCard
                icon={<Zap size={18} />}
                label="Urgent Hirings"
                value={urgentCount}
                color="red"
              />
              <StatCard
                icon={<MapPin size={18} />}
                label="States Active"
                value={uniqueStates}
                color="green"
              />
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-7 h-7 border-[3px] border-slate-300 border-t-slate-800 rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-24 px-6 text-center">
              <Briefcase size={40} className="text-slate-200 mb-4" />
              <p className="text-lg font-black text-slate-800 mb-1">
                No projects yet
              </p>
              <p className="text-sm font-semibold text-slate-400 mb-6">
                Post your first project to find skilled workers.
              </p>
              <Link
                href="/employer/dashboard/create-project"
                className="flex items-center gap-2 bg-[#0f0f0f] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors no-underline"
              >
                <Plus size={15} />
                Add New Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDelete}
                  deleting={deleting === project.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    slate: "bg-slate-50 text-black",
    blue: "bg-slate-50 text-black",
    red: "bg-slate-50 text-black",
    green: "bg-slate-50 text-black",
  };
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-2"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}
      >
        {icon}
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-semibold text-slate-400">{label}</p>
    </div>
  );
}

function ProjectCard({ project, onDelete, deleting }) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <MapPin size={11} />
          {project.location}
          {project.state ? `, ${project.state}` : ""}
          {project.country ? `, ${project.country}` : ""}
        </div>
        {project.urgent && (
          <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shrink-0">
            Urgent hiring
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 mb-0.5">
          {project.company}
        </p>
        <h3 className="text-xl font-black text-slate-900">{project.title}</h3>
      </div>

      <div className="text-xs font-semibold text-slate-500">
        <span>
          <strong className="text-slate-700">Rate:</strong>{" "}
          {project.rateType === "On Discussion"
            ? "On Discussion"
            : `${project.rateAmount} ${project.rateType}`}
        </span>
        <span className="mx-2">·</span>
        <span>
          <strong className="text-slate-700">Workers:</strong>{" "}
          {project.workersRequired}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="border border-slate-800 text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full">
          {project.projectType}
        </span>
        <span className="border border-red-400 text-red-500 text-[11px] font-bold px-3 py-1 rounded-full">
          {project.workType}
        </span>
      </div>

      <hr className="border-slate-100" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
            {project.company?.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-slate-700 max-w-30 truncate">
            {project.company}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/employer/dashboard/create-project?edit=${project.id}`}
            className="flex items-center gap-1.5 border border-slate-300 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors no-underline"
          >
            <Pencil size={11} />
            Edit
          </Link>
          <button
            onClick={() => onDelete(project.id)}
            disabled={deleting}
            className="flex items-center gap-1.5 border border-red-200 text-red-500 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 size={11} />
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
