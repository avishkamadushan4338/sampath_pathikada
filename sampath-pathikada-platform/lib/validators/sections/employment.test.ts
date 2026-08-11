import { describe, it, expect } from "vitest";
import {
  employmentSchemaStrict,
  employmentSchemaPartial,
  SELF_EMPLOYMENT_SECTORS,
  MARKETPLACES,
  JOB_SEEKER_EDUCATION_LEVELS,
} from "@/lib/validators/sections/employment";

const validPayload = {
  jobSeekersByEducation: JOB_SEEKER_EDUCATION_LEVELS.map((level) => ({ level, count: 1 })),
  vocationalTrainingOpportunityGapCount: 5,
  selfEmploymentSectors: SELF_EMPLOYMENT_SECTORS.map((sector) => ({ sector, count: 1 })),
  selfEmployedPersons: [{ name: "K. Silva", phone: "0771234567", sector: "Carpentry", marketplace: "local" as const }],
};

describe("employmentSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = employmentSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing a required field", () => {
    const { selfEmploymentSectors, ...withoutSelfEmploymentSectors } = validPayload;
    void selfEmploymentSectors;
    const result = employmentSchemaStrict.safeParse(withoutSelfEmploymentSectors);
    expect(result.success).toBe(false);
  });

  it("rejects jobSeekersByEducation with fewer rows than JOB_SEEKER_EDUCATION_LEVELS", () => {
    const result = employmentSchemaStrict.safeParse({
      ...validPayload,
      jobSeekersByEducation: validPayload.jobSeekersByEducation.slice(0, JOB_SEEKER_EDUCATION_LEVELS.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects selfEmploymentSectors with fewer rows than SELF_EMPLOYMENT_SECTORS", () => {
    const result = employmentSchemaStrict.safeParse({
      ...validPayload,
      selfEmploymentSectors: validPayload.selfEmploymentSectors.slice(0, SELF_EMPLOYMENT_SECTORS.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts the correct full-length arrays", () => {
    const result = employmentSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobSeekersByEducation).toHaveLength(JOB_SEEKER_EDUCATION_LEVELS.length);
      expect(result.data.selfEmploymentSectors).toHaveLength(SELF_EMPLOYMENT_SECTORS.length);
    }
  });

  it("rejects an unknown job seeker education level enum value", () => {
    const result = employmentSchemaStrict.safeParse({
      ...validPayload,
      jobSeekersByEducation: [
        { level: "not-a-real-level", count: 1 },
        ...validPayload.jobSeekersByEducation.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown self-employment sector enum value", () => {
    const result = employmentSchemaStrict.safeParse({
      ...validPayload,
      selfEmploymentSectors: [
        { sector: "not-a-real-sector", count: 1 },
        ...validPayload.selfEmploymentSectors.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a self-employed person row missing a required field", () => {
    const result = employmentSchemaStrict.safeParse({
      ...validPayload,
      selfEmployedPersons: [{ phone: "0771234567" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown marketplace enum value", () => {
    const result = employmentSchemaStrict.safeParse({
      ...validPayload,
      selfEmployedPersons: [{ name: "K. Silva", sector: "Carpentry", marketplace: "not-a-real-marketplace" }],
    });
    expect(result.success).toBe(false);
  });

  it("coerces numeric string counts", () => {
    const result = employmentSchemaStrict.safeParse({
      ...validPayload,
      vocationalTrainingOpportunityGapCount: "12",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.vocationalTrainingOpportunityGapCount).toBe(12);
    }
  });
});

describe("employmentSchemaPartial", () => {
  it("accepts an empty object (fresh draft)", () => {
    const result = employmentSchemaPartial.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts an untouched array (no rows added yet)", () => {
    const result = employmentSchemaPartial.safeParse({ selfEmployedPersons: [] });
    expect(result.success).toBe(true);
  });

  it("rejects a self-employed person row added via the UI still left blank — surfaces a required error without blocking the draft save (SectionForm saves regardless)", () => {
    const result = employmentSchemaPartial.safeParse({
      selfEmployedPersons: [{ name: "", phone: "", sector: "", marketplace: undefined }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a self-employed person row missing just the phone or marketplace — every field in this row is required, not only name/sector", () => {
    const missingPhone = employmentSchemaPartial.safeParse({
      selfEmployedPersons: [{ name: "K. Silva", sector: "Carpentry", phone: "", marketplace: "local" }],
    });
    expect(missingPhone.success).toBe(false);

    const missingMarketplace = employmentSchemaPartial.safeParse({
      selfEmployedPersons: [{ name: "K. Silva", sector: "Carpentry", phone: "0771234567", marketplace: undefined }],
    });
    expect(missingMarketplace.success).toBe(false);
  });

  it("accepts a self-employed person row once all four fields are filled in", () => {
    const result = employmentSchemaPartial.safeParse({
      selfEmployedPersons: [{ name: "K. Silva", sector: "Carpentry", phone: "0771234567", marketplace: "local" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a jobSeekersByEducation row missing the required level or a blank count", () => {
    const missingLevel = employmentSchemaPartial.safeParse({
      jobSeekersByEducation: [{ count: 5 }],
    });
    expect(missingLevel.success).toBe(false);

    const blankCount = employmentSchemaPartial.safeParse({
      jobSeekersByEducation: [{ level: "ol-pass", count: "" }],
    });
    expect(blankCount.success).toBe(false);
  });

  it("accepts a jobSeekersByEducation row once level and count are both filled in, including an explicit zero", () => {
    const result = employmentSchemaPartial.safeParse({
      jobSeekersByEducation: [{ level: "ol-pass", count: 0 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a selfEmploymentSectors row missing the required sector or a blank count", () => {
    const missingSector = employmentSchemaPartial.safeParse({
      selfEmploymentSectors: [{ count: 5 }],
    });
    expect(missingSector.success).toBe(false);

    const blankCount = employmentSchemaPartial.safeParse({
      selfEmploymentSectors: [{ sector: "carpentry", count: "" }],
    });
    expect(blankCount.success).toBe(false);
  });

  it("accepts a selfEmploymentSectors row once sector and count are both filled in", () => {
    const result = employmentSchemaPartial.safeParse({
      selfEmploymentSectors: [{ sector: "carpentry", count: 0 }],
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a genuinely invalid enum value", () => {
    const result = employmentSchemaPartial.safeParse({
      selfEmploymentSectors: [{ sector: "not-a-real-sector", count: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts every known marketplace value once required fields are filled in", () => {
    for (const marketplace of MARKETPLACES) {
      const result = employmentSchemaPartial.safeParse({
        selfEmployedPersons: [{ name: "K. Silva", sector: "Carpentry", phone: "0771234567", marketplace }],
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects a blank vocationalTrainingOpportunityGapCount", () => {
    const result = employmentSchemaPartial.safeParse({ vocationalTrainingOpportunityGapCount: "" });
    expect(result.success).toBe(false);
  });

  it("accepts vocationalTrainingOpportunityGapCount once filled in with an explicit zero", () => {
    const result = employmentSchemaPartial.safeParse({ vocationalTrainingOpportunityGapCount: 0 });
    expect(result.success).toBe(true);
  });
});
