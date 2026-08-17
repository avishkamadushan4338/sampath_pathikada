import type { SectionDictionary } from "@/lib/i18n/types";
import type { HealthData } from "@/lib/validators/sections/health";

export const healthDict: SectionDictionary<keyof HealthData & string> = {
  title: { en: "Health", si: "සෞඛ්‍යය" },
  description: {
    en: "Health institutions, hospitals, and medical practitioners serving the division.",
    si: "වසමට සේවය සපයන සෞඛ්‍ය ආයතන, රෝහල් සහ වෛද්‍ය වෘත්තිකයන් පිළිබඳ තොරතුරු.",
  },
  fields: {
    institutionCounts: {
      en: "Health Institutions in the GN Division",
      si: "ග්‍රාම නිලධාරී වසම තුළ පිහිටා ඇති සෞඛ්‍ය ආයතන",
    },
    govtHospitalsDirectory: {
      en: "Names and Addresses of Government Hospitals in the Division",
      si: "කොට්ඨාසයේ ඇති රජයේ රෝහල්වල නම හා ලිපිනය",
      helpEn: "(Teaching Hospital-1, Base Hospital-2, Primary Hospital-3, Divisional Hospital-4)",
      helpSi: "(ශික්ෂණ රෝහල්-1 ,මහරෝහල්-2 ,මූලික රෝහල් -3 ,ප්‍රාදේශිය රෝහල්-4)",
    },
    primaryHealthcareUnitsDirectory: {
      en: "Primary Healthcare Units (Central Dispensary - Western) / Maternity Homes",
      si: "ප්‍රාථමික සෞඛ්‍ය සත්කාර ඒකක-( මධ්‍යම බෙහෙත් ශාලා- බටහිර )/මාතෘ නිවාස",
    },
    privateHospitalsDirectory: {
      en: "Names and Addresses of Private Hospitals in the Division",
      si: "කොට්ඨාසයේ ඇති පෞද්ගලික රෝහල්වල නම හා ලිපිනය",
    },
    ayurvedicInstitutions: {
      en: "Ayurvedic Hospitals / Ayurvedic Central Dispensaries",
      si: "ආයුර්වේද රෝහල් /ආයුර්වේද මධ්‍යම බෙහෙත් ශාලා",
    },
    specialistServiceCentersDirectory: {
      en: "Institutions Providing Specialist Medical Services (Wellness Centers)",
      si: "විශේෂඥ වෛද්‍ය සේවා ලබාගතහැකි ආයතන සංඛ්‍යාව (චැනලින් සෙන්ටර්)",
    },
    mohOfficesDirectory: {
      en: "MOH Offices / Village Health Centers",
      si: "සෞඛ්‍ය වෛද්‍ය නිලධාරි කාර්යාල/ ග්‍රාමෝදය සෞඛ්‍ය මධ්‍යස්ථාන",
    },
    traditionalMedicineInstitutionsDirectory: {
      en: "Registered Institutions Practicing Traditional Sinhala Medicine",
      si: "පාරම්පරික සිංහල වෙදකම සිදු කරන ලියාපදිංචි ආයතන",
    },
    privateMedicalLabsDirectory: {
      en: "Private Medical Clinic Centers",
      si: "පෞද්ගලික වෛද්‍ය සායන මධ්‍යස්ථාන",
    },
    animalClinicsDirectory: {
      en: "Animal Clinic Centers",
      si: "සත්ත්ව සායන මධ්‍යස්ථාන",
    },
    traditionalPractitioners: {
      en: "Details of Practitioners of Traditional Sinhala Medicine",
      si: "පාරම්පරික සිංහල වෙදකම සිදු කරන වෛද්‍යවරුන්ගේ විස්තර",
      helpEn: "* e.g. snake venom, fractures, paralysis, chronic diseases, eye diseases.",
      helpSi: "*-සර්ප විෂ  -කැඩුම් බිදුම් -අංශභාග -නිදන්ගත රෝග-අක්ෂි රෝග",
    },
  },
  rows: {
    // institutionCounts nested object.
    govtHospitals: { en: "Number of Government Hospitals", si: "රජයේ රෝහල් සංඛ්‍යාව" },
    primaryHealthcareUnits: {
      en: "Primary Healthcare Units (Central Dispensary - Western) / Maternity Homes",
      si: "ප්‍රාථමික සෞඛ්‍ය සත්කාර ඒකක-( මධ්‍යම බෙහෙත් ශාලා- බටහිර )/මාතෘ නිවාස",
    },
    privateHospitals: {
      en: "Number of Private Hospitals (with Residential Facilities)",
      si: "පෞද්ගලික රෝහල් සංඛ්‍යාව (නේවාසික පහසුකම් සහිත)",
    },
    ayurvedicHospitals: {
      en: "Number of Ayurvedic Hospitals / Ayurvedic Central Dispensaries",
      si: "ආයුර්වේද රෝහල් /ආයුර්වේද මධ්‍යම බෙහෙත් ශාලා සංඛ්‍යාව",
    },
    specialistServiceCenters: {
      en: "Number of Institutions Providing Specialist Medical Services (Wellness Center)",
      si: "විශේෂඥ වෛද්‍ය සේවා ලබාගතහැකි ආයතන සංඛ්‍යාව (චැනලින් සෙන්ටර්)",
    },
    mohOfficesOrCommunityHealthCenters: {
      en: "MOH Offices / Village Health Centers",
      si: "සෞඛ්‍ය වෛද්‍ය නිලධාරි කාර්යාල/ ග්‍රාමෝදය සෞඛ්‍ය මධ්‍යස්ථාන",
    },
    traditionalMedicineRegisteredInstitutions: {
      en: "Registered Institutions Practicing Traditional Sinhala Medicine",
      si: "පාරම්පරික සිංහල වෙදකම සිදු කරන ලියාපදිංචි ආයතන",
    },
    privateMedicalLabs: { en: "Private Medical Clinic Centers", si: "පෞද්ගලික වෛද්‍ය සායන මධ්‍යස්ථාන" },
    animalClinicCenters: { en: "Animal Clinic Centers", si: "සත්ත්ව සායන මධ්‍යස්ථාන" },
    govtPharmacies: { en: "Government Pharmacies", si: "රාජ්‍ය ඖෂධශල" },
    privatePharmacies: { en: "Private Pharmacies", si: "පෞද්ගලික ෆාමසි" },
    // Shared across the several directories that reuse `nameAddressColumns`.
    name: { en: "Name of Institution", si: "ආයතනයේ නම" },
    address: { en: "Address", si: "ලිපිනය" },
    specialty: { en: "Field of Practice", si: "කටයුතු කරන වෛද්‍ය ක්ෂේත්‍රය" },
    // Compound overrides — "name"/"type" mean something different in these specific directories.
    "govtHospitalsDirectory.name": { en: "Government Hospital Name", si: "රජයේ රෝහලේ නම" },
    "govtHospitalsDirectory.type": { en: "Hospital Type", si: "රෝහල් වර්ගය" },
    "primaryHealthcareUnitsDirectory.name": {
      en: "Primary Healthcare Unit Name (Central Dispensary - Western) / Maternity Home",
      si: "ප්‍රාථමික සෞඛ්‍ය සත්කාර ඒකකයේ නම -( මධ්‍යම බෙහෙත් ශාලා- බටහිර )/මාතෘ නිවාස)",
    },
    "primaryHealthcareUnitsDirectory.type": { en: "* Type", si: "*වර්ගය" },
    "privateHospitalsDirectory.name": { en: "Private Hospital Name", si: "පෞද්ගලික රෝහලේ නම" },
    "traditionalPractitioners.name": {
      en: "Practitioner Name",
      si: "පාරම්පරික සිංහල වෙදකම සිදු කරන වෛද්‍යවරුන්ගේ නම",
    },
  },
};
