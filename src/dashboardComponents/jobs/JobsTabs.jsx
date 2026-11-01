"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BLUE = "#004aac";
const LIGHT_BLUE = "#e8f0fb";

const TABS = [
  { href: "/dashboard/jobs", label: "All jobs" },
  { href: "/dashboard/jobs/recommended", label: "Recommended for you" },
];

// Two small tabs. The sidebar hover menu does not exist on phones,
// so this is how phone users switch between the two lists.
export default function JobsTabs() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-2 px-4 sm:px-6 pt-4">
      {TABS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="text-sm font-bold px-4 py-2 rounded-full border transition-colors"
            style={{
              backgroundColor: active ? LIGHT_BLUE : "#ffffff",
              color: active ? BLUE : "#475569",
              borderColor: active ? BLUE : "#e2e8f0",
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
