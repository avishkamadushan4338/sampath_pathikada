"use client";

import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";

/** On-brand chart palette — shared by every chart surface (per-submission and area-wide).
 *  Each color is a CSS variable, not a hardcoded hex: a single hex can't clear 3:1 against
 *  both the light card (#EEE3CC) and the dark card (#102238) at once — e.g. the original
 *  maroon #66261E measured 8.86:1 in light mode but only 1.42:1 in dark. --chart-* in
 *  globals.css defines a separate, independently-validated step of each hue per theme, so
 *  these repaint automatically on theme switch (no React re-render needed). */
export const NAVY = "hsl(var(--chart-navy))";
export const GOLD = "hsl(var(--chart-gold))";
export const MAROON = "hsl(var(--chart-maroon))";
export const GREEN = "hsl(var(--chart-green))";
export const AMBER = "hsl(var(--chart-amber))";
export const GOLD_DEEP = "hsl(var(--chart-gold-deep))";

export interface BarRow {
  label: string;
  value: number;
}

export function hasKeys(v: unknown): boolean {
  return !!v && typeof v === "object" && Object.keys(v as object).length > 0;
}

export function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: BarRow; color?: string }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 30px rgba(0,0,0,0.10)" }}
    >
      <p className="font-semibold" style={{ color: p.color }}>
        {p.payload.label}: <strong>{p.payload.value}</strong>
      </p>
    </div>
  );
}

/** Horizontal bar chart card. Height grows with row count but width is always fluid via
 *  ResponsiveContainer, so it scales from a narrow phone column up to an ultrawide monitor
 *  without ever overflowing or needing a fixed pixel width. */
export function BarCard({
  titleEn,
  titleSi,
  rows,
  color,
  hideZero,
  footer,
}: {
  titleEn: string;
  titleSi: string;
  rows: BarRow[];
  color: string;
  hideZero?: boolean;
  footer?: React.ReactNode;
}) {
  const visibleRows = hideZero ? rows.filter((r) => r.value > 0) : rows;
  const hasData = visibleRows.some((r) => r.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-fluid-base">
          <Bilingual en={titleEn} si={titleSi} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-fluid-sm text-muted-foreground">
            <Bilingual en="No data recorded." si="දත්ත සටහන් කර නොමැත." />
          </p>
        ) : (
          <div style={{ height: Math.max(160, visibleRows.length * 30) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visibleRows} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={160}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22} fill={color}>
                  <LabelList dataKey="value" position="right" style={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {footer}
      </CardContent>
    </Card>
  );
}

/** Vertical column chart card — same spec as BarCard (thin marks, rounded data-end, direct
 *  value labels) but bars grow upward from a baseline with categories along the x-axis instead
 *  of down the y-axis. Category labels are rotated 35° with extra bottom margin so several
 *  long-named categories (e.g. "Rural / Local Water Supply") don't collide edge-to-edge the way
 *  they would sitting flat under a narrow column. */
export function ColumnCard({
  titleEn,
  titleSi,
  rows,
  color,
  hideZero,
  footer,
}: {
  titleEn: string;
  titleSi: string;
  rows: BarRow[];
  color: string;
  hideZero?: boolean;
  footer?: React.ReactNode;
}) {
  const visibleRows = hideZero ? rows.filter((r) => r.value > 0) : rows;
  const hasData = visibleRows.some((r) => r.value > 0);

  return (
    <Card className="card-lift">
      <CardHeader>
        <CardTitle className="text-fluid-lg">
          <Bilingual en={titleEn} si={titleSi} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-fluid-sm text-muted-foreground">
            <Bilingual en="No data recorded." si="දත්ත සටහන් කර නොමැත." />
          </p>
        ) : (
          // Horizontal scroll below a min-width floor (80px/column) — on a narrow phone, 7
          // rotated long labels squeezed into ~270px would collide with each other; scrolling
          // keeps every label legible instead of letting Recharts cram or overlap them.
          <div className="overflow-x-auto">
            <div style={{ height: 480, minWidth: Math.max(480, visibleRows.length * 80) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visibleRows} margin={{ top: 24, right: 12, bottom: 84, left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 13 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={24} fill={color}>
                    <LabelList dataKey="value" position="top" style={{ fill: "hsl(var(--foreground))", fontSize: 13, fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {footer}
      </CardContent>
    </Card>
  );
}

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
  /** A subset already counted inside `value` (e.g. "of these 30 without facilities, 20 need
   *  assistance") — rendered as an indented sub-row under this slice's legend entry instead of
   *  a separate donut wedge, since it isn't an additional share of the whole and would double-
   *  count the total if it were. Its percentage is of this slice's value, not the grand total. */
  subBreakdown?: { label: string; value: number };
}

/** Part-to-whole breakdown of a total (e.g. housing types making up Total Houses) — a donut
 *  rather than a full pie so the whole (the total the slices sum to) can sit labeled at the
 *  center, which is the entire point of charting it this way instead of a bar. Each slice gets
 *  its own step of the section's hue (a small ordinal-style ramp) rather than unrelated
 *  categorical colors, since there are only 2-3 slices and a legend + direct labels already
 *  carry identity — color doesn't have to. */
export function DonutCard({
  titleEn,
  titleSi,
  slices,
  totalLabel,
  footer,
}: {
  titleEn: string;
  titleSi: string;
  slices: DonutSlice[];
  totalLabel: { en: string; si: string };
  footer?: React.ReactNode;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const hasData = total > 0;

  return (
    <Card className="card-lift">
      <CardHeader>
        <CardTitle className="text-fluid-lg">
          <Bilingual en={titleEn} si={titleSi} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-fluid-sm text-muted-foreground">
            <Bilingual en="No data recorded." si="දත්ත සටහන් කර නොමැත." />
          </p>
        ) : (
          <div className="flex max-w-3xl flex-col items-center gap-8 md:ml-6 md:flex-row md:items-center md:justify-start">
            <div className="relative size-48 shrink-0 sm:size-64 md:size-72 lg:size-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="label"
                    innerRadius="64%"
                    outerRadius="100%"
                    paddingAngle={slices.length > 1 ? 2 : 0}
                    stroke="none"
                  >
                    {slices.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-fluid-3xl font-semibold nums-tabular text-foreground">{total}</p>
                <p className="text-fluid-base text-muted-foreground">
                  <Bilingual en={totalLabel.en} si={totalLabel.si} />
                </p>
              </div>
            </div>
            <ul className="flex w-full min-w-0 flex-1 flex-col gap-3">
              {slices.map((s, i) => (
                <li key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5 text-fluid-sm">
                    <span className="size-3 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                    <span className="whitespace-nowrap text-foreground">{s.label}</span>
                    <span className="whitespace-nowrap font-semibold nums-tabular text-foreground">
                      {s.value} <span className="text-muted-foreground">({total > 0 ? Math.round((s.value / total) * 100) : 0}%)</span>
                    </span>
                  </div>
                  {s.subBreakdown && (
                    <div className="ml-4.5 flex items-center gap-2.5 border-l-2 pl-3 text-fluid-xs" style={{ borderColor: s.color }}>
                      <span className="whitespace-nowrap text-muted-foreground">{s.subBreakdown.label}</span>
                      <span className="whitespace-nowrap font-semibold nums-tabular text-foreground">
                        {s.subBreakdown.value}{" "}
                        <span className="text-muted-foreground">
                          ({s.value > 0 ? Math.round((s.subBreakdown.value / s.value) * 100) : 0}%)
                        </span>
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {footer}
      </CardContent>
    </Card>
  );
}

/** Single ratio against a 0-100 limit (e.g. "% electricity access") — a filled track in the
 *  section's accent color against a lighter step of that same hue, per the dataviz meter spec:
 *  the fill carries the value, the unfilled track stays on-ramp instead of a neutral gray. */
export function MeterCard({
  titleEn,
  titleSi,
  percent,
  color,
}: {
  titleEn: string;
  titleSi: string;
  percent: number | null;
  color: string;
}) {
  const value = percent !== null ? Math.min(100, Math.max(0, percent)) : null;

  return (
    <Card className="card-lift">
      <CardHeader>
        <CardTitle className="text-fluid-lg">
          <Bilingual en={titleEn} si={titleSi} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {value === null ? (
          <p className="text-fluid-sm text-muted-foreground">
            <Bilingual en="No data recorded." si="දත්ත සටහන් කර නොමැත." />
          </p>
        ) : (
          <div className="flex flex-col gap-5 py-4">
            <p className="text-fluid-3xl font-semibold nums-tabular text-foreground">{value}%</p>
            <div className="h-6 w-full overflow-hidden rounded-full" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
              <div
                className="h-full rounded-full transition-[width]"
                style={{ width: `${value}%`, background: color }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatGrid({ items }: { items: { en: string; si: string; value: string | number }[] }) {
  const { lang } = useLanguage();
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-border bg-muted/20 p-3">
          <p className="text-fluid-lg font-semibold nums-tabular text-foreground">{it.value}</p>
          <p lang={lang} className={lang === "si" ? "font-si text-fluid-xs text-muted-foreground" : "font-ui text-fluid-xs text-muted-foreground"}>
            {lang === "si" ? it.si : it.en}
          </p>
        </div>
      ))}
    </div>
  );
}

export function YesNoBadge({ yes, labelEn, labelSi }: { yes: boolean; labelEn: string; labelSi: string }) {
  return (
    <Badge
      variant="outline"
      className={
        yes
          ? "border-[hsl(var(--status-approved))]/30 bg-[hsl(var(--status-approved))]/15 text-[hsl(var(--status-approved))]"
          : "text-muted-foreground"
      }
    >
      {(labelEn || labelSi) && <Bilingual en={`${labelEn}: `} si={`${labelSi}: `} />}
      <Bilingual en={yes ? "Yes" : "No"} si={yes ? "ඔව්" : "නැත"} />
    </Badge>
  );
}

export function SectionGroup({
  icon: Icon,
  titleEn,
  titleSi,
  empty,
  badge,
  children,
}: {
  icon: LucideIcon;
  titleEn: string;
  titleSi: string;
  empty: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-fluid-lg font-semibold text-foreground">
          <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <Bilingual en={titleEn} si={titleSi} />
        </h2>
        {badge}
      </div>
      {empty ? (
        <p className="text-fluid-sm text-muted-foreground">
          <Bilingual en="No data recorded for this section." si="මෙම කොටස සඳහා දත්ත සටහන් කර නොමැත." />
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">{children}</div>
      )}
    </section>
  );
}
