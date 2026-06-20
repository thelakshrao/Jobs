import DashNavbar from "@/dashboardComponents/DashNavbar";
import SearchNavbar from "@/dashboardComponents/SearchNavbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <DashNavbar />
      <div className="md:ml-24 md:pt-17 min-h-screen">
        <div className="pt-14 md:pt-0">
          <SearchNavbar />
          {children}
        </div>
      </div>
    </div>
  );
}