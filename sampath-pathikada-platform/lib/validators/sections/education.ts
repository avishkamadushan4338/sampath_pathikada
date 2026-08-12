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

/** Institution name is only required once a category has been marked as existing — and since a
 *  GN division can have more than one institution of the same type (e.g. two branches, entered
 *  as extra rows sharing that `type`), the requirement is "at least one row of this type has a
 *  name", not "this exact row does". Runs at the whole-schema level (not inside the row schema
 *  itself) so it can see every row sharing a type. Extra rows are only ever added once the
 *  category's own row is already "yes", so only that first (anchor) row's `exists` is checked
 *  here — and the error is attached to that row's `name` field since it's the one row of each
 *  type that's always on screen. */
function requireTertiaryInstitutionNames(
  data: { tertiaryInstitutions?: { type?: string; exists?: string; name?: string }[] },
  ctx: z.RefinementCtx
) {
  const rows = data.tertiaryInstitutions ?? [];
  const anchorIndexByType = new Map<string, number>();
  rows.forEach((row, index) => {
    if (row?.type && !anchorIndexByType.has(row.type)) anchorIndexByType.set(row.type, index);
  });
  for (const [type, anchorIndex] of anchorIndexByType) {
    if (rows[anchorIndex]?.exists !== "yes") continue;
    const hasName = rows.some((row) => row.type === type && row.name?.trim());
    if (!hasName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tertiaryInstitutions", anchorIndex, "name"],
        message: "Institution name is required once you've indicated it exists",
      });
    }
  }
}

export const tuitionCenterRowSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  nameAndAddress: z.string().min(1, "Name and address is required"),
});

export const educationSchemaStrict = z
  .object({
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
    // At least one row per institution type, but the officer can add extra rows for the same
    // type (e.g. a second university branch) via "+" in the UI, so this is a floor, not an
    // exact count.
    tertiaryInstitutions: z.array(tertiaryInstitutionRowSchema).min(TERTIARY_TYPES.length, "All institution type categories must be listed"),
    tuitionCenters: z.array(tuitionCenterRowSchema).default([]),
    outOfSchoolChildren: sexCountSchema,
    childrenInProbationOrDetention: sexCountSchema,
  })
  .superRefine(requireTertiaryInstitutionNames);

export type EducationData = z.infer<typeof educationSchemaStrict>;

/* Draft-mode reuses the strict row schemas directly — a row's required fields (e.g. `name`,
 * `schoolName`) still fail validation if blank, surfacing a "required" error in the UI. Required
 * fields (and the tertiaryInstitutions name rule above) DO block saving — SectionForm only calls
 * onSaveDraft once validation passes. Only the *array itself* is optional here, so an
 * empty/untouched directory (no rows added yet) is still a valid draft. */
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
  schoolFacilities: z.array(schoolFacilityRowSchema).optional(),
  specialAttentionSchools: z.array(specialAttentionSchoolRowSchema).optional(),
  closedSchools: z.array(closedSchoolRowSchema).optional(),
  privateInternationalSchools: z.array(privateInternationalSchoolRowSchema).optional(),
  pirivenas: z.array(pirivenaRowSchema).optional(),
  vocationalInstitutes: z.array(vocationalInstituteRowSchema).optional(),
  preschools: z.array(preschoolRowSchema).optional(),
  dhammaEducationInstitutions: z.array(dhammaEducationInstitutionRowSchema).optional(),
  tertiaryInstitutions: z.array(tertiaryInstitutionRowSchema).optional(),
  tuitionCenters: z.array(tuitionCenterRowSchema).optional(),
  outOfSchoolChildren: sexCountSchema.partial().optional(),
  childrenInProbationOrDetention: sexCountSchema.partial().optional(),
}).superRefine(requireTertiaryInstitutionNames);

export { TERTIARY_TYPES, PRESCHOOL_FACILITY_TYPES, DHAMMA_TYPES };
