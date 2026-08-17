export const socialWelfareData = {
  welfarePaymentHouseholdCounts: {
    rs2500: 12,
    rs5000: 34,
    rs8500: 21,
    rs15000: 8,
    totalAswesumaRecipients: 75,
  },
  allowanceRecipientCounts: {
    disabilityAllowance: 18,
    elderlyAllowance: 42,
    nutritionAllowance: 9,
    publicAssistance: 15,
    diseaseAidWheelchair: 3,
    diseaseAidCancer: 5,
    diseaseAidThalassemia: 2,
    diseaseAidDiabetes: 11,
    other: 4,
  },
  eldersHomes: [
    {
      name: "Kurunduwatta Elders' Care Centre",
      authority: "private",
      phone: "0912234567",
      infrastructureNeeds: "Wheelchair ramp and backup generator",
      capacity: 20,
      residentCount: { female: 9, male: 6 },
    },
  ],
  childrensHomes: [],
};

export const communityOrganizationsData = {
  organizationCounts: [
    { type: "village-development-society", typeLabel: "Village Development Society", count: 2 },
    { type: "youth-society", typeLabel: "Youth Society", count: 2 },
    { type: "sports-club", typeLabel: "Sports Society", count: 2 },
    { type: "funeral-aid-society", typeLabel: "Funeral & Welfare Society", count: 3 },
    { type: "womens-society", typeLabel: "Women's Society", count: 2 },
    { type: "elders-society", typeLabel: "Elders' Society", count: 1 },
    { type: "childrens-society", typeLabel: "Children's Society", count: 1 },
    { type: "samurdhi-society", typeLabel: "Samurdhi Society", count: 1 },
    { type: "friend-organization", typeLabel: "Friend Organization / Friend Group", count: 1 },
    { type: "ngo-committee", typeLabel: "Non-Governmental Organization", count: 1 },
    { type: "farmer-society", typeLabel: "Farmer Society", count: 2 },
    { type: "religious-society", typeLabel: "Religious Society", count: 3 },
    { type: "sanasa-society", typeLabel: "SANASA Society", count: 1 },
    { type: "civil-defense-committee", typeLabel: "Civil Defense Committee", count: 1 },
    { type: "prajashakthi-society", typeLabel: "Prajashakthi Society", count: 1 },
  ],
  villageDevelopmentSocieties: [
    { name: "Kurunduwatta Village Development Society", address: "Temple Road, Kurunduwatta, Galle" },
    { name: "Pahala Kurunduwatta Development Society", address: "Pahala Kurunduwatta, Galle" },
  ],
  youthSocieties: [
    { name: "Kurunduwatta Youth Club", address: "Main Road, Kurunduwatta, Galle" },
    { name: "Sisu Diriya Youth Society", address: "Wackwella Road, Kurunduwatta, Galle" },
  ],
  sportsClubs: [
    {
      nameAndAddress: "Kurunduwatta Sports Club, Play Ground Road, Kurunduwatta, Galle",
      memberCount: 35,
      identifiedNeeds: "Cricket equipment and ground maintenance",
    },
    {
      nameAndAddress: "Kurunduwatta Volleyball Association, Temple Road, Kurunduwatta, Galle",
      memberCount: 18,
      identifiedNeeds: "Volleyball court flood lighting",
    },
  ],
  funeralAidSocieties: [
    { name: "Kurunduwatta Death Donation Society", address: "Main Road, Kurunduwatta, Galle" },
    { name: "Pahala Kurunduwatta Funeral Aid Society", address: "Pahala Kurunduwatta, Galle" },
    { name: "Sri Sumangala Funeral Welfare Society", address: "Temple Road, Kurunduwatta, Galle" },
  ],
  womensSocieties: [
    { name: "Kurunduwatta Women's Rural Development Society", address: "Main Road, Kurunduwatta, Galle" },
    { name: "Deepashika Women's Society", address: "Wackwella Road, Kurunduwatta, Galle" },
  ],
  eldersSocieties: [
    { name: "Kurunduwatta Elders' Welfare Society", address: "Temple Road, Kurunduwatta, Galle" },
  ],
  childrensSocieties: [
    { name: "Kurunduwatta Children's Club", address: "Main Road, Kurunduwatta, Galle" },
  ],
  samurdhiSocieties: [
    { name: "Kurunduwatta Samurdhi Beneficiary Society", address: "Samurdhi Office, Kurunduwatta, Galle" },
  ],
  friendOrganizations: [
    { name: "Kurunduwatta Mithuru Hamuwa", address: "Main Road, Kurunduwatta, Galle" },
  ],
  ngoCommittees: [
    { name: "Sarvodaya Kurunduwatta Community Committee", address: "Temple Road, Kurunduwatta, Galle" },
  ],
  farmerSocieties: [
    { name: "Kurunduwatta Farmer Organization", address: "Paddy Field Road, Kurunduwatta, Galle" },
    { name: "Wackwella-Kurunduwatta Cultivators' Society", address: "Wackwella Road, Kurunduwatta, Galle" },
  ],
  religiousSocieties: [
    { name: "Sri Sumangala Purana Viharaya Dayaka Sabha", address: "Temple Road, Kurunduwatta, Galle" },
    { name: "Kurunduwatta Sunday Dhamma School Society", address: "Temple Road, Kurunduwatta, Galle" },
    { name: "St. Anthony's Church Welfare Society", address: "Wackwella Road, Kurunduwatta, Galle" },
  ],
  sanasaSocieties: [
    { name: "Kurunduwatta SANASA Primary Society", address: "Main Road, Kurunduwatta, Galle" },
  ],
  civilDefenseCommittees: [
    { name: "Kurunduwatta Civil Defense Committee", address: "Grama Niladhari Office, Kurunduwatta, Galle" },
  ],
  prajashakthiSocieties: [
    { name: "Kurunduwatta Prajashakthi Society", address: "Main Road, Kurunduwatta, Galle" },
  ],
  cooperativeSocieties: [
    { name: "Galle Four Gravets Multi-Purpose Cooperative Society - Kurunduwatta Branch" },
  ],
};

export const tourismData = {
  hotelInventory: [
    { category: "star-graded", categoryLabel: "Number of Star-Graded Hotels", hotelCount: 0, roomCount: 0 },
    { category: "non-star-graded", categoryLabel: "Number of Non-Star-Graded Hotels", hotelCount: 1, roomCount: 8 },
    { category: "guest-houses", categoryLabel: "Number of Guest Houses", hotelCount: 2, roomCount: 10 },
    { category: "villa-homestay", categoryLabel: "Villas / Home Stay", hotelCount: 1, roomCount: 4 },
    { category: "conference-centers", categoryLabel: "Massage Centers", hotelCount: 1, roomCount: 0 },
  ],
  guestAccommodations: [
    {
      name: "Kurunduwatta Beach View Guest House",
      type: "guesthouse",
      address: "No. 45, Wackwella Road, Kurunduwatta, Galle",
      roomCount: 6,
    },
    {
      name: "Villa Serena Kurunduwatta",
      type: "villa",
      address: "No. 12, Temple Road, Kurunduwatta, Galle",
      roomCount: 4,
    },
  ],
  otherAccommodations: [
    {
      name: "Kurunduwatta Rest House",
      type: "Government Rest House",
      address: "No. 3, Main Road, Kurunduwatta, Galle",
    },
  ],
};

export const wasteDisasterData = {
  hasWasteProgram: "yes",
  publicInformedOfSchedule: "yes",
  collectionFrequency: "weekly",
  collectionMethod: "mixed",
  hasCompostOrDisposalSite: "no",
};
