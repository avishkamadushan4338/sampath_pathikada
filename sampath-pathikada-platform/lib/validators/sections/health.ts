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

/* Draft-mode row schemas built from scratch rather than `.partial()` on the strict schemas
 * above: `.partial()` only allows a field to be *missing*, it doesn't relax `min(1)`, so a row
 * added via the "Add" button (whose fields start as "") would still fail validation and
 * silently block saving. */
const govtHospitalRowPartialSchema = z.object({
  name: z.string().optional(),
  type: z.enum(GOVT_HOSPITAL_TYPES).optional(),
});

const nameAddressHealthRowPartialSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
});

const primaryHealthcareUnitRowPartialSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
});

const traditionalPractitionerRowPartialSchema = z.object({
  name: z.string().optional(),
  specialty: z.string().optional(),
});

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
  govtHospitalsDirectory: z.array(govtHospitalRowPartialSchema).optional(),
  primaryHealthcareUnitsDirectory: z.array(primaryHealthcareUnitRowPartialSchema).optional(),
  privateHospitalsDirectory: z.array(nameAddressHealthRowPartialSchema).optional(),
  ayurvedicInstitutions: z.array(nameAddressHealthRowPartialSchema).optional(),
  specialistServiceCentersDirectory: z.array(nameAddressHealthRowPartialSchema).optional(),
  mohOfficesDirectory: z.array(nameAddressHealthRowPartialSchema).optional(),
  traditionalMedicineInstitutionsDirectory: z.array(nameAddressHealthRowPartialSchema).optional(),
  privateMedicalLabsDirectory: z.array(nameAddressHealthRowPartialSchema).optional(),
  animalClinicsDirectory: z.array(nameAddressHealthRowPartialSchema).optional(),
  traditionalPractitioners: z.array(traditionalPractitionerRowPartialSchema).optional(),
});

export { GOVT_HOSPITAL_TYPES };
