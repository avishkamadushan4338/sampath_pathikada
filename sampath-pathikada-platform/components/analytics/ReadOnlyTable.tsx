"use client";

import { Bilingual } from "@/components/Bilingual";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Translated } from "@/lib/i18n/types";

export interface ReadOnlyColumn {
  key: string;
  label: Translated;
  /** Present for enum-valued columns (mirrors the EDO entry form's RepeatableColumn "select"
   *  type) — renders the matching option as a badge instead of the raw stored value. */
  options?: { value: string; label: Translated }[];
}

interface ReadOnlyTableProps {
  title: Translated;
  columns: ReadOnlyColumn[];
  rows: Record<string, string | undefined>[];
}

/** Read-only rendering of one EDO-entered repeatable table (the DS-side counterpart to
 *  RepeatableTable) — same column/row shape, no add/remove/edit affordances. */
export function ReadOnlyTable({ title, columns, rows }: ReadOnlyTableProps) {
  return (
    <div>
      <h3 className="mb-3 text-fluid-base font-semibold text-foreground">
        <Bilingual en={title.en} si={title.si} />
      </h3>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-fluid-sm text-muted-foreground">
          <Bilingual en="No entries recorded for this GN division." si="මෙම ග්‍රාම නිලධාරී වසම සඳහා සටහන් නොමැත." />
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="divide-x divide-border bg-muted/40 hover:bg-muted/40">
                {columns.map((c) => (
                  <TableHead key={c.key} className="px-4 text-fluid-sm">
                    <Bilingual en={c.label.en} si={c.label.si} />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i} className="divide-x divide-border">
                  {columns.map((c) => {
                    const value = row[c.key];
                    if (!c.options) {
                      return (
                        <TableCell key={c.key} className="px-4 text-fluid-base nums-tabular">
                          {value || "—"}
                        </TableCell>
                      );
                    }
                    const option = c.options.find((o) => o.value === value);
                    return (
                      <TableCell key={c.key} className="px-4 text-fluid-base">
                        <Badge variant="outline">
                          {option ? <Bilingual en={option.label.en} si={option.label.si} /> : value || "—"}
                        </Badge>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
