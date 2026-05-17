import DashNavbar from "@/dashboardComponents/DashNavbar";
import SearchNavbar from "@/dashboardComponents/SearchNavbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <DashNavbar />
      <SearchNavbar />
      {children}
    </div>
  );
}