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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";

/** On-brand chart palette — shared by every chart surface (per-submission and area-wide). */
export const NAVY = "#0E2B4E";
export const GOLD = "#BC9144";
export const MAROON = "#66261E";
export const GREEN = "#2D7A51";

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
