import { describe, it, expect } from "vitest";
import {
  religiousCulturalSchemaStrict,
  religiousCulturalSchemaPartial,
  HERITAGE_SITE_TYPES,
} from "@/lib/validators/sections/religious-cultural";

const validPayload = {
  religiousSiteCounts: {
    temples: { count: 5, clergyCount: 10 },
    meheniArama: { count: 1, clergyCount: 2 },
    kovils: { count: 0, clergyCount: 0 },
    mosques: { count: 0, clergyCount: 0 },
    churches: { count: 1, priestsCount: 1, nunsCount: 0 },
  },
  heritageSites: [
    { name: "Galle Fort Temple", type: "temple-vihara" as const, significance: "Ancient heritage site" },
  ],
  artAcademies: [{ name: "Ruhunu Art Academy", studentCount: 30 }],
  traditionalArtists: [{ name: "K. Perera", artForm: "Low-country dancing" }],
};

describe("religiousCulturalSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = religiousCulturalSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing religiousSiteCounts", () => {
    const { religiousSiteCounts, ...rest } = validPayload;
    void religiousSiteCounts;
    const result = religiousCulturalSchemaStrict.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects a heritage site row missing a required field", () => {
    const result = religiousCulturalSchemaStrict.safeParse({
      ...validPayload,
      heritageSites: [{ name: "Galle Fort Temple", type: "temple-vihara" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown heritage site type enum value", () => {
    const result = religiousCulturalSchemaStrict.safeParse({
      ...validPayload,
      heritageSites: [{ name: "Galle Fort Temple", type: "not-a-real-type", significance: "Ancient site" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a traditional artist row missing a required field", () => {
    const result = religiousCulturalSchemaStrict.safeParse({
      ...validPayload,
      traditionalArtists: [{ name: "K. Perera" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts every declared heritage site type", () => {
    const result = religiousCulturalSchemaStrict.safeParse({
      ...validPayload,
      heritageSites: HERITAGE_SITE_TYPES.map((type) => ({
        name: `Site (${type})`,
        type,
        significance: "Local significance",
      })),
    });
    expect(result.success).toBe(true);
  });

  it("coerces numeric string counts", () => {
    const result = religiousCulturalSchemaStrict.safeParse({
      ...validPayload,
      religiousSiteCounts: {
        ...validPayload.religiousSiteCounts,
        temples: { count: "5", clergyCount: "10" },
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.religiousSiteCounts.temples.count).toBe(5);
      expect(result.data.religiousSiteCounts.temples.clergyCount).toBe(10);
    }
  });
});

describe("religiousCulturalSchemaPartial", () => {
  it("accepts an empty object (fresh draft)", () => {
    const result = religiousCulturalSchemaPartial.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts an untouched table (no rows added yet)", () => {
    const result = religiousCulturalSchemaPartial.safeParse({ heritageSites: [] });
    expect(result.success).toBe(true);
  });

  it("accepts partial religiousSiteCounts with only some sub-fields filled in", () => {
    // count/clergyCount both default to 0 in strict, so this is unaffected by the fix.
    const result = religiousCulturalSchemaPartial.safeParse({
      religiousSiteCounts: { temples: { count: 3 } },
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a genuinely invalid enum value", () => {
    const result = religiousCulturalSchemaPartial.safeParse({
      heritageSites: [{ name: "Galle Fort Temple", type: "not-a-real-type", significance: "Ancient site" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a heritage site row added via the UI still left blank — surfaces a required error without blocking the draft save (SectionForm saves regardless)", () => {
    const result = religiousCulturalSchemaPartial.safeParse({
      heritageSites: [{ name: "", type: undefined, significance: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a heritage site row once its required fields are filled in, with optional fields left blank", () => {
    const result = religiousCulturalSchemaPartial.safeParse({
      heritageSites: [{ name: "Galle Fort Temple", type: "temple-vihara", significance: "Ancient heritage site" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a heritage site marked used for a Dhamma school or government purpose with no task description", () => {
    const result = religiousCulturalSchemaPartial.safeParse({
      heritageSites: [
        {
          name: "Galle Fort Temple",
          type: "temple-vihara",
          significance: "Ancient heritage site",
          usedForDhammaOrGovtPurpose: "yes",
          taskDescription: "",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a heritage site not used for a Dhamma school or government purpose with no task description", () => {
    const result = religiousCulturalSchemaPartial.safeParse({
      heritageSites: [
        {
          name: "Galle Fort Temple",
          type: "temple-vihara",
          significance: "Ancient heritage site",
          usedForDhammaOrGovtPurpose: "no",
          taskDescription: "",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a heritage site used for a Dhamma school or government purpose once a task description is given", () => {
    const result = religiousCulturalSchemaPartial.safeParse({
      heritageSites: [
        {
          name: "Galle Fort Temple",
          type: "temple-vihara",
          significance: "Ancient heritage site",
          usedForDhammaOrGovtPurpose: "yes",
          taskDescription: "Hosts weekly Dhamma school classes for children",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an art academy row added via the UI still left blank", () => {
    const result = religiousCulturalSchemaPartial.safeParse({
      artAcademies: [{ name: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an art academy row once its required name is filled in", () => {
    const result = religiousCulturalSchemaPartial.safeParse({
      artAcademies: [{ name: "Ruhunu Art Academy" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a traditional artist row added via the UI still left blank", () => {
    const result = religiousCulturalSchemaPartial.safeParse({
      traditionalArtists: [{ name: "", artForm: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a traditional artist row once its required fields are filled in", () => {
    const result = religiousCulturalSchemaPartial.safeParse({
      traditionalArtists: [{ name: "K. Perera", artForm: "Low-country dancing" }],
    });
    expect(result.success).toBe(true);
  });
});
