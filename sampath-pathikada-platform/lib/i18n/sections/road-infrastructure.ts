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
      en: "Public Facilities Related to Transport Located Within the GN Division",
      si: "ග්‍රාම නිලධාරී වසම තුල පිහිටි ප්‍රවාහනය සම්බන්ධ පොදු පහසුකම්",
    },
    roadDevelopmentNeeds: {
      en: "Need for Roads That Should Be Developed (By Priority)",
      si: "සංවර්ධනය කලයුතු මාර්ග පිළිබඳ අවශ්‍යතාවය (ප්‍රමුඛතාවය අනුව)",
      helpEn:
        "* Road surface (1. Carpet 2. Tar 3. Concrete 4. Interlock 5. Gravel/Soil). ** Municipal / Urban / Pradeshiya Sabha / Rural.",
      helpSi: "*මාර්ගයේ ස්වභාවය (1-කාපට් 2-තාර 3-කොන්ක්‍රීට් 4- interlock 5- බොරළු/ පස්) **මාසඅ/ප්‍රාමාසඅ/ප්‍රාදේශිය සභා/ග්‍රාමීය",
    },
    bridgeRepairs: {
      en: "Details of Bridges / Culverts / Footpaths in Dilapidated Condition (By Priority)",
      si: "අබලන් තත්ත්වයේ පවතින පාලම්/ බෝක්කු/පැතිබැමි පිළිබඳ විස්තර (ප්‍රමුඛතාවය අනුව)",
      helpEn: "** Municipal / Urban / Pradeshiya Sabha / Rural.",
      helpSi: "**මාසඅ/ප්‍රාමාසඅ/ප්‍රාදේශිය සභා/ග්‍රාමීය",
    },
    newRoadBridgeNeeds: { en: "Need for New Bridges / Culverts (By Priority)", si: "නව පාලම් බෝක්කු අවශ්‍යතාවය (ප්‍රමුඛතාවය අනුව)" },
    noPublicTransportAreas: {
      en: "Roads That Need but Lack a Public Transport System",
      si: "පොදු ප්‍රවාහන ක්‍රමයක් අවශ්‍ය එහෙත් නොමැති මාර්ග",
    },
    railwayCrossingGaps: {
      en: "Locations at Railway Crossings Lacking Protective Railway Gates",
      si: "දුම්රිය හරස් මාර්ගයන්හි ආරක්ෂිත දුම්රිය ගේට්ටු නොමැති ස්ථාන",
    },
    postOffices: {
      en: "Details of Post Offices / Sub Post Offices / (Postal Boxes and Counters)",
      si: "තැපැල් කාර්යාල /උප තැපැල් කාර්යාල/ (තැපැල් කණු හා පෙට්ටි) පිළිබඳ විස්තර",
      helpEn:
        "* Head Post Office-1, 1st Grade Sub Post Office-2, 2nd Grade Sub Post Office-3, Sub Post Office-4, Appointed Post Office-5, Postal Box & Counter.",
      helpSi:
        "*අධීශ්‍රේණියේ තැපැල් කාර්යාල -1, පළමු පෙළ තැපැල් කාර්යාල -2, දෙවන පෙළ තැපැල් කාර්යාල -3, උප තැපැල් කාර්යාල-4, නියෝජිත තැපැල් කාර්යාල-5, තැපැල් කණු හා පෙට්ටි)",
    },
    fuelDistributionStations: { en: "Details of Fuel Filling Stations", si: "ඉන්ධන පිරවුම්හල් පිළිබඳ විස්තර" },
    solarPowerPlants: { en: "Solar Power Plants", si: "සූර්ය විදුලි බලාගාර" },
    windPowerPlants: { en: "Wind Power Plants", si: "සුළං විදුලි බලාගාර" },
    hydropowerPlants: { en: "Hydropower Plants", si: "ජල විදුලි බලාගාර" },
    financialInstitutions: {
      en: "Banks / Financial Institutions / Insurance Institutions",
      si: "බැංකු හා මූල්‍ය ආයතන /රක්ෂණ ආයතන",
      helpEn: "* Government Bank, Private Bank, Cooperative Rural Bank, Samurdhi Bank.",
      helpSi: "*රාජ්‍ය බැංකු ,පෞද්ගලික බැංකු , සමූපකාර ග්‍රාමීය බැංකු, සමෘද්ධි බැංකු",
    },
    serviceEstablishments: { en: "Service Establishments", si: "සේවා ආයතන" },
    industrialEstates: { en: "Industrial Estates", si: "කාර්මික උද්‍යාන" },
    waterReservoirs: { en: "Water Reservoirs / Tanks", si: "ජල ගබඩා / වැව්" },
    publicFacilityCategories: {
      en: "Public Facilities Present Within the GN Division",
      si: "ග්‍රාම නිලධාරී වසම තුල ඇති පොදු පහසුකම්",
    },
    licensedLiquorShopsPresent: { en: "Are There Taverns in the Division?", si: "වසම තුළ තැබෑරුම් පිහිටා තිබේද?" },
    licensedLiquorShops: { en: "Licensed Taverns / Bars", si: "බලපත්‍රලාභී තැබෑරුම්/ බාර් සංඛ්‍යාව" },
  },
  rows: {
    roadName: { en: "Road Name", si: "මාර්ගයේ නම" },
    roadNumber: { en: "Road Number", si: "මාර්ග අංකය" },
    lengthMeters: { en: "Length (m)", si: "දිග ප්‍රමාණය (m)" },
    surfaceType: { en: "* Current Road Surface", si: "*දැනට මාර්ගයේ ස්වභාවය" },
    maintainingAuthority: { en: "** Maintaining Authority", si: "**නඩත්තු කරනු ලබන ආයතනය" },
    location: { en: "Location", si: "ස්ථානය" },
    justification: { en: "Describe the Need", si: "අවශ්‍යතාවය විස්තර කරන්න" },
    startPoint: { en: "Start Point", si: "ආරම්භක ස්ථානය" },
    endPoint: { en: "End Point", si: "අවසන් ස්ථානය" },
    distanceKm: { en: "Distance", si: "දුර ප්‍රමාණය" },
    requiredBeneficiaryCount: { en: "Beneficiaries Needing Service", si: "සේවාව අවශ්‍ය ප්‍රතිලාභීසංඛ්‍යාව" },
    name: { en: "Name", si: "නම" },
    scale: { en: "Scale", si: "ධාරිතාව" },
    present: { en: "Present", si: "ඇත/නැත" },
    distanceToNearestIfOutsideDivision: {
      en: "Distance to Nearest (if not located within the division)",
      si: "වසම තුල පිහිටා නැත නම් ආසන්නතම ස්ථානයන්ට ඇති දුර",
    },
    address: { en: "Address", si: "ලිපිනය" },
    // Compound overrides — same generic key means something different in each array/object.
    "roadDevelopmentNeeds.roadNumber": { en: "Road Number (if any)", si: "මාර්ග අංකය (තිබෙනම්)" },
    "railwayCrossingGaps.roadName": {
      en: "Road Name at the Railway Crossing",
      si: "දුම්රිය මාර්ගය හරස්ව පිහිටි මාර්ගයේ නම",
    },
    "bridgeRepairs.name": { en: "Bridge / Culvert / Footpath", si: "පාලම/බෝක්කුව/පැතිබැම්" },
    "bridgeRepairs.location": { en: "Location (Describe)", si: "පිහිටීම (විස්තර කරන්න)" },
    "newRoadBridgeNeeds.location": { en: "Required Location", si: "අවශ්‍ය ස්ථානය" },
    "postOffices.type": { en: "Type", si: "වර්ගය" },
    "fuelDistributionStations.name": { en: "Filling Station Name", si: "පිරවුම්හලේ නම" },
    "financialInstitutions.name": {
      en: "Bank / Financial Institution / Insurance Institution Name",
      si: "බැංකුවේ/ මූල්‍ය ආයතනයේ /රක්ෂණ ආයතනයේ නම",
    },
    "financialInstitutions.type": { en: "Government / Private", si: "රාජ්‍ය/ පෞද්ගලික" },
    "serviceEstablishments.categoryLabel": { en: "Category", si: "වර්ගය" },
    "serviceEstablishments.count": { en: "Number of Trade Institutions", si: "වෙළඳ ආයතන සංඛ්‍යාව" },
    "publicFacilityCategories.categoryLabel": { en: "Type", si: "වර්ගය" },
    "publicFacilityCategories.count": { en: "Count", si: "සංඛ්‍යාව" },
    "publicFacilities.typeLabel": { en: "Type", si: "වර්ගය" },
    "publicFacilities.present": { en: "Present?", si: "ඇත/ නැත" },
    "publicFacilities.name": { en: "Location Name", si: "ස්ථානයේ නම" },
    "licensedLiquorShops.name": { en: "Licensed Tavern / Bar Name", si: "බලපත්‍රලාභී තැබෑරුම් /බාර් නම" },
  },
};
