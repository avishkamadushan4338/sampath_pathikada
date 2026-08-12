import { describe, it, expect } from "vitest";
import {
  roadInfrastructureSchemaStrict,
  roadInfrastructureSchemaPartial,
  SERVICE_CATEGORIES,
  PUBLIC_FACILITY_CATEGORIES,
  POST_OFFICE_TYPES,
  FINANCIAL_INSTITUTION_TYPES,
  TRANSPORT_FACILITY_TYPES,
} from "@/lib/validators/sections/road-infrastructure";

const validPayload = {
  publicFacilities: [
    { type: "busStand" as const, present: "yes" as const, name: "Galle Main Bus Stand" },
    { type: "railwayStation" as const, present: "no" as const },
    { type: "port" as const, present: "no" as const },
    { type: "airport" as const, present: "no" as const },
  ],
  roadDevelopmentNeeds: [{ roadName: "Temple Road", lengthMeters: 500 }],
  bridgeRepairs: [{ name: "Old Bridge", location: "Near town center" }],
  newRoadBridgeNeeds: [{ location: "River crossing", justification: "No safe crossing point" }],
  noPublicTransportAreas: [{ roadName: "Hill Road" }],
  railwayCrossingGaps: [{ location: "Km post 4" }],
  postOffices: [{ name: "Galle Post Office", type: "head-post-office" as const }],
  fuelDistributionStations: [{ name: "Ceypetco Station" }],
  solarPowerPlants: [{ name: "Village Solar Plant", scale: "mini" as const }],
  windPowerPlants: [],
  hydropowerPlants: [],
  financialInstitutions: [{ name: "Bank of Ceylon", type: "govt-bank" as const }],
  serviceEstablishments: SERVICE_CATEGORIES.map((category) => ({ category, count: 0 })),
  industrialEstates: [{ name: "Koggala Industrial Estate", location: "Koggala" }],
  waterReservoirs: [{ name: "Village Tank" }],
  publicFacilityCategories: PUBLIC_FACILITY_CATEGORIES.map((category) => ({
    category,
    present: "no" as const,
    count: 0,
    distanceToNearestIfOutsideDivision: "2 km",
  })),
  licensedLiquorShopsPresent: "no" as const,
  licensedLiquorShops: [],
};

describe("roadInfrastructureSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = roadInfrastructureSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing publicFacilities", () => {
    const { publicFacilities, ...rest } = validPayload;
    void publicFacilities;
    const result = roadInfrastructureSchemaStrict.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects publicFacilities with fewer rows than TRANSPORT_FACILITY_TYPES", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      publicFacilities: validPayload.publicFacilities.slice(0, TRANSPORT_FACILITY_TYPES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts more than one row for the same transport facility type (e.g. two bus stands)", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      publicFacilities: [...validPayload.publicFacilities, { type: "busStand" as const, present: "yes" as const, name: "Second Bus Stand" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing licensedLiquorShopsPresent", () => {
    const { licensedLiquorShopsPresent, ...rest } = validPayload;
    void licensedLiquorShopsPresent;
    const result = roadInfrastructureSchemaStrict.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects serviceEstablishments with fewer rows than SERVICE_CATEGORIES", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      serviceEstablishments: validPayload.serviceEstablishments.slice(0, SERVICE_CATEGORIES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts the correct full-length serviceEstablishments array", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      serviceEstablishments: SERVICE_CATEGORIES.map((category) => ({ category, count: 3 })),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a publicFacilityCategories row marked present with no count", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      publicFacilityCategories: [
        { category: PUBLIC_FACILITY_CATEGORIES[0], present: "yes" as const, count: 0 },
        ...validPayload.publicFacilityCategories.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a publicFacilityCategories row marked not present with no distance to nearest", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      publicFacilityCategories: [
        { category: PUBLIC_FACILITY_CATEGORIES[0], present: "no" as const, count: 0, distanceToNearestIfOutsideDivision: "" },
        ...validPayload.publicFacilityCategories.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a publicFacilityCategories row marked present with a count greater than 0", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      publicFacilityCategories: [
        { category: PUBLIC_FACILITY_CATEGORIES[0], present: "yes" as const, count: 2 },
        ...validPayload.publicFacilityCategories.slice(1),
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects publicFacilityCategories with fewer rows than PUBLIC_FACILITY_CATEGORIES", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      publicFacilityCategories: validPayload.publicFacilityCategories.slice(
        0,
        PUBLIC_FACILITY_CATEGORIES.length - 1
      ),
    });
    expect(result.success).toBe(false);
  });

  it("accepts the correct full-length publicFacilityCategories array", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      publicFacilityCategories: PUBLIC_FACILITY_CATEGORIES.map((category) => ({
        category,
        present: "yes" as const,
        count: 1,
      })),
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown serviceEstablishments category enum value", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      serviceEstablishments: [
        { category: "not-a-real-category", count: 1 },
        ...validPayload.serviceEstablishments.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown postOffice type enum value", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      postOffices: [{ name: "Galle Post Office", type: "not-a-real-type" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown financialInstitution type enum value", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      financialInstitutions: [{ name: "Bank of Ceylon", type: "not-a-real-type" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts every declared post office type and financial institution type", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      postOffices: POST_OFFICE_TYPES.map((type) => ({ name: `Post Office (${type})`, type })),
      financialInstitutions: FINANCIAL_INSTITUTION_TYPES.map((type) => ({ name: `Bank (${type})`, type })),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a bridge repair row missing a required field", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      bridgeRepairs: [{ name: "Old Bridge" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an industrial estate row missing a required field", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      industrialEstates: [{ name: "Koggala Industrial Estate" }],
    });
    expect(result.success).toBe(false);
  });

  it("coerces numeric string lengths and distances", () => {
    const result = roadInfrastructureSchemaStrict.safeParse({
      ...validPayload,
      roadDevelopmentNeeds: [{ roadName: "Temple Road", lengthMeters: "500" }],
      noPublicTransportAreas: [{ roadName: "Hill Road", distanceKm: "3.5", requiredBeneficiaryCount: "40" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.roadDevelopmentNeeds[0].lengthMeters).toBe(500);
      expect(result.data.noPublicTransportAreas[0].distanceKm).toBe(3.5);
      expect(result.data.noPublicTransportAreas[0].requiredBeneficiaryCount).toBe(40);
    }
  });
});

describe("roadInfrastructureSchemaPartial", () => {
  it("rejects an empty object because licensedLiquorShopsPresent is a required top-level field — but SectionForm saves the draft regardless of this validation outcome", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts a fresh draft with only the required top-level licensedLiquorShopsPresent set and every table left untouched", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({ licensedLiquorShopsPresent: "no" });
    expect(result.success).toBe(true);
  });

  it("accepts an untouched table (no rows added yet)", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      bridgeRepairs: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a bridge repair row added via the UI still left blank", () => {
    // Add-button rows start with empty strings; this now surfaces a required error without
    // blocking the draft save (SectionForm saves regardless of validation outcome).
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      bridgeRepairs: [{ name: "", location: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a bridge repair row once its required fields are filled in", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      bridgeRepairs: [{ name: "Old Bridge", location: "Near town center" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a road development need row still left blank", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      roadDevelopmentNeeds: [{ roadName: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a road development need row once roadName is filled in, with optional fields left blank", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      roadDevelopmentNeeds: [{ roadName: "Temple Road" }],
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a genuinely invalid enum value", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      postOffices: [{ name: "Galle Post Office", type: "not-a-real-type" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an industrial estate row added via the UI with blank string fields", () => {
    // Previously a suspected bug left this row schema relaxed (only .partial()), so blank
    // rows silently passed. It now reuses the strict row schema, so blank required fields are
    // correctly rejected — surfacing an error without blocking the save.
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      industrialEstates: [{ name: "", location: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an industrial estate row once its required fields are filled in", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      industrialEstates: [{ name: "Koggala Industrial Estate", location: "Koggala" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a water reservoir row added via the UI with a blank string field", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      waterReservoirs: [{ name: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a water reservoir row once its name is filled in", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      waterReservoirs: [{ name: "Village Tank" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a solar/wind/hydropower plant row still left blank now that they follow the same pattern as every other table", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      solarPowerPlants: [{ name: "" }],
      windPowerPlants: [{ name: "" }],
      hydropowerPlants: [{ name: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts solar/wind/hydropower plant rows once their required fields are filled in", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      solarPowerPlants: [{ name: "Village Solar Plant", scale: "mini" }],
      windPowerPlants: [{ name: "Coastal Wind Farm", scale: "major" }],
      hydropowerPlants: [{ name: "Hill Hydro Plant", scale: "mini" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a publicFacilities row when present is left unset but the row is touched", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      publicFacilities: [{ type: "busStand", name: "Galle Main Bus Stand" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a publicFacilities row once present is filled in, leaving other facility types untouched", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      publicFacilities: [{ type: "busStand", present: "yes", name: "Galle Main Bus Stand" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a publicFacilities busStand row with present = yes and no location name", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      publicFacilities: [{ type: "busStand", present: "yes", name: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a publicFacilities busStand row with present = no and no location name — name is only required once present", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      publicFacilities: [{ type: "busStand", present: "no", name: "" }],
    });
    expect(result.success).toBe(true);
  });

  it.each(["railwayStation", "port", "airport"] as const)("rejects a publicFacilities %s row with present = yes and no location name", (type) => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      publicFacilities: [{ type, present: "yes", name: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a second bus stand row even when the first (anchor) row's name is blank", () => {
    // Mirrors the UI: clicking "+" on the anchor row inserts an extra row right after it for the
    // same facility type — the officer may fill the branch name into that extra row instead of
    // the anchor, so the rule only needs *some* row of the type to carry a name.
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "no",
      publicFacilities: [
        { type: "busStand", present: "yes", name: "" },
        { type: "busStand", present: "yes", name: "Second Bus Stand" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a licensed liquor shop row still left blank", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "yes",
      licensedLiquorShops: [{ name: "", address: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a licensed liquor shop row once its required fields are filled in", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "yes",
      licensedLiquorShops: [{ name: "The Old Tavern", address: "Main Street" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects licensedLiquorShopsPresent = yes with an empty licensedLiquorShops directory", () => {
    const result = roadInfrastructureSchemaPartial.safeParse({
      licensedLiquorShopsPresent: "yes",
      licensedLiquorShops: [],
    });
    expect(result.success).toBe(false);
  });
});
