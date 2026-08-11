import { describe, it, expect } from "vitest";
import {
  economicAgricultureSchemaStrict,
  economicAgricultureSchemaPartial,
  LAND_USE_TYPES,
  FLORAL_CULTIVATION_TYPES,
  AGRI_MACHINERY_TYPES,
  CROP_DAMAGE_TYPES,
} from "@/lib/validators/sections/economic-agriculture";

const validPayload = {
  landUse: LAND_USE_TYPES.map((landType) => ({ landType, extentHectares: 1 })),
  animalHusbandryCounts: FLORAL_CULTIVATION_TYPES.map((type) => ({ type, count: 1 })),
  animalHusbandryDirectory: [],
  specialEconomicActivities: [],
  abandonedPaddyLand: { extentAcres: 0, canBeReactivatedExtent: 0 },
  agriMachinery: AGRI_MACHINERY_TYPES.map((type) => ({ type, count: 1 })),
  forestDamage: CROP_DAMAGE_TYPES.map((type) => ({ type, present: "no" as const })),
  livestockFarms: [],
  industryCounts: { householdIndustry: 0, under5Employees: 0, over5Employees: 0 },
  industries: [],
  marineFisheries: { householdCount: 0, fishingPopulation: 0, activeFishermenCount: 0, societyCount: 0 },
  marineFisheriesSocieties: [],
  inlandFisheries: { householdCount: 0, fishingPopulation: 0, activeFishermenCount: 0, societyCount: 0 },
  inlandFisheriesSocieties: [],
  inlandWaterBodies: [],
  aquacultureDirectory: [],
  ornamentalFishDirectory: [],
  fishLandingSitePresent: "no" as const,
  fishLandingSites: [],
  iceProductionPresent: "no" as const,
  iceProductionDirectory: [],
  teaEstates: [],
};

describe("economicAgricultureSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = economicAgricultureSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects landUse with fewer rows than LAND_USE_TYPES", () => {
    const result = economicAgricultureSchemaStrict.safeParse({
      ...validPayload,
      landUse: validPayload.landUse.slice(0, LAND_USE_TYPES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects agriMachinery with fewer rows than AGRI_MACHINERY_TYPES", () => {
    const result = economicAgricultureSchemaStrict.safeParse({
      ...validPayload,
      agriMachinery: validPayload.agriMachinery.slice(0, AGRI_MACHINERY_TYPES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects forestDamage with fewer rows than CROP_DAMAGE_TYPES", () => {
    const result = economicAgricultureSchemaStrict.safeParse({
      ...validPayload,
      forestDamage: validPayload.forestDamage.slice(0, CROP_DAMAGE_TYPES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects animalHusbandryCounts with fewer rows than FLORAL_CULTIVATION_TYPES", () => {
    const result = economicAgricultureSchemaStrict.safeParse({
      ...validPayload,
      animalHusbandryCounts: validPayload.animalHusbandryCounts.slice(0, FLORAL_CULTIVATION_TYPES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown landType enum value", () => {
    const result = economicAgricultureSchemaStrict.safeParse({
      ...validPayload,
      landUse: [{ landType: "not-a-real-type", extentHectares: 1 }, ...validPayload.landUse.slice(1)],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a livestock farm row missing a required field", () => {
    const result = economicAgricultureSchemaStrict.safeParse({
      ...validPayload,
      livestockFarms: [{ address: "Somewhere" }],
    });
    expect(result.success).toBe(false);
  });

  it("requires fishLandingSitePresent and iceProductionPresent to be present", () => {
    const { fishLandingSitePresent, ...rest } = validPayload;
    void fishLandingSitePresent;
    const result = economicAgricultureSchemaStrict.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("coerces numeric string counts", () => {
    const result = economicAgricultureSchemaStrict.safeParse({
      ...validPayload,
      industryCounts: { householdIndustry: "3", under5Employees: "0", over5Employees: "0" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.industryCounts.householdIndustry).toBe(3);
    }
  });
});

// fishLandingSitePresent / iceProductionPresent are bare top-level `yesNo` fields in the strict
// schema (no `.optional()`), and the UI's <Select> for each always carries a real "yes"/"no"
// value (see buildEmptyValues in the entry page) — so the partial schema requires them too. Every
// other assertion below layers additional fields on top of this base so failures are attributable
// to the field actually under test, not to these two being absent.
const BASE_PARTIAL = { fishLandingSitePresent: "no" as const, iceProductionPresent: "no" as const };

describe("economicAgricultureSchemaPartial", () => {
  it("rejects a completely empty object — fishLandingSitePresent/iceProductionPresent are required scalars even in a fresh draft", () => {
    const result = economicAgricultureSchemaPartial.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts a fresh draft with only the required top-level yes/no fields set and every other section untouched", () => {
    const result = economicAgricultureSchemaPartial.safeParse(BASE_PARTIAL);
    expect(result.success).toBe(true);
  });

  it("accepts untouched directories (no rows added yet)", () => {
    const result = economicAgricultureSchemaPartial.safeParse({ ...BASE_PARTIAL, livestockFarms: [], industries: [] });
    expect(result.success).toBe(true);
  });

  it("rejects a livestock farm row added via the UI still left blank — surfaces a required error without blocking the draft save (SectionForm saves regardless)", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      livestockFarms: [{ name: "", address: "", phone: "", cattle: undefined }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a livestock farm row once its required fields are filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      livestockFarms: [{ name: "Green Farm", address: "Matara Road" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a landUse row with only the required landType filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      landUse: [{ landType: "forest" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a landUse row missing the required landType", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      landUse: [{ extentHectares: 5 }],
    });
    expect(result.success).toBe(false);
  });

  it("still rejects a genuinely invalid landType enum value", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      landUse: [{ landType: "not-a-real-type" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an animalHusbandryCounts row with only the required type filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      animalHusbandryCounts: [{ type: "beekeeping" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an animalHusbandryCounts row missing the required type", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      animalHusbandryCounts: [{ count: 3 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an animal husbandry directory row added via the UI still left blank", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      animalHusbandryDirectory: [{ name: "", address: "", type: undefined }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an animal husbandry directory row once its required fields are filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      animalHusbandryDirectory: [{ name: "K. Perera", address: "Galle Road", type: "beekeeping" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a special economic activity row left blank", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      specialEconomicActivities: [{ activity: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a special economic activity row once activity is filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      specialEconomicActivities: [{ activity: "Pottery" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an agri machinery row missing the required type", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      agriMachinery: [{ count: 2 }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an agri machinery row once type is filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      agriMachinery: [{ type: "water-pump" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a forest damage row missing the required present value", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      forestDamage: [{ type: "drought" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a forest damage row once type and present are filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      forestDamage: [{ type: "drought", present: "yes" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an industry row left blank", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      industries: [{ name: "", productionType: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an industry row once its required fields are filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      industries: [{ name: "Lanka Weaving", productionType: "Textiles" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a fisheries society row left blank", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      marineFisheriesSocieties: [{ name: "", address: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a fisheries society row once its required fields are filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      inlandFisheriesSocieties: [{ name: "Lake Society", address: "Lakeside Road" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an inland water body row left blank", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      inlandWaterBodies: [{ name: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an inland water body row once its required fields are filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      inlandWaterBodies: [{ name: "Big Tank", type: "perennial" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a name/address/phone directory row left blank", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      aquacultureDirectory: [{ name: "", address: "", phone: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a name/address/phone directory row once its required fields are filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      ornamentalFishDirectory: [{ name: "Blue Aquaria", address: "Coast Road" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a fish landing site row left blank", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      fishLandingSites: [{ name: "", address: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a fish landing site row once its required fields are filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      fishLandingSites: [{ name: "Main Harbor", address: "Port Road", siteType: "harbor", waterType: "marine" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an ice production directory row left blank", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      iceProductionDirectory: [{ name: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an ice production directory row once its required fields are filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      iceProductionDirectory: [{ name: "Ice Factory", address: "Cold Street" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a tea estate row left blank", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      teaEstates: [{ name: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a tea estate row once its required fields are filled in", () => {
    const result = economicAgricultureSchemaPartial.safeParse({
      ...BASE_PARTIAL,
      teaEstates: [{ name: "Hill Estate", ownership: "govt" }],
    });
    expect(result.success).toBe(true);
  });
});
