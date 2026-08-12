import { describe, it, expect } from "vitest";
import {
  physicalEnvironmentSchemaStrict,
  physicalEnvironmentSchemaPartial,
  HAZARD_TYPES,
  WATER_SOURCE_TYPES,
} from "@/lib/validators/sections/physical-environment";

const validPayload = {
  waterSources: WATER_SOURCE_TYPES.map((type) => ({ type, name: "Kirindi Oya" })),
  sensitiveZones: [
    { zoneName: "Coastal buffer zone", significance: "Erosion control", managingAuthority: "Coast Conservation Dept" },
  ],
  naturalResources: [{ resource: "Sand", utilizedForProduction: "no" as const }],
  hazards: HAZARD_TYPES.map((type) => ({ type, occurred: "no" as const })),
  safeLocationsIdentified: "yes" as const,
  safeLocations: [{ name: "Central College", address: "Main Street, Galle" }],
  touristSites: [
    { siteName: "Galle Fort", reasonForAttraction: "Historic fort", maintainedBy: "Dept of Archaeology" },
  ],
  proposedTouristSites: [{ siteName: "Lighthouse Point", specialFeatures: "Scenic coastal view" }],
};

describe("physicalEnvironmentSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing a required field", () => {
    const { safeLocationsIdentified, ...rest } = validPayload;
    void safeLocationsIdentified;
    const result = physicalEnvironmentSchemaStrict.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects waterSources with fewer rows than WATER_SOURCE_TYPES", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({
      ...validPayload,
      waterSources: validPayload.waterSources.slice(0, WATER_SOURCE_TYPES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts more than one row for the same water source category (e.g. two rivers)", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({
      ...validPayload,
      waterSources: [...validPayload.waterSources, { type: "river", name: "Second river" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects hazards with fewer rows than HAZARD_TYPES", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({
      ...validPayload,
      hazards: validPayload.hazards.slice(0, HAZARD_TYPES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts more than one row for the same hazard category (e.g. two separate flood incidents)", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({
      ...validPayload,
      hazards: [
        ...validPayload.hazards,
        { type: "flood", occurred: "yes" as const, frequency: "Monsoon season", mitigationProposal: "Build a drainage channel" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts the correct full-length waterSources and hazards arrays", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({
      ...validPayload,
      waterSources: WATER_SOURCE_TYPES.map((type) => ({ type })),
      hazards: HAZARD_TYPES.map((type) => ({ type, occurred: "yes" as const, frequency: "Annually", mitigationProposal: "Build a drainage channel" })),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a hazard marked as occurred without its time period and remedial measures", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({
      ...validPayload,
      hazards: [{ type: "flood", occurred: "yes" }, ...validPayload.hazards.slice(1)],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a hazard marked as occurred once its time period and remedial measures are filled in", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({
      ...validPayload,
      hazards: [
        { type: "flood", occurred: "yes", frequency: "Annually", mitigationProposal: "Build a drainage channel" },
        ...validPayload.hazards.slice(1),
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects safeLocationsIdentified=yes with no safe locations listed", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({ ...validPayload, safeLocations: [] });
    expect(result.success).toBe(false);
  });

  it("accepts safeLocationsIdentified=no with no safe locations listed", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({
      ...validPayload,
      safeLocationsIdentified: "no",
      safeLocations: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown waterSource type enum value", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({
      ...validPayload,
      waterSources: [{ type: "not-a-real-type" }, ...validPayload.waterSources.slice(1)],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown hazard type enum value", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({
      ...validPayload,
      hazards: [{ type: "not-a-real-hazard", occurred: "no" }, ...validPayload.hazards.slice(1)],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a sensitive zone row missing a required field", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({
      ...validPayload,
      sensitiveZones: [{ zoneName: "Coastal buffer zone" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a safe location row missing a required field", () => {
    const result = physicalEnvironmentSchemaStrict.safeParse({
      ...validPayload,
      safeLocations: [{ name: "Central College" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("physicalEnvironmentSchemaPartial", () => {
  it("accepts an empty object (fresh draft)", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts untouched directories (no rows added yet)", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({ sensitiveZones: [], safeLocations: [] });
    expect(result.success).toBe(true);
  });

  it("rejects a sensitive zone row added via the UI still left blank — surfaces a required error without blocking the draft save (SectionForm saves regardless)", () => {
    // Rows added by the "Add" button start with empty strings, not undefined.
    const result = physicalEnvironmentSchemaPartial.safeParse({
      sensitiveZones: [{ zoneName: "", significance: "", managingAuthority: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a sensitive zone row once its required fields are filled in", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      sensitiveZones: [
        { zoneName: "Coastal buffer zone", significance: "Erosion control", managingAuthority: "Coast Conservation Dept" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a safe location row with only some required fields filled in", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      safeLocations: [{ name: "Central College" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a safe location row once its required fields are filled in", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      safeLocations: [{ name: "Central College", address: "Main Street, Galle" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a natural resource row added via the UI still left blank", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      naturalResources: [{ resource: "", utilizedForProduction: undefined, notes: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a natural resource row once its required fields are filled in, with the optional notes left blank", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      naturalResources: [{ resource: "Sand", utilizedForProduction: "no" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a hazard row missing its required occurred field", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      hazards: [{ type: "flood", occurred: undefined }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a hazard row once occurred is filled in, with the optional frequency/mitigation left blank", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      hazards: [{ type: "flood", occurred: "no" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a hazard marked as occurred=yes without its time period and remedial measures", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      hazards: [{ type: "flood", occurred: "yes" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a hazard marked as occurred=yes once its time period and remedial measures are filled in", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      hazards: [{ type: "flood", occurred: "yes", frequency: "Annually", mitigationProposal: "Build a drainage channel" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects safeLocationsIdentified=yes with no safe locations listed", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({ safeLocationsIdentified: "yes", safeLocations: [] });
    expect(result.success).toBe(false);
  });

  it("rejects safeLocationsIdentified=yes with the safeLocations directory left untouched (key omitted entirely)", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({ safeLocationsIdentified: "yes" });
    expect(result.success).toBe(false);
  });

  it("accepts safeLocationsIdentified=yes once at least one safe location is listed", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      safeLocationsIdentified: "yes",
      safeLocations: [{ name: "Central College", address: "Main Street, Galle" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts safeLocationsIdentified=no with no safe locations listed", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({ safeLocationsIdentified: "no", safeLocations: [] });
    expect(result.success).toBe(true);
  });

  it("rejects a tourist site row added via the UI still left blank", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      touristSites: [{ siteName: "", reasonForAttraction: "", maintainedBy: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a tourist site row once its required fields are filled in, with the optional frequency left blank", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      touristSites: [{ siteName: "Galle Fort", reasonForAttraction: "Historic fort", maintainedBy: "Dept of Archaeology" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a proposed tourist site row added via the UI still left blank", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      proposedTouristSites: [{ siteName: "", specialFeatures: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a proposed tourist site row once its required fields are filled in", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      proposedTouristSites: [{ siteName: "Lighthouse Point", specialFeatures: "Scenic coastal view" }],
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a genuinely invalid enum value", () => {
    const result = physicalEnvironmentSchemaPartial.safeParse({
      waterSources: [{ type: "not-a-real-type" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts every known water source type with the optional name left blank", () => {
    for (const type of WATER_SOURCE_TYPES) {
      const result = physicalEnvironmentSchemaPartial.safeParse({ waterSources: [{ type }] });
      expect(result.success).toBe(true);
    }
  });
});
