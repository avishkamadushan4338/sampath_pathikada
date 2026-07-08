"use client";

import { MapPinned } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { DivisionSummaryPanel } from "@/components/dashboard/DivisionSummaryPanel";
import { DIVISIONAL_SECRETARIATS, DISTRICTS } from "@/lib/registration-data";

export default function AdminDivisionsPage() {
  const { user, isLoading } = useSession();
  const division = user?.dsDivision ? DIVISIONAL_SECRETARIATS.find((d) => d.id === user.dsDivision) : undefined;
  const district = division ? DISTRICTS.find((d) => d.id === division.districtId) : undefined;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#0E2B4E" }}>
          <MapPinned size={20} color="#fff" />
        </div>
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
          >
            {division ? division.en : "Division Summary"}
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            {district ? `${district.en} District · Full demographic & submission breakdown` : "Assigned division data summary"}
          </p>
        </div>
      </div>

      {!isLoading && !user?.dsDivision ? (
        <div className="rounded-2xl p-6 text-center" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <p className="text-[14px] font-semibold" style={{ color: "#92400e" }}>No division has been assigned to your account yet.</p>
        </div>
      ) : (
        <DivisionSummaryPanel dsDivision={user?.dsDivision ?? undefined} />
      )}
    </div>
  );
}
