import type { SectionDictionary } from "@/lib/i18n/types";
import type { RoadInfrastructureData } from "@/lib/validators/sections/road-infrastructure";

export const roadInfrastructureDict: SectionDictionary<keyof RoadInfrastructureData & string> = {
  title: { en: "Transport & Infrastructure Facilities", si: "ප්‍රවාහන හා යටිතල පහසුකම්" },
  description: {
    en: "Roads, bridges, public transport gaps, utilities, and other infrastructure facilities within the GN division.",
    si: "ග්‍රාම නිලධාරී වසම තුළ පාරවල්, පාලම්, මහජන ප්‍රවාහන හිඩැස්, උපයෝගිතා සේවා සහ අනෙකුත් යටිතල පහසුකම්.",
  },
  fields: {
    publicFacilities: {
      en: "Common Public Facilities (Bus Stand / Railway Station / Jetty / Airport)",
      si: "පොදු මහජන පහසුකම් (බස් නැවතුම්පොළ / දුම්රිය ස්ථානය / පොකුණුතොට / ගුවන්තොටුපොළ)",
    },
    roadDevelopmentNeeds: { en: "Road Development Needs", si: "පාර සංවර්ධන අවශ්‍යතා" },
    bridgeRepairs: { en: "Bridges Requiring Repair", si: "අලුත්වැඩියා කළ යුතු පාලම්" },
    newRoadBridgeNeeds: { en: "New Road / Bridge Needs", si: "නව පාර/පාලම් අවශ්‍යතා" },
    noPublicTransportAreas: {
      en: "Areas Without Public Transport",
      si: "මහජන ප්‍රවාහන පහසුකම් නොමැති ප්‍රදේශ",
    },
    railwayCrossingGaps: {
      en: "Railway Crossing Gaps",
      si: "දුම්රිය මාර්ග තරණ ස්ථාන හිඩැස්",
    },
    electricitySubstations: { en: "Electricity Substations", si: "විදුලි උප මධ්‍යස්ථාන" },
    fuelDistributionStations: { en: "Fuel Distribution Stations", si: "ඉන්ධන බෙදාහැරීමේ මධ්‍යස්ථාන" },
    hydropowerPlants: { en: "Hydropower Plants", si: "ජල විදුලි බලාගාර" },
    financialInstitutions: { en: "Financial Institutions", si: "මූල්‍ය ආයතන" },
    serviceEstablishments: { en: "Service Establishments", si: "සේවා ආයතන" },
    industrialEstates: { en: "Industrial Estates", si: "කාර්මික උද්‍යාන" },
    waterReservoirs: { en: "Water Reservoirs / Tanks", si: "ජල ගබඩා / වැව්" },
    publicFacilityCategories: { en: "Other Public Facility Categories", si: "අනෙකුත් පොදු පහසුකම් වර්ග" },
    notableClubsAndBars: { en: "Notable Clubs and Bars", si: "සුවිශේෂී සමාජ ශාලා සහ බාර්" },
  },
};
