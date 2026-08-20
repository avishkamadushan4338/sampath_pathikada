import { describe, it, expect } from "vitest";
import { filterCsvRowsToSection, SECTION_CSV_PREFIXES, type CsvRow } from "@/lib/analytics/csv-export";
import { SECTION_KEYS, type SectionKey } from "@/lib/types/submission";

const SAMPLE_ROW: CsvRow = {
  "GN Division": "Galle Fort",
  "DS Division": "Galle",
  "District": "Galle",
  "Officer": "K. Perera",
  "Officer Email": "officer@example.com",
  "Status": "APPROVED",
  "Submitted": "2026-01-01",
  "Decided": "2026-01-02",
  "Demographics: Total Population": 1000,
  "Housing: Total Units": 200,
  "Housing: Permanent": 150,
  "Employment: Total Job Seekers": 50,
  "Education: Govt Schools": 3,
  "Health: Govt Hospitals": 1,
  "Agriculture: Land Use Categories": 5,
  "Community: Total Organizations": 10,
  "Welfare: Disability Allowance Recipients": 4,
  "Infrastructure: Has Bus Stand": "Yes",
  "Physical Env: Water Sources Listed": 2,
  "Religious: Temples": 3,
  "Tourism: Hotels Listed": 1,
  "Waste: Has Collection Program": "Yes",
  "State Institutions & Land: State Institutions Listed": 6,
};

const IDENTITY_KEYS = ["GN Division", "DS Division", "District", "Officer", "Officer Email", "Status", "Submitted", "Decided"];

describe("SECTION_CSV_PREFIXES / filterCsvRowsToSection", () => {
  it("has an entry for every section except identification", () => {
    const mappedSections = Object.keys(SECTION_CSV_PREFIXES);
    const expected = SECTION_KEYS.filter((k) => k !== "identification");
    expect(new Set(mappedSections)).toEqual(new Set(expected));
  });

  it("returns an empty array for identification, since it has no buildCsvRows columns", () => {
    expect(filterCsvRowsToSection([SAMPLE_ROW], "identification")).toEqual([]);
  });

  it("keeps identity columns plus only the requested section's columns", () => {
    const [filtered] = filterCsvRowsToSection([SAMPLE_ROW], "housing");
    for (const key of IDENTITY_KEYS) expect(filtered).toHaveProperty(key);
    expect(filtered).toHaveProperty("Housing: Total Units", 200);
    expect(filtered).toHaveProperty("Housing: Permanent", 150);
    expect(filtered).not.toHaveProperty("Demographics: Total Population");
    expect(filtered).not.toHaveProperty("Employment: Total Job Seekers");
  });

  it("never lets two different sections' filtered output share a non-identity column (no cross-contamination)", () => {
    const nonIdentitySectionKeys = new Set<string>();
    for (const section of Object.keys(SECTION_CSV_PREFIXES) as SectionKey[]) {
      const [filtered] = filterCsvRowsToSection([SAMPLE_ROW], section);
      for (const key of Object.keys(filtered)) {
        if (IDENTITY_KEYS.includes(key)) continue;
        expect(nonIdentitySectionKeys.has(key)).toBe(false);
        nonIdentitySectionKeys.add(key);
      }
    }
  });

  it("produces at least one non-identity column for every mapped section given a fully-populated row", () => {
    for (const section of Object.keys(SECTION_CSV_PREFIXES) as SectionKey[]) {
      const [filtered] = filterCsvRowsToSection([SAMPLE_ROW], section);
      const nonIdentityKeys = Object.keys(filtered).filter((k) => !IDENTITY_KEYS.includes(k));
      expect(nonIdentityKeys.length, `section "${section}" produced no columns`).toBeGreaterThan(0);
    }
  });
});
