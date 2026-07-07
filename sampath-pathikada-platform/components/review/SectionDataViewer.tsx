"use client";

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function ValueDisplay({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground/60">—</span>;
  }
  if (typeof value === "boolean") {
    return <span>{value ? "Yes" : "No"}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground/60">—</span>;
    return (
      <div className="flex flex-col gap-2">
        {value.map((row, i) => (
          <div key={i} className="rounded-md border border-border bg-muted/30 p-2">
            <SectionDataViewer data={row as Record<string, unknown>} nested />
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    return <SectionDataViewer data={value as Record<string, unknown>} nested />;
  }
  return <span>{String(value)}</span>;
}

/** Generic read-only renderer for one section's stored JSON — used by the reviewer detail page. */
export function SectionDataViewer({
  data,
  nested = false,
}: {
  data: Record<string, unknown> | null | undefined;
  nested?: boolean;
}) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-fluid-sm text-muted-foreground">No data recorded for this section.</p>;
  }

  return (
    <dl className={nested ? "flex flex-col gap-1.5" : "grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-6 gap-y-3"}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-0.5">
          <dt className="text-fluid-xs font-medium text-muted-foreground">{humanizeKey(key)}</dt>
          <dd className="text-fluid-sm text-foreground">
            <ValueDisplay value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
