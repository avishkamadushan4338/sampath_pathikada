import { z } from "zod";
import { requiredCount } from "@/lib/validators/common";

/* ── §3 ජනගහන තොරතුරු — Demographics ──────────────────────────────────────── */

const AGE_BANDS = ["0-4", "5-14", "15-59", "60-80", "80+"] as const;
const ETHNICITIES = ["sinhala", "tamil", "muslim", "malay", "burgher", "other"] as const;
const RELIGIONS = ["buddhist", "hindu", "islam", "catholic", "other"] as const;
const DISABILITY_TYPES = [
  "mentalIllness",
  "intellectualDisability",
  "paralysis",
  "speechImpairment",
  "hearingImpairment",
  "visualImpairment",
  "physicalMobility",
  "multipleDisability",
] as const;

export const ageSexRowSchema = z.object({
  band: z.enum(AGE_BANDS),
  female: requiredCount("Female count is required"),
  male: requiredCount("Male count is required"),
});
export const ethnicityRowSchema = z.object({
  ethnicity: z.enum(ETHNICITIES),
  female: requiredCount("Female count is required"),
  male: requiredCount("Male count is required"),
});
export const religionRowSchema = z.object({
  religion: z.enum(RELIGIONS),
  female: requiredCount("Female count is required"),
  male: requiredCount("Male count is required"),
});

export const disabilityRowSchema = z.object({
  type: z.enum(DISABILITY_TYPES),
  under18: z.object({
    female: requiredCount("Female count is required"),
    male: requiredCount("Male count is required"),
  }),
  over18: z.object({
    female: requiredCount("Female count is required"),
    male: requiredCount("Male count is required"),
  }),
});

export const registeredVotersSchema = z.object({
  electoralArea: z.string().min(1, "Electoral area is required"),
  female: requiredCount("Female count is required"),
  male: requiredCount("Male count is required"),
});

/** A submission's total population (by sex) must be the same number regardless of which
 *  breakdown you sum it from — Age, Ethnicity, and Religion are three different ways of slicing
 *  the *same* people, not three independent counts. If they don't match, the officer has
 *  mis-entered a number somewhere. Exported so the save API can detect this exact failure (as
 *  opposed to a routine "still filling this in" required-field error) and flag it for review. */
export const POPULATION_MISMATCH_ERROR_PREFIX = "Invalid data:";

function sumIfComplete(rows: { female?: unknown; male?: unknown }[] | undefined, key: "female" | "male"): number | null {
  if (!rows || rows.length === 0) return null;
  let total = 0;
  for (const row of rows) {
    const value = row[key];
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
    total += value;
  }
  return total;
}

function requireMatchingPopulationTotals(
  data: {
    populationByAge?: { female?: unknown; male?: unknown }[];
    populationByEthnicity?: { female?: unknown; male?: unknown }[];
    populationByReligion?: { female?: unknown; male?: unknown }[];
  },
  ctx: z.RefinementCtx
) {
  const ageFemale = sumIfComplete(data.populationByAge, "female");
  const ageMale = sumIfComplete(data.populationByAge, "male");
  const ethnicityFemale = sumIfComplete(data.populationByEthnicity, "female");
  const ethnicityMale = sumIfComplete(data.populationByEthnicity, "male");
  const religionFemale = sumIfComplete(data.populationByReligion, "female");
  const religionMale = sumIfComplete(data.populationByReligion, "male");

  // Only compare once every table involved is fully filled in — while cells are still blank the
  // per-field "required" errors already tell the officer what to do first, and comparing
  // half-finished totals would just be noise on top of that.
  if (
    ageFemale === null || ethnicityFemale === null || religionFemale === null ||
    ageMale === null || ethnicityMale === null || religionMale === null
  ) {
    return;
  }

  const femaleMatches = ageFemale === ethnicityFemale && ageFemale === religionFemale;
  const maleMatches = ageMale === ethnicityMale && ageMale === religionMale;
  if (femaleMatches && maleMatches) return;

  const message =
    `${POPULATION_MISMATCH_ERROR_PREFIX} the total population count must match across Age, Ethnicity, ` +
    `and Religion breakdowns. Female totals — Age: ${ageFemale}, Ethnicity: ${ethnicityFemale}, Religion: ${religionFemale}. ` +
    `Male totals — Age: ${ageMale}, Ethnicity: ${ethnicityMale}, Religion: ${religionMale}. Please recheck your entries.`;
  // A single issue on a synthetic path (not `populationByEthnicity`/`populationByReligion`
  // themselves) — attaching to both real array fields made RepeatableTable's generic
  // array-level error banner render the identical paragraph twice, back-to-back, once under
  // each table. The entry page reads this key directly to render one bilingual banner instead
  // (this English text is just the fallback/API-facing message; see demographics/page.tsx).
  ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["populationTotalsMismatch"], message });
}

export const demographicsSchemaStrict = z
  .object({
    populationByAge: z.array(ageSexRowSchema).length(AGE_BANDS.length),
    populationByEthnicity: z.array(ethnicityRowSchema).length(ETHNICITIES.length),
    populationByReligion: z.array(religionRowSchema).length(RELIGIONS.length),
    foreignNationals: z.object({
      female: requiredCount("Female count is required"),
      male: requiredCount("Male count is required"),
    }),
    households: z.object({
      total: requiredCount("Total is required"),
      femaleHeaded: requiredCount("Female-headed count is required"),
      displaced: requiredCount("This count is required"),
    }),
    disabilities: z.array(disabilityRowSchema).length(DISABILITY_TYPES.length),
    registeredVoters: registeredVotersSchema,
  })
  .superRefine(requireMatchingPopulationTotals);

export type DemographicsData = z.infer<typeof demographicsSchemaStrict>;

/* Every count/text field here must be explicitly filled in — see requiredCount() above. The
 * partial schema reuses the exact same row/field schemas as strict, since every field in this
 * section is required (there are no genuinely-optional counts to relax); only the *array or
 * object container itself* stays optional, so a fresh submission that's never touched this
 * section yet doesn't force these to already exist. In practice buildEmptyValues() in the entry
 * page always seeds every row/object anyway (blank, not zero) — so once the page is opened,
 * every field must be filled in before the section saves — SectionForm blocks save until
 * validation passes. */
export const demographicsSchemaPartial = z
  .object({
    populationByAge: z.array(ageSexRowSchema).optional(),
    populationByEthnicity: z.array(ethnicityRowSchema).optional(),
    populationByReligion: z.array(religionRowSchema).optional(),
    foreignNationals: z
      .object({
        female: requiredCount("Female count is required"),
        male: requiredCount("Male count is required"),
      })
      .optional(),
    households: z
      .object({
        total: requiredCount("Total is required"),
        femaleHeaded: requiredCount("Female-headed count is required"),
        displaced: requiredCount("This count is required"),
      })
      .optional(),
    disabilities: z.array(disabilityRowSchema).optional(),
    registeredVoters: registeredVotersSchema.optional(),
  })
  .superRefine(requireMatchingPopulationTotals);

export { AGE_BANDS, ETHNICITIES, RELIGIONS, DISABILITY_TYPES };
