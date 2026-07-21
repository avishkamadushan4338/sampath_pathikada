"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Users, UserCheck, ShieldCheck, Activity, TrendingUp, TrendingDown,
  Clock, CheckCircle2, XCircle, ArrowRight,
  Globe, Database, Zap, Eye, RefreshCw, Download, Calendar, Settings,
  IdCard, Car, BookImage,
} from "lucide-react";

/* ─── Brand tokens ─────────────────────────────────────────────────────── */
const NAVY   = "#0E2B4E";
const NAVY2  = "#0B2240";
const GOLD   = "#BC9144";
const GOLD_L = "#D4A85A";
const GOLD_D = "#915F2F";
const MAROON = "#66261E";
const GREEN  = "#2D7A51";

/* ─── API shapes ───────────────────────────────────────────────────────── */
interface RegistrationRow {
  id: string; name: string; district: string; dsDivision: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string; approvedAt: string | null;
  role: "economic-development-officer" | "divisional-secretariat";
  roleLabel: string;
  verificationDocType?: "NIC" | "DRIVING_LICENSE" | "PASSPORT" | null;
}

interface UserRow {
  id: string; name: string; role: string; status: string; createdAt: string;
}

interface AuditRow {
  action: string; description: string; userName: string; userIp: string | null;
  severity: "INFO" | "WARNING" | "ERROR" | "SUCCESS"; createdAt: string;
}

const DOC_ICON: Record<string, React.ElementType> = {
  NIC: IdCard, DRIVING_LICENSE: Car, PASSPORT: BookImage,
};
const DOC_LABEL: Record<string, string> = {
  NIC: "NIC", DRIVING_LICENSE: "License", PASSPORT: "Passport",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/* ─── Stat Card ────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, trend, trendValue, iconBg, href }: {
  icon: React.ElementType; label: string; value: string | number; sub: string;
  trend?: "up" | "down" | "neutral"; trendValue?: string; iconBg: string; href?: string;
}) {
  const className = "relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 group block";
  const style = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    boxShadow: "0 1px 3px rgba(14,43,78,0.06)",
  };

  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p
          className="text-[11px] font-bold uppercase tracking-wider mb-2"
          style={{ color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em" }}
        >
          {label}
        </p>
        <p
          className="text-3xl font-bold leading-none"
          style={{ fontFamily: "'DM Sans','Inter',sans-serif", fontVariantNumeric: "tabular-nums", color: "hsl(var(--foreground))" }}
        >
          {value}
        </p>
        <p className="text-[12px] mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
          {sub}
        </p>
        {trend && trendValue && (
          <div
            className="flex items-center gap-1 mt-2 text-[12px] font-semibold"
            style={{
              color: trend === "up" ? "#16a34a" : trend === "down" ? MAROON : "hsl(var(--muted-foreground))",
            }}
          >
            {trend === "up"   && <TrendingUp size={12} />}
            {trend === "down" && <TrendingDown size={12} />}
            {trend === "neutral" && <Activity size={12} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={20} color="#fff" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        style={style}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(14,43,78,0.10)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(14,43,78,0.06)")}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={className}
      style={style}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(14,43,78,0.10)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(14,43,78,0.06)")}
    >
      {content}
    </div>
  );
}

/* ─── Status badge ─────────────────────────────────────────────────────── */
const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  pending:  { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  approved: { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0" },
  rejected: { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {status === "pending"  && <Clock size={9} />}
      {status === "approved" && <CheckCircle2 size={9} />}
      {status === "rejected" && <XCircle size={9} />}
      <span className="capitalize">{status}</span>
    </span>
  );
}

/* ─── Verification doc badge ───────────────────────────────────────────── */
function DocBadge({ docType }: { docType?: "NIC" | "DRIVING_LICENSE" | "PASSPORT" | null }) {
  if (!docType) return null;
  const Icon = DOC_ICON[docType];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))", borderColor: "hsl(var(--border))" }}
      title="Verification document submitted"
    >
      <Icon size={9} /> {DOC_LABEL[docType]}
    </span>
  );
}

/* ─── Ghost button ─────────────────────────────────────────────────────── */
function GhostBtn({ onClick, icon: Icon, label, busy }: { onClick?: () => void; icon: React.ElementType; label: string; busy?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-semibold rounded-xl transition-all"
      style={{
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
        color: "hsl(var(--foreground))",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
      onMouseLeave={e => (e.currentTarget.style.background = "hsl(var(--card))")}
    >
      <Icon size={14} className={busy ? "animate-spin" : ""} /> {label}
    </button>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [regCounts, setRegCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [auditLog, setAuditLog] = useState<AuditRow[]>([]);
  const [health, setHealth] = useState<{ dbHealthy: boolean | null; uptimeSeconds: number | null }>({
    dbHealthy: null, uptimeSeconds: null,
  });

  const fetchAll = useCallback(async () => {
    try {
      const [regsRes, countsRes, usersRes, auditRes, healthRes] = await Promise.all([
        fetch("/api/registrations?status=all&role=all&limit=50"),
        fetch("/api/registrations?countsOnly=true"),
        fetch("/api/users"),
        fetch("/api/audit-logs?limit=5"),
        fetch("/api/health"),
      ]);

      const regsJson = await regsRes.json() as { ok: boolean; data?: RegistrationRow[] };
      if (regsJson.ok) setRegistrations(regsJson.data ?? []);

      const countsJson = await countsRes.json() as { ok: boolean; counts?: typeof regCounts };
      if (countsJson.ok && countsJson.counts) setRegCounts(countsJson.counts);

      const usersJson = await usersRes.json() as { ok: boolean; data?: UserRow[] };
      if (usersJson.ok) setUsers(usersJson.data ?? []);

      const auditJson = await auditRes.json() as { ok: boolean; data?: AuditRow[] };
      if (auditJson.ok) setAuditLog(auditJson.data ?? []);

      const healthJson = await healthRes.json() as { ok: boolean; uptimeSeconds?: number };
      setHealth({ dbHealthy: healthJson.ok, uptimeSeconds: healthJson.uptimeSeconds ?? null });
    } catch {
      // dashboard is best-effort; leave previous state on transient network errors
      setHealth(h => ({ ...h, dbHealthy: false }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRefresh = () => { setRefreshing(true); fetchAll(); };

  /* ── Derived: approved this month + admin accounts ── */
  const approvedThisMonth = useMemo(() => {
    const now = new Date();
    return registrations.filter(r => {
      if (r.status !== "APPROVED" || !r.approvedAt) return false;
      const d = new Date(r.approvedAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [registrations]);

  const adminAccounts = useMemo(() => users.filter(u => u.role === "ADMIN"), [users]);
  const activeAdmins = useMemo(() => adminAccounts.filter(u => u.status === "ACTIVE").length, [adminAccounts]);

  const recentRegistrations = useMemo(
    () => [...registrations].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 5),
    [registrations]
  );

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
          >
            Control Center
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            {today} &nbsp;·&nbsp; Southern Province, Sri Lanka
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <GhostBtn icon={RefreshCw} label="Refresh" onClick={handleRefresh} busy={refreshing} />
          <Link
            href="/super-admin/registrations"
            className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-semibold rounded-xl text-white transition-all"
            style={{
              background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)`,
              boxShadow: "0 2px 8px rgba(14,43,78,0.25)",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(14,43,78,0.35)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(14,43,78,0.25)")}
          >
            <UserCheck size={14} /> Review Registrations
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users} label="Total Users" value={loading ? "—" : users.length}
          sub="Across all roles" iconBg={NAVY} href="/super-admin/users"
        />
        <StatCard
          icon={Clock} label="Pending Verification" value={loading ? "—" : regCounts.pending}
          sub="Awaiting document review" trend={regCounts.pending > 0 ? "neutral" : undefined}
          trendValue={regCounts.pending > 0 ? "Needs Super Admin action" : undefined}
          iconBg={GOLD} href="/super-admin/registrations?status=pending"
        />
        <StatCard
          icon={CheckCircle2} label="Approved (Month)" value={loading ? "—" : approvedThisMonth}
          sub={new Date().toLocaleString("en", { month: "long", year: "numeric" })}
          iconBg={GREEN} href="/super-admin/registrations?status=approved"
        />
        <StatCard
          icon={ShieldCheck} label="Admin Accounts" value={loading ? "—" : adminAccounts.length}
          sub={loading ? "" : `${activeAdmins} active · ${adminAccounts.length - activeAdmins} inactive`}
          iconBg={MAROON} href="/super-admin/admins"
        />
      </div>

      {/* ── System Health ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Uptime",
            value: health.uptimeSeconds == null ? "—" : formatUptime(health.uptimeSeconds),
            icon: Zap, valueColor: GREEN,
          },
          { label: "Registrations", value: String(regCounts.total), icon: Globe, valueColor: GOLD_D },
          {
            label: "DB Health",
            value: health.dbHealthy == null ? "—" : health.dbHealthy ? "Healthy" : "Down",
            icon: Database,
            valueColor: health.dbHealthy === false ? MAROON : GREEN,
          },
          { label: "Rejected", value: String(regCounts.rejected), icon: Calendar, valueColor: "hsl(var(--muted-foreground))" },
        ].map(item => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <item.icon size={16} style={{ color: item.valueColor, flexShrink: 0 }} />
            <div className="min-w-0">
              <p className="text-[11px] truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                {item.label}
              </p>
              <p className="text-[13px] font-bold truncate" style={{ color: item.valueColor }}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent tables ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Recent Registrations */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid hsl(var(--border))" }}
          >
            <h2 className="font-bold text-[14.5px]" style={{ color: "hsl(var(--foreground))" }}>
              Recent Registrations
            </h2>
            <Link
              href="/super-admin/registrations"
              className="flex items-center gap-1 text-[12px] font-semibold hover:underline"
              style={{ color: GOLD_D }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {recentRegistrations.length === 0 && (
              <p className="text-[12.5px] px-5 py-6 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                {loading ? "Loading…" : "No registrations yet"}
              </p>
            )}
            {recentRegistrations.map(r => (
              <Link
                key={r.id}
                href="/super-admin/registrations"
                className="flex items-center gap-3 px-5 py-3.5 transition-colors"
                style={{ borderBottom: "1px solid hsl(var(--border))" }}
                onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white"
                  style={{ background: NAVY }}
                >
                  {r.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold truncate" style={{ color: "hsl(var(--foreground))" }}>
                      {r.name}
                    </p>
                    <DocBadge docType={r.verificationDocType} />
                  </div>
                  <p className="text-[11px] truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {r.roleLabel} · {r.district}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={r.status.toLowerCase()} />
                  <p className="text-[10px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {timeAgo(r.submittedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Audit Log */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid hsl(var(--border))" }}
          >
            <h2 className="font-bold text-[14.5px]" style={{ color: "hsl(var(--foreground))" }}>
              Audit Log
            </h2>
            <Link
              href="/super-admin/audit-logs"
              className="flex items-center gap-1 text-[12px] font-semibold hover:underline"
              style={{ color: GOLD_D }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {auditLog.length === 0 && (
              <p className="text-[12.5px] px-5 py-6 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                {loading ? "Loading…" : "No activity yet"}
              </p>
            )}
            {auditLog.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-5 py-3.5 transition-colors cursor-default"
                style={{ borderBottom: i < auditLog.length - 1 ? "1px solid hsl(var(--border))" : undefined }}
                onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span
                  className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                  style={{
                    background:
                      entry.severity === "ERROR"   ? "#ef4444" :
                      entry.severity === "WARNING" ? "#f59e0b" : GREEN,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: "hsl(var(--foreground))" }}>
                    {entry.action}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                    by {entry.userName} {entry.userIp ? `· ${entry.userIp}` : ""}
                  </p>
                </div>
                <span className="text-[11px] shrink-0 pt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {timeAgo(entry.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: `linear-gradient(135deg, ${NAVY2} 0%, ${NAVY} 100%)`,
          border: "1px solid rgba(29,74,122,0.5)",
          boxShadow: "0 4px 24px rgba(14,43,78,0.18)",
        }}
      >
        <h2
          className="text-lg font-bold text-white mb-1"
          style={{ fontFamily: "var(--font-display,'Playfair Display',serif)" }}
        >
          Quick Actions
        </h2>
        <p className="text-[12.5px] mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
          Common super-admin operations
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: `Review Registrations${regCounts.pending > 0 ? ` (${regCounts.pending})` : ""}`, icon: UserCheck, href: "/super-admin/registrations", accent: GOLD    },
            { label: "Create Admin",          icon: Users,     href: "/super-admin/admins",         accent: GREEN  },
            { label: "View Audit Logs",       icon: Eye,       href: "/super-admin/audit-logs",     accent: GOLD_D },
            { label: "System Settings",       icon: Settings,  href: "/super-admin/system-settings",accent: MAROON },
          ].map(a => (
            <Link
              key={a.label}
              href={a.href}
              className="flex flex-col items-center gap-2.5 p-4 rounded-xl text-center group transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200"
                style={{ background: a.accent, boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}
              >
                <a.icon size={18} color="#fff" />
              </div>
              <span
                className="text-[12px] font-medium leading-snug"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {a.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
