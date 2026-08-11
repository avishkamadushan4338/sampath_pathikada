import { describe, it, expect } from "vitest";
import { healthSchemaStrict, healthSchemaPartial, GOVT_HOSPITAL_TYPES } from "@/lib/validators/sections/health";

const validPayload = {
  institutionCounts: {
    govtHospitals: 1,
    primaryHealthcareUnits: 3,
    privateHospitals: 0,
    ayurvedicHospitals: 1,
    specialistServiceCenters: 0,
    mohOfficesOrCommunityHealthCenters: 1,
    privateMedicalLabs: 2,
    traditionalMedicineRegisteredInstitutions: 1,
    animalClinicCenters: 0,
    govtPharmacies: 1,
    privatePharmacies: 2,
  },
  govtHospitalsDirectory: [{ name: "Base Hospital Galle", type: "base" as const }],
  primaryHealthcareUnitsDirectory: [{ name: "Galle PHU", type: "Rural" }],
  privateHospitalsDirectory: [{ name: "Southern Private Hospital", address: "Main Street, Galle" }],
  ayurvedicInstitutions: [{ name: "Ayurvedic Hospital", address: "Church Street, Galle" }],
  specialistServiceCentersDirectory: [{ name: "Eye Clinic", address: "Hospital Road" }],
  mohOfficesDirectory: [{ name: "MOH Office Galle", address: "Fort Road" }],
  traditionalMedicineInstitutionsDirectory: [{ name: "Native Clinic", address: "Lake Road" }],
  privateMedicalLabsDirectory: [{ name: "Lanka Labs", address: "Main Street" }],
  animalClinicsDirectory: [{ name: "Vet Clinic", address: "Pettah Road" }],
  traditionalPractitioners: [{ name: "K. Fernando", specialty: "Ayurveda" }],
};

describe("healthSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = healthSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing a required field", () => {
    const { institutionCounts, ...withoutInstitutionCounts } = validPayload;
    void institutionCounts;
    const result = healthSchemaStrict.safeParse(withoutInstitutionCounts);
    expect(result.success).toBe(false);
  });

  it("defaults directory arrays to empty when omitted", () => {
    const result = healthSchemaStrict.safeParse({ institutionCounts: validPayload.institutionCounts });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.govtHospitalsDirectory).toEqual([]);
      expect(result.data.traditionalPractitioners).toEqual([]);
    }
  });

  it("rejects a govt hospital row missing a required field", () => {
    const result = healthSchemaStrict.safeParse({
      ...validPayload,
      govtHospitalsDirectory: [{ type: "base" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown govt hospital type enum value", () => {
    const result = healthSchemaStrict.safeParse({
      ...validPayload,
      govtHospitalsDirectory: [{ name: "Base Hospital", type: "not-a-real-type" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a traditional practitioner row missing a required field", () => {
    const result = healthSchemaStrict.safeParse({
      ...validPayload,
      traditionalPractitioners: [{ name: "K. Fernando" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name/address row missing a required field", () => {
    const result = healthSchemaStrict.safeParse({
      ...validPayload,
      privateHospitalsDirectory: [{ name: "Southern Private Hospital" }],
    });
    expect(result.success).toBe(false);
  });

  it("coerces numeric string counts", () => {
    const result = healthSchemaStrict.safeParse({
      ...validPayload,
      institutionCounts: { ...validPayload.institutionCounts, govtHospitals: "4" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.institutionCounts.govtHospitals).toBe(4);
    }
  });
});

describe("healthSchemaPartial", () => {
  it("accepts an empty object (fresh draft)", () => {
    const result = healthSchemaPartial.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts an untouched directory (no rows added yet)", () => {
    const result = healthSchemaPartial.safeParse({ govtHospitalsDirectory: [] });
    expect(result.success).toBe(true);
  });

  it("rejects a govt hospital row added via the UI still left blank — surfaces a required error without blocking the draft save (SectionForm saves regardless)", () => {
    const result = healthSchemaPartial.safeParse({
      govtHospitalsDirectory: [{ name: "", type: undefined }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a govt hospital row once its required fields are filled in", () => {
    const result = healthSchemaPartial.safeParse({
      govtHospitalsDirectory: [{ name: "Base Hospital Galle", type: "base" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a name/address row added via the UI still left blank", () => {
    const result = healthSchemaPartial.safeParse({
      privateHospitalsDirectory: [{ name: "", address: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a name/address row once its required fields are filled in", () => {
    const result = healthSchemaPartial.safeParse({
      privateHospitalsDirectory: [{ name: "Southern Private Hospital", address: "Main Street, Galle" }],
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a genuinely invalid govt hospital type enum value", () => {
    const result = healthSchemaPartial.safeParse({
      govtHospitalsDirectory: [{ name: "Base Hospital", type: "not-a-real-type" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts every known govt hospital type once name is filled in", () => {
    for (const type of GOVT_HOSPITAL_TYPES) {
      const result = healthSchemaPartial.safeParse({ govtHospitalsDirectory: [{ name: "Base Hospital", type }] });
      expect(result.success).toBe(true);
    }
  });

  it("accepts a primary healthcare unit row with its optional type left blank", () => {
    // type is genuinely optional on this row (unlike govt hospitals' type) — only name is required.
    const result = healthSchemaPartial.safeParse({
      primaryHealthcareUnitsDirectory: [{ name: "Galle PHU", type: undefined }],
    });
    expect(result.success).toBe(true);
  });
});
