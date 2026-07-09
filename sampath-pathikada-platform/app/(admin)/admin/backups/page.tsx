"use client";

import useSWR from "swr";
import { DatabaseZap, Loader2 } from "lucide-react";

const NAVY = "#0E2B4E";

interface SettingRow { key: string; value: string; updatedAt: string }

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json.data as SettingRow[];
};

const BACKUP_KEYS = ["auto_backup", "backup_frequency", "backup_retention_days"];
const BACKUP_LABELS: Record<string, string> = {
  auto_backup: "Automatic Backups",
  backup_frequency: "Backup Frequency",
  backup_retention_days: "Retention (days)",
};

export default function AdminBackupsPage() {
  const { data: settings, isLoading } = useSWR("/api/system-settings", fetcher);
  const rows = (settings ?? []).filter((s) => BACKUP_KEYS.includes(s.key));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: NAVY }}>
          <DatabaseZap size={20} color="#fff" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}>
            Backups
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Current backup configuration — view only
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl p-4"
        style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
      >
        <p className="text-[12.5px]" style={{ color: "#92400e" }}>
          There is no automated backup or restore action available from this page. These settings are informational
          — contact a Super Administrator to change backup policy or to request a manual backup.
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}>
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
            Backup Settings
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
              No backup settings configured yet.
            </p>
          )}
          {rows.map((s) => (
            <div key={s.key} className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-[13px] font-medium" style={{ color: "hsl(var(--foreground))" }}>
                {BACKUP_LABELS[s.key] ?? s.key}
              </span>
              <span className="text-[13px] font-mono" style={{ color: NAVY }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
