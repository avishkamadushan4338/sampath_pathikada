import { z } from "zod";
import { nameAddressRowSchema, nameAddressPhoneRowSchema, yesNo } from "@/lib/validators/common";

/* ── §9 ආර්ථික - කෘෂිකාර්මික/කාර්මික — Economic: Agriculture / Industry ───── */

const LAND_USE_TYPES = [
  "forest",
  "paddy-cultivation",
  "abandoned-paddy",
  "agri-land-tea",
  "agri-land-coconut",
  "agri-land-rubber",
  "cinnamon",
  "pepper",
  "coffee",
  "vegetables",
  "fruits",
  "tuber-crops",
  "supplementary-food-crops",
  "inland-reservoirs",
  "roads-sports-homegardens",
  "scrub-chena-barren",
  "ornamental-nurseries",
  "plantation-crop-nurseries",
  "aquaculture-land",
] as const;

const FLORAL_CULTIVATION_TYPES = ["floor-flower-cultivation", "greenhouse-cultivation", "beekeeping"] as const;

const MARKETPLACES = ["local", "national", "international"] as const;

const AGRI_MACHINERY_TYPES = [
  "two-wheel-tractor",
  "two-wheel-tractor-rotavator",
  "two-wheel-tractor-mouldboard-plough",
  "four-wheel-tractor",
  "four-wheel-tractor-rotavator",
  "four-wheel-tractor-disc-plough",
  "water-pump",
  "transplanter",
  "weeder",
  "harvester",
  "power-sprayer",
  "sprinkler-irrigation",
  "water-spraying-equipment",
  "grass-cutter",
  "food-processing-equipment",
  "paddy-dryer-parboiling",
  "paddy-miller",
  "chena-planting-equipment",
  "paddy-winnower",
  "oil-mill",
  "rubber-mill",
  "paddy-mill",
  "other",
] as const;

const CROP_DAMAGE_TYPES = [
  "elephant-conflict",
  "wildlife-damage",
  "peacock-damage",
  "flood-damage",
  "drought",
  "pest-disease",
  "other",
] as const;

const TEA_ESTATE_OWNERSHIP = ["govt", "private-company", "private"] as const;
const FISH_SITE_TYPES = ["landing-site", "harbor"] as const;
const WATER_TYPES = ["marine", "inland"] as const;
const INLAND_WATER_BODY_TYPES = ["perennial", "seasonal"] as const;

export const landUseRowSchema = z.object({
  landType: z.enum(LAND_USE_TYPES),
  extentHectares: z.coerce.number().min(0).default(0),
});

export const animalHusbandryDirectoryRowSchema = nameAddressPhoneRowSchema.extend({
  type: z.enum(FLORAL_CULTIVATION_TYPES),
  marketplace: z.enum(MARKETPLACES).optional(),
});

export const specialEconomicActivityRowSchema = z.object({
  activity: z.string().min(1, "Activity is required"),
  natureOfActivity: z.string().optional(),
  resourceOrProductUsed: z.string().optional(),
});

export const agriMachineryRowSchema = z.object({
  type: z.enum(AGRI_MACHINERY_TYPES),
  count: z.coerce.number().int().min(0).default(0),
});

export const forestDamageRowSchema = z.object({
  type: z.enum(CROP_DAMAGE_TYPES),
  present: yesNo,
});

export const livestockFarmRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().optional(),
  cattle: z.coerce.number().int().min(0).default(0),
  layerChickens: z.coerce.number().int().min(0).default(0),
  broilerChickens: z.coerce.number().int().min(0).default(0),
  goats: z.coerce.number().int().min(0).default(0),
  pigs: z.coerce.number().int().min(0).default(0),
  peacock: z.coerce.number().int().min(0).default(0),
  other: z.coerce.number().int().min(0).default(0),
});

export const industryRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  productionType: z.string().min(1, "Production type is required"),
  employeeCount: z.coerce.number().int().min(0).default(0),
  phone: z.string().optional(),
  marketplace: z.enum(MARKETPLACES).optional(),
});

export const fishLandingSiteRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  siteType: z.enum(FISH_SITE_TYPES),
  waterType: z.enum(WATER_TYPES),
});

export const fisheriesSocietyRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  memberCount: z.coerce.number().int().min(0).default(0),
});

export const inlandWaterBodyRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(INLAND_WATER_BODY_TYPES),
});

export const iceProductionRowSchema = nameAddressRowSchema;

export const teaEstateRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ownership: z.enum(TEA_ESTATE_OWNERSHIP),
  extentAcres: z.coerce.number().min(0).default(0),
  employeesFemale: z.coerce.number().int().min(0).default(0),
  employeesMale: z.coerce.number().int().min(0).default(0),
});

export const economicAgricultureSchemaStrict = z.object({
  landUse: z.array(landUseRowSchema).length(LAND_USE_TYPES.length),
  animalHusbandryCounts: z.array(z.object({ type: z.enum(FLORAL_CULTIVATION_TYPES), count: z.coerce.number().int().min(0).default(0) })).length(
    FLORAL_CULTIVATION_TYPES.length
  ),
  animalHusbandryDirectory: z.array(animalHusbandryDirectoryRowSchema).default([]),
  specialEconomicActivities: z.array(specialEconomicActivityRowSchema).default([]),
  abandonedPaddyLand: z.object({
    extentAcres: z.coerce.number().min(0).default(0),
    canBeReactivatedExtent: z.coerce.number().min(0).default(0),
    reason: z.string().optional(),
    actionPlan: z.string().optional(),
  }),
  agriMachinery: z.array(agriMachineryRowSchema).length(AGRI_MACHINERY_TYPES.length),
  forestDamage: z.array(forestDamageRowSchema).length(CROP_DAMAGE_TYPES.length),
  livestockFarms: z.array(livestockFarmRowSchema).default([]),
  industryCounts: z.object({
    householdIndustry: z.coerce.number().int().min(0).default(0),
    under5Employees: z.coerce.number().int().min(0).default(0),
    over5Employees: z.coerce.number().int().min(0).default(0),
  }),
  industries: z.array(industryRowSchema).default([]),
  marineFisheries: z.object({
    householdCount: z.coerce.number().int().min(0).default(0),
    fishingPopulation: z.coerce.number().int().min(0).default(0),
    activeFishermenCount: z.coerce.number().int().min(0).default(0),
    societyCount: z.coerce.number().int().min(0).default(0),
  }),
  marineFisheriesSocieties: z.array(fisheriesSocietyRowSchema).default([]),
  inlandFisheries: z.object({
    householdCount: z.coerce.number().int().min(0).default(0),
    fishingPopulation: z.coerce.number().int().min(0).default(0),
    activeFishermenCount: z.coerce.number().int().min(0).default(0),
    societyCount: z.coerce.number().int().min(0).default(0),
  }),
  inlandFisheriesSocieties: z.array(fisheriesSocietyRowSchema).default([]),
  inlandWaterBodies: z.array(inlandWaterBodyRowSchema).default([]),
  aquacultureDirectory: z.array(nameAddressPhoneRowSchema).default([]),
  ornamentalFishDirectory: z.array(nameAddressPhoneRowSchema).default([]),
  fishLandingSitePresent: yesNo,
  fishLandingSites: z.array(fishLandingSiteRowSchema).default([]),
  iceProductionPresent: yesNo,
  iceProductionDirectory: z.array(iceProductionRowSchema).default([]),
  teaEstates: z.array(teaEstateRowSchema).default([]),
});

export type EconomicAgricultureData = z.infer<typeof economicAgricultureSchemaStrict>;

export const economicAgricultureSchemaPartial = z.object({
  landUse: z.array(landUseRowSchema.partial()).optional(),
  animalHusbandryCounts: z.array(z.object({ type: z.enum(FLORAL_CULTIVATION_TYPES).optional(), count: z.coerce.number().int().min(0).optional() })).optional(),
  animalHusbandryDirectory: z.array(animalHusbandryDirectoryRowSchema.partial()).optional(),
  specialEconomicActivities: z.array(specialEconomicActivityRowSchema.partial()).optional(),
  abandonedPaddyLand: z
    .object({
      extentAcres: z.coerce.number().min(0).optional(),
      canBeReactivatedExtent: z.coerce.number().min(0).optional(),
      reason: z.string().optional(),
      actionPlan: z.string().optional(),
    })
    .optional(),
  agriMachinery: z.array(agriMachineryRowSchema.partial()).optional(),
  forestDamage: z.array(forestDamageRowSchema.partial()).optional(),
  livestockFarms: z.array(livestockFarmRowSchema.partial()).optional(),
  industryCounts: z
    .object({
      householdIndustry: z.coerce.number().int().min(0).optional(),
      under5Employees: z.coerce.number().int().min(0).optional(),
      over5Employees: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  industries: z.array(industryRowSchema.partial()).optional(),
  marineFisheries: z
    .object({
      householdCount: z.coerce.number().int().min(0).optional(),
      fishingPopulation: z.coerce.number().int().min(0).optional(),
      activeFishermenCount: z.coerce.number().int().min(0).optional(),
      societyCount: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  marineFisheriesSocieties: z.array(fisheriesSocietyRowSchema.partial()).optional(),
  inlandFisheries: z
    .object({
      householdCount: z.coerce.number().int().min(0).optional(),
      fishingPopulation: z.coerce.number().int().min(0).optional(),
      activeFishermenCount: z.coerce.number().int().min(0).optional(),
      societyCount: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  inlandFisheriesSocieties: z.array(fisheriesSocietyRowSchema.partial()).optional(),
  inlandWaterBodies: z.array(inlandWaterBodyRowSchema.partial()).optional(),
  aquacultureDirectory: z.array(nameAddressPhoneRowSchema.partial()).optional(),
  ornamentalFishDirectory: z.array(nameAddressPhoneRowSchema.partial()).optional(),
  fishLandingSitePresent: yesNo.optional(),
  fishLandingSites: z.array(fishLandingSiteRowSchema.partial()).optional(),
  iceProductionPresent: yesNo.optional(),
  iceProductionDirectory: z.array(iceProductionRowSchema.partial()).optional(),
  teaEstates: z.array(teaEstateRowSchema.partial()).optional(),
});

export {
  LAND_USE_TYPES,
  FLORAL_CULTIVATION_TYPES,
  MARKETPLACES,
  AGRI_MACHINERY_TYPES,
  CROP_DAMAGE_TYPES,
  TEA_ESTATE_OWNERSHIP,
  FISH_SITE_TYPES,
  WATER_TYPES,
  INLAND_WATER_BODY_TYPES,
};
