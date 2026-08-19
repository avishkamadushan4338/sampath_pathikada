import { SECTION_KEYS, type SectionKey, type SubmissionData } from "@/lib/types/submission";
import { resolveLabel } from "@/lib/i18n/section-label";
import { SECTION_META } from "@/lib/i18n/section-meta";
import type { CsvBlock, CsvRow, CsvValue } from "@/lib/analytics/csv-export";

function scalarToCsvValue(value: unknown): CsvValue {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  if (typeof value === "number") return value;
  return String(value);
}

/** Flattens one nested plain object one level deep into `"parent.child": value` pairs — mirrors
 *  SectionDetailViewer's NestedObjectBlock, but as CSV cells instead of a labeled dl/dt block. */
function flattenNestedObject(
  sectionKey: SectionKey,
  data: Record<string, unknown>,
  lang: "en" | "si",
  parentKey?: string
): CsvRow {
  const row: CsvRow = {};
  for (const [key, value] of Object.entries(data)) {
    const label = resolveLabel(sectionKey, key, lang, parentKey);
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(row, flattenNestedObject(sectionKey, value as Record<string, unknown>, lang, key));
    } else {
      row[label] = scalarToCsvValue(value);
    }
  }
  return row;
}

/** Array-of-row-objects → one CSV row per item, columns = the union of that array's own keys,
 *  same as SectionDetailViewer's RowsTable — including its "drop any `${col}Label` raw-enum
 *  sibling, keep the human-readable one" rule. */
function rowsToCsvRows(sectionKey: SectionKey, parentKey: string, rows: Record<string, unknown>[], lang: "en" | "si"): CsvRow[] {
  if (rows.length === 0) return [];
  const allColumns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );
  const columns = allColumns.filter((col) => !allColumns.includes(`${col}Label`));

  return rows.map((row) => {
    const csvRow: CsvRow = {};
    for (const col of columns) {
      const value = row[col];
      const label = resolveLabel(sectionKey, col, lang, parentKey);
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const nested = flattenNestedObject(sectionKey, value as Record<string, unknown>, lang, col);
        for (const [nestedLabel, nestedValue] of Object.entries(nested)) {
          csvRow[`${label} — ${nestedLabel}`] = nestedValue;
        }
      } else {
        csvRow[label] = scalarToCsvValue(value);
      }
    }
    return csvRow;
  });
}

/** One block per top-level field within a section: a scalar/nested-object field becomes a single
 *  "Field / Value" two-column table (all such fields pooled into one block per section), and each
 *  array field becomes its own block (a real table, one row per array item) — the same shape
 *  SectionDetailViewer renders on screen, just as CSV blocks instead of JSX. */
function buildSectionBlocks(sectionKey: SectionKey, data: Record<string, unknown> | undefined, lang: "en" | "si"): CsvBlock[] {
  const meta = SECTION_META[sectionKey];
  const sectionTitle = lang === "si" ? meta.title.si : meta.title.en;

  if (!data || Object.keys(data).length === 0) {
    return [{ heading: `Section ${meta.number}: ${sectionTitle}`, rows: [] }];
  }

  const scalarFieldsRow: CsvRow = {};
  const arrayBlocks: CsvBlock[] = [];

  for (const [key, value] of Object.entries(data)) {
    const label = resolveLabel(sectionKey, key, lang);
    if (Array.isArray(value)) {
      arrayBlocks.push({
        heading: `Section ${meta.number}: ${sectionTitle} — ${label}`,
        rows: rowsToCsvRows(sectionKey, key, value as Record<string, unknown>[], lang),
      });
    } else if (value !== null && typeof value === "object") {
      Object.assign(scalarFieldsRow, flattenNestedObject(sectionKey, value as Record<string, unknown>, lang, key));
    } else {
      scalarFieldsRow[label] = scalarToCsvValue(value);
    }
  }

  const blocks: CsvBlock[] = [];
  if (Object.keys(scalarFieldsRow).length > 0) {
    blocks.push({ heading: `Section ${meta.number}: ${sectionTitle}`, rows: [scalarFieldsRow] });
  }
  blocks.push(...arrayBlocks);
  // A section with nothing but empty arrays (no scalar fields, every array empty) still needs a
  // visible placeholder block so the section isn't silently absent from the file.
  if (blocks.length === 0) {
    blocks.push({ heading: `Section ${meta.number}: ${sectionTitle}`, rows: [] });
  }
  return blocks;
}

/** Full-detail CSV blocks for one GN division's approved profile — every section, every listed
 *  row (institution names, sites, etc.), not just counts. Walks SECTION_KEYS in the same PDF
 *  numeric order used everywhere else (dashboard, sidebar), so the export reads top-to-bottom the
 *  same way the on-screen section list does. */
export function buildProfileCsvBlocks(data: SubmissionData, lang: "en" | "si" = "en"): CsvBlock[] {
  return SECTION_KEYS.flatMap((key) => buildSectionBlocks(key, data[key] as Record<string, unknown> | undefined, lang));
}
