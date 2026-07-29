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
  const gnLabel = () => "";

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
          titleEn="Religious Sites"
          titleSi="ආගමික ස්ථාන"
          color={GOLD}
          rows={[
            { label: t("Temples", "විහාරස්ථාන"), value: areaProfile.religiousSiteCounts.temples.count },
            { label: t("Nun Hermitages", "මෙහෙණි ආරාම"), value: areaProfile.religiousSiteCounts.meheniArama.count },
            { label: t("Kovils", "කෝවිල්"), value: areaProfile.religiousSiteCounts.kovils.count },
            { label: t("Mosques", "පල්ලි"), value: areaProfile.religiousSiteCounts.mosques.count },
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
                { en: "Illegal Structures", si: "නීති විරෝධී ඉදිකිරීම්", value: areaProfile.illegalStructures.rows.length },
                { en: "Development Projects", si: "සංවර්ධන ව්‍යාපෘති", value: areaProfile.developmentProjects.rows.length },
                { en: "Water Sources", si: "ජල මූලාශ්‍ර", value: areaProfile.waterSources.rows.length },
                { en: "Sensitive Zones", si: "සංවේදී කලාප", value: areaProfile.sensitiveZones.rows.length },
                { en: "Natural Resources", si: "ස්වාභාවික සම්පත්", value: areaProfile.naturalResources.rows.length },
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
                { en: "Households", si: "ගෘහ ඒකක", value: demo.households.total },
                { en: "Female-Headed Households", si: "ස්ත්‍රී ප්‍රධාන ගෘහ ඒකක", value: demo.households.femaleHeaded },
                { en: "Displaced Households", si: "අවතැන් වූ ගෘහ ඒකක", value: demo.households.displaced },
                { en: "Registered Voters", si: "ලියාපදිංචි ඡන්දදායකයන්", value: demo.registeredVoters.total },
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
                { en: "Total Housing Units", si: "මුළු නිවාස ඒකක", value: housing.housingCounts.total },
                { en: "Households Without Housing", si: "නිවාස රහිත ගෘහ ඒකක", value: housing.householdsWithoutHousing },
                { en: "With Electricity", si: "විදුලි පහසුකම් සහිත", value: housing.electricityAccess.withElectricity },
                { en: "Without Electricity", si: "විදුලි පහසුකම් නොමැති", value: housing.electricityAccess.withoutElectricity },
                { en: "Without Safe Sanitation", si: "ආරක්ෂිත සනීපාරක්ෂක නොමැති", value: housing.sanitation.withoutSafeSanitation },
                { en: "Needing Sanitation Assistance", si: "සනීපාරක්ෂක සහාය අවශ්‍ය", value: housing.sanitation.needingAssistance },
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
      <SectionGroup icon={Briefcase} titleEn="Employment" titleSi="රැකියා" empty={!hasEmployment}>
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <StatGrid
              items={[
                { en: "Total Job Seekers", si: "මුළු රැකියා අපේක්ෂකයන්", value: employment.totalJobSeekers },
                { en: "Vocational Training Opportunity Gap", si: "වෘත්තීය පුහුණු අවස්ථා හිඩැස", value: employment.vocationalTrainingOpportunityGapCount },
              ]}
            />
          </CardContent>
        </Card>
        <BarCard
          titleEn="Job Seekers by Education"
          titleSi="අධ්‍යාපනය අනුව රැකියා අපේක්ෂකයන්"
          color={GREEN}
          rows={employment.jobSeekersByEducation.map((r) => ({ label: t(r.en, r.si), value: r.count }))}
        />
        <BarCard
          titleEn="Self-Employment Sectors"
          titleSi="ස්වයං රැකියා අංශ"
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
          titleEn="Institution Counts"
          titleSi="ආයතන ගණන්"
          color={NAVY}
          rows={[
            { label: t("Govt. Schools", "රජයේ පාසල්"), value: education.institutionCounts.govtSchools },
            { label: t("Private/International Schools", "පෞද්ගලික/ජාත්‍යන්තර පාසල්"), value: education.institutionCounts.privateOrInternationalSchools },
            { label: t("Pirivenas", "පිරිවෙන්"), value: education.institutionCounts.pirivenas },
            { label: t("Vocational Institutes", "වෘත්තීය පුහුණු ආයතන"), value: education.institutionCounts.vocationalTrainingInstitutes },
            { label: t("Preschools (Govt.)", "පෙර පාසල් (රජයේ)"), value: education.institutionCounts.registeredPreschoolsGovt },
            { label: t("Preschools (Private)", "පෙර පාසල් (පෞද්ගලික)"), value: education.institutionCounts.registeredPreschoolsPrivate },
            { label: t("Dhamma Education Institutions", "දහම් අධ්‍යාපන ආයතන"), value: education.institutionCounts.dhammaEducationInstitutions },
            { label: t("Higher Education Institutions", "උසස් අධ්‍යාපන ආයතන"), value: education.institutionCounts.higherEducationInstitutions },
            { label: t("Tuition Class Institutions", "උපකාරක පන්ති ආයතන"), value: education.institutionCounts.tuitionCenterInstitutions },
          ]}
        />
        <BarCard
          titleEn="School Counts by Type"
          titleSi="වර්ගය අනුව පාසල් ගණන්"
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
          titleEn="Health Institution Counts"
          titleSi="සෞඛ්‍ය ආයතන ගණන්"
          color={MAROON}
          rows={[
            { label: t("Govt. Hospitals", "රජයේ රෝහල්"), value: health.institutionCounts.govtHospitals },
            { label: t("Primary Healthcare Units", "ප්‍රාථමික සෞඛ්‍ය ඒකක"), value: health.institutionCounts.primaryHealthcareUnits },
            { label: t("Private Hospitals", "පෞද්ගලික රෝහල්"), value: health.institutionCounts.privateHospitals },
            { label: t("Ayurvedic Hospitals", "ආයුර්වේද රෝහල්"), value: health.institutionCounts.ayurvedicHospitals },
            { label: t("Specialist Centers", "විශේෂඥ සේවා මධ්‍යස්ථාන"), value: health.institutionCounts.specialistServiceCenters },
            { label: t("MOH / Community Health Centers", "සෞඛ්‍ය වෛද්‍ය නිලධාරී/ප්‍රජා සෞඛ්‍ය මධ්‍යස්ථාන"), value: health.institutionCounts.mohOfficesOrCommunityHealthCenters },
            { label: t("Private Medical Labs", "පෞද්ගලික වෛද්‍ය රසායනාගාර"), value: health.institutionCounts.privateMedicalLabs },
            { label: t("Traditional Medicine Institutions", "පාරම්පරික වෙදකම් ආයතන"), value: health.institutionCounts.traditionalMedicineRegisteredInstitutions },
            { label: t("Animal Clinic Centers", "සත්ත්ව සායන මධ්‍යස්ථාන"), value: health.institutionCounts.animalClinicCenters },
            { label: t("Govt. Pharmacies", "රජයේ ෆාමසි"), value: health.institutionCounts.govtPharmacies },
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
                { en: "Abandoned Paddy Land (Acres)", si: "අතහැර දැමූ කුඹුරු (අක්කර)", value: econAgri.abandonedPaddyLand.extentAcres },
                { en: "Reactivatable Extent (Ha)", si: "නැවත සක්‍රීය කළ හැකි ප්‍රමාණය (හෙක්.)", value: econAgri.abandonedPaddyLand.canBeReactivatedExtent },
                { en: "Marine Fisheries Households", si: "මුහුදු මසුන් ගොවි ගෘහ ඒකක", value: econAgri.marineFisheries.householdCount },
                { en: "Marine Active Fishermen", si: "මුහුදු සක්‍රීය ධීවරයන්", value: econAgri.marineFisheries.activeFishermenCount },
                { en: "Inland Fisheries Households", si: "අභ්‍යන්තර මසුන් ගොවි ගෘහ ඒකක", value: econAgri.inlandFisheries.householdCount },
                { en: "Inland Active Fishermen", si: "අභ්‍යන්තර සක්‍රීය ධීවරයන්", value: econAgri.inlandFisheries.activeFishermenCount },
              ]}
            />
          </CardContent>
        </Card>
        <BarCard
          titleEn="Land Use (Hectares)"
          titleSi="ඉඩම් භාවිතය (හෙක්.)"
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
          titleEn="Welfare Payment Households"
          titleSi="සුබසාධන ගෙවීම් ලබන ගෘහ ඒකක"
          color={GREEN}
          rows={[
            { label: "Rs. 2,500", value: community.welfarePaymentHouseholdCounts.rs2500 },
            { label: "Rs. 5,000", value: community.welfarePaymentHouseholdCounts.rs5000 },
            { label: "Rs. 8,500", value: community.welfarePaymentHouseholdCounts.rs8500 },
            { label: "Rs. 15,000", value: community.welfarePaymentHouseholdCounts.rs15000 },
            { label: t("Total Aswesuma Recipients", "අස්වැසුම ප්‍රතිලාභී මුළු"), value: community.welfarePaymentHouseholdCounts.totalAswesumaRecipients },
          ]}
        />
        <BarCard
          titleEn="Allowance Recipients"
          titleSi="දීමනා ලබන්නන්"
          color={GREEN}
          rows={[
            { label: t("Disability Allowance", "ආබාධිත දීමනාව"), value: community.allowanceRecipientCounts.disabilityAllowance },
            { label: t("Elderly Allowance", "වැඩිහිටි දීමනාව"), value: community.allowanceRecipientCounts.elderlyAllowance },
            { label: t("Nutrition Allowance", "පෝෂණ දීමනාව"), value: community.allowanceRecipientCounts.nutritionAllowance },
            { label: t("Public Assistance", "රාජ්‍ය ආධාර"), value: community.allowanceRecipientCounts.publicAssistance },
            { label: t("Disease Aid - Wheelchair", "රෝගාධාර - වීල්චෙයාර්"), value: community.allowanceRecipientCounts.diseaseAidWheelchair },
            { label: t("Disease Aid - Cancer", "රෝගාධාර - පිළිකා"), value: community.allowanceRecipientCounts.diseaseAidCancer },
            { label: t("Disease Aid - Thalassemia", "රෝගාධාර - තැලසීමියා"), value: community.allowanceRecipientCounts.diseaseAidThalassemia },
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
              <YesNoBadge yes={infra.publicFacilities.busStand > 0} labelEn="Bus Stand" labelSi="බස් නැවතුම්පොළ" />
              <YesNoBadge yes={infra.publicFacilities.railwayStation > 0} labelEn="Railway Station" labelSi="දුම්රිය ස්ථානය" />
              <YesNoBadge yes={infra.publicFacilities.jetty > 0} labelEn="Jetty" labelSi="එතුම් තොටුපොළ" />
              <YesNoBadge yes={infra.publicFacilities.airport > 0} labelEn="Airport" labelSi="ගුවන් තොටුපොළ" />
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
