import DashNavbar from "@/dashboardComponents/DashNavbar";
import SearchNavbar from "@/dashboardComponents/SearchNavbar";
import DashPolicyStrip from "@/dashboardComponents/Dashpolicystrip";

export default function DashboardLayout({ children }) {
  return (
    <div
      className="min-h-screen bg-white md:grid"
      style={{
        gridTemplateColumns: "auto 1fr",
        gridTemplateRows: "auto auto",
      }}
    >
      <div
        className="relative z-50 md:pl-4 md:pt-4"
        style={{ gridColumn: "1 / 2", gridRow: "1 / 3" }}
      >
        <DashNavbar />
      </div>

      <div
        className="min-w-0 md:pr-4 md:ml-4 md:pt-4"
        style={{ gridColumn: "2 / 3", gridRow: "1 / 2" }}
      >
        <div className="pt-14 pb-20 md:pt-0 md:pb-8">
          <SearchNavbar />
          {children}
        </div>
      </div>

      <div
        className="relative z-10"
        style={{ gridColumn: "1 / -1", gridRow: "2 / 3" }}
      >
        <DashPolicyStrip />
      </div>
    </div>
  );
}