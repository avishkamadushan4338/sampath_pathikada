import { describe, it, expect } from "vitest";
import { identificationSchemaStrict } from "@/lib/validators/sections/identification";

const validPayload = {
  gnDivisionName: "Galle Fort",
  gnDivisionNumber: "4/A",
  officerName: "K. Perera",
  officerDesignation: "Grama Niladhari",
  officerPhone: "0771234567",
  district: "galle",
  dsDivision: "galle-fg",
  gnDivision: "galle-fort",
  localGovt: "Galle Municipal Council",
  electoral: "Galle",
  farmers: "Galle Farmers Service Center",
  eduZone: "Galle",
  eduDiv: "Galle",
};

describe("identificationSchemaStrict", () => {
  it("accepts a valid payload", () => {
    const result = identificationSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing a required field", () => {
    const { officerName, ...withoutOfficerName } = validPayload;
    const result = identificationSchemaStrict.safeParse(withoutOfficerName);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone number", () => {
    const result = identificationSchemaStrict.safeParse({ ...validPayload, officerPhone: "12345" });
    expect(result.success).toBe(false);
  });
});
