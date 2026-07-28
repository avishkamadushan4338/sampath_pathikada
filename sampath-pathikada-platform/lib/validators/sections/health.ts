import { z } from "zod";

/* ── §8 සෞඛ්‍යය — Health ──────────────────────────────────────────────────── */

const GOVT_HOSPITAL_TYPES = ["teaching", "base", "divisional", "primary"] as const;

export const govtHospitalRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
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
  address: z.string().min(1, "Address is required"),
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
  govtHospitalsDirectory: z.array(govtHospitalRowSchema.partial()).optional(),
  primaryHealthcareUnitsDirectory: z.array(primaryHealthcareUnitRowSchema.partial()).optional(),
  privateHospitalsDirectory: z.array(nameAddressHealthRowSchema.partial()).optional(),
  ayurvedicInstitutions: z.array(nameAddressHealthRowSchema.partial()).optional(),
  specialistServiceCentersDirectory: z.array(nameAddressHealthRowSchema.partial()).optional(),
  mohOfficesDirectory: z.array(nameAddressHealthRowSchema.partial()).optional(),
  traditionalMedicineInstitutionsDirectory: z.array(nameAddressHealthRowSchema.partial()).optional(),
  privateMedicalLabsDirectory: z.array(nameAddressHealthRowSchema.partial()).optional(),
  animalClinicsDirectory: z.array(nameAddressHealthRowSchema.partial()).optional(),
  traditionalPractitioners: z.array(traditionalPractitionerRowSchema.partial()).optional(),
});

export { GOVT_HOSPITAL_TYPES };
