"use client";

import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent } from "@/components/ui/card";
import type { Translated } from "@/lib/i18n/types";

export interface ReadOnlyStat {
  key: string;
  label: Translated;
  value: string | undefined;
}

export interface ReadOnlyStatGroup {
  label: Translated;
  stats: ReadOnlyStat[];
}

interface ReadOnlyStatsProps {
  title: Translated;
  /** Flat KPI row — use for a single group of figures. */
  stats?: ReadOnlyStat[];
  /** Sub-headed KPI rows — use when the figures split into named categories (e.g. drinking
   *  water source's Groundwater / Pipe-borne / Other groups). Mutually exclusive with `stats`. */
  groups?: ReadOnlyStatGroup[];
}

function StatTileGrid({ stats }: { stats: ReadOnlyStat[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
      {stats.map((stat) => (
        <Card key={stat.key} className="border-border/60">
          <CardContent className="py-5 text-center">
            <p className="text-fluid-3xl font-semibold nums-tabular text-foreground">
              {stat.value || "—"}
            </p>
            <p className="mt-1 text-fluid-sm text-muted-foreground">
              <Bilingual en={stat.label.en} si={stat.label.si} />
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Read-only KPI row(s) for a group of scalar/summary numbers (the DS-side counterpart to the
 *  numeric fields on an EDO entry form) — large bold figures in their own tiles so an officer
 *  can read totals at a glance, instead of hunting for them in small table cells. */
export function ReadOnlyStats({ title, stats, groups }: ReadOnlyStatsProps) {
  return (
    <div>
      <h3 className="mb-3 text-fluid-base font-semibold text-foreground">
        <Bilingual en={title.en} si={title.si} />
      </h3>
      {groups ? (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.label.en}>
              <h4 className="mb-2 text-fluid-sm font-medium text-muted-foreground">
                <Bilingual en={group.label.en} si={group.label.si} />
              </h4>
              <StatTileGrid stats={group.stats} />
            </div>
          ))}
        </div>
      ) : (
        <StatTileGrid stats={stats ?? []} />
      )}
    </div>
  );
}
