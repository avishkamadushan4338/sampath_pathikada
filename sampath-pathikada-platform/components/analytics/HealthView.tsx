"use client";

import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyStats, type ReadOnlyStat } from "@/components/analytics/ReadOnlyStats";
import { ReadOnlyTable, type ReadOnlyColumn } from "@/components/analytics/ReadOnlyTable";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAreaAnalytics } from "@/hooks/use-area-analytics";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { healthDict } from "@/lib/i18n/sections/health";
import type { Translated } from "@/lib/i18n/types";
import type { HealthAggregate } from "@/lib/analytics/aggregate-sections";
import type { HealthData } from "@/lib/validators/sections/health";

const GOVT_HOSPITAL_TYPE_OPTIONS = [
  { value: "teaching", label: { en: "Teaching Hospital", si: "ශික්ෂණ රෝහල්" } },
  { value: "base", label: { en: "Base Hospital", si: "මහරෝහල්" } },
  { value: "primary", label: { en: "Primary Hospital", si: "මූලික රෝහල්" } },
  { value: "divisional", label: { en: "Divisional Hospital", si: "ප්‍රාදේශිය රෝහල්" } },
];

const INSTITUTION_COUNT_FIELDS: { key: string; label: Translated }[] = [
  { key: "govtHospitals", label: { en: "Number of Government Hospitals", si: "රජයේ රෝහල් සංඛ්‍යාව" } },
  {
    key: "primaryHealthcareUnits",
    label: { en: "Primary Healthcare Units (Central Dispensary - Western) / Maternity Homes", si: "ප්‍රාථමික සෞඛ්‍ය සත්කාර ඒකක-( මධ්‍යම බෙහෙත් ශාලා- බටහිර )/මාතෘ නිවාස" },
  },
  {
    key: "privateHospitals",
    label: { en: "Number of Private Hospitals (with Residential Facilities)", si: "පෞද්ගලික රෝහල් සංඛ්‍යාව (නේවාසික පහසුකම් සහිත)" },
  },
  {
    key: "ayurvedicHospitals",
    label: { en: "Number of Ayurvedic Hospitals / Ayurvedic Central Dispensaries", si: "ආයුර්වේද රෝහල් /ආයුර්වේද මධ්‍යම බෙහෙත් ශාලා සංඛ්‍යාව" },
  },
  {
    key: "specialistServiceCenters",
    label: { en: "Number of Institutions Providing Specialist Medical Services (Wellness Center)", si: "විශේෂඥ වෛද්‍ය සේවා ලබාගතහැකි ආයතන සංඛ්‍යාව (චැනලින් සෙන්ටර්)" },
  },
  {
    key: "mohOfficesOrCommunityHealthCenters",
    label: { en: "MOH Offices / Village Health Centers", si: "සෞඛ්‍ය වෛද්‍ය නිලධාරි කාර්යාල/ ග්‍රාමෝදය සෞඛ්‍ය මධ්‍යස්ථාන" },
  },
  {
    key: "traditionalMedicineRegisteredInstitutions",
    label: { en: "Registered Institutions Practicing Traditional Sinhala Medicine", si: "පාරම්පරික සිංහල වෙදකම සිදු කරන ලියාපදිංචි ආයතන" },
  },
  { key: "privateMedicalLabs", label: { en: "Private Medical Clinic Centers", si: "පෞද්ගලික වෛද්‍ය සායන මධ්‍යස්ථාන" } },
  { key: "animalClinicCenters", label: { en: "Animal Clinic Centers", si: "සත්ත්ව සායන මධ්‍යස්ථාන" } },
  { key: "govtPharmacies", label: { en: "Government Pharmacies", si: "රාජ්‍ය ඖෂධශල" } },
  { key: "privatePharmacies", label: { en: "Private Pharmacies", si: "පෞද්ගලික ෆාමසි" } },
];

const GN_DIVISION_COLUMN: ReadOnlyColumn = { key: "gnName", label: { en: "GN Division", si: "ග්‍රාම නිලධාරී වසම" } };

const GOVT_HOSPITAL_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Government Hospital Name", si: "රජයේ රෝහලේ නම" } },
  { key: "type", label: { en: "Hospital Type", si: "රෝහල් වර්ගය" }, options: GOVT_HOSPITAL_TYPE_OPTIONS },
];

const PRIMARY_HEALTHCARE_UNIT_COLUMNS: ReadOnlyColumn[] = [
  {
    key: "name",
    label: {
      en: "Primary Healthcare Unit Name (Central Dispensary - Western) / Maternity Home",
      si: "ප්‍රාථමික සෞඛ්‍ය සත්කාර ඒකකයේ නම -( මධ්‍යම බෙහෙත් ශාලා- බටහිර )/මාතෘ නිවාස)",
    },
  },
  { key: "type", label: { en: "* Type", si: "*වර්ගය" } },
];

const NAME_ADDRESS_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name of Institution", si: "ආයතනයේ නම" } },
  { key: "address", label: { en: "Address", si: "ලිපිනය" } },
];

const PRIVATE_HOSPITAL_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Private Hospital Name", si: "පෞද්ගලික රෝහලේ නම" } },
  { key: "address", label: { en: "Address", si: "ලිපිනය" } },
];

const TRADITIONAL_PRACTITIONER_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Practitioner Name", si: "පාරම්පරික සිංහල වෙදකම සිදු කරන වෛද්‍යවරුන්ගේ නම" } },
  { key: "specialty", label: { en: "* Field of Practice", si: "*කටයුතු කරන වෛද්‍ය ක්ෂේත්‍රය" } },
];

/** Builds the {key, label, value} triples ReadOnlyStats needs from a fixed field list plus
 *  whatever numeric object holds the actual figures — shared by the per-GN and area-wide
 *  renderings so both stay in sync with the same field set. `values` can be `undefined` — every
 *  sub-group in this section's schema is optional at save time (a draft can be submitted, and
 *  later approved, having only ever had some of its subsections filled in), so an approved
 *  record's `health.institutionCounts` is not guaranteed to exist even though `HealthData`'s
 *  strict type claims it always does. */
function toStats(
  fields: { key: string; label: Translated }[],
  values: Record<string, number | undefined> | undefined
): ReadOnlyStat[] {
  return fields.map((f) => ({ key: f.key, label: f.label, value: values?.[f.key]?.toString() }));
}

/** Converts a repeatable-row object into the string-valued record ReadOnlyTable expects,
 *  stringifying numbers and passing strings through untouched. */
function toRows(rows: Record<string, unknown>[]): Record<string, string | undefined>[] {
  return rows.map((row) => {
    const out: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(row)) {
      out[key] = value === undefined || value === null ? undefined : String(value);
    }
    return out;
  });
}

/** GN-division-scoped view of the "Health" section (§9): institution counts, hospital and
 *  healthcare-unit directories, pharmacies, and traditional-medicine practitioners for whichever
 *  GN division the DS searches or selects — or, before any division is picked, the whole-division
 *  aggregate across every approved GN division. */
export function HealthView() {
  const { lang } = useLanguage();
  const { data: area, isLoading: areaLoading, isError: areaError } = useAreaAnalytics();

  return (
    <GnScopedSectionView
      prompt={{
        en: "Search or select a GN division above to view its Health data.",
        si: "එහි සෞඛ්‍ය තොරතුරු බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
      }}
      unselectedContent={
        areaLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : areaError || !area ? (
          <Card>
            <CardContent className="text-fluid-sm text-muted-foreground">
              <Bilingual
                en="Unable to load whole-division Health data right now. Please try again shortly."
                si="සම්පූර්ණ කොට්ඨාසයේ සෞඛ්‍ය තොරතුරු මෙම මොහොතේ පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
              />
            </CardContent>
          </Card>
        ) : (
          <HealthAreaWideView aggregate={area.sections.health} lang={lang} />
        )
      }
    >
      {(profile) => {
        const section = profile.data.health;

        if (!section) {
          return (
            <Card>
              <CardContent className="text-fluid-sm text-muted-foreground">
                <Bilingual
                  en="This GN division's approved submission doesn't include Health data yet."
                  si="මෙම ග්‍රාම නිලධාරී වසමේ අනුමත ඉදිරිපත් කිරීමේ සෞඛ්‍ය තොරතුරු තවම ඇතුළත් නොවේ."
                />
              </CardContent>
            </Card>
          );
        }

        return <HealthSectionContent section={section} />;
      }}
    </GnScopedSectionView>
  );
}

function HealthSectionContent({ section }: { section: HealthData }) {
  return (
    <div className="flex flex-col gap-8">
      <ReadOnlyStats title={healthDict.fields.institutionCounts} stats={toStats(INSTITUTION_COUNT_FIELDS, section.institutionCounts)} />

      <ReadOnlyTable title={healthDict.fields.govtHospitalsDirectory} columns={GOVT_HOSPITAL_COLUMNS} rows={toRows(section.govtHospitalsDirectory ?? [])} />
      <ReadOnlyTable title={healthDict.fields.primaryHealthcareUnitsDirectory} columns={PRIMARY_HEALTHCARE_UNIT_COLUMNS} rows={toRows(section.primaryHealthcareUnitsDirectory ?? [])} />
      <ReadOnlyTable title={healthDict.fields.privateHospitalsDirectory} columns={PRIVATE_HOSPITAL_COLUMNS} rows={toRows(section.privateHospitalsDirectory ?? [])} />
      <ReadOnlyTable title={healthDict.fields.ayurvedicInstitutions} columns={NAME_ADDRESS_COLUMNS} rows={toRows(section.ayurvedicInstitutions ?? [])} />
      <ReadOnlyTable title={healthDict.fields.specialistServiceCentersDirectory} columns={NAME_ADDRESS_COLUMNS} rows={toRows(section.specialistServiceCentersDirectory ?? [])} />
      <ReadOnlyTable title={healthDict.fields.mohOfficesDirectory} columns={NAME_ADDRESS_COLUMNS} rows={toRows(section.mohOfficesDirectory ?? [])} />
      <ReadOnlyTable title={healthDict.fields.traditionalMedicineInstitutionsDirectory} columns={NAME_ADDRESS_COLUMNS} rows={toRows(section.traditionalMedicineInstitutionsDirectory ?? [])} />
      <ReadOnlyTable title={healthDict.fields.privateMedicalLabsDirectory} columns={NAME_ADDRESS_COLUMNS} rows={toRows(section.privateMedicalLabsDirectory ?? [])} />
      <ReadOnlyTable title={healthDict.fields.animalClinicsDirectory} columns={NAME_ADDRESS_COLUMNS} rows={toRows(section.animalClinicsDirectory ?? [])} />
      <ReadOnlyTable title={healthDict.fields.traditionalPractitioners} columns={TRADITIONAL_PRACTITIONER_COLUMNS} rows={toRows(section.traditionalPractitioners ?? [])} />
    </div>
  );
}

/** Whole-division rollup of every approved GN division's Health data: institution counts are
 *  summed, and every directory is pooled with a GN Division column added so each row's source
 *  division is still visible — same shape `aggregateHealth` already produces. */
function HealthAreaWideView({ aggregate, lang }: { aggregate: HealthAggregate; lang: "en" | "si" }) {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-fluid-sm text-muted-foreground">
        <Bilingual
          en="Aggregated across every GN division with an approved submission in your division. Select a GN division above to see its individual data."
          si="ඔබගේ කොට්ඨාසයේ අනුමත ඉදිරිපත් කිරීමක් ඇති සියලුම ග්‍රාම නිලධාරී වසම් හරහා එකතු කර ඇත. තනි වසමක දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් තෝරන්න."
        />
      </p>

      <ReadOnlyStats title={healthDict.fields.institutionCounts} stats={toStats(INSTITUTION_COUNT_FIELDS, aggregate.institutionCounts)} />

      <ReadOnlyTable lang={lang} title={healthDict.fields.govtHospitalsDirectory} columns={[GN_DIVISION_COLUMN, ...GOVT_HOSPITAL_COLUMNS]} rows={toRows(aggregate.govtHospitalsDirectory.rows)} />
      <ReadOnlyTable lang={lang} title={healthDict.fields.primaryHealthcareUnitsDirectory} columns={[GN_DIVISION_COLUMN, ...PRIMARY_HEALTHCARE_UNIT_COLUMNS]} rows={toRows(aggregate.primaryHealthcareUnitsDirectory.rows)} />
      <ReadOnlyTable lang={lang} title={healthDict.fields.privateHospitalsDirectory} columns={[GN_DIVISION_COLUMN, ...PRIVATE_HOSPITAL_COLUMNS]} rows={toRows(aggregate.privateHospitalsDirectory.rows)} />
      <ReadOnlyTable lang={lang} title={healthDict.fields.ayurvedicInstitutions} columns={[GN_DIVISION_COLUMN, ...NAME_ADDRESS_COLUMNS]} rows={toRows(aggregate.ayurvedicInstitutions.rows)} />
      <ReadOnlyTable lang={lang} title={healthDict.fields.specialistServiceCentersDirectory} columns={[GN_DIVISION_COLUMN, ...NAME_ADDRESS_COLUMNS]} rows={toRows(aggregate.specialistServiceCentersDirectory.rows)} />
      <ReadOnlyTable lang={lang} title={healthDict.fields.mohOfficesDirectory} columns={[GN_DIVISION_COLUMN, ...NAME_ADDRESS_COLUMNS]} rows={toRows(aggregate.mohOfficesDirectory.rows)} />
      <ReadOnlyTable lang={lang} title={healthDict.fields.traditionalMedicineInstitutionsDirectory} columns={[GN_DIVISION_COLUMN, ...NAME_ADDRESS_COLUMNS]} rows={toRows(aggregate.traditionalMedicineInstitutionsDirectory.rows)} />
      <ReadOnlyTable lang={lang} title={healthDict.fields.privateMedicalLabsDirectory} columns={[GN_DIVISION_COLUMN, ...NAME_ADDRESS_COLUMNS]} rows={toRows(aggregate.privateMedicalLabsDirectory.rows)} />
      <ReadOnlyTable lang={lang} title={healthDict.fields.animalClinicsDirectory} columns={[GN_DIVISION_COLUMN, ...NAME_ADDRESS_COLUMNS]} rows={toRows(aggregate.animalClinicsDirectory.rows)} />
      <ReadOnlyTable lang={lang} title={healthDict.fields.traditionalPractitioners} columns={[GN_DIVISION_COLUMN, ...TRADITIONAL_PRACTITIONER_COLUMNS]} rows={toRows(aggregate.traditionalPractitioners.rows)} />
    </div>
  );
}
