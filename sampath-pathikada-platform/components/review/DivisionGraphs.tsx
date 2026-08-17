"use client";

import { useMemo } from "react";
import {
  Landmark,
  Users,
  Home,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Wheat,
  RouteOff,
  HandHeart,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NAVY,
  GOLD,
  MAROON,
  GREEN,
  hasKeys,
  BarCard,
  StatGrid,
  YesNoBadge,
  SectionGroup,
} from "@/components/charts/chart-primitives";
import {
  aggregateHousing,
  aggregateEmployment,
  aggregateEducation,
  aggregateHealth,
  aggregateEconomicAgriculture,
  aggregateCommunityWelfare,
  aggregateInfrastructure,
  aggregateAreaProfile,
} from "@/lib/analytics/aggregate-sections";
import { aggregateDemographics } from "@/lib/analytics/aggregate-demographics";

interface DivisionGraphsProps {
  data: Record<string, unknown> | null | undefined;
}

/** Visual (chart) overview of a single submission's numeric/aggregable data — reuses the same
 *  lib/analytics aggregation functions the area-wide /api/analytics endpoint uses, just scoped
 *  to a single-row array so one GN division's submission renders through the identical logic. */
export function DivisionGraphs({ data }: DivisionGraphsProps) {
  const { lang } = useLanguage();

  const rows = useMemo(() => [{ data: data ?? {}, gnDivision: "" }], [data]);
  const gnLabel = () => ({ en: "", si: "" });

  const demo = useMemo(() => aggregateDemographics(rows), [rows]);
  const housing = useMemo(() => aggregateHousing(rows, gnLabel), [rows]);
  const employment = useMemo(() => aggregateEmployment(rows, gnLabel), [rows]);
  const education = useMemo(() => aggregateEducation(rows, gnLabel), [rows]);
  const health = useMemo(() => aggregateHealth(rows, gnLabel), [rows]);
  const econAgri = useMemo(() => aggregateEconomicAgriculture(rows, gnLabel), [rows]);
  const community = useMemo(() => aggregateCommunityWelfare(rows, gnLabel), [rows]);
  const infra = useMemo(() => aggregateInfrastructure(rows, gnLabel), [rows]);
  const areaProfile = useMemo(() => aggregateAreaProfile(rows, gnLabel), [rows]);

  const hasAreaProfile =
    hasKeys(data?.stateInstitutionsLand) ||
    hasKeys(data?.physicalEnvironment) ||
    hasKeys(data?.religiousCultural) ||
    hasKeys(data?.tourism) ||
    hasKeys(data?.wasteDisaster);
  const hasDemographics = hasKeys(data?.demographics);
  const hasHousing = hasKeys(data?.housing);
  const hasEmployment = hasKeys(data?.employment);
  const hasEducation = hasKeys(data?.education);
  const hasHealth = hasKeys(data?.health);
  const hasEconAgri = hasKeys(data?.economicAgriculture);
  const hasInfra = hasKeys(data?.roadInfrastructure);
  const hasCommunity = hasKeys(data?.communityOrganizations) || hasKeys(data?.socialWelfare);

  const anyData =
    hasAreaProfile || hasDemographics || hasHousing || hasEmployment || hasEducation ||
    hasHealth || hasEconAgri || hasInfra || hasCommunity;

  if (!anyData) {
    return (
      <p className="text-fluid-sm text-muted-foreground">
        <Bilingual en="No data recorded yet — charts will appear once at least one section is filled in." si="තවම දත්ත සටහන් කර නොමැත — අවම වශයෙන් එක් කොටසක් සම්පූර්ණ කළ පසු ප්‍රස්ථාර දිස්වනු ඇත." />
      </p>
    );
  }

  const t = (en: string, si: string) => (lang === "si" ? si : en);

  return (
    <div className="flex flex-col gap-10">
      {/* ── Area Profile: State Institutions & Land, Physical & Environment, Religious & Cultural, Tourism, Waste Management ── */}
      <SectionGroup icon={Landmark} titleEn="Area Profile" titleSi="ප්‍රදේශ පැතිකඩ" empty={!hasAreaProfile}>
        <BarCard
          titleEn="Total Number of All Religious Sites"
          titleSi="සියලුම ආගමික ස්ථාන සංඛ්‍යාව"
          color={GOLD}
          rows={[
            { label: t("Temple / Forest Hermitage / Asapuwa", "පන්සල්/ආරණ්‍ය විහාරස්ථාන/අසපුව"), value: areaProfile.religiousSiteCounts.temples.count },
            { label: t("Nun Hermitages", "මෙහෙනි ආරාම"), value: areaProfile.religiousSiteCounts.meheniArama.count },
            { label: t("Kovils", "කෝවිල්"), value: areaProfile.religiousSiteCounts.kovils.count },
            { label: t("Mosques", "ඉස්ලාම් පල්ලි"), value: areaProfile.religiousSiteCounts.mosques.count },
            { label: t("Catholic Churches", "කතෝලික පල්ලි"), value: areaProfile.religiousSiteCounts.churches.count },
          ]}
        />
        <BarCard
          titleEn="Waste Disposal Method (no formal program)"
          titleSi="කසළ බැහැර කිරීමේ ක්‍රමය (වැඩසටහනක් නැති විට)"
          color={GOLD}
          rows={areaProfile.wasteManagement.disposalMethodIfNoProgram.map((r) => ({ label: t(r.en, r.si), value: r.presentCount }))}
        />
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-fluid-base">
              <Bilingual en="Area Profile Snapshot" si="ප්‍රදේශ පැතිකඩ සාරාංශය" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <YesNoBadge yes={areaProfile.wasteManagement.divisionsWithProgram > 0} labelEn="Waste Program" labelSi="කසළ වැඩසටහන" />
              <YesNoBadge yes={areaProfile.wasteManagement.divisionsWithCompostSite > 0} labelEn="Compost / Disposal Site" labelSi="කොම්පෝස්ට්/බැහැර කිරීමේ ස්ථානය" />
            </div>
            <StatGrid
              items={[
                { en: "State Institutions", si: "රාජ්‍ය ආයතන", value: areaProfile.stateInstitutions.rows.length },
                { en: "Abandoned Buildings", si: "අත්හැර දමන ලද ගොඩනැගිලි", value: areaProfile.illegalStructures.rows.length },
                { en: "Stalled Development Projects", si: "අතරමං සංවර්ධන ව්‍යාපෘති", value: areaProfile.developmentProjects.rows.length },
                { en: "Water Sources", si: "ජල මූලාශ්‍ර", value: areaProfile.waterSources.rows.length },
                { en: "Sensitive Zones", si: "සංවේදී කලාප", value: areaProfile.sensitiveZones.rows.length },
                { en: "Physical Resources", si: "භෞතික සම්පත්", value: areaProfile.naturalResources.rows.length },
                { en: "Hazards", si: "අනතුරු", value: areaProfile.hazards.rows.length },
                { en: "Safe Locations", si: "ආරක්ෂිත ස්ථාන", value: areaProfile.safeLocations.rows.length },
                { en: "Tourist Sites (Existing)", si: "සංචාරක ස්ථාන (පවතින)", value: areaProfile.existingTouristSitesFromPhysicalEnv.rows.length },
                { en: "Tourist Sites (Proposed)", si: "සංචාරක ස්ථාන (යෝජිත)", value: areaProfile.proposedTouristSites.rows.length },
                { en: "Heritage Sites", si: "උරුම ස්ථාන", value: areaProfile.heritageSites.rows.length },
                { en: "Hotels", si: "හෝටල්", value: areaProfile.hotelInventory.rows.reduce((s, r) => s + (r.hotelCount ?? 0), 0) },
                { en: "Guest Accommodations", si: "අමුත්තන් නවාතැන්", value: areaProfile.guestAccommodations.rows.length },
              ]}
            />
          </CardContent>
        </Card>
      </SectionGroup>

      {/* ── Demographics ── */}
      <SectionGroup icon={Users} titleEn="Demographics" titleSi="ජනගහනය" empty={!hasDemographics}>
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <StatGrid
              items={[
                { en: "Total Population", si: "මුළු ජනගහනය", value: demo.totalPopulation },
                { en: "Female %", si: "ස්ත්‍රී %", value: demo.femalePercentage !== null ? `${demo.femalePercentage}%` : "—" },
                { en: "Number of Families", si: "පවුල් සංඛ්‍යාව", value: demo.households.total },
                { en: "Female-Headed Families", si: "කාන්තා ගෘහමූලික පවුල් සංඛ්‍යාව", value: demo.households.femaleHeaded },
                { en: "Families with Children in Probation Care", si: "පරිවාසගත ළමුන් සිටින පවුල් සංඛ්‍යාව", value: demo.households.displaced },
                { en: "Registered Voters", si: "ලියාපදිංචි ඡන්ද දායකයින්", value: demo.registeredVoters.total },
              ]}
            />
          </CardContent>
        </Card>
        <BarCard
          titleEn="Population by Gender"
          titleSi="ස්ත්‍රී පුරුෂ භේදයෙන් ජනගහනය"
          color={NAVY}
          rows={[
            { label: t("Female", "ස්ත්‍රී"), value: demo.female },
            { label: t("Male", "පුරුෂ"), value: demo.male },
          ]}
        />
        <BarCard
          titleEn="Population by Age Band"
          titleSi="වයස් කාණ්ඩය අනුව ජනගහනය"
          color={NAVY}
          rows={demo.populationByAge.map((r) => ({ label: t(r.en, r.si), value: r.total }))}
        />
        <BarCard
          titleEn="Population by Ethnicity"
          titleSi="ජනවර්ගය අනුව ජනගහනය"
          color={NAVY}
          rows={demo.populationByEthnicity.map((r) => ({ label: t(r.en, r.si), value: r.total }))}
        />
        <BarCard
          titleEn="Population by Religion"
          titleSi="ආගම අනුව ජනගහනය"
          color={NAVY}
          rows={demo.populationByReligion.map((r) => ({ label: t(r.en, r.si), value: r.total }))}
        />
        <BarCard
          titleEn="Persons with Disabilities"
          titleSi="ආබාධිත පුද්ගලයන්"
          color={NAVY}
          rows={demo.disabilities.map((r) => ({ label: t(r.en, r.si), value: r.total }))}
        />
      </SectionGroup>

      {/* ── Housing ── */}
      <SectionGroup icon={Home} titleEn="Housing" titleSi="නිවාස" empty={!hasHousing}>
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <StatGrid
              items={[
                { en: "Total Housing Count", si: "මුළු නිවාස සංඛ්‍යාව", value: housing.housingCounts.total },
                { en: "Families Without Housing", si: "නිවාස නොමැති පවුල් සංඛ්‍යාව", value: housing.householdsWithoutHousing },
                { en: "With Electricity Facility", si: "විදුලිබල පහසුකම් සහිත", value: housing.electricityAccess.withElectricity },
                { en: "Without Electricity Facility", si: "විදුලිබල පහසුකම් නොමැති", value: housing.electricityAccess.withoutElectricity },
                { en: "Without Hygienic Toilet Facilities", si: "සෞඛ්‍යාරක්ෂිත වැසිකිලි පහසුකම් නොමැති", value: housing.sanitation.withoutSafeSanitation },
                { en: "Should Be Given Toilet Assistance", si: "වැසිකිලි ආධාර ලබාදිය යුතු", value: housing.sanitation.needingAssistance },
              ]}
            />
          </CardContent>
        </Card>
        <BarCard
          titleEn="Housing by Type"
          titleSi="වර්ගය අනුව නිවාස"
          color={GOLD}
          rows={[
            { label: t("Permanent", "ස්ථිර"), value: housing.housingCounts.permanent },
            { label: t("Semi-Permanent", "අර්ධ ස්ථිර"), value: housing.housingCounts.semiPermanent },
            { label: t("Non-Permanent", "අස්ථිර"), value: housing.housingCounts.nonPermanent },
          ]}
        />
        <BarCard
          titleEn="Drinking Water Source"
          titleSi="පානීය ජල මූලාශ්‍රය"
          color={GOLD}
          rows={[
            { label: t("Well", "ළිං"), value: housing.drinkingWaterSource.well },
            { label: t("Tube Well", "නළ ළිං"), value: housing.drinkingWaterSource.tubeWell },
            { label: t("Spring", "බුබුළු/උල්පත්"), value: housing.drinkingWaterSource.spring },
            { label: t("Piped (National)", "නළ ජලය (ජාතික)"), value: housing.drinkingWaterSource.pipedNational },
            { label: t("Piped (Local Govt)", "නළ ජලය (පළාත් පාලන)"), value: housing.drinkingWaterSource.pipedLocalGovt },
            { label: t("Piped (Community)", "නළ ජලය (ප්‍රජාමූල)"), value: housing.drinkingWaterSource.pipedCommunity },
            { label: t("Tank / River / Canal", "වැව්/ගඟ/ඇල"), value: housing.drinkingWaterSource.tankRiverCanalOther },
            { label: t("Bottled", "බෝතල් ජලය"), value: housing.drinkingWaterSource.bottled },
            { label: t("Treated / Recycled", "ප්‍රති ආශ්‍රිත ජලය"), value: housing.drinkingWaterSource.treated },
            { label: t("Other", "වෙනත්"), value: housing.drinkingWaterSource.other },
          ]}
        />
      </SectionGroup>

      {/* ── Employment ── */}
      <SectionGroup icon={Briefcase} titleEn="Employment Aspiration" titleSi="සේවා නියුක්තිය" empty={!hasEmployment}>
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <StatGrid
              items={[
                { en: "Total Job-Seeking Persons", si: "රැකියා අපේක්ෂිත මුළු පුද්ගලයන් ගණන", value: employment.totalJobSeekers },
                { en: "Persons Needing Vocational Training", si: "වෘත්තිය පුහුණුව අවශ්‍ය එහෙත් සුදුසුකම් නොමැති පුද්ගලයන්", value: employment.vocationalTrainingOpportunityGapCount },
              ]}
            />
          </CardContent>
        </Card>
        <BarCard
          titleEn="Job Seekers by Education Level"
          titleSi="අධ්‍යාපන මට්ටම අනුව රැකියා අපේක්ෂිත පුද්ගලයන් ගණන"
          color={GREEN}
          rows={employment.jobSeekersByEducation.map((r) => ({ label: t(r.en, r.si), value: r.count }))}
        />
        <BarCard
          titleEn="Self-Employment Sectors"
          titleSi="ස්වයං රැකියා ක්ෂේත්‍ර"
          color={GREEN}
          hideZero
          rows={employment.selfEmploymentSectors.map((r) => ({ label: t(r.en, r.si), value: r.count }))}
        />
      </SectionGroup>

      {/* ── Education ── */}
      <SectionGroup icon={GraduationCap} titleEn="Education" titleSi="අධ්‍යාපනය" empty={!hasEducation}>
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <StatGrid
              items={[
                { en: "Out-of-School Children", si: "පාසල් රහිත ළමුන්", value: education.outOfSchoolChildren.total },
                { en: "Children in Probation/Detention", si: "පරිවාසගත/බන්ධනාගාරගත ළමුන්", value: education.childrenInProbationOrDetention.total },
                { en: "Teachers (Female)", si: "ගුරුවරු (ස්ත්‍රී)", value: education.schoolStaffAndStudents.teachersFemale },
                { en: "Teachers (Male)", si: "ගුරුවරු (පුරුෂ)", value: education.schoolStaffAndStudents.teachersMale },
                { en: "Students (Female)", si: "සිසුන් (ස්ත්‍රී)", value: education.schoolStaffAndStudents.studentsFemale },
                { en: "Students (Male)", si: "සිසුන් (පුරුෂ)", value: education.schoolStaffAndStudents.studentsMale },
              ]}
            />
          </CardContent>
        </Card>
        <BarCard
          titleEn="Distribution of Educational Institutions"
          titleSi="අධ්‍යාපනය ආයතන ව්‍යාප්තිය"
          color={NAVY}
          rows={[
            { label: t("Schools (Government)", "පාසල් (රජයේ)"), value: education.institutionCounts.govtSchools },
            { label: t("Private Schools / International Schools", "පෞද්ගලික පාසල් /ජාත්‍යන්තර පාසල්"), value: education.institutionCounts.privateOrInternationalSchools },
            { label: t("Pirivenas", "පිරිවෙන්"), value: education.institutionCounts.pirivenas },
            { label: t("Technical and Vocational Training Institutions", "කාර්මික හා වෘත්තීය පුහුණු ආයතන"), value: education.institutionCounts.vocationalTrainingInstitutes },
            { label: t("Registered Preschools - Government", "ලියාපදිංචි පෙර පාසල්- රජයේ"), value: education.institutionCounts.registeredPreschoolsGovt },
            { label: t("Registered Preschools - Private", "ලියාපදිංචි පෙර පාසල් - පෞද්ගලික"), value: education.institutionCounts.registeredPreschoolsPrivate },
            { label: t("Dhamma Education Institutions", "දහම් අධ්‍යාපනය ලබාදෙන ආයතන"), value: education.institutionCounts.dhammaEducationInstitutions },
            { label: t("Higher Education Institutions", "උසස් අධ්‍යාපන ආයතන"), value: education.institutionCounts.higherEducationInstitutions },
            { label: t("Tuition Class Institutions", "උපකාරක පන්ති පවත්වන ආයතන"), value: education.institutionCounts.tuitionCenterInstitutions },
          ]}
        />
        <BarCard
          titleEn="Number of Schools"
          titleSi="පාසල් සංඛ්‍යාව"
          color={NAVY}
          rows={[
            { label: t("National Schools", "ජාතික පාසල්"), value: education.schoolCountsByType.nationalSchools },
            { label: "1AB", value: education.schoolCountsByType.type1AB },
            { label: "1C", value: education.schoolCountsByType.type1C },
            { label: t("Type 2", "වර්ගය 2"), value: education.schoolCountsByType.type2 },
            { label: t("Type 3", "වර්ගය 3"), value: education.schoolCountsByType.type3 },
          ]}
        />
        <BarCard
          titleEn="Dhamma Education Institutions by Religion"
          titleSi="ආගම අනුව දහම් අධ්‍යාපන ආයතන"
          color={NAVY}
          rows={[
            { label: t("Buddhist", "බෞද්ධ"), value: education.dhammaEducationInstitutions.rows.filter((r) => r.type === "buddhist").length },
            { label: t("Islam", "ඉස්ලාම්"), value: education.dhammaEducationInstitutions.rows.filter((r) => r.type === "islam").length },
            { label: t("Hindu", "හින්දු"), value: education.dhammaEducationInstitutions.rows.filter((r) => r.type === "hindu").length },
            { label: t("Christian", "ක්‍රිස්තියානි"), value: education.dhammaEducationInstitutions.rows.filter((r) => r.type === "christian").length },
          ]}
        />
      </SectionGroup>

      {/* ── Health ── */}
      <SectionGroup icon={HeartPulse} titleEn="Health" titleSi="සෞඛ්‍යය" empty={!hasHealth}>
        <BarCard
          titleEn="Health Institutions in the GN Division"
          titleSi="ග්‍රාම නිලධාරී වසම තුළ පිහිටා ඇති සෞඛ්‍ය ආයතන"
          color={MAROON}
          rows={[
            { label: t("Govt. Hospitals", "රජයේ රෝහල්"), value: health.institutionCounts.govtHospitals },
            { label: t("Primary Healthcare Units", "ප්‍රාථමික සෞඛ්‍ය සත්කාර ඒකක"), value: health.institutionCounts.primaryHealthcareUnits },
            { label: t("Private Hospitals", "පෞද්ගලික රෝහල්"), value: health.institutionCounts.privateHospitals },
            { label: t("Ayurvedic Hospitals", "ආයුර්වේද රෝහල්"), value: health.institutionCounts.ayurvedicHospitals },
            { label: t("Specialist Centers", "විශේෂඥ වෛද්‍ය සේවා ආයතන"), value: health.institutionCounts.specialistServiceCenters },
            { label: t("MOH / Village Health Centers", "සෞඛ්‍ය වෛද්‍ය නිලධාරී/ග්‍රාමෝදය සෞඛ්‍ය මධ්‍යස්ථාන"), value: health.institutionCounts.mohOfficesOrCommunityHealthCenters },
            { label: t("Traditional Medicine Institutions", "පාරම්පරික වෙදකම් ආයතන"), value: health.institutionCounts.traditionalMedicineRegisteredInstitutions },
            { label: t("Private Medical Clinics", "පෞද්ගලික වෛද්‍ය සායන"), value: health.institutionCounts.privateMedicalLabs },
            { label: t("Animal Clinic Centers", "සත්ත්ව සායන මධ්‍යස්ථාන"), value: health.institutionCounts.animalClinicCenters },
            { label: t("Govt. Pharmacies", "රජයේ ඖෂධශල"), value: health.institutionCounts.govtPharmacies },
            { label: t("Private Pharmacies", "පෞද්ගලික ෆාමසි"), value: health.institutionCounts.privatePharmacies },
          ]}
        />
      </SectionGroup>

      {/* ── Economic — Agriculture / Industry ── */}
      <SectionGroup icon={Wheat} titleEn="Economic — Agriculture / Industry" titleSi="ආර්ථික — කෘෂිකාර්මික/කාර්මික" empty={!hasEconAgri}>
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex flex-wrap gap-2">
              <YesNoBadge yes={econAgri.iceProductionDivisionsCount > 0} labelEn="Ice Production" labelSi="අයිස් නිෂ්පාදනය" />
              <YesNoBadge yes={econAgri.fishLandingSiteDivisionsCount > 0} labelEn="Fish Landing Sites" labelSi="ධීවර තොටුපොළ" />
            </div>
            <StatGrid
              items={[
                { en: "Abandoned Paddy Land (Acres)", si: "පුරන් කුඹුරු බිම් ප්‍රමාණය (අක්.)", value: econAgri.abandonedPaddyLand.extentAcres },
                { en: "Recultivatable Extent", si: "නැවත වගාකල හැකි ප්‍රමාණය", value: econAgri.abandonedPaddyLand.canBeReactivatedExtent },
                { en: "Marine (Karadiya) Fishing Households", si: "කරදිය ධීවර පවුල් ගණන", value: econAgri.marineFisheries.householdCount },
                { en: "Marine Active Fishermen", si: "කරදිය සක්‍රිය ධීවරයින්", value: econAgri.marineFisheries.activeFishermenCount },
                { en: "Inland (Miridiya) Fishing Households", si: "මිරිදිය ධීවර පවුල් ගණන", value: econAgri.inlandFisheries.householdCount },
                { en: "Inland Active Fishermen", si: "මිරිදිය සක්‍රිය ධීවරයින්", value: econAgri.inlandFisheries.activeFishermenCount },
              ]}
            />
          </CardContent>
        </Card>
        <BarCard
          titleEn="Land Use and Agricultural Information (Hectares)"
          titleSi="ඉඩම් පරිභෝගය හා කෘෂිකාර්මික තොරතුරු (හෙක්.)"
          color={GOLD}
          rows={econAgri.landUse.map((r) => ({ label: t(r.en, r.si), value: r.extentHectares }))}
        />
        <BarCard
          titleEn="Commercial Cultivation (Flowers / Greenhouse / Beekeeping)"
          titleSi="වාණිජ මට්ටමින් වගාවන්"
          color={GOLD}
          rows={econAgri.animalHusbandryCounts.map((r) => ({ label: t(r.en, r.si), value: r.count }))}
        />
        <BarCard
          titleEn="Agricultural Machinery"
          titleSi="කෘෂිකාර්මික යන්ත්‍රෝපකරණ"
          color={GOLD}
          rows={econAgri.agriMachinery.map((r) => ({ label: t(r.en, r.si), value: r.count }))}
        />
        <BarCard
          titleEn="Crop / Forest Damage Reported"
          titleSi="වගා/වන විනාශය වාර්තා වී ඇත"
          color={GOLD}
          rows={econAgri.forestDamage.map((r) => ({ label: t(r.en, r.si), value: r.presentCount }))}
        />
      </SectionGroup>

      {/* ── Community, Social Welfare & Organizations ── */}
      <SectionGroup icon={HandHeart} titleEn="Community / Social Welfare / Organizations" titleSi="ප්‍රජාමූල / සමාජ සුබසාධන / සංවිධාන" empty={!hasCommunity}>
        <BarCard
          titleEn="Community Organizations"
          titleSi="ප්‍රජාමූල සංවිධාන"
          color={GREEN}
          hideZero
          rows={community.organizationCounts.map((r) => ({ label: t(r.en, r.si), value: r.count }))}
        />
        <BarCard
          titleEn="Manner in Which Aswesuma Benefits Have Been Distributed"
          titleSi="අස්වැසුම සහනාධාර බෙදී ගොස් ඇති ආකාරය"
          color={GREEN}
          rows={[
            { label: t("Rs. 2,500 - Transitional", "රු.2500 සංක්‍රාන්තික"), value: community.welfarePaymentHouseholdCounts.rs2500 },
            { label: t("Rs. 5,000 - At Risk", "රු.5000 අවධානමට ලක් වූ"), value: community.welfarePaymentHouseholdCounts.rs5000 },
            { label: t("Rs. 8,500 - Poor", "රු.8500 දිලිඳු"), value: community.welfarePaymentHouseholdCounts.rs8500 },
            { label: t("Rs. 15,000 - Extremely Poor", "රු.15000 අන්ත දිලිඳු"), value: community.welfarePaymentHouseholdCounts.rs15000 },
            { label: t("Total Aswesuma Recipients", "අස්වැසුම ප්‍රතිලාභී මුළ"), value: community.welfarePaymentHouseholdCounts.totalAswesumaRecipients },
          ]}
        />
        <BarCard
          titleEn="Manner in Which Disability / Elderly / Other Aid Has Been Distributed"
          titleSi="ආබාධිත දීමනා /වැඩිහිටි දීමනා /වෙනත් ආධාර බෙදී ගොස් ඇති ආකාරය"
          color={GREEN}
          rows={[
            { label: t("Disability Allowance", "ආබාධිත දීමනා"), value: community.allowanceRecipientCounts.disabilityAllowance },
            { label: t("Elderly Allowance", "වැඩිහිටි දීමනා"), value: community.allowanceRecipientCounts.elderlyAllowance },
            { label: t("Nutrition Stamp", "පෝෂණ මුද්දර"), value: community.allowanceRecipientCounts.nutritionAllowance },
            { label: t("Public Assistance", "මහජන ආධාර"), value: community.allowanceRecipientCounts.publicAssistance },
            { label: t("Disease Aid - Kidney", "රෝගාධාර - වකුගඩු ආධාර"), value: community.allowanceRecipientCounts.diseaseAidWheelchair },
            { label: t("Disease Aid - Cancer", "රෝගාධාර - පිළිකා"), value: community.allowanceRecipientCounts.diseaseAidCancer },
            { label: t("Disease Aid - Thalassemia", "රෝගාධාර - තැලිසීමියා"), value: community.allowanceRecipientCounts.diseaseAidThalassemia },
            { label: t("Disease Aid - Diabetes", "රෝගාධාර - දියවැඩියාව"), value: community.allowanceRecipientCounts.diseaseAidDiabetes },
            { label: t("Other", "වෙනත්"), value: community.allowanceRecipientCounts.other },
          ]}
        />
      </SectionGroup>

      {/* ── Transport & Infrastructure ── */}
      <SectionGroup icon={RouteOff} titleEn="Transport & Infrastructure" titleSi="ප්‍රවාහන හා යටිතල පහසුකම්" empty={!hasInfra}>
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex flex-wrap gap-2">
              <YesNoBadge yes={infra.publicFacilities.busStand > 0} labelEn="Bus Stand" labelSi="බස් නැවතුම් පොළ" />
              <YesNoBadge yes={infra.publicFacilities.railwayStation > 0} labelEn="Railway Station" labelSi="දුම්රිය නැවතුම් පොළ" />
              <YesNoBadge yes={infra.publicFacilities.port > 0} labelEn="Port" labelSi="වරාය" />
              <YesNoBadge yes={infra.publicFacilities.airport > 0} labelEn="Airport" labelSi="ගුවන්තොටුපළ" />
            </div>
            <StatGrid
              items={[{ en: "Road Development Needed (m)", si: "මාර්ග සංවර්ධනය අවශ්‍ය (මී.)", value: infra.totalRoadDevelopmentLengthMeters }]}
            />
          </CardContent>
        </Card>
        <BarCard
          titleEn="Service Establishments"
          titleSi="සේවා ආයතන"
          color={NAVY}
          hideZero
          rows={infra.serviceEstablishments.map((r) => ({ label: t(r.en, r.si), value: r.count }))}
        />
        <BarCard
          titleEn="Public Facilities Present"
          titleSi="පවතින පොදු පහසුකම්"
          color={NAVY}
          hideZero
          rows={infra.publicFacilityCategories.map((r) => ({ label: t(r.en, r.si), value: r.presentCount }))}
        />
      </SectionGroup>
    </div>
  );
}
