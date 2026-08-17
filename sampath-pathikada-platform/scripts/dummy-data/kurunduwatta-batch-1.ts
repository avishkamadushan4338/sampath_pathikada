/**
 * DEMO data for Kurunduwatta GN division (3-1-39-020, Galle Four Gravets DS, Galle district).
 * Fictional but internally-consistent values for a stakeholder demo of the "Division Information"
 * feature. No real citizen data — matches the strict/required Zod schemas in
 * lib/validators/sections/{housing,employment,education,religious-cultural}.ts.
 */

export const housingData = {
  housingCounts: {
    total: 460,
    permanent: 340,
    semiPermanent: 95,
    nonPermanent: 25,
  },
  householdsWithoutHousing: 6,
  sanitation: {
    total: 460,
    withoutSafeSanitation: 12,
    needingAssistance: 8,
  },
  drinkingWaterSource: {
    well: 180,
    tubeWell: 15,
    spring: 5,
    pipedNational: 210,
    pipedLocalGovt: 20,
    pipedCommunity: 15,
    tankRiverCanalOther: 5,
    bottled: 3,
    treated: 2,
    bowser: 3,
    other: 2,
  },
  underservedAreas: [
    {
      area: "Pahala Kurunduwatta lower plots",
      difficultyDescription: "Seasonal flooding limits vehicle access to about 15 households during the monsoon",
      households: 15,
      proposal: "Elevate and gravel the access road with proper roadside drainage",
    },
    {
      area: "Watapotha housing cluster",
      difficultyDescription: "No pipeline water connection; households depend on a shared well far from most homes",
      households: 22,
      proposal: "Extend the National Water Supply Board pipeline to cover this cluster",
    },
  ],
  electricityAccess: {
    total: 460,
    withElectricity: 430,
    withSolar: 20,
    withoutElectricity: 10,
    needingAssistance: 8,
  },
  communityWaterProjects: [
    {
      name: "Kurunduwatta Community Water Project",
      functional: "yes",
      householdsServed: 45,
      authority: "main-ministry",
    },
    {
      name: "Watapotha CBO Rural Water Scheme",
      functional: "yes",
      householdsServed: 28,
      authority: "private",
    },
  ],
};

export const employmentData = {
  jobSeekersByEducation: [
    { level: "vocational-training", count: 14 },
    { level: "below-ol", count: 38 },
    { level: "ol-pass", count: 62 },
    { level: "al-pass", count: 45 },
    { level: "degree-and-above", count: 12 },
  ],
  vocationalTrainingOpportunityGapCount: 20,
  selfEmploymentSectors: [
    { sector: "food-production", count: 12 },
    { sector: "confectionery-production", count: 5 },
    { sector: "spice-production", count: 8 },
    { sector: "rice-parcel-production", count: 6 },
    { sector: "bakery-production", count: 4 },
    { sector: "garment-production", count: 15 },
    { sector: "dressmaking", count: 22 },
    { sector: "doormat-production", count: 3 },
    { sector: "beeralu-lace-production", count: 9 },
    { sector: "ornamental-items-production", count: 4 },
    { sector: "coconut-shell-production", count: 6 },
    { sector: "welding-work", count: 5 },
    { sector: "motor-vehicle-repair", count: 7 },
    { sector: "bicycle-repair", count: 3 },
    { sector: "masonry-work", count: 10 },
    { sector: "carpentry", count: 8 },
    { sector: "electrical-appliance-repair", count: 4 },
    { sector: "jewelry-production", count: 2 },
    { sector: "concrete-block-production", count: 3 },
    { sector: "cinnamon-peeling", count: 6 },
    { sector: "fish-related-production", count: 5 },
    { sector: "fishing-gear-repair", count: 2 },
    { sector: "fish-trade", count: 6 },
  ],
  selfEmployedPersons: [
    { name: "Chandima Perera", phone: "0771234567", sector: "Beeralu Lace Production", marketplace: "local" },
    { name: "Nimal Rathnayake", phone: "0777654321", sector: "Carpentry", marketplace: "local" },
    { name: "Sujeewa Wickramasinghe", phone: "0714567890", sector: "Spice Production", marketplace: "international" },
    { name: "Malani Jayasuriya", phone: "0765432198", sector: "Dressmaking / Sewing", marketplace: "local" },
  ],
};

export const educationData = {
  institutionCounts: {
    govtSchools: 2,
    privateOrInternationalSchools: 2,
    pirivenas: 2,
    vocationalTrainingInstitutes: 2,
    registeredPreschoolsGovt: 1,
    registeredPreschoolsPrivate: 2,
    dhammaEducationInstitutions: 2,
    higherEducationInstitutions: 1,
    tuitionCenterInstitutions: 3,
  },
  schoolCountsByType: {
    nationalSchools: 0,
    type1AB: 0,
    type1C: 1,
    type2: 1,
    type3: 0,
  },
  schoolFacilities: [
    {
      schoolName: "Kurunduwatta Sri Sumangala Vidyalaya",
      accommodationAvailable: "no",
      teachersFemale: 18,
      teachersMale: 9,
      studentsFemale: 210,
      studentsMale: 195,
      waterFacility: "yes",
      sanitationFacility: "yes",
      sportsGround: "yes",
    },
    {
      schoolName: "Kurunduwatta Maha Vidyalaya",
      accommodationAvailable: "no",
      teachersFemale: 12,
      teachersMale: 6,
      studentsFemale: 140,
      studentsMale: 130,
      waterFacility: "yes",
      sanitationFacility: "yes",
      sportsGround: "no",
    },
  ],
  specialAttentionSchools: [
    {
      schoolName: "Kurunduwatta Maha Vidyalaya",
      teachersFemale: 12,
      teachersMale: 6,
      studentsFemale: 140,
      studentsMale: 130,
      developmentNeeds: "Requires an additional classroom block and updated library resources",
    },
    {
      schoolName: "Kurunduwatta Sri Sumangala Vidyalaya",
      teachersFemale: 18,
      teachersMale: 9,
      studentsFemale: 210,
      studentsMale: 195,
      developmentNeeds: "Needs upgraded science laboratory equipment",
    },
  ],
  closedSchools: [
    {
      schoolName: "Pahala Kurunduwatta Junior School",
      yearClosed: 2011,
      buildingCount: 2,
      buildingsUsable: "yes",
    },
    {
      schoolName: "Watapotha Primary School",
      yearClosed: 2015,
      buildingCount: 1,
      buildingsUsable: "no",
    },
  ],
  privateInternationalSchools: [
    { name: "Galle International Montessori - Kurunduwatta Branch", teacherCount: 8, studentCount: 65 },
    { name: "Little Stars Private School", teacherCount: 5, studentCount: 40 },
  ],
  pirivenas: [
    {
      name: "Kurunduwatta Sri Vijayananda Pirivena",
      type: "Pirivena (Primary)",
      boardingFacility: "no",
      teachersFemale: 2,
      teachersMale: 6,
      studentsFemale: 25,
      studentsMale: 40,
      waterFacility: "yes",
      sanitationFacility: "yes",
      sportsGround: "no",
    },
    {
      name: "Sri Gnanawimala Pirivena",
      type: "Pirivena (Sangha)",
      boardingFacility: "yes",
      teachersFemale: 0,
      teachersMale: 8,
      studentsFemale: 0,
      studentsMale: 30,
      waterFacility: "yes",
      sanitationFacility: "yes",
      sportsGround: "yes",
    },
  ],
  vocationalInstitutes: [
    { name: "Kurunduwatta Community Vocational Training Center" },
    { name: "Galle District Handloom Training Institute - Kurunduwatta Unit" },
  ],
  preschools: [
    { name: "Kurunduwatta Government Preschool", address: "No. 12, Temple Road, Kurunduwatta", facilityType: "govt", teacherCount: 2, studentCount: 28 },
    { name: "Little Buds Montessori", address: "No. 45, Main Street, Kurunduwatta", facilityType: "private", teacherCount: 3, studentCount: 35 },
    { name: "Sunshine Preschool", address: "No. 7, Watapotha Road, Kurunduwatta", facilityType: "private", teacherCount: 2, studentCount: 22 },
  ],
  dhammaEducationInstitutions: [
    { institutionName: "Kurunduwatta Sri Sumangala Daham Pasala", type: "buddhist", teacherCount: 10, studentCount: 120 },
    { institutionName: "Watapotha Daham Pasala", type: "buddhist", teacherCount: 6, studentCount: 75 },
  ],
  tertiaryInstitutions: [
    { type: "university-college", exists: "no" },
    { type: "university", exists: "no" },
    { type: "tech-institute", exists: "yes", name: "Southlands National Vocational Training Institute - Galle" },
    { type: "private-university", exists: "no" },
  ],
  tuitionCenters: [
    { registrationNumber: "TC/GL/2024/0113", nameAndAddress: "Bright Future Tuition Class, No. 22, Main Street, Kurunduwatta" },
    { registrationNumber: "TC/GL/2023/0087", nameAndAddress: "Wisdom Academy Tuition Institute, No. 8, Temple Road, Kurunduwatta" },
    { registrationNumber: "TC/GL/2024/0156", nameAndAddress: "Elite English & Maths Class, No. 15, Watapotha Road, Kurunduwatta" },
  ],
  outOfSchoolChildren: { female: 3, male: 5 },
  childrenInProbationOrDetention: { female: 0, male: 1 },
};

export const religiousCulturalData = {
  religiousSiteCounts: {
    temples: { count: 4, clergyCount: 9 },
    meheniArama: { count: 1, clergyCount: 3 },
    kovils: { count: 1, clergyCount: 1 },
    mosques: { count: 1, clergyCount: 1 },
    churches: { count: 1, priestsCount: 1, nunsCount: 2 },
  },
  heritageSites: [
    {
      name: "Kurunduwatta Rajamaha Vihara",
      type: "temple-vihara",
      significance: "Ancient temple with historical murals dating back to the Kandyan era",
      usedForDhammaOrGovtPurpose: "yes",
      taskDescription: "Hosts the GN division's Sunday Dhamma school for children",
    },
    {
      name: "Kurunduwatta Sri Gnanodaya Asapuwa",
      type: "asapuwa",
      significance: "Meditation retreat site used by devotees during Poya days",
      usedForDhammaOrGovtPurpose: "no",
    },
    {
      name: "Watapotha Devalaya",
      type: "devalaya",
      significance: "Traditional shrine associated with the area's annual perahera festival",
      usedForDhammaOrGovtPurpose: "no",
    },
  ],
  artAcademies: [
    { name: "Kurunduwatta Sangeetha Kalayathanaya", registrationNumber: "AA/GL/0231", studentCount: 45 },
    { name: "Rhythm Dance Academy", registrationNumber: "AA/GL/0298", studentCount: 30 },
  ],
  traditionalArtists: [
    {
      artForm: "Low-Country (Ruhunu) Drumming",
      name: "Somapala Gunaratne",
      description: "Renowned Ruhunu drumming (bera) performer active in temple festivals for over 30 years",
    },
    {
      artForm: "Traditional Mask Carving",
      name: "Ariyasena Fernando",
      description: "Master mask carver producing devil-dance masks for cultural performances",
    },
  ],
};
