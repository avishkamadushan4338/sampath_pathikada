import { describe, it, expect } from "vitest";
import {
  demographicsSchemaStrict,
  demographicsSchemaPartial,
  AGE_BANDS,
  ETHNICITIES,
  RELIGIONS,
  DISABILITY_TYPES,
  POPULATION_MISMATCH_ERROR_PREFIX,
} from "@/lib/validators/sections/demographics";

// Age/Ethnicity/Religion are three different breakdowns of the *same* population, so their
// female/male totals must agree (50 female / 60 male here) — see requireMatchingPopulationTotals.
const validPayload = {
  populationByAge: AGE_BANDS.map((band) => ({ band, female: 10, male: 12 })),
  populationByEthnicity: ETHNICITIES.map((ethnicity, i) => ({
    ethnicity,
    female: i === 0 ? 45 : 1,
    male: i === 0 ? 55 : 1,
  })),
  populationByReligion: RELIGIONS.map((religion, i) => ({
    religion,
    female: i === 0 ? 46 : 1,
    male: i === 0 ? 56 : 1,
  })),
  foreignNationals: { female: 0, male: 0 },
  households: { total: 100, femaleHeaded: 20, displaced: 0 },
  disabilities: DISABILITY_TYPES.map((type) => ({
    type,
    under18: { female: 0, male: 0 },
    over18: { female: 1, male: 1 },
  })),
  registeredVoters: { electoralArea: "Galle", female: 60, male: 55 },
};

describe("demographicsSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = demographicsSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing a required field", () => {
    const { households, ...withoutHouseholds } = validPayload;
    void households;
    const result = demographicsSchemaStrict.safeParse(withoutHouseholds);
    expect(result.success).toBe(false);
  });

  it("rejects populationByAge with fewer rows than AGE_BANDS", () => {
    const result = demographicsSchemaStrict.safeParse({
      ...validPayload,
      populationByAge: validPayload.populationByAge.slice(0, AGE_BANDS.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects populationByEthnicity with fewer rows than ETHNICITIES", () => {
    const result = demographicsSchemaStrict.safeParse({
      ...validPayload,
      populationByEthnicity: validPayload.populationByEthnicity.slice(0, ETHNICITIES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects populationByReligion with fewer rows than RELIGIONS", () => {
    const result = demographicsSchemaStrict.safeParse({
      ...validPayload,
      populationByReligion: validPayload.populationByReligion.slice(0, RELIGIONS.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects disabilities with fewer rows than DISABILITY_TYPES", () => {
    const result = demographicsSchemaStrict.safeParse({
      ...validPayload,
      disabilities: validPayload.disabilities.slice(0, DISABILITY_TYPES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts the correct full-length arrays", () => {
    const result = demographicsSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.populationByAge).toHaveLength(AGE_BANDS.length);
      expect(result.data.disabilities).toHaveLength(DISABILITY_TYPES.length);
    }
  });

  it("rejects an unknown ethnicity enum value", () => {
    const result = demographicsSchemaStrict.safeParse({
      ...validPayload,
      populationByEthnicity: [
        { ethnicity: "not-a-real-ethnicity", female: 1, male: 1 },
        ...validPayload.populationByEthnicity.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown disability type enum value", () => {
    const result = demographicsSchemaStrict.safeParse({
      ...validPayload,
      disabilities: [
        { type: "not-a-real-type", under18: { female: 0, male: 0 }, over18: { female: 0, male: 0 } },
        ...validPayload.disabilities.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("coerces numeric string counts", () => {
    const result = demographicsSchemaStrict.safeParse({
      ...validPayload,
      households: { total: "150", femaleHeaded: "30", displaced: "0" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.households.total).toBe(150);
    }
  });

  it("rejects a female population total that doesn't match across Age/Ethnicity/Religion", () => {
    const result = demographicsSchemaStrict.safeParse({
      ...validPayload,
      // Age totals 50 female (5 rows x 10); bump ethnicity's first row so it totals 51 instead.
      populationByEthnicity: [
        { ethnicity: ETHNICITIES[0], female: 46, male: 55 },
        ...validPayload.populationByEthnicity.slice(1),
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.startsWith(POPULATION_MISMATCH_ERROR_PREFIX))).toBe(true);
    }
  });

  it("rejects a male population total that doesn't match across Age/Ethnicity/Religion", () => {
    const result = demographicsSchemaStrict.safeParse({
      ...validPayload,
      populationByReligion: [
        { religion: RELIGIONS[0], female: 46, male: 57 },
        ...validPayload.populationByReligion.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("flags the mismatch once, on a dedicated key — not duplicated onto both the ethnicity and religion arrays", () => {
    const result = demographicsSchemaStrict.safeParse({
      ...validPayload,
      populationByEthnicity: [
        { ethnicity: ETHNICITIES[0], female: 999, male: 55 },
        ...validPayload.populationByEthnicity.slice(1),
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const mismatchIssues = result.error.issues.filter((i) => i.message.startsWith(POPULATION_MISMATCH_ERROR_PREFIX));
      expect(mismatchIssues).toHaveLength(1);
      expect(mismatchIssues[0].path[0]).toBe("populationTotalsMismatch");
    }
  });
});

describe("demographicsSchemaPartial", () => {
  it("accepts an empty object (fresh draft, section not yet opened)", () => {
    const result = demographicsSchemaPartial.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects a populationByAge row with blank counts — matches how the entry page seeds a fresh row (band filled in, counts start as \"\" not 0)", () => {
    const result = demographicsSchemaPartial.safeParse({
      populationByAge: [{ band: "0-4", female: "", male: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a populationByAge row once both counts are filled in, including an explicit zero", () => {
    const result = demographicsSchemaPartial.safeParse({
      populationByAge: [{ band: "0-4", female: 0, male: 0 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a disabilities row with blank counts", () => {
    const result = demographicsSchemaPartial.safeParse({
      disabilities: [{ type: "paralysis", under18: { female: "", male: "" }, over18: { female: "", male: "" } }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a disabilities row once all four counts are filled in", () => {
    const result = demographicsSchemaPartial.safeParse({
      disabilities: [{ type: "paralysis", under18: { female: 0, male: 0 }, over18: { female: 0, male: 0 } }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects foreignNationals with blank counts", () => {
    const result = demographicsSchemaPartial.safeParse({ foreignNationals: { female: "", male: "" } });
    expect(result.success).toBe(false);
  });

  it("accepts foreignNationals once filled in with explicit zeros", () => {
    const result = demographicsSchemaPartial.safeParse({ foreignNationals: { female: 0, male: 0 } });
    expect(result.success).toBe(true);
  });

  it("rejects households with blank counts", () => {
    const result = demographicsSchemaPartial.safeParse({ households: { total: "", femaleHeaded: "", displaced: "" } });
    expect(result.success).toBe(false);
  });

  it("accepts households once filled in", () => {
    const result = demographicsSchemaPartial.safeParse({ households: { total: 100, femaleHeaded: 20, displaced: 0 } });
    expect(result.success).toBe(true);
  });

  it("rejects registeredVoters with a blank electoral area and blank counts", () => {
    const result = demographicsSchemaPartial.safeParse({ registeredVoters: { electoralArea: "", female: "", male: "" } });
    expect(result.success).toBe(false);
  });

  it("accepts registeredVoters once filled in", () => {
    const result = demographicsSchemaPartial.safeParse({ registeredVoters: { electoralArea: "Galle", female: 60, male: 55 } });
    expect(result.success).toBe(true);
  });

  it("treats null the same as a blank count", () => {
    const result = demographicsSchemaPartial.safeParse({ foreignNationals: { female: null, male: 0 } });
    expect(result.success).toBe(false);
  });

  it("still rejects a genuinely invalid enum value", () => {
    const result = demographicsSchemaPartial.safeParse({
      populationByAge: [{ band: "not-a-real-band", female: 0, male: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("skips the population-total cross-check while a table is still untouched (only Age filled in)", () => {
    const result = demographicsSchemaPartial.safeParse({
      populationByAge: [{ band: "0-4", female: 10, male: 12 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched totals once all three tables are fully filled in", () => {
    const result = demographicsSchemaPartial.safeParse({
      populationByAge: [{ band: "0-4", female: 10, male: 12 }],
      populationByEthnicity: [{ ethnicity: "sinhala", female: 999, male: 12 }],
      populationByReligion: [{ religion: "buddhist", female: 10, male: 12 }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.startsWith(POPULATION_MISMATCH_ERROR_PREFIX))).toBe(true);
    }
  });

  it("accepts matching totals once all three tables are fully filled in", () => {
    const result = demographicsSchemaPartial.safeParse({
      populationByAge: [{ band: "0-4", female: 10, male: 12 }],
      populationByEthnicity: [{ ethnicity: "sinhala", female: 10, male: 12 }],
      populationByReligion: [{ religion: "buddhist", female: 10, male: 12 }],
    });
    expect(result.success).toBe(true);
  });
});
