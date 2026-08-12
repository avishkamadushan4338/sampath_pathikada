import { describe, it, expect } from "vitest";
import {
  educationSchemaStrict,
  educationSchemaPartial,
  TERTIARY_TYPES,
  PRESCHOOL_FACILITY_TYPES,
  DHAMMA_TYPES,
} from "@/lib/validators/sections/education";

const validPayload = {
  institutionCounts: {
    govtSchools: 12,
    privateOrInternationalSchools: 1,
    pirivenas: 2,
    vocationalTrainingInstitutes: 1,
    registeredPreschoolsGovt: 3,
    registeredPreschoolsPrivate: 1,
    dhammaEducationInstitutions: 4,
    higherEducationInstitutions: 0,
    tuitionCenterInstitutions: 5,
  },
  schoolCountsByType: { nationalSchools: 1, type1AB: 2, type1C: 1, type2: 3, type3: 5 },
  schoolFacilities: [
    {
      schoolName: "Galle Central College",
      accommodationAvailable: "yes" as const,
      teachersFemale: 20,
      teachersMale: 10,
      studentsFemale: 300,
      studentsMale: 280,
      waterFacility: "yes" as const,
      sanitationFacility: "yes" as const,
      sportsGround: "yes" as const,
    },
  ],
  specialAttentionSchools: [
    {
      schoolName: "Galle Special School",
      teachersFemale: 5,
      teachersMale: 2,
      studentsFemale: 20,
      studentsMale: 15,
      developmentNeeds: "Wheelchair ramps",
    },
  ],
  closedSchools: [
    { schoolName: "Old Village School", yearClosed: 2015, buildingCount: 2, buildingsUsable: "no" as const },
  ],
  privateInternationalSchools: [{ name: "Southlands College", teacherCount: 30, studentCount: 400 }],
  pirivenas: [
    {
      name: "Sri Sumangala Pirivena",
      type: "Pahamuna",
      boardingFacility: "yes" as const,
      teachersFemale: 2,
      teachersMale: 8,
      studentsFemale: 10,
      studentsMale: 50,
      waterFacility: "yes" as const,
      sanitationFacility: "yes" as const,
      sportsGround: "no" as const,
    },
  ],
  vocationalInstitutes: [{ name: "Galle Vocational Training Center" }],
  preschools: [
    { name: "Little Stars Preschool", address: "Main Street, Galle", facilityType: "govt" as const, teacherCount: 2, studentCount: 25 },
  ],
  dhammaEducationInstitutions: [
    { institutionName: "Galle Dhamma School", type: "buddhist" as const, teacherCount: 4, studentCount: 60 },
  ],
  tertiaryInstitutions: TERTIARY_TYPES.map((type) => ({ type, exists: "no" as const })),
  tuitionCenters: [{ registrationNumber: "TC-001", nameAndAddress: "ABC Tuition, Main Street" }],
  outOfSchoolChildren: { female: 1, male: 2 },
  childrenInProbationOrDetention: { female: 0, male: 1 },
};

describe("educationSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = educationSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing a required field", () => {
    const { tertiaryInstitutions, ...withoutTertiaryInstitutions } = validPayload;
    void tertiaryInstitutions;
    const result = educationSchemaStrict.safeParse(withoutTertiaryInstitutions);
    expect(result.success).toBe(false);
  });

  it("rejects tertiaryInstitutions with fewer rows than TERTIARY_TYPES", () => {
    const result = educationSchemaStrict.safeParse({
      ...validPayload,
      tertiaryInstitutions: validPayload.tertiaryInstitutions.slice(0, TERTIARY_TYPES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts the correct full-length tertiaryInstitutions array", () => {
    const result = educationSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tertiaryInstitutions).toHaveLength(TERTIARY_TYPES.length);
    }
  });

  it("rejects an unknown tertiary institution type enum value", () => {
    const result = educationSchemaStrict.safeParse({
      ...validPayload,
      tertiaryInstitutions: [
        { type: "not-a-real-type", exists: "no" },
        ...validPayload.tertiaryInstitutions.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown preschool facility type enum value", () => {
    const result = educationSchemaStrict.safeParse({
      ...validPayload,
      preschools: [{ name: "X", address: "Y", facilityType: "not-a-real-type" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown dhamma education type enum value", () => {
    const result = educationSchemaStrict.safeParse({
      ...validPayload,
      dhammaEducationInstitutions: [{ institutionName: "X", type: "not-a-real-type" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a school facility row missing a required field", () => {
    const result = educationSchemaStrict.safeParse({
      ...validPayload,
      schoolFacilities: [{ accommodationAvailable: "yes" }],
    });
    expect(result.success).toBe(false);
  });

  it("coerces numeric string counts", () => {
    const result = educationSchemaStrict.safeParse({
      ...validPayload,
      schoolCountsByType: { nationalSchools: "1", type1AB: "2", type1C: "1", type2: "3", type3: "5" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.schoolCountsByType.type1AB).toBe(2);
    }
  });
});

describe("educationSchemaPartial", () => {
  it("accepts an empty object (fresh draft)", () => {
    const result = educationSchemaPartial.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts an untouched directory (no rows added yet)", () => {
    const result = educationSchemaPartial.safeParse({ schoolFacilities: [] });
    expect(result.success).toBe(true);
  });

  it("rejects a school facility row added via the UI still left blank — surfaces a required error without blocking the draft save (SectionForm saves regardless)", () => {
    const result = educationSchemaPartial.safeParse({
      schoolFacilities: [{ schoolName: "", accommodationAvailable: undefined }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a school facility row once its required fields are filled in", () => {
    const result = educationSchemaPartial.safeParse({
      schoolFacilities: [
        {
          schoolName: "Galle Central College",
          accommodationAvailable: "yes",
          waterFacility: "yes",
          sanitationFacility: "yes",
          sportsGround: "yes",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a special attention school row missing developmentNeeds", () => {
    const result = educationSchemaPartial.safeParse({
      specialAttentionSchools: [{ schoolName: "Galle Special School", developmentNeeds: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a special attention school row once its required fields are filled in", () => {
    const result = educationSchemaPartial.safeParse({
      specialAttentionSchools: [{ schoolName: "Galle Special School", developmentNeeds: "Wheelchair ramps" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a closed school row missing buildingsUsable", () => {
    const result = educationSchemaPartial.safeParse({
      closedSchools: [{ schoolName: "Old Village School", buildingsUsable: undefined }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a closed school row once its required fields are filled in", () => {
    const result = educationSchemaPartial.safeParse({
      closedSchools: [{ schoolName: "Old Village School", buildingsUsable: "no" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a private/international school row missing name", () => {
    const result = educationSchemaPartial.safeParse({
      privateInternationalSchools: [{ name: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a private/international school row once its required fields are filled in", () => {
    const result = educationSchemaPartial.safeParse({
      privateInternationalSchools: [{ name: "Southlands College" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a pirivena row missing required fields", () => {
    const result = educationSchemaPartial.safeParse({
      pirivenas: [{ name: "Sri Sumangala Pirivena", type: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a pirivena row once its required fields are filled in", () => {
    const result = educationSchemaPartial.safeParse({
      pirivenas: [
        {
          name: "Sri Sumangala Pirivena",
          type: "Pahamuna",
          boardingFacility: "yes",
          waterFacility: "yes",
          sanitationFacility: "yes",
          sportsGround: "no",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a vocational institute row missing name", () => {
    const result = educationSchemaPartial.safeParse({
      vocationalInstitutes: [{ name: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a vocational institute row once its required fields are filled in", () => {
    const result = educationSchemaPartial.safeParse({
      vocationalInstitutes: [{ name: "Galle Vocational Training Center" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a preschool row added via the UI still left blank", () => {
    const result = educationSchemaPartial.safeParse({
      preschools: [{ name: "", address: "", facilityType: undefined }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts every known preschool facility type once name and address are filled in", () => {
    for (const facilityType of PRESCHOOL_FACILITY_TYPES) {
      const result = educationSchemaPartial.safeParse({
        preschools: [{ name: "Little Stars Preschool", address: "Main Street, Galle", facilityType }],
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects a dhamma education institution row added via the UI still left blank", () => {
    const result = educationSchemaPartial.safeParse({
      dhammaEducationInstitutions: [{ institutionName: "", type: undefined }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts every known dhamma education type once institutionName is filled in", () => {
    for (const type of DHAMMA_TYPES) {
      const result = educationSchemaPartial.safeParse({
        dhammaEducationInstitutions: [{ institutionName: "Galle Dhamma School", type }],
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects a tertiary institution row with only the type filled in — exists is required (SectionForm saves regardless)", () => {
    const result = educationSchemaPartial.safeParse({
      tertiaryInstitutions: [{ type: "university" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a tertiary institution row once type and exists are filled in", () => {
    const result = educationSchemaPartial.safeParse({
      tertiaryInstitutions: [{ type: "university", exists: "no" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a tertiary institution row marked as existing with no name", () => {
    const result = educationSchemaPartial.safeParse({
      tertiaryInstitutions: [{ type: "university", exists: "yes", name: undefined }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a tertiary institution row with name left blank when exists is no — name is only required once marked as existing", () => {
    const result = educationSchemaPartial.safeParse({
      tertiaryInstitutions: [{ type: "university", exists: "no", name: undefined }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a tertiary institution row marked as existing once a name is filled in", () => {
    const result = educationSchemaPartial.safeParse({
      tertiaryInstitutions: [{ type: "university", exists: "yes", name: "University of Ruhuna" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a second branch row for the same type even when the first (anchor) row's name is blank", () => {
    // Mirrors the UI: clicking "+" on the anchor row inserts an extra row right after it for the
    // same institution type — the officer may fill the branch name into that extra row instead
    // of the anchor, so the rule only needs *some* row of the type to carry a name.
    const result = educationSchemaPartial.safeParse({
      tertiaryInstitutions: [
        { type: "university", exists: "yes", name: "" },
        { type: "university", exists: "yes", name: "University of Ruhuna — Matara Branch" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a genuinely invalid tertiary institution type enum value", () => {
    const result = educationSchemaPartial.safeParse({
      tertiaryInstitutions: [{ type: "not-a-real-type", exists: "no" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a tuition center row added via the UI still left blank", () => {
    const result = educationSchemaPartial.safeParse({
      tuitionCenters: [{ registrationNumber: "", nameAndAddress: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a tuition center row once its required fields are filled in", () => {
    const result = educationSchemaPartial.safeParse({
      tuitionCenters: [{ registrationNumber: "TC-001", nameAndAddress: "ABC Tuition, Main Street" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts outOfSchoolChildren left entirely blank — its fields default to 0 in strict", () => {
    const result = educationSchemaPartial.safeParse({ outOfSchoolChildren: {} });
    expect(result.success).toBe(true);
  });
});
