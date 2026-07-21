import { z } from "zod";
import { yesNo } from "@/lib/validators/common";

/* ── §6 අධ්‍යාපනය — Education ─────────────────────────────────────────────── */

const TERTIARY_TYPES = ["university-college", "university", "tech-institute", "private-university"] as const;
const PRESCHOOL_FACILITY_TYPES = ["govt", "private"] as const;

export const schoolFacilityRowSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  accommodationAvailable: yesNo,
  teacherCount: z.coerce.number().int().min(0).default(0),
  studentsFemale: z.coerce.number().int().min(0).default(0),
  studentsMale: z.coerce.number().int().min(0).default(0),
  waterFacility: yesNo,
  sanitationFacility: yesNo,
  sportsGround: yesNo,
});

export const specialAttentionSchoolRowSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  reason: z.string().min(1, "Reason is required"),
});

export const privateInternationalSchoolRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  teacherCount: z.coerce.number().int().min(0).default(0),
  studentCount: z.coerce.number().int().min(0).default(0),
});

export const pirivenaRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  studentCount: z.coerce.number().int().min(0).default(0),
});

export const vocationalInstituteRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const preschoolRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  facilityType: z.enum(PRESCHOOL_FACILITY_TYPES),
  teacherCount: z.coerce.number().int().min(0).default(0),
  studentCount: z.coerce.number().int().min(0).default(0),
});

export const dhammaEducationCountSchema = z.object({
  schools: z.coerce.number().int().min(0).default(0),
  students: z.coerce.number().int().min(0).default(0),
});

export const tertiaryInstitutionRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(TERTIARY_TYPES),
});

export const tuitionCenterRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const educationSchemaStrict = z.object({
  institutionCounts: z.object({
    govtSchools: z.coerce.number().int().min(0).default(0),
    privateOrInternationalSchools: z.coerce.number().int().min(0).default(0),
    pirivenas: z.coerce.number().int().min(0).default(0),
    vocationalTrainingInstitutes: z.coerce.number().int().min(0).default(0),
    registeredPreschoolsGovt: z.coerce.number().int().min(0).default(0),
    registeredPreschoolsPrivate: z.coerce.number().int().min(0).default(0),
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
  privateInternationalSchools: z.array(privateInternationalSchoolRowSchema).default([]),
  pirivenas: z.array(pirivenaRowSchema).default([]),
  vocationalInstitutes: z.array(vocationalInstituteRowSchema).default([]),
  preschools: z.array(preschoolRowSchema).default([]),
  dhammaEducation: z.object({
    buddhist: dhammaEducationCountSchema,
    islam: dhammaEducationCountSchema,
    hindu: dhammaEducationCountSchema,
    christian: dhammaEducationCountSchema,
  }),
  tertiaryInstitutions: z.array(tertiaryInstitutionRowSchema).default([]),
  tuitionCenters: z.array(tuitionCenterRowSchema).default([]),
  outOfSchoolChildrenCount: z.coerce.number().int().min(0).default(0),
  marriedOrCohabitingMinorsCount: z.coerce.number().int().min(0).default(0),
});

export type EducationData = z.infer<typeof educationSchemaStrict>;

export const educationSchemaPartial = z.object({
  institutionCounts: z
    .object({
      govtSchools: z.coerce.number().int().min(0).optional(),
      privateOrInternationalSchools: z.coerce.number().int().min(0).optional(),
      pirivenas: z.coerce.number().int().min(0).optional(),
      vocationalTrainingInstitutes: z.coerce.number().int().min(0).optional(),
      registeredPreschoolsGovt: z.coerce.number().int().min(0).optional(),
      registeredPreschoolsPrivate: z.coerce.number().int().min(0).optional(),
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
  schoolFacilities: z.array(schoolFacilityRowSchema.partial()).optional(),
  specialAttentionSchools: z.array(specialAttentionSchoolRowSchema.partial()).optional(),
  privateInternationalSchools: z.array(privateInternationalSchoolRowSchema.partial()).optional(),
  pirivenas: z.array(pirivenaRowSchema.partial()).optional(),
  vocationalInstitutes: z.array(vocationalInstituteRowSchema.partial()).optional(),
  preschools: z.array(preschoolRowSchema.partial()).optional(),
  dhammaEducation: z
    .object({
      buddhist: dhammaEducationCountSchema.partial().optional(),
      islam: dhammaEducationCountSchema.partial().optional(),
      hindu: dhammaEducationCountSchema.partial().optional(),
      christian: dhammaEducationCountSchema.partial().optional(),
    })
    .optional(),
  tertiaryInstitutions: z.array(tertiaryInstitutionRowSchema.partial()).optional(),
  tuitionCenters: z.array(tuitionCenterRowSchema.partial()).optional(),
  outOfSchoolChildrenCount: z.coerce.number().int().min(0).optional(),
  marriedOrCohabitingMinorsCount: z.coerce.number().int().min(0).optional(),
});

export { TERTIARY_TYPES, PRESCHOOL_FACILITY_TYPES };
