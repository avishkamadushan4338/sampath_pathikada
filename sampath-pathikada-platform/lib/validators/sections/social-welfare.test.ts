import { describe, it, expect } from "vitest";
import {
  socialWelfareSchemaStrict,
  socialWelfareSchemaPartial,
} from "@/lib/validators/sections/social-welfare";

const validPayload = {
  welfarePaymentHouseholdCounts: {
    rs2500: 10,
    rs5000: 5,
    rs8500: 3,
    rs15000: 1,
    totalAswesumaRecipients: 19,
  },
  allowanceRecipientCounts: {
    disabilityAllowance: 1,
    elderlyAllowance: 2,
    nutritionAllowance: 3,
    publicAssistance: 4,
    diseaseAidWheelchair: 5,
    diseaseAidCancer: 6,
    diseaseAidThalassemia: 7,
    diseaseAidDiabetes: 8,
    other: 9,
  },
  eldersHomes: [
    {
      name: "Sunshine Elders' Home",
      authority: "govt" as const,
      phone: "0771234567",
      infrastructureNeeds: "Ramp access",
      capacity: 20,
      residentCount: { female: 10, male: 8 },
    },
  ],
  childrensHomes: [
    {
      name: "Hope Children's Home",
      authority: "private" as const,
      type: "childrens-home" as const,
      capacity: 15,
      residentCount: { female: 7, male: 6 },
    },
  ],
};

describe("socialWelfareSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = socialWelfareSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("defaults elders/children home arrays to empty when the count objects are present", () => {
    const result = socialWelfareSchemaStrict.safeParse({
      welfarePaymentHouseholdCounts: {},
      allowanceRecipientCounts: {},
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eldersHomes).toEqual([]);
      expect(result.data.childrensHomes).toEqual([]);
      expect(result.data.welfarePaymentHouseholdCounts.rs2500).toBe(0);
    }
  });

  it("rejects a payload missing the welfarePaymentHouseholdCounts object", () => {
    const { welfarePaymentHouseholdCounts, ...rest } = validPayload;
    void welfarePaymentHouseholdCounts;
    const result = socialWelfareSchemaStrict.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an elders' home row missing a required field", () => {
    const result = socialWelfareSchemaStrict.safeParse({
      ...validPayload,
      eldersHomes: [{ authority: "govt" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a children's home row missing a required field", () => {
    const result = socialWelfareSchemaStrict.safeParse({
      ...validPayload,
      childrensHomes: [{ name: "Hope Children's Home", authority: "private" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid elders' home authority enum value", () => {
    const result = socialWelfareSchemaStrict.safeParse({
      ...validPayload,
      eldersHomes: [{ ...validPayload.eldersHomes[0], authority: "not-a-real-authority" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid children's home type enum value", () => {
    const result = socialWelfareSchemaStrict.safeParse({
      ...validPayload,
      childrensHomes: [{ ...validPayload.childrensHomes[0], type: "not-a-real-type" }],
    });
    expect(result.success).toBe(false);
  });

  it("coerces numeric string welfare payment counts", () => {
    const result = socialWelfareSchemaStrict.safeParse({
      ...validPayload,
      welfarePaymentHouseholdCounts: {
        ...validPayload.welfarePaymentHouseholdCounts,
        rs2500: "10",
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.welfarePaymentHouseholdCounts.rs2500).toBe(10);
    }
  });
});

describe("socialWelfareSchemaPartial", () => {
  it("accepts an empty object (fresh draft)", () => {
    const result = socialWelfareSchemaPartial.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts untouched home arrays (no rows added yet)", () => {
    const result = socialWelfareSchemaPartial.safeParse({ eldersHomes: [], childrensHomes: [] });
    expect(result.success).toBe(true);
  });

  it("rejects an elders' home row added via the UI still left blank — surfaces a required error without blocking the draft save (SectionForm saves regardless)", () => {
    // The "Add" button (see entry/social-welfare/page.tsx) seeds new rows with a valid
    // enum default ("govt") but a blank `name` — that blank required field should now be
    // flagged, even though it no longer blocks SectionForm from saving the draft.
    const result = socialWelfareSchemaPartial.safeParse({
      eldersHomes: [
        {
          name: "",
          authority: "govt",
          phone: "",
          infrastructureNeeds: "",
          capacity: 0,
          residentCount: { female: 0, male: 0 },
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an elders' home row once its required fields are filled in", () => {
    const result = socialWelfareSchemaPartial.safeParse({
      eldersHomes: [
        {
          name: "Sunshine Elders' Home",
          authority: "govt",
          phone: "",
          infrastructureNeeds: "",
          capacity: 0,
          residentCount: { female: 0, male: 0 },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts an elders' home row with genuinely optional fields left blank", () => {
    // phone and infrastructureNeeds are genuinely optional — only name/authority are required.
    const result = socialWelfareSchemaPartial.safeParse({
      eldersHomes: [{ name: "Sunshine Elders' Home", authority: "govt", residentCount: { female: 0, male: 0 } }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a children's home row added via the UI still left blank", () => {
    const result = socialWelfareSchemaPartial.safeParse({
      childrensHomes: [
        {
          name: "",
          authority: "govt",
          type: "childrens-home",
          capacity: 0,
          residentCount: { female: 0, male: 0 },
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a children's home row once its required fields are filled in", () => {
    const result = socialWelfareSchemaPartial.safeParse({
      childrensHomes: [
        {
          name: "Hope Children's Home",
          authority: "private",
          type: "childrens-home",
          capacity: 15,
          residentCount: { female: 7, male: 6 },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a genuinely invalid enum value", () => {
    const result = socialWelfareSchemaPartial.safeParse({
      eldersHomes: [{ name: "Sunshine Elders' Home", authority: "not-a-real-authority", residentCount: { female: 0, male: 0 } }],
    });
    expect(result.success).toBe(false);
  });
});
