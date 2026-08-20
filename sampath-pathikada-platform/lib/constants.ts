/** Reporting cycle year — fixed for now; a year-selector is a future feature. */
export const CURRENT_YEAR = 2026;

/** Safety-net cap for the CSV/Excel/PDF export routes' unpaginated findMany() calls.
 *  Sri Lanka has ~14,000 GN divisions nationwide, so one Submission row per GN division
 *  per year is comfortably bounded — this exists to turn a pathological/unscoped query
 *  (e.g. a SUPER_ADMIN export with no district/dsDivision filter) into a clear error
 *  instead of an unbounded multi-MB in-memory aggregation, not to truncate real exports. */
export const EXPORT_ROW_CAP = 20_000;
