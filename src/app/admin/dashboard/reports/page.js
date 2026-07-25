"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import AdminSidebar, {
  getStoredSidebarCollapsed,
  TOGGLE_EVENT,
} from "@/adminComponents/AdminSidebar";
import { Download, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BRAND = "#003882";
const COLOR_PRIMARY = "#4f46e5";
const COLOR_HIRED = "#22c55e";
const COLOR_INTERVIEWED = "#0ea5e9";
const COLOR_REJECTED = "#f43f5e";
const MONTHS_WINDOW = 7;

function toDate(dateInput) {
  const date =
    typeof dateInput?.toDate === "function"
      ? dateInput.toDate()
      : new Date(dateInput);
  return isNaN(date.getTime()) ? null : date;
}

function lastNMonths(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-US", { month: "short" }),
    });
  }
  return out;
}

function monthKeyOf(dateInput) {
  const date = toDate(dateInput);
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const STATUS_ALIASES = {
  hired: ["hired"],
  inProcess: [
    "in hiring process",
    "in process",
    "interviewing",
    "interviewed",
    "processing",
  ],
  rejected: ["reject", "rejected", "not a fit"],
};

function matchesStatus(app, group) {
  const value = (app.status || "").trim().toLowerCase();
  return STATUS_ALIASES[group].includes(value);
}

const STAGE_TIMESTAMP_FIELD = {
  hired: "hiredAt",
  inProcess: "interviewingAt",
  rejected: "rejectedAt",
};

function statusTimestamp(app, group) {
  const field = STAGE_TIMESTAMP_FIELD[group];
  return app[field] || app.statusUpdatedAt || app.appliedAt;
}

function exportCsv(filename, rows) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => JSON.stringify(r[h] ?? "")).join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ExportButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
    >
      <Download size={13} />
      Export
    </button>
  );
}

function ChartTooltip({ active, payload, label, series }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-4 py-3">
      <p className="text-sm font-extrabold text-slate-800 mb-1.5">{label}</p>
      <div className="space-y-1">
        {series.map((s) => {
          const item = payload.find((p) => p.dataKey === s.key);
          if (!item) return null;
          return (
            <p
              key={s.key}
              className="text-sm text-slate-500 flex items-center gap-2"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              {s.label}:{" "}
              <span className="font-extrabold text-slate-800">
                {item.value}
              </span>
            </p>
          );
        })}
      </div>
    </div>
  );
}

function ChartCard({ title, onExport, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
        <ExportButton onClick={onExport} />
      </div>
      {children}
    </div>
  );
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [exportingPdf, setExportingPdf] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    setCollapsed(getStoredSidebarCollapsed());
    const handler = () => setCollapsed(getStoredSidebarCollapsed());
    window.addEventListener(TOGGLE_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_EVENT, handler);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/admin");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "admin_staff", user.uid));
        if (!snap.exists() || snap.data().status !== "active") {
          await signOut(auth);
          router.replace("/admin");
          return;
        }
        setChecking(false);
      } catch (err) {
        console.error(err);
        router.replace("/admin");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (checking) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [appsSnap, jobsSnap] = await Promise.all([
          getDocs(collection(db, "applications")),
          getDocs(collection(db, "jobs")),
        ]);
        setApplications(appsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setJobs(jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error loading report data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [checking]);

  const applicationsOverTime = useMemo(() => {
    const months = lastNMonths(MONTHS_WINDOW);
    return months.map((m) => ({
      month: m.label,
      applications: applications.filter(
        (a) => monthKeyOf(a.appliedAt) === m.key,
      ).length,
    }));
  }, [applications]);

  const hiringTrends = useMemo(() => {
    const months = lastNMonths(MONTHS_WINDOW);
    return months.map((m) => ({
      month: m.label,
      hired: applications.filter(
        (a) =>
          matchesStatus(a, "hired") &&
          monthKeyOf(statusTimestamp(a, "hired")) === m.key,
      ).length,
      inProcess: applications.filter(
        (a) =>
          matchesStatus(a, "inProcess") &&
          monthKeyOf(statusTimestamp(a, "inProcess")) === m.key,
      ).length,
      rejected: applications.filter(
        (a) =>
          matchesStatus(a, "rejected") &&
          monthKeyOf(statusTimestamp(a, "rejected")) === m.key,
      ).length,
    }));
  }, [applications]);

  const applicationsPerJob = useMemo(() => {
    const map = new Map();
    applications.forEach((a) => {
      const title = a.jobTitle || "Untitled";
      map.set(title, (map.get(title) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([title, count]) => ({ title, applications: count }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 7);
  }, [applications]);

  const topEmployers = useMemo(() => {
    const jobsByEmployer = new Map();
    jobs.forEach((j) => {
      const key = j.employerUid || j.companyName || "unknown";
      if (!jobsByEmployer.has(key)) {
        jobsByEmployer.set(key, {
          companyName: j.companyName || "—",
          jobsPosted: 0,
        });
      }
      jobsByEmployer.get(key).jobsPosted += 1;
    });

    const appsByEmployer = new Map();
    applications.forEach((a) => {
      const key = a.employerUid || a.companyName || "unknown";
      if (!appsByEmployer.has(key)) {
        appsByEmployer.set(key, { total: 0, hired: 0 });
      }
      const rec = appsByEmployer.get(key);
      rec.total += 1;
      if (matchesStatus(a, "hired")) rec.hired += 1;
    });

    return Array.from(jobsByEmployer.entries())
      .map(([key, info]) => {
        const appInfo = appsByEmployer.get(key) || { total: 0, hired: 0 };
        const hireRate =
          appInfo.total > 0
            ? Math.round((appInfo.hired / appInfo.total) * 100)
            : 0;
        return {
          key,
          companyName: info.companyName,
          jobsPosted: info.jobsPosted,
          totalApplications: appInfo.total,
          hireRate,
        };
      })
      .sort((a, b) => b.totalApplications - a.totalApplications)
      .slice(0, 5);
  }, [jobs, applications]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handlePdfExport = async () => {
    if (!reportRef.current) return;
    setExportingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#e8eaed",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`reports-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Error exporting reports PDF:", err);
    } finally {
      setExportingPdf(false);
    }
  };

  const periodLabel = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <AdminSidebar />
      <main
        className={`pt-14 md:pt-0 min-h-screen bg-[#e8eaed] transition-all duration-200 ${
          collapsed ? "md:ml-20" : "md:ml-60"
        }`}
      >
        <div className="px-4 sm:px-8 py-8">
          <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-extrabold text-[#003882] tracking-tight">
                Reports &amp; Analytics
              </h1>
              <p className="text-sm text-slate-500 mt-0.5 font-medium">
                Platform performance — {periodLabel}
              </p>
            </div>
            <button
              onClick={handlePdfExport}
              disabled={loading || exportingPdf}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-lg text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: BRAND }}
            >
              <FileDown size={14} />
              {exportingPdf ? "Preparing PDF…" : "Export All (PDF)"}
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center text-sm text-slate-400 font-medium">
              Loading…
            </div>
          ) : (
            <div className="space-y-4" ref={reportRef}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard
                  title="Applications Over Time"
                  onExport={() =>
                    exportCsv(
                      "applications-over-time.csv",
                      applicationsOverTime,
                    )
                  }
                >
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={applicationsOverTime}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          content={(props) => (
                            <ChartTooltip
                              {...props}
                              series={[
                                {
                                  key: "applications",
                                  label: "Applications",
                                  color: COLOR_PRIMARY,
                                },
                              ]}
                            />
                          )}
                        />
                        <Line
                          type="monotone"
                          dataKey="applications"
                          stroke={COLOR_PRIMARY}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: COLOR_PRIMARY }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard
                  title="Hiring Trends"
                  onExport={() => exportCsv("hiring-trends.csv", hiringTrends)}
                >
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={hiringTrends}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          content={(props) => (
                            <ChartTooltip
                              {...props}
                              series={[
                                {
                                  key: "inProcess",
                                  label: "In Hiring Process",
                                  color: COLOR_INTERVIEWED,
                                },
                                {
                                  key: "hired",
                                  label: "Hired",
                                  color: COLOR_HIRED,
                                },
                                {
                                  key: "rejected",
                                  label: "Rejected",
                                  color: COLOR_REJECTED,
                                },
                              ]}
                            />
                          )}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={32}
                          iconType="circle"
                          formatter={(value) => (
                            <span className="text-xs font-semibold text-slate-500">
                              {value === "hired"
                                ? "Hired"
                                : value === "inProcess"
                                  ? "In Hiring Process"
                                  : "Rejected"}
                            </span>
                          )}
                        />
                        <Line
                          type="monotone"
                          dataKey="inProcess"
                          stroke={COLOR_INTERVIEWED}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: COLOR_INTERVIEWED }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="hired"
                          stroke={COLOR_HIRED}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: COLOR_HIRED }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="rejected"
                          stroke={COLOR_REJECTED}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: COLOR_REJECTED }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>

              <ChartCard
                title="Applications Per Job"
                onExport={() =>
                  exportCsv("applications-per-job.csv", applicationsPerJob)
                }
              >
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={applicationsPerJob}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="title"
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#f1f5f9" }}
                        content={(props) => (
                          <ChartTooltip
                            {...props}
                            series={[
                              {
                                key: "applications",
                                label: "Applications",
                                color: COLOR_PRIMARY,
                              },
                            ]}
                          />
                        )}
                      />
                      <Bar
                        dataKey="applications"
                        fill={COLOR_PRIMARY}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={56}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Top Employers by Activity
                  </h2>
                  <ExportButton
                    onClick={() => exportCsv("top-employers.csv", topEmployers)}
                  />
                </div>
                {topEmployers.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400 font-medium">
                    No employer activity yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-t border-slate-100">
                          <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            #
                          </th>
                          <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            Company
                          </th>
                          <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            Jobs Posted
                          </th>
                          <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            Total Applications
                          </th>
                          <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            Hire Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {topEmployers.map((emp, idx) => (
                          <tr key={emp.key} className="hover:bg-slate-50">
                            <td className="px-6 py-3.5">
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold"
                                style={{
                                  backgroundColor: "#eef2ff",
                                  color: COLOR_PRIMARY,
                                }}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-[#eef2ff] text-[#4f46e5] font-bold text-xs flex items-center justify-center shrink-0">
                                  {(emp.companyName || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <span className="font-bold text-slate-800">
                                  {emp.companyName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-slate-500 font-medium">
                              {emp.jobsPosted}
                            </td>
                            <td className="px-6 py-3.5 text-slate-500 font-medium">
                              {emp.totalApplications}
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                                {emp.hireRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}