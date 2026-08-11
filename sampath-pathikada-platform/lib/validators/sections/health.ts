import { z } from "zod";

/* ── §8 සෞඛ්‍යය — Health ──────────────────────────────────────────────────── */

const GOVT_HOSPITAL_TYPES = ["teaching", "base", "primary", "divisional"] as const;

export const govtHospitalRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(GOVT_HOSPITAL_TYPES),
});

export const nameAddressHealthRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
});

export const primaryHealthcareUnitRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().optional(),
});

export const traditionalPractitionerRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  specialty: z.string().min(1, "Specialty is required"),
});

export const healthSchemaStrict = z.object({
  institutionCounts: z.object({
    govtHospitals: z.coerce.number().int().min(0).default(0),
    primaryHealthcareUnits: z.coerce.number().int().min(0).default(0),
    privateHospitals: z.coerce.number().int().min(0).default(0),
    ayurvedicHospitals: z.coerce.number().int().min(0).default(0),
    specialistServiceCenters: z.coerce.number().int().min(0).default(0),
    mohOfficesOrCommunityHealthCenters: z.coerce.number().int().min(0).default(0),
    privateMedicalLabs: z.coerce.number().int().min(0).default(0),
    traditionalMedicineRegisteredInstitutions: z.coerce.number().int().min(0).default(0),
    animalClinicCenters: z.coerce.number().int().min(0).default(0),
    govtPharmacies: z.coerce.number().int().min(0).default(0),
    privatePharmacies: z.coerce.number().int().min(0).default(0),
  }),
  govtHospitalsDirectory: z.array(govtHospitalRowSchema).default([]),
  primaryHealthcareUnitsDirectory: z.array(primaryHealthcareUnitRowSchema).default([]),
  privateHospitalsDirectory: z.array(nameAddressHealthRowSchema).default([]),
  ayurvedicInstitutions: z.array(nameAddressHealthRowSchema).default([]),
  specialistServiceCentersDirectory: z.array(nameAddressHealthRowSchema).default([]),
  mohOfficesDirectory: z.array(nameAddressHealthRowSchema).default([]),
  traditionalMedicineInstitutionsDirectory: z.array(nameAddressHealthRowSchema).default([]),
  privateMedicalLabsDirectory: z.array(nameAddressHealthRowSchema).default([]),
  animalClinicsDirectory: z.array(nameAddressHealthRowSchema).default([]),
  traditionalPractitioners: z.array(traditionalPractitionerRowSchema).default([]),
});

export type HealthData = z.infer<typeof healthSchemaStrict>;

/* Draft-mode reuses the strict row schemas directly — a row's required fields (e.g. `name`)
 * still fail validation if blank, surfacing a "required" error in the UI, but that no longer
 * blocks saving: SectionForm always saves the draft regardless of validation outcome, it just
 * shows the errors alongside. Only the *array itself* is optional here, so an empty/untouched
 * directory (no rows added yet) is still a valid draft. */
export const healthSchemaPartial = z.object({
  institutionCounts: z
    .object({
      govtHospitals: z.coerce.number().int().min(0).optional(),
      primaryHealthcareUnits: z.coerce.number().int().min(0).optional(),
      privateHospitals: z.coerce.number().int().min(0).optional(),
      ayurvedicHospitals: z.coerce.number().int().min(0).optional(),
      specialistServiceCenters: z.coerce.number().int().min(0).optional(),
      mohOfficesOrCommunityHealthCenters: z.coerce.number().int().min(0).optional(),
      privateMedicalLabs: z.coerce.number().int().min(0).optional(),
      traditionalMedicineRegisteredInstitutions: z.coerce.number().int().min(0).optional(),
      animalClinicCenters: z.coerce.number().int().min(0).optional(),
      govtPharmacies: z.coerce.number().int().min(0).optional(),
      privatePharmacies: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  govtHospitalsDirectory: z.array(govtHospitalRowSchema).optional(),
  primaryHealthcareUnitsDirectory: z.array(primaryHealthcareUnitRowSchema).optional(),
  privateHospitalsDirectory: z.array(nameAddressHealthRowSchema).optional(),
  ayurvedicInstitutions: z.array(nameAddressHealthRowSchema).optional(),
  specialistServiceCentersDirectory: z.array(nameAddressHealthRowSchema).optional(),
  mohOfficesDirectory: z.array(nameAddressHealthRowSchema).optional(),
  traditionalMedicineInstitutionsDirectory: z.array(nameAddressHealthRowSchema).optional(),
  privateMedicalLabsDirectory: z.array(nameAddressHealthRowSchema).optional(),
  animalClinicsDirectory: z.array(nameAddressHealthRowSchema).optional(),
  traditionalPractitioners: z.array(traditionalPractitionerRowSchema).optional(),
});

export { GOVT_HOSPITAL_TYPES };
