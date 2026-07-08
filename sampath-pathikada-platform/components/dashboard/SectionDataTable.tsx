"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUp, ArrowDown, ArrowUpDown, MapPin } from "lucide-react";

const NAVY = "#0E2B4E";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

type WithGnTag = { gnName?: string; gnId?: string };

interface SectionDataTableProps<T extends WithGnTag> {
  title: string;
  rows: T[];
  columns: DataTableColumn<T>[];
  truncated?: boolean;
  showGnColumn?: boolean;
  emptyLabel?: string;
}

export function SectionDataTable<T extends WithGnTag>({
  title, rows, columns, truncated, showGnColumn = true, emptyLabel = "No records yet",
}: SectionDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let data = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((row) =>
        Object.values(row).some((v) => typeof v === "string" && v.toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      data = [...data].sort((a, b) => {
        const av = (a as any)[sortKey];
        const bv = (b as any)[sortKey];
        if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
        const as = String(av ?? "").toLowerCase();
        const bs = String(bv ?? "").toLowerCase();
        return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
      });
    }
    return data;
  }, [rows, search, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
      <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div>
          <h3 className="font-bold text-[13.5px]" style={{ color: "hsl(var(--foreground))" }}>{title}</h3>
          <p className="text-[11.5px]" style={{ color: "hsl(var(--muted-foreground))" }}>
            {rows.length.toLocaleString()} record{rows.length === 1 ? "" : "s"}
            {truncated ? " (showing first 500)" : ""}
          </p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-8 pl-8 pr-3 rounded-lg text-[12px] w-48 focus:outline-none"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--input))", color: "hsl(var(--foreground))" }}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-[12.5px]" style={{ color: "hsl(var(--muted-foreground))" }}>{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="sticky top-0" style={{ background: "hsl(var(--muted))" }}>
              <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                {showGnColumn && (
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                    GN Division
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && toggleSort(col.key)}
                    className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wider whitespace-nowrap select-none"
                    style={{ color: "hsl(var(--muted-foreground))", cursor: col.sortable !== false ? "pointer" : "default" }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable !== false && (
                        sortKey === col.key
                          ? (sortDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />)
                          : <ArrowUpDown size={11} style={{ opacity: 0.4 }} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={columns.length + (showGnColumn ? 1 : 0)} className="px-4 py-6 text-center text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>No matches</td></tr>
              )}
              {filtered.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid hsl(var(--border))" : undefined }}>
                  {showGnColumn && (
                    <td className="px-4 py-2.5 text-[12px] whitespace-nowrap" style={{ color: NAVY }}>
                      <span className="inline-flex items-center gap-1"><MapPin size={10} />{row.gnName ?? "—"}</span>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-2.5 text-[12.5px]" style={{ color: "hsl(var(--foreground))" }}>
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
