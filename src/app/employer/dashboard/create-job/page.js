import DashboardNavbar from "@/employerComponets/DashboardNavbar";
import EmployerSidebar from "@/employerComponets/EmployerSidebar";
import CreateJob from "@/employerComponets/Createjob";

export default async function CreateJobPage({ searchParams }) {
  const params = await searchParams;
  const draftId = params?.draftId || null;

  return (
    <>
      <EmployerSidebar />
      <DashboardNavbar />
      <main className="md:ml-64 pt-14 pb-16 md:pb-0 min-h-screen bg-slate-50">
        <CreateJob draftId={draftId} />
      </main>
    </>
  );
}