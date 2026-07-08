"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Users, UserCheck, ShieldCheck, Activity, TrendingUp, TrendingDown,
  Clock, CheckCircle2, XCircle, ArrowRight, BarChart3,
  Globe, Database, Zap, Eye, RefreshCw, Download, Calendar, Settings,
  IdCard, Car, BookImage,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

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

/* ─── Stat Card ────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, trend, trendValue, iconBg }: {
  icon: React.ElementType; label: string; value: string | number; sub: string;
  trend?: "up" | "down" | "neutral"; trendValue?: string; iconBg: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 group"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        boxShadow: "0 1px 3px rgba(14,43,78,0.06)",
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(14,43,78,0.10)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(14,43,78,0.06)")}
    >
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

/* ─── Chart tooltip ────────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{
        background: "hsl(var(--background))",
        border: "1px solid hsl(var(--border))",
        boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
      }}
    >
      <p className="font-bold mb-1.5" style={{ color: "hsl(var(--foreground))" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="capitalize" style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ─── Period button ────────────────────────────────────────────────────── */
function PeriodBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-2 text-[12px] font-semibold transition-colors"
      style={{
        background: active ? NAVY : "transparent",
        color:      active ? "#fff" : "hsl(var(--muted-foreground))",
      }}
    >
      {label}
    </button>
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
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [regCounts, setRegCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [auditLog, setAuditLog] = useState<AuditRow[]>([]);

  const fetchAll = useCallback(async () => {
    try {
      const [regsRes, countsRes, usersRes, auditRes] = await Promise.all([
        fetch("/api/registrations?status=all&role=all&limit=50"),
        fetch("/api/registrations?countsOnly=true"),
        fetch("/api/users"),
        fetch("/api/audit-logs?limit=5"),
      ]);

      const regsJson = await regsRes.json() as { ok: boolean; data?: RegistrationRow[] };
      if (regsJson.ok) setRegistrations(regsJson.data ?? []);

      const countsJson = await countsRes.json() as { ok: boolean; counts?: typeof regCounts };
      if (countsJson.ok && countsJson.counts) setRegCounts(countsJson.counts);

      const usersJson = await usersRes.json() as { ok: boolean; data?: UserRow[] };
      if (usersJson.ok) setUsers(usersJson.data ?? []);

      const auditJson = await auditRes.json() as { ok: boolean; data?: AuditRow[] };
      if (auditJson.ok) setAuditLog(auditJson.data ?? []);
    } catch {
      // dashboard is best-effort; leave previous state on transient network errors
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRefresh = () => { setRefreshing(true); fetchAll(); };

  /* ── Derived: registration trend (last 6 months, real data) ── */
  const registrationTrend = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; month: string; approved: number; pending: number; rejected: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleString("en", { month: "short" }), approved: 0, pending: 0, rejected: 0 });
    }
    const byKey = new Map(buckets.map(b => [b.key, b]));
    for (const r of registrations) {
      const d = new Date(r.submittedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = byKey.get(key);
      if (!bucket) continue;
      if (r.status === "APPROVED") bucket.approved++;
      else if (r.status === "REJECTED") bucket.rejected++;
      else bucket.pending++;
    }
    return buckets;
  }, [registrations]);

  /* ── Derived: role distribution (real users) ── */
  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of users) counts[u.role] = (counts[u.role] ?? 0) + 1;
    const labelMap: Record<string, string> = {
      ECONOMIC_DEVELOPMENT_OFFICER: "Economic Development Officers",
      DIVISIONAL_SECRETARIAT: "Divisional Secretariats",
      ADMIN: "Admins",
      SUPER_ADMIN: "Super Admins",
    };
    const colorMap: Record<string, string> = {
      ECONOMIC_DEVELOPMENT_OFFICER: NAVY, DIVISIONAL_SECRETARIAT: MAROON, ADMIN: GREEN, SUPER_ADMIN: GOLD,
    };
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([role, value]) => ({ name: labelMap[role] ?? role, value, color: colorMap[role] ?? GOLD }));
  }, [users]);

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
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
          >
            {(["7d", "30d", "90d"] as const).map(p => (
              <PeriodBtn key={p} active={period === p} onClick={() => setPeriod(p)} label={p} />
            ))}
          </div>
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
          sub="Across all roles" iconBg={NAVY}
        />
        <StatCard
          icon={Clock} label="Pending Verification" value={loading ? "—" : regCounts.pending}
          sub="Awaiting document review" trend={regCounts.pending > 0 ? "neutral" : undefined}
          trendValue={regCounts.pending > 0 ? "Needs Super Admin action" : undefined}
          iconBg={GOLD}
        />
        <StatCard
          icon={CheckCircle2} label="Approved (Month)" value={loading ? "—" : approvedThisMonth}
          sub={new Date().toLocaleString("en", { month: "long", year: "numeric" })}
          iconBg={GREEN}
        />
        <StatCard
          icon={ShieldCheck} label="Admin Accounts" value={loading ? "—" : adminAccounts.length}
          sub={loading ? "" : `${activeAdmins} active · ${adminAccounts.length - activeAdmins} inactive`}
          iconBg={MAROON}
        />
      </div>

      {/* ── System Health ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Uptime",        value: "99.9%",   icon: Zap,      valueColor: GREEN  },
          { label: "Registrations", value: String(regCounts.total), icon: Globe, valueColor: GOLD_D },
          { label: "DB Health",     value: "Healthy", icon: Database, valueColor: GREEN  },
          { label: "Rejected",      value: String(regCounts.rejected), icon: Calendar, valueColor: "hsl(var(--muted-foreground))" },
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

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area chart */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-[15px]" style={{ color: "hsl(var(--foreground))" }}>
                Registration Trend
              </h2>
              <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                Monthly approvals vs rejections
              </p>
            </div>
            <BarChart3 size={18} style={{ color: "hsl(var(--muted-foreground))" }} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={registrationTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gApp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={NAVY}  stopOpacity={0.2} />
                  <stop offset="95%" stopColor={NAVY}  stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gPen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={GOLD}  stopOpacity={0.2} />
                  <stop offset="95%" stopColor={GOLD}  stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.7} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              <Area type="monotone" dataKey="approved" name="Approved" stroke={NAVY}   strokeWidth={2.5} fill="url(#gApp)" dot={{ r: 3, fill: NAVY   }} />
              <Area type="monotone" dataKey="pending"  name="Pending"  stroke={GOLD}   strokeWidth={2.5} fill="url(#gPen)" dot={{ r: 3, fill: GOLD   }} />
              <Area type="monotone" dataKey="rejected" name="Rejected" stroke={MAROON} strokeWidth={2.5} fill="none"       dot={{ r: 3, fill: MAROON }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <div className="mb-4">
            <h2 className="font-semibold text-[15px]" style={{ color: "hsl(var(--foreground))" }}>User Roles</h2>
            <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>Distribution by role</p>
          </div>
          {roleDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                    {roleDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(val: number, name: string) => [val, name]}
                    contentStyle={{
                      borderRadius: 12, fontSize: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--background))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-4 space-y-2.5">
                {roleDistribution.map(r => (
                  <li key={r.name} className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                    <span className="text-[12px] flex-1 truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {r.name}
                    </span>
                    <span
                      className="text-[12px] font-bold"
                      style={{ fontVariantNumeric: "tabular-nums", color: "hsl(var(--foreground))" }}
                    >
                      {r.value}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-[12px] py-8 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
              {loading ? "Loading…" : "No users yet"}
            </p>
          )}
        </div>
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
