import type { SectionDictionary } from "@/lib/i18n/types";
import type { EducationData } from "@/lib/validators/sections/education";

export const educationDict: SectionDictionary<keyof EducationData & string> = {
  title: { en: "Education", si: "අධ්‍යාපනය" },
  description: {
    en: "Schools, preschools, tertiary institutions, and education-related facilities in the division.",
    si: "වසම තුළ පිහිටි පාසල්, පෙර පාසල්, තෘතීයික අධ්‍යාපන ආයතන සහ අධ්‍යාපන පහසුකම් පිළිබඳ තොරතුරු.",
  },
  fields: {
    institutionCounts: {
      en: "Distribution of Educational Institutions",
      si: "අධ්‍යාපනය ආයතන ව්‍යාප්තිය",
    },
    schoolCountsByType: {
      en: "Number of Schools",
      si: "පාසල් සංඛ්‍යාව",
    },
    schoolFacilities: {
      en: "Names of Schools in the Area and Facilities Currently Available",
      si: "ප්‍රදේශයේ පවතින පාසල්වල නම හා පාසල්වල දැනට තිබෙන පහසුකම්",
      helpEn: "* Indicate whether present or not.",
      helpSi: "*ඇත හා නැත යන බව දක්වන්න.",
    },
    specialAttentionSchools: {
      en: "Details of Units for Students with Special Needs at Schools with Such Units",
      si: "විශේෂ අවශ්‍යතා ඇති අය සඳහා පිහිටුවා ඇති ඒකක සහිත පාසල් වල ඒකකයේ විස්තර",
    },
    closedSchools: {
      en: "Information About Schools Closed Within the Last 5 Years",
      si: "පසුගිය වසර පහ ඇතුලත වැසීගිය පාසල් පිළිබඳ තොරතුරු",
    },
    privateInternationalSchools: {
      en: "Private Schools / International Schools",
      si: "පෞද්ගලික පාසල්/ජාත්‍යන්තර පාසල්",
    },
    pirivenas: {
      en: "Information About Pirivenas",
      si: "පිරිවෙන් පිළිබඳ තොරතුරු",
      helpEn: "* Pirivena types: Basic / Vidyartha / Maha / Dharmodaya.",
      helpSi: "* (පිරිවෙන් වර්ග - මූලික/විද්‍යාර්ථි/මහා/ධර්මෝදය)",
    },
    vocationalInstitutes: {
      en: "Information About Technical and Vocational Training Institutions",
      si: "කාර්මික හා වෘත්තීය පුහුණු ආයතන පිළිබඳ තොරතුරු",
    },
    preschools: {
      en: "Information About Preschools",
      si: "පෙර පාසැල් පිළිබඳ තොරතුරු",
    },
    dhammaEducationInstitutions: {
      en: "Institutions Providing Dhamma Education",
      si: "දහම් අධ්‍යාපනය ලබාදෙන ආයතන",
      helpEn: "* 1. Buddhist Dhamma School 2. Islamic Dhamma School 3. Hindu Dhamma School 4. Christian Dhamma School.",
      helpSi: "*1- බෞද්ධ දහම් පාසල් 2-ඉස්ලාම් දහම් පාසල් 3-හින්දු දහම් පාසල් 4-ක්‍රිස්තියානි දහම් පාසල්",
    },
    tertiaryInstitutions: {
      en: "Higher Education Institutions Within the GN Division",
      si: "ග්‍රා.නි.වසම තුළ පවතින උසස් අධ්‍යාපන ආයතන",
    },
    tuitionCenters: {
      en: "Information About Institutions Conducting Tuition Classes",
      si: "උපකාරක පන්ති පවත්වන ආයතන පිළිබඳ තොරතුරු",
    },
    outOfSchoolChildren: {
      en: "Number of Children of Mandatory School-Going Age Not Attending School",
      si: "අනිවාර්ය පාසැල් යායුතු වයසේ සිටින පාසැල් නොයන ළමුන් සංඛ්‍යාව",
    },
    childrenInProbationOrDetention: {
      en: "Number of Children in Probation Care or Imprisoned",
      si: "පරිවාසගත හෝ බන්ධනාගාරගත ළමුන් සංඛ්‍යාව",
    },
  },
  rows: {
    schoolName: { en: "School Name", si: "පාසලේ නම" },
    teachersFemale: { en: "Teachers (Female)", si: "ගුරුවරු ගණන - ස්ත්‍රී" },
    teachersMale: { en: "Teachers (Male)", si: "ගුරුවරු ගණන - පුරුෂ" },
    studentsFemale: { en: "Students (Female)", si: "සිසුන් ගණන - ස්ත්‍රී" },
    studentsMale: { en: "Students (Male)", si: "සිසුන් ගණන - පුරුෂ" },
    waterFacility: { en: "Water Facilities", si: "ජල පහසුකම්" },
    sanitationFacility: { en: "Toilet Facilities", si: "වැසිකිලි පහසුකම්" },
    sportsGround: { en: "Playground", si: "ක්‍රීඩාපිටි" },
    accommodationAvailable: { en: "Boarding Facilities", si: "නේවාසික පහසුකම්" },
    boardingFacility: { en: "Boarding Facilities", si: "නේවාසික පහසුකම්" },
    developmentNeeds: { en: "Development Needs", si: "සංවර්ධන අවශ්‍යතා" },
    yearClosed: { en: "Year Closed", si: "වැසීගිය වර්ෂය" },
    buildingCount: { en: "Existing Buildings", si: "පවතින ගොඩනැගිලි සංඛ්‍යාව" },
    buildingsUsable: {
      en: "Whether Buildings Can Currently Be Used",
      si: "ගොඩනැගිලි දැනට භාවිතා කලහැකි බව/නොහැකි බව",
    },
    teacherCount: { en: "Number of Teachers", si: "ගුරුවරු ගණන" },
    studentCount: { en: "Number of Students", si: "සිසුන් ගණන" },
    address: { en: "Address", si: "ලිපිනය" },
    facilityType: { en: "Private / Government", si: "පුද්ගලික/ රජයේ" },
    institutionName: { en: "Name of Dhamma Education Institution", si: "දහම් අධ්‍යාපනය ලබාදෙන ආයතනයේ නම" },
    registrationNumber: { en: "Registration Number", si: "ලියාපදිංචි අංකය" },
    nameAndAddress: {
      en: "Name and Address of Tuition Class Institution",
      si: "උපකාරක පන්ති ආයතනයන්හි නම හා ලිපිනය",
    },
    male: { en: "Male", si: "පිරිමි" },
    female: { en: "Female", si: "ගැහැණු" },
    // Compound overrides — same generic key means something different in each array/object.
    "privateInternationalSchools.name": { en: "School Name", si: "පාසලේ නම" },
    "pirivenas.name": { en: "Pirivena Name", si: "පිරිවෙනේ නම" },
    "pirivenas.type": { en: "Pirivena Type", si: "පිරිවෙනේ වර්ගය" },
    "vocationalInstitutes.name": {
      en: "Technical and Vocational Training Institution",
      si: "කාර්මික හා වෘත්තීය පුහුණු ආයතන",
    },
    "preschools.name": { en: "Preschool Name", si: "පෙර පාසලේ නම" },
    "dhammaEducationInstitutions.type": {
      en: "Dhamma Education Institution Type",
      si: "දහම් අධ්‍යාපනය ලබාදෙන ආයතන වර්ගය",
    },
    "tertiaryInstitutions.name": { en: "Institution Name", si: "ආයතනයේ නම" },
    "tertiaryInstitutions.typeLabel": { en: "Institution Type", si: "ආයතන වර්ගය" },
    "tertiaryInstitutions.exists": { en: "Exists", si: "ඇත/නැත" },
    "institutionCounts.pirivenas": { en: "Pirivenas", si: "පිරිවෙන්" },
    "institutionCounts.dhammaEducationInstitutions": {
      en: "Dhamma Education Institutions",
      si: "දහම් අධ්‍යාපනය ලබාදෙන ආයතන",
    },
  },
};
