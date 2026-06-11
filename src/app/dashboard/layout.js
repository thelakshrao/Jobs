import DashNavbar from "@/dashboardComponents/DashNavbar";
import SearchNavbar from "@/dashboardComponents/SearchNavbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <DashNavbar />
      <SearchNavbar />
    
      <main className="md:ml-21 pt-14 md:pt-17 min-h-screen">
        {children}
      </main>
    </div>
  );
}