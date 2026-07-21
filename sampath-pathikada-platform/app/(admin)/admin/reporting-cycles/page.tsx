"use client";

import useSWR from "swr";
import { CalendarClock, Loader2 } from "lucide-react";
import { CURRENT_YEAR } from "@/lib/constants";

const NAVY = "#0E2B4E";

interface SettingRow { key: string; value: string; updatedAt: string }

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json.data as SettingRow[];
};

const CYCLE_KEYS = ["session_timeout_minutes", "force_password_reset", "allow_public_registration"];
const CYCLE_LABELS: Record<string, string> = {
  session_timeout_minutes: "Session Timeout (minutes)",
  force_password_reset: "Force Password Reset on First Login",
  allow_public_registration: "Public Registration Open",
};

export default function ReportingCyclesPage() {
  const { data: settings, isLoading } = useSWR("/api/system-settings", fetcher);
  const rows = (settings ?? []).filter((s) => CYCLE_KEYS.includes(s.key));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: NAVY }}>
          <CalendarClock size={20} color="#fff" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}>
            Reporting Cycles
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Current reporting cycle and related settings — view only
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
          Active Cycle
        </p>
        <p className="text-3xl font-bold mt-1" style={{ color: NAVY, fontVariantNumeric: "tabular-nums" }}>
          {CURRENT_YEAR}/{(CURRENT_YEAR + 1) % 100}
        </p>
        <p className="text-[12.5px] mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
          Submissions are currently being collected for this reporting year. The active cycle is set at deployment
          time by a Super Administrator and cannot be changed from this page.
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}>
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
            Cycle Settings
          </p>
        </div>
        <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
          {isLoading && (
            <div className="px-5 py-8 flex justify-center">
              <Loader2 className="animate-spin" size={18} style={{ color: "hsl(var(--muted-foreground))" }} />
            </div>
          )}
          {!isLoading && rows.length === 0 && (
            <p className="px-5 py-8 text-center text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>
              No cycle settings configured yet.
            </p>
          )}
          {rows.map((s) => (
            <div key={s.key} className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-[13px] font-medium" style={{ color: "hsl(var(--foreground))" }}>
                {CYCLE_LABELS[s.key] ?? s.key}
              </span>
              <span className="text-[13px] font-mono" style={{ color: NAVY }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
