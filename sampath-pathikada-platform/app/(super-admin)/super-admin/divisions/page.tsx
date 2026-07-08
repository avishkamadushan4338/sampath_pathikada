"use client";

import { useState, useMemo } from "react";
import { Globe2, MapPinned } from "lucide-react";
import { DivisionSummaryPanel } from "@/components/dashboard/DivisionSummaryPanel";
import { DISTRICTS, DIVISIONAL_SECRETARIATS } from "@/lib/registration-data";

const NAVY = "#0E2B4E";

export default function SuperAdminDivisionsPage() {
  const [districtId, setDistrictId] = useState<string>("all");
  const [dsDivisionId, setDsDivisionId] = useState<string>("all");

  const divisionsInDistrict = useMemo(
    () => (districtId === "all" ? [] : DIVISIONAL_SECRETARIATS.filter((d) => d.districtId === districtId)),
    [districtId]
  );

  const effectiveDsDivision = dsDivisionId !== "all" ? dsDivisionId : undefined;
  const effectiveDistrict = !effectiveDsDivision && districtId !== "all" ? districtId : undefined;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
        >
          Division Drill-Down
        </h1>
        <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          Inspect the same summary view an Admin sees, for any division across all 3 districts
        </p>
      </div>

      {/* Picker */}
      <div
        className="flex flex-col sm:flex-row gap-3 rounded-2xl p-4"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
      >
        <div className="flex items-center gap-2 flex-1">
          <Globe2 size={16} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
          <select
            value={districtId}
            onChange={(e) => { setDistrictId(e.target.value); setDsDivisionId("all"); }}
            className="flex-1 h-10 px-3 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--input))", color: "hsl(var(--foreground))" }}
          >
            <option value="all">All Districts (Southern Province)</option>
            {DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.en} District</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <MapPinned size={16} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
          <select
            value={dsDivisionId}
            onChange={(e) => setDsDivisionId(e.target.value)}
            disabled={districtId === "all"}
            className="flex-1 h-10 px-3 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:opacity-50"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--input))", color: "hsl(var(--foreground))" }}
          >
            <option value="all">{districtId === "all" ? "Select a district first" : "All divisions in district"}</option>
            {divisionsInDistrict.map((d) => <option key={d.id} value={d.id}>{d.en}</option>)}
          </select>
        </div>
      </div>

      <DivisionSummaryPanel key={`${effectiveDsDivision ?? ""}-${effectiveDistrict ?? ""}`} dsDivision={effectiveDsDivision} district={effectiveDistrict} />
    </div>
  );
}
