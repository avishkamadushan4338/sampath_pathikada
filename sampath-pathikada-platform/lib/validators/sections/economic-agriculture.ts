import { z } from "zod";
import { nameAddressPhoneRowSchema, yesNo } from "@/lib/validators/common";

/* ── §9 ආර්ථික - කෘෂිකාර්මික/කාර්මික — Economic: Agriculture / Industry ───── */

const INDUSTRY_SIZES = ["household", "small", "large"] as const;

export const landUseRowSchema = z.object({
  landType: z.string().min(1, "Land type is required"),
  extentHectares: z.coerce.number().min(0).default(0),
});

export const animalHusbandryDirectoryRowSchema = nameAddressPhoneRowSchema.extend({
  type: z.string().min(1, "Type is required"),
});

export const specialEconomicActivityRowSchema = z.object({
  activity: z.string().min(1, "Activity is required"),
  description: z.string().optional(),
  beneficiaries: z.string().optional(),
});

export const agriMachineryRowSchema = z.object({
  label: z.string().min(1),
  count: z.coerce.number().int().min(0).default(0),
});

export const forestDamageRowSchema = z.object({
  label: z.string().min(1),
  present: yesNo,
});

export const livestockFarmRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  animalType: z.string().min(1, "Animal type is required"),
  count: z.coerce.number().int().min(0).default(0),
});

export const industryRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  productType: z.string().min(1, "Product type is required"),
  employeeCount: z.coerce.number().int().min(0).default(0),
  size: z.enum(INDUSTRY_SIZES),
});

export const fishLandingSiteRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
});

export const saltProductionRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
});

export const teaEstateRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  extentHectares: z.coerce.number().min(0).default(0),
  ownership: z.string().min(1, "Ownership is required"),
});

export const economicAgricultureSchemaStrict = z.object({
  landUse: z.array(landUseRowSchema).default([]),
  animalHusbandryCounts: z.object({
    cattleFarming: z.coerce.number().int().min(0).default(0),
    beekeeping: z.coerce.number().int().min(0).default(0),
  }),
  animalHusbandryDirectory: z.array(animalHusbandryDirectoryRowSchema).default([]),
  specialEconomicActivities: z.array(specialEconomicActivityRowSchema).default([]),
  abandonedPaddyLand: z.object({
    extentHectares: z.coerce.number().min(0).default(0),
    canBeReactivatedExtent: z.coerce.number().min(0).default(0),
    reason: z.string().optional(),
    actionPlan: z.string().optional(),
  }),
  agriMachinery: z.array(agriMachineryRowSchema).default([]),
  forestDamage: z.array(forestDamageRowSchema).default([]),
  livestockFarms: z.array(livestockFarmRowSchema).default([]),
  industries: z.array(industryRowSchema).default([]),
  marineFisheries: z.object({
    householdCount: z.coerce.number().int().min(0).default(0),
    activeFishermenCount: z.coerce.number().int().min(0).default(0),
    societyCount: z.coerce.number().int().min(0).default(0),
  }),
  inlandFisheries: z.object({
    householdCount: z.coerce.number().int().min(0).default(0),
    activeFishermenCount: z.coerce.number().int().min(0).default(0),
    societyCount: z.coerce.number().int().min(0).default(0),
  }),
  fishLandingSites: z.array(fishLandingSiteRowSchema).default([]),
  saltProductionPresent: yesNo,
  saltProductionDirectory: z.array(saltProductionRowSchema).default([]),
  teaEstates: z.array(teaEstateRowSchema).default([]),
});

export type EconomicAgricultureData = z.infer<typeof economicAgricultureSchemaStrict>;

export const economicAgricultureSchemaPartial = z.object({
  landUse: z.array(landUseRowSchema.partial()).optional(),
  animalHusbandryCounts: z
    .object({
      cattleFarming: z.coerce.number().int().min(0).optional(),
      beekeeping: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  animalHusbandryDirectory: z.array(animalHusbandryDirectoryRowSchema.partial()).optional(),
  specialEconomicActivities: z.array(specialEconomicActivityRowSchema.partial()).optional(),
  abandonedPaddyLand: z
    .object({
      extentHectares: z.coerce.number().min(0).optional(),
      canBeReactivatedExtent: z.coerce.number().min(0).optional(),
      reason: z.string().optional(),
      actionPlan: z.string().optional(),
    })
    .optional(),
  agriMachinery: z.array(agriMachineryRowSchema.partial()).optional(),
  forestDamage: z.array(forestDamageRowSchema.partial()).optional(),
  livestockFarms: z.array(livestockFarmRowSchema.partial()).optional(),
  industries: z.array(industryRowSchema.partial()).optional(),
  marineFisheries: z
    .object({
      householdCount: z.coerce.number().int().min(0).optional(),
      activeFishermenCount: z.coerce.number().int().min(0).optional(),
      societyCount: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  inlandFisheries: z
    .object({
      householdCount: z.coerce.number().int().min(0).optional(),
      activeFishermenCount: z.coerce.number().int().min(0).optional(),
      societyCount: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  fishLandingSites: z.array(fishLandingSiteRowSchema.partial()).optional(),
  saltProductionPresent: yesNo.optional(),
  saltProductionDirectory: z.array(saltProductionRowSchema.partial()).optional(),
  teaEstates: z.array(teaEstateRowSchema.partial()).optional(),
});

export { INDUSTRY_SIZES };
