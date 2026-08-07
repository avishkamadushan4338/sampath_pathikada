import { z } from "zod";
import { yesNo, sexCountSchema } from "@/lib/validators/common";

/* ── §6 අධ්‍යාපනය — Education ─────────────────────────────────────────────── */

const TERTIARY_TYPES = ["university-college", "university", "tech-institute", "private-university"] as const;
const PRESCHOOL_FACILITY_TYPES = ["govt", "private"] as const;
const DHAMMA_TYPES = ["buddhist", "islam", "hindu", "christian"] as const;

export const schoolFacilityRowSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  accommodationAvailable: yesNo,
  teachersFemale: z.coerce.number().int().min(0).default(0),
  teachersMale: z.coerce.number().int().min(0).default(0),
  studentsFemale: z.coerce.number().int().min(0).default(0),
  studentsMale: z.coerce.number().int().min(0).default(0),
  waterFacility: yesNo,
  sanitationFacility: yesNo,
  sportsGround: yesNo,
});

export const specialAttentionSchoolRowSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  teachersFemale: z.coerce.number().int().min(0).default(0),
  teachersMale: z.coerce.number().int().min(0).default(0),
  studentsFemale: z.coerce.number().int().min(0).default(0),
  studentsMale: z.coerce.number().int().min(0).default(0),
  developmentNeeds: z.string().min(1, "Development needs is required"),
});

export const closedSchoolRowSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  yearClosed: z.coerce.number().int().min(0).default(0),
  buildingCount: z.coerce.number().int().min(0).default(0),
  buildingsUsable: yesNo,
});

export const privateInternationalSchoolRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  teacherCount: z.coerce.number().int().min(0).default(0),
  studentCount: z.coerce.number().int().min(0).default(0),
});

export const pirivenaRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  boardingFacility: yesNo,
  teachersFemale: z.coerce.number().int().min(0).default(0),
  teachersMale: z.coerce.number().int().min(0).default(0),
  studentsFemale: z.coerce.number().int().min(0).default(0),
  studentsMale: z.coerce.number().int().min(0).default(0),
  waterFacility: yesNo,
  sanitationFacility: yesNo,
  sportsGround: yesNo,
});

export const vocationalInstituteRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const preschoolRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  facilityType: z.enum(PRESCHOOL_FACILITY_TYPES),
  teacherCount: z.coerce.number().int().min(0).default(0),
  studentCount: z.coerce.number().int().min(0).default(0),
});

export const dhammaEducationInstitutionRowSchema = z.object({
  institutionName: z.string().min(1, "Institution name is required"),
  type: z.enum(DHAMMA_TYPES),
  teacherCount: z.coerce.number().int().min(0).default(0),
  studentCount: z.coerce.number().int().min(0).default(0),
});

export const tertiaryInstitutionRowSchema = z.object({
  type: z.enum(TERTIARY_TYPES),
  exists: yesNo,
  name: z.string().optional(),
});

export const tuitionCenterRowSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  nameAndAddress: z.string().min(1, "Name and address is required"),
});

export const educationSchemaStrict = z.object({
  institutionCounts: z.object({
    govtSchools: z.coerce.number().int().min(0).default(0),
    privateOrInternationalSchools: z.coerce.number().int().min(0).default(0),
    pirivenas: z.coerce.number().int().min(0).default(0),
    vocationalTrainingInstitutes: z.coerce.number().int().min(0).default(0),
    registeredPreschoolsGovt: z.coerce.number().int().min(0).default(0),
    registeredPreschoolsPrivate: z.coerce.number().int().min(0).default(0),
    dhammaEducationInstitutions: z.coerce.number().int().min(0).default(0),
    higherEducationInstitutions: z.coerce.number().int().min(0).default(0),
    tuitionCenterInstitutions: z.coerce.number().int().min(0).default(0),
  }),
  schoolCountsByType: z.object({
    nationalSchools: z.coerce.number().int().min(0).default(0),
    type1AB: z.coerce.number().int().min(0).default(0),
    type1C: z.coerce.number().int().min(0).default(0),
    type2: z.coerce.number().int().min(0).default(0),
    type3: z.coerce.number().int().min(0).default(0),
  }),
  schoolFacilities: z.array(schoolFacilityRowSchema).default([]),
  specialAttentionSchools: z.array(specialAttentionSchoolRowSchema).default([]),
  closedSchools: z.array(closedSchoolRowSchema).default([]),
  privateInternationalSchools: z.array(privateInternationalSchoolRowSchema).default([]),
  pirivenas: z.array(pirivenaRowSchema).default([]),
  vocationalInstitutes: z.array(vocationalInstituteRowSchema).default([]),
  preschools: z.array(preschoolRowSchema).default([]),
  dhammaEducationInstitutions: z.array(dhammaEducationInstitutionRowSchema).default([]),
  tertiaryInstitutions: z.array(tertiaryInstitutionRowSchema).length(TERTIARY_TYPES.length),
  tuitionCenters: z.array(tuitionCenterRowSchema).default([]),
  outOfSchoolChildren: sexCountSchema,
  childrenInProbationOrDetention: sexCountSchema,
});

export type EducationData = z.infer<typeof educationSchemaStrict>;

/* Draft-mode row schemas built from scratch rather than `.partial()` on the strict schemas
 * above: `.partial()` only allows a field to be *missing*, it doesn't relax `min(1)`, so a row
 * added via the "Add" button (whose fields start as "") would still fail validation and
 * silently block saving. */
const schoolFacilityRowPartialSchema = z.object({
  schoolName: z.string().optional(),
  accommodationAvailable: yesNo.optional(),
  teachersFemale: z.coerce.number().int().min(0).optional(),
  teachersMale: z.coerce.number().int().min(0).optional(),
  studentsFemale: z.coerce.number().int().min(0).optional(),
  studentsMale: z.coerce.number().int().min(0).optional(),
  waterFacility: yesNo.optional(),
  sanitationFacility: yesNo.optional(),
  sportsGround: yesNo.optional(),
});

const specialAttentionSchoolRowPartialSchema = z.object({
  schoolName: z.string().optional(),
  teachersFemale: z.coerce.number().int().min(0).optional(),
  teachersMale: z.coerce.number().int().min(0).optional(),
  studentsFemale: z.coerce.number().int().min(0).optional(),
  studentsMale: z.coerce.number().int().min(0).optional(),
  developmentNeeds: z.string().optional(),
});

const closedSchoolRowPartialSchema = z.object({
  schoolName: z.string().optional(),
  yearClosed: z.coerce.number().int().min(0).optional(),
  buildingCount: z.coerce.number().int().min(0).optional(),
  buildingsUsable: yesNo.optional(),
});

const privateInternationalSchoolRowPartialSchema = z.object({
  name: z.string().optional(),
  teacherCount: z.coerce.number().int().min(0).optional(),
  studentCount: z.coerce.number().int().min(0).optional(),
});

const pirivenaRowPartialSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  boardingFacility: yesNo.optional(),
  teachersFemale: z.coerce.number().int().min(0).optional(),
  teachersMale: z.coerce.number().int().min(0).optional(),
  studentsFemale: z.coerce.number().int().min(0).optional(),
  studentsMale: z.coerce.number().int().min(0).optional(),
  waterFacility: yesNo.optional(),
  sanitationFacility: yesNo.optional(),
  sportsGround: yesNo.optional(),
});

const vocationalInstituteRowPartialSchema = z.object({
  name: z.string().optional(),
});

const preschoolRowPartialSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  facilityType: z.enum(PRESCHOOL_FACILITY_TYPES).optional(),
  teacherCount: z.coerce.number().int().min(0).optional(),
  studentCount: z.coerce.number().int().min(0).optional(),
});

const dhammaEducationInstitutionRowPartialSchema = z.object({
  institutionName: z.string().optional(),
  type: z.enum(DHAMMA_TYPES).optional(),
  teacherCount: z.coerce.number().int().min(0).optional(),
  studentCount: z.coerce.number().int().min(0).optional(),
});

const tuitionCenterRowPartialSchema = z.object({
  registrationNumber: z.string().optional(),
  nameAndAddress: z.string().optional(),
});

export const educationSchemaPartial = z.object({
  institutionCounts: z
    .object({
      govtSchools: z.coerce.number().int().min(0).optional(),
      privateOrInternationalSchools: z.coerce.number().int().min(0).optional(),
      pirivenas: z.coerce.number().int().min(0).optional(),
      vocationalTrainingInstitutes: z.coerce.number().int().min(0).optional(),
      registeredPreschoolsGovt: z.coerce.number().int().min(0).optional(),
      registeredPreschoolsPrivate: z.coerce.number().int().min(0).optional(),
      dhammaEducationInstitutions: z.coerce.number().int().min(0).optional(),
      higherEducationInstitutions: z.coerce.number().int().min(0).optional(),
      tuitionCenterInstitutions: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  schoolCountsByType: z
    .object({
      nationalSchools: z.coerce.number().int().min(0).optional(),
      type1AB: z.coerce.number().int().min(0).optional(),
      type1C: z.coerce.number().int().min(0).optional(),
      type2: z.coerce.number().int().min(0).optional(),
      type3: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  schoolFacilities: z.array(schoolFacilityRowPartialSchema).optional(),
  specialAttentionSchools: z.array(specialAttentionSchoolRowPartialSchema).optional(),
  closedSchools: z.array(closedSchoolRowPartialSchema).optional(),
  privateInternationalSchools: z.array(privateInternationalSchoolRowPartialSchema).optional(),
  pirivenas: z.array(pirivenaRowPartialSchema).optional(),
  vocationalInstitutes: z.array(vocationalInstituteRowPartialSchema).optional(),
  preschools: z.array(preschoolRowPartialSchema).optional(),
  dhammaEducationInstitutions: z.array(dhammaEducationInstitutionRowPartialSchema).optional(),
  tertiaryInstitutions: z.array(tertiaryInstitutionRowSchema.partial()).optional(),
  tuitionCenters: z.array(tuitionCenterRowPartialSchema).optional(),
  outOfSchoolChildren: sexCountSchema.partial().optional(),
  childrenInProbationOrDetention: sexCountSchema.partial().optional(),
});

export { TERTIARY_TYPES, PRESCHOOL_FACILITY_TYPES, DHAMMA_TYPES };
