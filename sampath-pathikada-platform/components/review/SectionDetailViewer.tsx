"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SECTION_DICTS } from "@/lib/i18n/sections";
import type { SectionKey } from "@/lib/types/submission";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function resolveLabel(sectionKey: SectionKey, fieldKey: string, lang: "en" | "si"): string {
  const dict = SECTION_DICTS[sectionKey];
  const entry = dict?.fields?.[fieldKey];
  if (entry) return lang === "si" ? entry.si : entry.en;
  return humanizeKey(fieldKey);
}

function ScalarValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground/60">—</span>;
  }
  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (value === "yes") return <span className="text-[hsl(var(--status-approved))]">Yes</span>;
  if (value === "no") return <span className="text-muted-foreground">No</span>;
  return <span>{String(value)}</span>;
}

/** Renders a nested plain object (not an array) as an indented label/value block. */
function NestedObjectBlock({ sectionKey, data }: { sectionKey: SectionKey; data: Record<string, unknown> }) {
  const { lang } = useLanguage();
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-x-4 gap-y-2 rounded-md border border-border bg-muted/20 p-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-0.5">
          <dt className="text-fluid-xs font-medium text-muted-foreground">{resolveLabel(sectionKey, key, lang)}</dt>
          <dd className="text-fluid-sm text-foreground">
            {value !== null && typeof value === "object" && !Array.isArray(value) ? (
              <NestedObjectBlock sectionKey={sectionKey} data={value as Record<string, unknown>} />
            ) : (
              <ScalarValue value={value} />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Renders an array of row objects as a real table — the repeatable-row pattern used across every section. */
function RowsTable({ sectionKey, rows }: { sectionKey: SectionKey; rows: Record<string, unknown>[] }) {
  const { lang } = useLanguage();
  if (rows.length === 0) {
    return <p className="text-fluid-sm text-muted-foreground">—</p>;
  }
  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {columns.map((col) => (
              <TableHead key={col} className="text-fluid-xs">
                {resolveLabel(sectionKey, col, lang)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col} className="text-fluid-sm whitespace-normal">
                  <ScalarValue value={row[col]} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface SectionDetailViewerProps {
  sectionKey: SectionKey;
  data: Record<string, unknown> | null | undefined;
}

/** Structured, labeled read-only renderer for one section's stored JSON — used by the DS review detail page. */
export function SectionDetailViewer({ sectionKey, data }: SectionDetailViewerProps) {
  const { lang } = useLanguage();

  if (!data || Object.keys(data).length === 0) {
    return (
      <p className="text-fluid-sm text-muted-foreground">
        {lang === "si" ? "මෙම කොටස සඳහා දත්ත සටහන් කර නොමැත." : "No data recorded for this section."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(data).map(([key, value]) => {
        const label = resolveLabel(sectionKey, key, lang);

        if (Array.isArray(value)) {
          return (
            <div key={key} className="flex flex-col gap-2">
              <h3 className="text-fluid-sm font-semibold text-foreground">{label}</h3>
              <RowsTable sectionKey={sectionKey} rows={value as Record<string, unknown>[]} />
            </div>
          );
        }

        if (value !== null && typeof value === "object") {
          return (
            <div key={key} className="flex flex-col gap-2">
              <h3 className="text-fluid-sm font-semibold text-foreground">{label}</h3>
              <NestedObjectBlock sectionKey={sectionKey} data={value as Record<string, unknown>} />
            </div>
          );
        }

        return (
          <div key={key} className="flex flex-col gap-0.5">
            <span className="text-fluid-xs font-medium text-muted-foreground">{label}</span>
            <span className="text-fluid-sm text-foreground">
              <ScalarValue value={value} />
            </span>
          </div>
        );
      })}
    </div>
  );
}
