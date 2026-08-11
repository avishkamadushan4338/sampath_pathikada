import { describe, it, expect } from "vitest";
import {
  housingSchemaStrict,
  housingSchemaPartial,
  COMMUNITY_WATER_AUTHORITIES,
} from "@/lib/validators/sections/housing";

const validPayload = {
  housingCounts: { total: 100, permanent: 80, semiPermanent: 15, nonPermanent: 5 },
  householdsWithoutHousing: 2,
  sanitation: { total: 100, withoutSafeSanitation: 3, needingAssistance: 3 },
  drinkingWaterSource: {
    well: 0,
    tubeWell: 0,
    spring: 0,
    pipedNational: 80,
    pipedLocalGovt: 0,
    pipedCommunity: 0,
    tankRiverCanalOther: 0,
    bottled: 0,
    treated: 0,
    bowser: 0,
    other: 0,
  },
  underservedAreas: [
    { area: "Hill area", difficultyDescription: "No road access", households: 5, proposal: "Build a road" },
  ],
  electricityAccess: { total: 100, withElectricity: 95, withSolar: 2, withoutElectricity: 3, needingAssistance: 3 },
  communityWaterProjects: [
    { name: "Village water scheme", functional: "yes" as const, householdsServed: 40, authority: "main-ministry" as const },
  ],
};

describe("housingSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = housingSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing a required field", () => {
    const { drinkingWaterSource, ...withoutDrinkingWaterSource } = validPayload;
    void drinkingWaterSource;
    const result = housingSchemaStrict.safeParse(withoutDrinkingWaterSource);
    expect(result.success).toBe(false);
  });

  it("defaults underservedAreas and communityWaterProjects to empty when omitted", () => {
    const { underservedAreas, communityWaterProjects, ...rest } = validPayload;
    void underservedAreas;
    void communityWaterProjects;
    const result = housingSchemaStrict.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.underservedAreas).toEqual([]);
      expect(result.data.communityWaterProjects).toEqual([]);
    }
  });

  it("rejects an underserved area row missing a required field", () => {
    const result = housingSchemaStrict.safeParse({
      ...validPayload,
      underservedAreas: [{ area: "Hill area" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a community water project row missing a required field", () => {
    const result = housingSchemaStrict.safeParse({
      ...validPayload,
      communityWaterProjects: [{ functional: "yes" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown community water authority enum value", () => {
    const result = housingSchemaStrict.safeParse({
      ...validPayload,
      communityWaterProjects: [{ name: "Scheme", functional: "yes", authority: "not-a-real-authority" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non yes/no value for functional", () => {
    const result = housingSchemaStrict.safeParse({
      ...validPayload,
      communityWaterProjects: [{ name: "Scheme", functional: "maybe" }],
    });
    expect(result.success).toBe(false);
  });

  it("coerces numeric string counts", () => {
    const result = housingSchemaStrict.safeParse({
      ...validPayload,
      housingCounts: { total: "100", permanent: "80", semiPermanent: "15", nonPermanent: "5" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.housingCounts.total).toBe(100);
    }
  });
});

describe("housingSchemaPartial", () => {
  it("accepts an empty object (fresh draft)", () => {
    const result = housingSchemaPartial.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts an untouched array (no rows added yet)", () => {
    const result = housingSchemaPartial.safeParse({ underservedAreas: [], communityWaterProjects: [] });
    expect(result.success).toBe(true);
  });

  it("rejects an underserved area row added via the UI still left blank — surfaces a required error without blocking the draft save (SectionForm saves regardless)", () => {
    const result = housingSchemaPartial.safeParse({
      underservedAreas: [{ area: "", difficultyDescription: "", households: undefined, proposal: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an underserved area row missing just the number of families or proposed remedy — every field in this row is required, not only area/difficulty", () => {
    const missingHouseholds = housingSchemaPartial.safeParse({
      underservedAreas: [{ area: "Hill area", difficultyDescription: "No road access", households: "", proposal: "Build a road" }],
    });
    expect(missingHouseholds.success).toBe(false);

    const missingProposal = housingSchemaPartial.safeParse({
      underservedAreas: [{ area: "Hill area", difficultyDescription: "No road access", households: 5, proposal: "" }],
    });
    expect(missingProposal.success).toBe(false);
  });

  it("accepts an underserved area row once all four fields are filled in, including an explicit zero households", () => {
    const result = housingSchemaPartial.safeParse({
      underservedAreas: [{ area: "Hill area", difficultyDescription: "No road access", households: 0, proposal: "Build a road" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a community water project row added via the UI still left blank", () => {
    const result = housingSchemaPartial.safeParse({
      communityWaterProjects: [{ name: "", functional: undefined, householdsServed: undefined, authority: undefined }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a community water project row missing just the number of families served or the ownership — every field in this row is required, not only name/functional", () => {
    const missingHouseholdsServed = housingSchemaPartial.safeParse({
      communityWaterProjects: [{ name: "Village water scheme", functional: "yes", householdsServed: "", authority: "main-ministry" }],
    });
    expect(missingHouseholdsServed.success).toBe(false);

    const missingAuthority = housingSchemaPartial.safeParse({
      communityWaterProjects: [{ name: "Village water scheme", functional: "yes", householdsServed: 40, authority: undefined }],
    });
    expect(missingAuthority.success).toBe(false);
  });

  it("accepts a community water project row once all four fields are filled in", () => {
    const result = housingSchemaPartial.safeParse({
      communityWaterProjects: [{ name: "Village water scheme", functional: "yes", householdsServed: 40, authority: "main-ministry" }],
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a genuinely invalid authority enum value", () => {
    const result = housingSchemaPartial.safeParse({
      communityWaterProjects: [{ name: "Scheme", functional: "yes", householdsServed: 10, authority: "not-a-real-authority" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts every known community water authority once required fields are filled in", () => {
    for (const authority of COMMUNITY_WATER_AUTHORITIES) {
      const result = housingSchemaPartial.safeParse({
        communityWaterProjects: [{ name: "Scheme", functional: "yes", householdsServed: 10, authority }],
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects housingCounts with blank counts — matches how the entry page seeds a fresh section (counts start as \"\" not 0)", () => {
    const result = housingSchemaPartial.safeParse({
      housingCounts: { total: "", permanent: "", semiPermanent: "", nonPermanent: "" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts housingCounts once filled in, including an explicit zero", () => {
    const result = housingSchemaPartial.safeParse({
      housingCounts: { total: 0, permanent: 0, semiPermanent: 0, nonPermanent: 0 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a blank householdsWithoutHousing", () => {
    const result = housingSchemaPartial.safeParse({ householdsWithoutHousing: "" });
    expect(result.success).toBe(false);
  });

  it("accepts householdsWithoutHousing once filled in with an explicit zero", () => {
    const result = housingSchemaPartial.safeParse({ householdsWithoutHousing: 0 });
    expect(result.success).toBe(true);
  });

  it("rejects sanitation with blank counts", () => {
    const result = housingSchemaPartial.safeParse({
      sanitation: { total: "", withoutSafeSanitation: "", needingAssistance: "" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts sanitation once filled in", () => {
    const result = housingSchemaPartial.safeParse({
      sanitation: { total: 100, withoutSafeSanitation: 3, needingAssistance: 3 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects drinkingWaterSource with even one blank count among the eleven", () => {
    const result = housingSchemaPartial.safeParse({
      drinkingWaterSource: {
        well: 0,
        tubeWell: 0,
        spring: 0,
        pipedNational: 0,
        pipedLocalGovt: 0,
        pipedCommunity: 0,
        tankRiverCanalOther: 0,
        bottled: 0,
        treated: 0,
        bowser: 0,
        other: "",
      },
    });
    expect(result.success).toBe(false);
  });

  it("accepts drinkingWaterSource once every source is filled in", () => {
    const result = housingSchemaPartial.safeParse({
      drinkingWaterSource: {
        well: 0,
        tubeWell: 0,
        spring: 0,
        pipedNational: 80,
        pipedLocalGovt: 0,
        pipedCommunity: 0,
        tankRiverCanalOther: 0,
        bottled: 0,
        treated: 0,
        bowser: 0,
        other: 0,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects electricityAccess with blank counts", () => {
    const result = housingSchemaPartial.safeParse({
      electricityAccess: { total: "", withElectricity: "", withSolar: "", withoutElectricity: "", needingAssistance: "" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts electricityAccess once filled in", () => {
    const result = housingSchemaPartial.safeParse({
      electricityAccess: { total: 100, withElectricity: 95, withSolar: 2, withoutElectricity: 3, needingAssistance: 3 },
    });
    expect(result.success).toBe(true);
  });

  it("treats null the same as a blank count", () => {
    const result = housingSchemaPartial.safeParse({ householdsWithoutHousing: null });
    expect(result.success).toBe(false);
  });
});
