import DashNavbar from "@/dashboardComponents/DashNavbar";
import SearchNavbar from "@/dashboardComponents/SearchNavbar";
import DashPolicyStrip from "@/dashboardComponents/Dashpolicystrip";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      <div className="flex items-start md:gap-4">
        <div className="md:pl-4 md:pt-4">
          <DashNavbar />
        </div>

        <div className="flex-1 min-w-0 md:pr-4 md:pt-4">
          <div className="pt-14 pb-20 md:pt-0 md:pb-8">
            <SearchNavbar />
            {children}
          </div>
        </div>
      </div>

      <DashPolicyStrip />
    </div>
  );
}