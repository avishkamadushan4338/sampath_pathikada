"use client";

import { useState, useMemo } from "react";
import {
  Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight, ChevronDown,
  AlertTriangle, Info, AlertCircle, CheckCircle2,
  User, Shield, Database, Settings, LogIn,
} from "lucide-react";

/* ─── Brand tokens ─────────────────────────────────────────────────────── */
const NAVY  = "#0E2B4E";

type Severity = "info" | "warning" | "error" | "success";
type Category = "auth" | "user" | "admin" | "system" | "data";

interface AuditEntry {
  id: string; action: string; description: string;
  user: string; userId: string; ip: string; userAgent: string;
  category: Category; severity: Severity; timestamp: string;
  metadata?: Record<string, string>;
}

const MOCK_AUDIT: AuditEntry[] = [
  { id: "AUD-001", action: "User Login",            description: "Successful login via password",           user: "Super Admin",    userId: "SA-001",  ip: "192.168.1.1",  userAgent: "Chrome 125 / Windows", category: "auth",   severity: "success", timestamp: "2026-07-02 09:14:22" },
  { id: "AUD-002", action: "Registration Approved", description: "Approved REG-2026-003 (Ruwan Fernando)", user: "Super Admin",    userId: "SA-001",  ip: "192.168.1.1",  userAgent: "Chrome 125 / Windows", category: "user",   severity: "info",    timestamp: "2026-07-02 09:02:11" },
  { id: "AUD-003", action: "Admin Created",          description: "New admin account created for Sumudu.S", user: "Super Admin",    userId: "SA-001",  ip: "192.168.1.1",  userAgent: "Chrome 125 / Windows", category: "admin",  severity: "info",    timestamp: "2026-07-01 16:30:05", metadata: { "New Admin ID": "ADM-004", "Email": "sumudu.s@sampath.lk" } },
  { id: "AUD-004", action: "Failed Login",           description: "Repeated failed login for admin@sampath.lk", user: "Unknown",   userId: "—",       ip: "203.94.12.55", userAgent: "curl/7.68.0",          category: "auth",   severity: "error",   timestamp: "2026-07-01 15:44:31", metadata: { "Attempts": "5", "Locked": "Yes" } },
  { id: "AUD-005", action: "Permission Updated",     description: "Economic Development Officer permissions modified",        user: "Super Admin",    userId: "SA-001",  ip: "192.168.1.1",  userAgent: "Chrome 125 / Windows", category: "system", severity: "warning", timestamp: "2026-07-01 14:20:18" },
  { id: "AUD-006", action: "Database Backup",        description: "Scheduled backup completed successfully", user: "System",        userId: "SYS",     ip: "localhost",     userAgent: "Node.js Cron",         category: "system", severity: "success", timestamp: "2026-07-01 12:00:00" },
  { id: "AUD-007", action: "Registration Rejected",  description: "Rejected REG-2026-004 — NIC mismatch",  user: "Super Admin",    userId: "SA-001",  ip: "192.168.1.1",  userAgent: "Chrome 125 / Windows", category: "user",   severity: "info",    timestamp: "2026-07-01 11:03:44" },
  { id: "AUD-008", action: "Password Reset",         description: "Admin Nimal Perera reset their password", user: "Nimal Perera", userId: "ADM-002", ip: "10.0.0.5",    userAgent: "Firefox 118 / macOS",  category: "auth",   severity: "info",    timestamp: "2026-07-01 10:15:09" },
  { id: "AUD-009", action: "System Settings Updated", description: "Session timeout changed to 30 minutes", user: "Super Admin",   userId: "SA-001",  ip: "192.168.1.1",  userAgent: "Chrome 125 / Windows", category: "system", severity: "warning", timestamp: "2026-06-30 17:45:00" },
  { id: "AUD-010", action: "User Deactivated",       description: "Admin Dilshan Fernando deactivated",     user: "Super Admin",   userId: "SA-001",  ip: "192.168.1.1",  userAgent: "Chrome 125 / Windows", category: "admin",  severity: "warning", timestamp: "2026-06-30 16:10:22" },
  { id: "AUD-011", action: "Export Generated",       description: "Excel export of registrations data",     user: "Admin Kamal",   userId: "ADM-001", ip: "10.0.0.3",    userAgent: "Chrome 125 / Windows", category: "data",   severity: "info",    timestamp: "2026-06-30 14:33:55" },
  { id: "AUD-012", action: "User Login",             description: "Successful login via password",          user: "Admin Nimal",   userId: "ADM-002", ip: "10.0.0.5",    userAgent: "Firefox 118 / macOS",  category: "auth",   severity: "success", timestamp: "2026-06-30 09:00:11" },
];

const SEV_MAP: Record<Severity, { bg: string; color: string; border: string; dot: string; Icon: React.ElementType; label: string }> = {
  success: { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0", dot: "#10b981", Icon: CheckCircle2, label: "Success" },
  info:    { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe", dot: "#3b82f6", Icon: Info,         label: "Info"    },
  warning: { bg: "#fffbeb", color: "#92400e", border: "#fde68a", dot: "#f59e0b", Icon: AlertTriangle,label: "Warning" },
  error:   { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3", dot: "#ef4444", Icon: AlertCircle,  label: "Error"   },
};

const CAT_ICONS: Record<Category, React.ElementType> = {
  auth: LogIn, user: User, admin: Shield, system: Settings, data: Database,
};

const PER_PAGE = 8;

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState<Severity | "all">("all");
  const [catFilter, setCatFilter] = useState<Category | "all">("all");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => MOCK_AUDIT.filter(e => {
    const q = search.toLowerCase();
    return (!q || e.action.toLowerCase().includes(q) || e.user.toLowerCase().includes(q) || e.ip.includes(q) || e.description.toLowerCase().includes(q))
      && (sevFilter === "all" || e.severity === sevFilter)
      && (catFilter === "all" || e.category === catFilter);
  }), [search, sevFilter, catFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
          >
            Audit Logs
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Complete record of all system activities and changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-medium rounded-xl transition-colors"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
            onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
            onMouseLeave={e => (e.currentTarget.style.background = "hsl(var(--card))")}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-medium rounded-xl text-white transition-all"
            style={{
              background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)`,
              boxShadow: "0 2px 8px rgba(14,43,78,0.22)",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(14,43,78,0.32)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(14,43,78,0.22)")}
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["success", "info", "warning", "error"] as Severity[]).map(s => {
          const { bg, color, border, Icon, label } = SEV_MAP[s];
          const count = MOCK_AUDIT.filter(e => e.severity === s).length;
          const isActive = sevFilter === s;
          return (
            <button
              key={s}
              onClick={() => setSevFilter(sevFilter === s ? "all" : s)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: bg,
                border: `1px solid ${border}`,
                boxShadow: isActive ? `0 0 0 2px ${color}` : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon size={14} style={{ color }} />
              </div>
              <p className="text-2xl font-bold" style={{ fontVariantNumeric: "tabular-nums", color }}>{count}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                {label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-50">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search action, user, IP..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "auth", "user", "admin", "system", "data"] as const).map(c => {
            const Icon = c !== "all" ? CAT_ICONS[c as Category] : Filter;
            const isActive = catFilter === c;
            return (
              <button
                key={c}
                onClick={() => { setCatFilter(c as any); setPage(1); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold capitalize transition-colors"
                style={isActive
                  ? { background: NAVY, color: "#fff", border: "1px solid transparent" }
                  : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                }
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "hsl(var(--foreground))"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}
              >
                <Icon size={12} /> {c === "all" ? "All" : c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Log entries */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
      >
        <div style={{ borderBottom: 0 }}>
          {pageData.length === 0 ? (
            <div className="py-16 text-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              No audit entries match your filters.
            </div>
          ) : pageData.map((entry, idx) => {
            const { dot, bg, color, border, Icon } = SEV_MAP[entry.severity];
            const CatIcon = CAT_ICONS[entry.category];
            const isExp = expanded === entry.id;
            return (
              <div
                key={entry.id}
                style={{ borderBottom: idx < pageData.length - 1 ? "1px solid hsl(var(--border))" : undefined }}
              >
                <button
                  onClick={() => setExpanded(isExp ? null : entry.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: dot }}
                  />
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "hsl(var(--muted))" }}
                  >
                    <CatIcon size={13} style={{ color: "hsl(var(--muted-foreground))" }} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13.5px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                        {entry.action}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{ background: bg, color, borderColor: border }}
                      >
                        <Icon size={9} /> {SEV_MAP[entry.severity].label}
                      </span>
                    </div>
                    <p className="text-[12px] truncate mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {entry.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-[12px] font-medium" style={{ color: "hsl(var(--foreground))" }}>{entry.user}</p>
                    <p className="text-[11px] font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>{entry.ip}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {entry.timestamp}
                    </p>
                  </div>
                  <ChevronDown
                    size={14}
                    className="transition-transform shrink-0"
                    style={{
                      color: "hsl(var(--muted-foreground))",
                      transform: isExp ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {/* Expanded detail — inline style instead of bg-[hsl(var(--background)/0.4)] */}
                {isExp && (
                  <div
                    className="px-5 pb-4 pt-0"
                    style={{ background: "hsl(var(--muted))" }}
                  >
                    <div
                      className="ml-12 rounded-xl overflow-hidden"
                      style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    >
                      {[
                        { label: "Entry ID",   value: entry.id },
                        { label: "User",       value: `${entry.user} (${entry.userId})` },
                        { label: "IP Address", value: entry.ip },
                        { label: "User Agent", value: entry.userAgent },
                        { label: "Category",   value: entry.category },
                        { label: "Timestamp",  value: entry.timestamp },
                        ...(entry.metadata ? Object.entries(entry.metadata).map(([k, v]) => ({ label: k, value: v })) : []),
                      ].map(({ label, value }, i, arr) => (
                        <div
                          key={label}
                          className="flex items-center gap-3 px-4 py-2.5"
                          style={{ borderBottom: i < arr.length - 1 ? "1px solid hsl(var(--border))" : undefined }}
                        >
                          <span className="text-[11.5px] w-28 shrink-0 font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
                            {label}
                          </span>
                          <span className="text-[12px] font-mono" style={{ color: "hsl(var(--foreground))" }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderTop: "1px solid hsl(var(--border))" }}
          >
            <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} entries
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                onMouseEnter={e => { if (page > 1) e.currentTarget.style.background = "hsl(var(--muted))"; }}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="w-8 h-8 rounded-lg text-[13px] font-semibold transition-colors"
                  style={n === page
                    ? { background: NAVY, color: "#fff" }
                    : { border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", background: "transparent" }
                  }
                  onMouseEnter={e => { if (n !== page) e.currentTarget.style.background = "hsl(var(--muted))"; }}
                  onMouseLeave={e => { if (n !== page) e.currentTarget.style.background = "transparent"; }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                onMouseEnter={e => { if (page < totalPages) e.currentTarget.style.background = "hsl(var(--muted))"; }}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
