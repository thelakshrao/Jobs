"use client";

import { Suspense } from "react";
import JobsTabs from "@/dashboardComponents/jobs/JobsTabs";
import JobsContent from "./JobsContent";

export default function JobsPage() {
  return (
    <>
      <JobsTabs />
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div
            className="w-7 h-7 border-[3px] border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#60a5fa", borderTopColor: "transparent" }}
          />
        </div>
      }>
        <JobsContent />
      </Suspense>
    </>
  );
}