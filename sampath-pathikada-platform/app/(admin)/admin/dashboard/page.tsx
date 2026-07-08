"use client";

import { useSession } from "@/hooks/use-session";
import { DivisionSummaryPanel } from "@/components/dashboard/DivisionSummaryPanel";

export default function AdminDashboard() {
  const { user, isLoading } = useSession();

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
        >
          Division Overview
        </h1>
        <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          {today}
        </p>
      </div>

      {!isLoading && !user?.dsDivision ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
        >
          <p className="text-[14px] font-semibold" style={{ color: "#92400e" }}>
            No division has been assigned to your account yet.
          </p>
          <p className="text-[12.5px] mt-1" style={{ color: "#92400e" }}>
            Please contact your Super Admin to assign a division.
          </p>
        </div>
      ) : (
        <DivisionSummaryPanel dsDivision={user?.dsDivision ?? undefined} />
      )}
    </div>
  );
}
