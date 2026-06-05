import EmpDashboard from "@/employerComponets/EmpNavbar"

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      {/* <EmpDashboard/> */}
      {children}
    </div>
  );
}