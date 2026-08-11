import { describe, it, expect } from "vitest";
import {
  communityOrganizationsSchemaStrict,
  communityOrganizationsSchemaPartial,
  ORGANIZATION_TYPES,
} from "@/lib/validators/sections/community-organizations";

const validPayload = {
  organizationCounts: ORGANIZATION_TYPES.map((type) => ({ type, count: 1 })),
  villageDevelopmentSocieties: [{ name: "Village Development Society", address: "Main Street, Galle" }],
  youthSocieties: [],
  sportsClubs: [{ nameAndAddress: "Galle Sports Club, Main Street", memberCount: 25 }],
  funeralAidSocieties: [],
  womensSocieties: [],
  eldersSocieties: [],
  childrensSocieties: [],
  samurdhiSocieties: [],
  friendOrganizations: [],
  ngoCommittees: [],
  farmerSocieties: [],
  religiousSocieties: [],
  sanasaSocieties: [],
  civilDefenseCommittees: [],
  prajashakthiSocieties: [],
  cooperativeSocieties: [{ name: "SANASA Cooperative Society" }],
};

describe("communityOrganizationsSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = communityOrganizationsSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing organizationCounts", () => {
    const { organizationCounts, ...rest } = validPayload;
    void organizationCounts;
    const result = communityOrganizationsSchemaStrict.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects organizationCounts with fewer rows than ORGANIZATION_TYPES", () => {
    const result = communityOrganizationsSchemaStrict.safeParse({
      ...validPayload,
      organizationCounts: validPayload.organizationCounts.slice(0, ORGANIZATION_TYPES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts the correct full-length organizationCounts array", () => {
    const result = communityOrganizationsSchemaStrict.safeParse({
      ...validPayload,
      organizationCounts: ORGANIZATION_TYPES.map((type) => ({ type, count: 0 })),
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown organization type enum value", () => {
    const result = communityOrganizationsSchemaStrict.safeParse({
      ...validPayload,
      organizationCounts: [{ type: "not-a-real-type", count: 1 }, ...validPayload.organizationCounts.slice(1)],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a village development society row missing a required field", () => {
    const result = communityOrganizationsSchemaStrict.safeParse({
      ...validPayload,
      villageDevelopmentSocieties: [{ name: "Village Development Society" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a sports club row missing a required field", () => {
    const result = communityOrganizationsSchemaStrict.safeParse({
      ...validPayload,
      sportsClubs: [{ memberCount: 25 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a cooperative society row missing a required field", () => {
    const result = communityOrganizationsSchemaStrict.safeParse({
      ...validPayload,
      cooperativeSocieties: [{}],
    });
    expect(result.success).toBe(false);
  });

  it("coerces numeric string counts", () => {
    const result = communityOrganizationsSchemaStrict.safeParse({
      ...validPayload,
      sportsClubs: [{ nameAndAddress: "Galle Sports Club", memberCount: "25" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sportsClubs[0].memberCount).toBe(25);
    }
  });
});

describe("communityOrganizationsSchemaPartial", () => {
  it("accepts an empty object (fresh draft)", () => {
    const result = communityOrganizationsSchemaPartial.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts untouched directories (no rows added yet)", () => {
    const result = communityOrganizationsSchemaPartial.safeParse({
      villageDevelopmentSocieties: [],
      sportsClubs: [],
      cooperativeSocieties: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a village development society row added via the UI still left blank — surfaces a required error without blocking the draft save (SectionForm saves regardless)", () => {
    // Rows added by the "Add" button start with empty strings, not undefined.
    const result = communityOrganizationsSchemaPartial.safeParse({
      villageDevelopmentSocieties: [{ name: "", address: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a village development society row once its required fields are filled in", () => {
    const result = communityOrganizationsSchemaPartial.safeParse({
      villageDevelopmentSocieties: [{ name: "Village Development Society", address: "Main Street, Galle" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a sports club row added via the UI still left blank", () => {
    const result = communityOrganizationsSchemaPartial.safeParse({
      sportsClubs: [{ nameAndAddress: "", memberCount: 0, identifiedNeeds: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a sports club row once its required field is filled in", () => {
    const result = communityOrganizationsSchemaPartial.safeParse({
      sportsClubs: [{ nameAndAddress: "Galle Sports Club, Main Street", memberCount: 25, identifiedNeeds: "" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a cooperative society row added via the UI still left blank", () => {
    const result = communityOrganizationsSchemaPartial.safeParse({
      cooperativeSocieties: [{ name: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a cooperative society row once its required field is filled in", () => {
    const result = communityOrganizationsSchemaPartial.safeParse({
      cooperativeSocieties: [{ name: "SANASA Cooperative Society" }],
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a genuinely invalid enum value", () => {
    const result = communityOrganizationsSchemaPartial.safeParse({
      organizationCounts: [{ type: "not-a-real-type" }],
    });
    expect(result.success).toBe(false);
  });
});
