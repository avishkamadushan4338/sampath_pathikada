"use client";

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from "recharts";

export const NAVY   = "#0E2B4E";
export const GOLD   = "#BC9144";
export const GOLD_D = "#915F2F";
export const MAROON = "#66261E";
export const GREEN  = "#2D7A51";
export const ROSE   = "#B5495B";

export const CHART_PALETTE = [NAVY, GOLD, GREEN, MAROON, GOLD_D, ROSE, "#8A8577", "#4A7FA6"];

export function StatCard({ icon: Icon, label, value, sub, iconBg }: {
  icon: React.ElementType; label: string; value: string | number; sub: string; iconBg: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 1px 3px rgba(14,43,78,0.06)" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(14,43,78,0.10)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(14,43,78,0.06)")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em" }}>
            {label}
          </p>
          <p className="text-3xl font-bold leading-none" style={{ fontFamily: "'DM Sans','Inter',sans-serif", fontVariantNumeric: "tabular-nums", color: "hsl(var(--foreground))" }}>
            {value}
          </p>
          <p className="text-[12px] mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>{sub}</p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon size={20} color="#fff" />
        </div>
      </div>
    </div>
  );
}

export function MiniStat({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}1A` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
        <p className="text-[15px] font-bold truncate" style={{ fontVariantNumeric: "tabular-nums", color: "hsl(var(--foreground))" }}>{value}</p>
      </div>
    </div>
  );
}

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 30px rgba(0,0,0,0.10)" }}>
      {label && <p className="font-bold mb-1.5" style={{ color: "hsl(var(--foreground))" }}>{label}</p>}
      {payload.map((p: any) => (
        <p key={p.dataKey ?? p.name} className="capitalize" style={{ color: p.color ?? p.payload?.fill }}>
          {p.name}: <strong>{Math.abs(p.value)}</strong>
        </p>
      ))}
    </div>
  );
}

export function ChartCard({ title, sub, icon: Icon, children }: { title: string; sub?: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[14px]" style={{ color: "hsl(var(--foreground))" }}>{title}</h3>
          {sub && <p className="text-[11.5px]" style={{ color: "hsl(var(--muted-foreground))" }}>{sub}</p>}
        </div>
        {Icon && <Icon size={16} style={{ color: "hsl(var(--muted-foreground))" }} />}
      </div>
      {children}
    </div>
  );
}

/** Horizontal bar chart for a list of { label/en, value } — used for most "count by category" charts. */
export function HorizontalBarChart({ data, height = 240, barFill = NAVY, maxBarSize = 20 }: {
  data: { label: string; value: number }[]; height?: number; barFill?: string; maxBarSize?: number;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.7} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={130} tick={{ fontSize: 10.5, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
          <Bar dataKey="value" fill={barFill} radius={[0, 4, 4, 0]} maxBarSize={maxBarSize}>
            <LabelList dataKey="value" position="right" style={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Donut chart with a legend list — used for religion/water-source/type-distribution charts. */
export function DonutChart({ data, height = 160 }: { data: { name: string; value: number; color: string }[]; height?: number }) {
  const nonZero = data.filter((d) => d.value > 0);
  if (nonZero.length === 0) {
    return <p className="text-[12px] py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No data yet</p>;
  }
  return (
    <>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={nonZero} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value">
            {nonZero.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-3 space-y-2">
        {nonZero.map((r) => (
          <li key={r.name} className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
            <span className="text-[11.5px] flex-1 truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{r.name}</span>
            <span className="text-[11.5px] font-bold" style={{ fontVariantNumeric: "tabular-nums", color: "hsl(var(--foreground))" }}>{r.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function CoverageBadge({ withData, total }: { withData: number; total: number }) {
  const pct = total > 0 ? Math.round((withData / total) * 100) : 0;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: pct >= 50 ? "rgba(45,122,81,0.12)" : "rgba(188,145,68,0.14)", color: pct >= 50 ? GREEN : GOLD_D }}
    >
      {withData}/{total} divisions reporting ({pct}%)
    </span>
  );
}
