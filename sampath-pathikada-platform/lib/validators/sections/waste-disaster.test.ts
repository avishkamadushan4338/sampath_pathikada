import { describe, it, expect } from "vitest";
import {
  wasteDisasterSchemaStrict,
  wasteDisasterSchemaPartial,
  COLLECTION_FREQUENCIES,
  COLLECTION_METHODS,
  DISPOSAL_METHODS,
} from "@/lib/validators/sections/waste-disaster";

const validPayload = {
  hasWasteProgram: "yes" as const,
  publicInformedOfSchedule: "yes" as const,
  collectionFrequency: "daily" as const,
  collectionMethod: "separated" as const,
  disposalMethodIfNoProgram: DISPOSAL_METHODS.map((method) => ({ method, present: "no" as const })),
  hasCompostOrDisposalSite: "no" as const,
  proposedSolutionIfNoProgram: "Build a compost site",
};

describe("wasteDisasterSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = wasteDisasterSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts a payload without the optional proposedSolutionIfNoProgram field", () => {
    const { proposedSolutionIfNoProgram, ...rest } = validPayload;
    void proposedSolutionIfNoProgram;
    const result = wasteDisasterSchemaStrict.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing a required field", () => {
    const { hasWasteProgram, ...rest } = validPayload;
    void hasWasteProgram;
    const result = wasteDisasterSchemaStrict.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects disposalMethodIfNoProgram with fewer rows than DISPOSAL_METHODS", () => {
    const result = wasteDisasterSchemaStrict.safeParse({
      ...validPayload,
      disposalMethodIfNoProgram: validPayload.disposalMethodIfNoProgram.slice(0, DISPOSAL_METHODS.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects disposalMethodIfNoProgram with more rows than DISPOSAL_METHODS", () => {
    const result = wasteDisasterSchemaStrict.safeParse({
      ...validPayload,
      disposalMethodIfNoProgram: [...validPayload.disposalMethodIfNoProgram, { method: DISPOSAL_METHODS[0], present: "no" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts disposalMethodIfNoProgram with exactly DISPOSAL_METHODS.length rows", () => {
    const result = wasteDisasterSchemaStrict.safeParse({
      ...validPayload,
      disposalMethodIfNoProgram: DISPOSAL_METHODS.map((method) => ({ method, present: "yes" as const })),
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid collectionFrequency enum value", () => {
    const result = wasteDisasterSchemaStrict.safeParse({
      ...validPayload,
      collectionFrequency: "not-a-real-frequency",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid collectionMethod enum value", () => {
    const result = wasteDisasterSchemaStrict.safeParse({
      ...validPayload,
      collectionMethod: "not-a-real-method",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid disposal method enum value in a row", () => {
    const result = wasteDisasterSchemaStrict.safeParse({
      ...validPayload,
      disposalMethodIfNoProgram: [
        { method: "not-a-real-method", present: "no" },
        ...validPayload.disposalMethodIfNoProgram.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid yes/no value", () => {
    const result = wasteDisasterSchemaStrict.safeParse({
      ...validPayload,
      hasWasteProgram: "maybe",
    });
    expect(result.success).toBe(false);
  });
});

const topLevelRequiredFields = {
  hasWasteProgram: "yes" as const,
  publicInformedOfSchedule: "yes" as const,
  collectionFrequency: "daily" as const,
  collectionMethod: "separated" as const,
  hasCompostOrDisposalSite: "no" as const,
};

describe("wasteDisasterSchemaPartial", () => {
  it("rejects a fully empty object {} — the top-level yes/no and enum fields are genuinely required on the paper form, so a blank draft surfaces required errors (this doesn't block saving: SectionForm saves regardless)", () => {
    const result = wasteDisasterSchemaPartial.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts an object with every top-level required field filled in and an untouched disposalMethodIfNoProgram array (no rows added yet)", () => {
    const result = wasteDisasterSchemaPartial.safeParse({
      ...topLevelRequiredFields,
      disposalMethodIfNoProgram: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a disposalMethodIfNoProgram row added via the UI still left blank — surfaces a required error without blocking the draft save (SectionForm saves regardless)", () => {
    const result = wasteDisasterSchemaPartial.safeParse({
      ...topLevelRequiredFields,
      disposalMethodIfNoProgram: [{ method: DISPOSAL_METHODS[0] }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a disposalMethodIfNoProgram array shorter than DISPOSAL_METHODS.length once each row's required fields are filled in", () => {
    // The partial array drops the `.length()` constraint so a draft can be
    // saved before every fixed row has been filled in.
    const result = wasteDisasterSchemaPartial.safeParse({
      ...topLevelRequiredFields,
      disposalMethodIfNoProgram: [{ method: DISPOSAL_METHODS[0], present: "no" }],
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a genuinely invalid enum value", () => {
    const result = wasteDisasterSchemaPartial.safeParse({
      ...topLevelRequiredFields,
      collectionFrequency: "not-a-real-frequency",
    });
    expect(result.success).toBe(false);
  });
});
