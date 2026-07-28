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
      en: "Institution Counts",
      si: "ආයතන ගණන්",
    },
    govtHospitalsDirectory: {
      en: "Government Hospitals Directory",
      si: "රාජ්‍ය රෝහල් නාමාවලිය",
    },
    primaryHealthcareUnitsDirectory: {
      en: "Primary Healthcare Units Directory",
      si: "ප්‍රාථමික සෞඛ්‍ය සේවා ඒකක නාමාවලිය",
    },
    privateHospitalsDirectory: {
      en: "Private Hospitals Directory",
      si: "පෞද්ගලික රෝහල් නාමාවලිය",
    },
    ayurvedicInstitutions: {
      en: "Ayurvedic Institutions",
      si: "ආයුර්වේද ආයතන",
    },
    specialistServiceCentersDirectory: {
      en: "Specialist Medical Service Centers Directory",
      si: "විශේෂඥ වෛද්‍ය සේවා මධ්‍යස්ථාන නාමාවලිය",
    },
    mohOfficesDirectory: {
      en: "MOH Offices / Community Health Stations Directory",
      si: "සෞඛ්‍ය වෛද්‍ය නිලධාරි කාර්යාල / ග්‍රාමෝදය සෞඛ්‍ය මධ්‍යස්ථාන නාමාවලිය",
    },
    traditionalMedicineInstitutionsDirectory: {
      en: "Traditional Sinhala Medicine Registered Institutions Directory",
      si: "පාරම්පරික සිංහල වෙදකම සිදු කරන ලියාපදිංචි ආයතන නාමාවලිය",
    },
    privateMedicalLabsDirectory: {
      en: "Private Medical Labs Directory",
      si: "පෞද්ගලික වෛද්‍ය රසායනාගාර නාමාවලිය",
    },
    animalClinicsDirectory: {
      en: "Animal / Veterinary Clinic Centers Directory",
      si: "සත්ත්ව සායන මධ්‍යස්ථාන නාමාවලිය",
    },
    traditionalPractitioners: {
      en: "Traditional Medicine Practitioners",
      si: "දේශීය වෛද්‍ය ප්‍රාවීණයන්",
    },
  },
};
