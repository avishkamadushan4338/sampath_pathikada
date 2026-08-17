"use client";

import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyStats, type ReadOnlyStat } from "@/components/analytics/ReadOnlyStats";
import { ReadOnlyTable, type ReadOnlyColumn } from "@/components/analytics/ReadOnlyTable";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAreaAnalytics } from "@/hooks/use-area-analytics";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { educationDict } from "@/lib/i18n/sections/education";
import type { Translated } from "@/lib/i18n/types";
import type { EducationAggregate } from "@/lib/analytics/aggregate-sections";
import type { EducationData } from "@/lib/validators/sections/education";

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const PRESCHOOL_FACILITY_TYPE_OPTIONS = [
  { value: "govt", label: { en: "Government", si: "රාජ්‍ය" } },
  { value: "private", label: { en: "Private", si: "පෞද්ගලික" } },
];

const TERTIARY_TYPE_OPTIONS = [
  { value: "university-college", label: { en: "College of Education", si: "විද්‍යාපීඨ" } },
  { value: "university", label: { en: "University", si: "විශ්ව විද්‍යාල" } },
  { value: "tech-institute", label: { en: "Higher Technical Institute", si: "උසස් තාක්ෂණ ආයතන" } },
  { value: "private-university", label: { en: "Private University", si: "පෞද්ගලික විශ්ව විද්‍යාල" } },
];

const DHAMMA_TYPE_OPTIONS = [
  { value: "buddhist", label: { en: "Buddhist", si: "බෞද්ධ" } },
  { value: "islam", label: { en: "Islam", si: "ඉස්ලාම්" } },
  { value: "hindu", label: { en: "Hindu", si: "හින්දු" } },
  { value: "christian", label: { en: "Christian", si: "ක්‍රිස්තියානි" } },
];

const INSTITUTION_COUNT_FIELDS: { key: string; label: Translated }[] = [
  { key: "govtSchools", label: { en: "Schools (Government)", si: "පාසල් (රජයේ)" } },
  { key: "privateOrInternationalSchools", label: { en: "Private Schools / International Schools", si: "පෞද්ගලික පාසල් /ජාත්‍යන්තර පාසල්" } },
  { key: "pirivenas", label: { en: "Pirivenas", si: "පිරිවෙන්" } },
  { key: "vocationalTrainingInstitutes", label: { en: "Technical and Vocational Training Institutions", si: "කාර්මික හා වෘත්තීය පුහුණු ආයතන" } },
  { key: "registeredPreschoolsGovt", label: { en: "Registered Preschools - Government", si: "ලියාපදිංචි පෙර පාසල්- රජයේ" } },
  { key: "registeredPreschoolsPrivate", label: { en: "Registered Preschools - Private", si: "ලියාපදිංචි පෙර පාසල් - පෞද්ගලික" } },
  { key: "dhammaEducationInstitutions", label: { en: "Dhamma Education Institutions", si: "දහම් අධ්‍යාපනය ලබාදෙන ආයතන" } },
  { key: "higherEducationInstitutions", label: { en: "Higher Education Institutions", si: "උසස් අධ්‍යාපන ආයතන" } },
  { key: "tuitionCenterInstitutions", label: { en: "Tuition Class Institutions", si: "උපකාරක පන්ති පවත්වන ආයතන" } },
];

const SCHOOL_COUNT_BY_TYPE_FIELDS: { key: string; label: Translated }[] = [
  { key: "nationalSchools", label: { en: "National Schools", si: "ජාතික පාසල් සංඛ්‍යාව" } },
  {
    key: "type1AB",
    label: { en: "Type 1 AB (A/L Science)", si: "වර්ගය 1 AB - උසස් පෙළ විද්‍යා විෂයයන් ඇති පාසල්" },
  },
  {
    key: "type1C",
    label: { en: "Type 1 C (A/L Arts / Commerce)", si: "වර්ගය 1 C - උසස් පෙළ කලා/වාණිජ විෂයයන් ඇති පාසල්" },
  },
  {
    key: "type2",
    label: { en: "Type 2 (Grades 1–11)", si: "වර්ගය 2 - 1-11 ශ්‍රේණිය දක්වා පන්ති පවතින පාසල්" },
  },
  { key: "type3", label: { en: "Type 3 (Primary Schools)", si: "වර්ගය 3 - ප්‍රාථමික පාසල්" } },
];

const SEX_COUNT_FIELDS: { key: string; label: Translated }[] = [
  { key: "male", label: { en: "Male", si: "පිරිමි" } },
  { key: "female", label: { en: "Female", si: "ගැහැණු" } },
];

/** Appends a live-computed "Total" stat to a female/male stat pair — mirrors the entry form's
 *  computed total field for the same two counts. `values` can be `undefined` — every sub-group in
 *  this section's schema is optional at save time (a draft can be submitted, and later approved,
 *  having only ever had some of its subsections filled in), so an approved record's
 *  `education.outOfSchoolChildren` etc. is not guaranteed to exist even though `EducationData`'s
 *  strict type claims it always does. */
function withSexTotal(stats: ReadOnlyStat[], values: Record<string, number | undefined> | undefined): ReadOnlyStat[] {
  const total = (values?.male ?? 0) + (values?.female ?? 0);
  return [...stats, { key: "total", label: { en: "Total", si: "එකතුව" }, value: total.toString() }];
}

/** Appends a live-computed "Total School Count" stat — mirrors the entry form's computed total
 *  across the 5 school-count-by-type fields. */
function withSchoolCountTotal(stats: ReadOnlyStat[], values: Record<string, number | undefined> | undefined): ReadOnlyStat[] {
  const total = SCHOOL_COUNT_BY_TYPE_FIELDS.reduce((sum, f) => sum + (values?.[f.key] ?? 0), 0);
  return [...stats, { key: "total", label: { en: "Total School Count", si: "මුළු පාසල් සංඛ්‍යාව" }, value: total.toString() }];
}

const GN_DIVISION_COLUMN: ReadOnlyColumn = { key: "gnName", label: { en: "GN Division", si: "ග්‍රාම නිලධාරී වසම" } };

const SCHOOL_FACILITY_COLUMNS: ReadOnlyColumn[] = [
  { key: "schoolName", label: { en: "School Name", si: "පාසලේ නම" } },
  { key: "accommodationAvailable", label: { en: "* Boarding Facilities", si: "*නේවාසික පහසුකම්" }, options: YES_NO_OPTIONS },
  { key: "teachersFemale", label: { en: "Teachers (Female)", si: "ගුරුවරු ගණන - ස්ත්‍රී" } },
  { key: "teachersMale", label: { en: "Teachers (Male)", si: "ගුරුවරු ගණන - පුරුෂ" } },
  { key: "studentsFemale", label: { en: "Students (Female)", si: "සිසුන් ගණන - ස්ත්‍රී" } },
  { key: "studentsMale", label: { en: "Students (Male)", si: "සිසුන් ගණන - පුරුෂ" } },
  { key: "waterFacility", label: { en: "* Water Facilities", si: "*ජල පහසුකම්" }, options: YES_NO_OPTIONS },
  { key: "sanitationFacility", label: { en: "* Toilet Facilities", si: "*වැසිකිලි පහසුකම්" }, options: YES_NO_OPTIONS },
  { key: "sportsGround", label: { en: "* Playground", si: "*ක්‍රීඩාපිටි" }, options: YES_NO_OPTIONS },
];

const SPECIAL_ATTENTION_SCHOOL_COLUMNS: ReadOnlyColumn[] = [
  { key: "schoolName", label: { en: "School Name", si: "පාසලේ නම" } },
  { key: "teachersFemale", label: { en: "Teachers (Female)", si: "ගුරුවරු ගණන - ස්ත්‍රී" } },
  { key: "teachersMale", label: { en: "Teachers (Male)", si: "ගුරුවරු ගණන - පුරුෂ" } },
  { key: "studentsFemale", label: { en: "Students (Female)", si: "සිසුන් ගණන - ස්ත්‍රී" } },
  { key: "studentsMale", label: { en: "Students (Male)", si: "සිසුන් ගණන - පුරුෂ" } },
  { key: "developmentNeeds", label: { en: "Development Needs", si: "සංවර්ධන අවශ්‍යතා" } },
];

const CLOSED_SCHOOL_COLUMNS: ReadOnlyColumn[] = [
  { key: "schoolName", label: { en: "School Name", si: "පාසලේ නම" } },
  { key: "yearClosed", label: { en: "Year Closed", si: "වැසීගිය වර්ෂය" } },
  { key: "buildingCount", label: { en: "Existing Buildings", si: "පවතින ගොඩනැගිලි සංඛ්‍යාව" } },
  {
    key: "buildingsUsable",
    label: { en: "Whether Buildings Can Currently Be Used", si: "ගොඩනැගිලි දැනට භාවිතා කලහැකි බව/නොහැකි බව" },
    options: YES_NO_OPTIONS,
  },
];

const PRIVATE_INTERNATIONAL_SCHOOL_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "School Name", si: "පාසලේ නම" } },
  { key: "teacherCount", label: { en: "Number of Teachers", si: "ගුරුවරු ගණන" } },
  { key: "studentCount", label: { en: "Number of Students", si: "සිසුන් ගණන" } },
];

const PIRIVENA_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Pirivena Name", si: "පිරිවෙනේ නම" } },
  { key: "type", label: { en: "* Pirivena Type", si: "*පිරිවෙනේ වර්ගය" } },
  { key: "boardingFacility", label: { en: "Boarding Facilities", si: "නේවාසික පහසුකම්" }, options: YES_NO_OPTIONS },
  { key: "teachersFemale", label: { en: "Teachers (Female)", si: "ගුරුවරු ගණන - ස්ත්‍රී" } },
  { key: "teachersMale", label: { en: "Teachers (Male)", si: "ගුරුවරු ගණන - පුරුෂ" } },
  { key: "studentsFemale", label: { en: "Students (Female)", si: "සිසුන් ගණන - ස්ත්‍රී" } },
  { key: "studentsMale", label: { en: "Students (Male)", si: "සිසුන් ගණන - පුරුෂ" } },
  { key: "waterFacility", label: { en: "Water Facilities", si: "ජල පහසුකම්" }, options: YES_NO_OPTIONS },
  { key: "sanitationFacility", label: { en: "Toilet Facilities", si: "වැසිකිලි පහසුකම්" }, options: YES_NO_OPTIONS },
  { key: "sportsGround", label: { en: "Playground", si: "ක්‍රීඩාපිටි" }, options: YES_NO_OPTIONS },
];

const VOCATIONAL_INSTITUTE_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Technical and Vocational Training Institution", si: "කාර්මික හා වෘත්තීය පුහුණු ආයතන" } },
];

const PRESCHOOL_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Preschool Name", si: "පෙර පාසලේ නම" } },
  { key: "address", label: { en: "Address", si: "ලිපිනය" } },
  { key: "facilityType", label: { en: "Private / Government", si: "පුද්ගලික/ රජයේ" }, options: PRESCHOOL_FACILITY_TYPE_OPTIONS },
  { key: "studentCount", label: { en: "Number of Students", si: "සිසුන් ගණන" } },
  { key: "teacherCount", label: { en: "Number of Teachers", si: "ගුරුවරු ගණන" } },
];

const DHAMMA_EDUCATION_INSTITUTION_COLUMNS: ReadOnlyColumn[] = [
  { key: "institutionName", label: { en: "Name of Dhamma Education Institution", si: "දහම් අධ්‍යාපනය ලබාදෙන ආයතනයේ නම" } },
  { key: "type", label: { en: "* Dhamma Education Institution Type", si: "*දහම් අධ්‍යාපනය ලබාදෙන ආයතන වර්ගය" }, options: DHAMMA_TYPE_OPTIONS },
  { key: "teacherCount", label: { en: "Number of Teachers", si: "ගුරුවරු ගණන" } },
  { key: "studentCount", label: { en: "Number of Students", si: "සිසුන් ගණන" } },
];

const TERTIARY_INSTITUTION_COLUMNS: ReadOnlyColumn[] = [
  { key: "type", label: { en: "Institution Type", si: "ආයතන වර්ගය" }, options: TERTIARY_TYPE_OPTIONS },
  { key: "exists", label: { en: "Exists? (Yes/No)", si: "ඇත/නැත" }, options: YES_NO_OPTIONS },
  { key: "name", label: { en: "Institution Name (Indicate Branches Too)", si: "ආයතනයේ නම (ශාඛා ද සඳහන් කරන්න)" } },
];

const TUITION_CENTER_COLUMNS: ReadOnlyColumn[] = [
  { key: "registrationNumber", label: { en: "Registration Number", si: "ලියාපදිංචි අංකය" } },
  {
    key: "nameAndAddress",
    label: { en: "Name and Address of Tuition Class Institution", si: "උපකාරක පන්ති ආයතනයන්හි නම හා ලිපිනය" },
  },
];

/** Builds the {key, label, value} triples ReadOnlyStats needs from a fixed field list plus
 *  whatever numeric object holds the actual figures — shared by the per-GN and area-wide
 *  renderings so both stay in sync with the same field set. `values` can be `undefined` — every
 *  sub-group in this section's schema is optional at save time (a draft can be submitted, and
 *  later approved, having only ever had some of its subsections filled in), so an approved
 *  record's `education.institutionCounts` etc. is not guaranteed to exist even though
 *  `EducationData`'s strict type claims it always does. */
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

/** GN-division-scoped view of the "Education" section (§6): institution counts, school
 *  facilities, special-needs and closed schools, pirivenas, preschools, dhamma education
 *  institutions, tertiary institutions, tuition centers, and out-of-school / probation-custody
 *  child counts for whichever GN division the DS searches or selects — or, before any division
 *  is picked, the whole-division aggregate across every approved GN division. */
export function EducationView() {
  const { lang } = useLanguage();
  const { data: area, isLoading: areaLoading, isError: areaError } = useAreaAnalytics();

  return (
    <GnScopedSectionView
      prompt={{
        en: "Search or select a GN division above to view its Education data.",
        si: "එහි අධ්‍යාපන තොරතුරු බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
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
                en="Unable to load whole-division Education data right now. Please try again shortly."
                si="සම්පූර්ණ කොට්ඨාසයේ අධ්‍යාපන තොරතුරු මෙම මොහොතේ පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
              />
            </CardContent>
          </Card>
        ) : (
          <EducationAreaWideView aggregate={area.sections.education} lang={lang} />
        )
      }
    >
      {(profile) => {
        const section = profile.data.education;

        if (!section) {
          return (
            <Card>
              <CardContent className="text-fluid-sm text-muted-foreground">
                <Bilingual
                  en="This GN division's approved submission doesn't include Education data yet."
                  si="මෙම ග්‍රාම නිලධාරී වසමේ අනුමත ඉදිරිපත් කිරීමේ අධ්‍යාපන තොරතුරු තවම ඇතුළත් නොවේ."
                />
              </CardContent>
            </Card>
          );
        }

        return <EducationSectionContent section={section} />;
      }}
    </GnScopedSectionView>
  );
}

function EducationSectionContent({ section }: { section: EducationData }) {
  return (
    <div className="flex flex-col gap-8">
      <ReadOnlyStats title={educationDict.fields.institutionCounts} stats={toStats(INSTITUTION_COUNT_FIELDS, section.institutionCounts)} />
      <ReadOnlyStats
        title={educationDict.fields.schoolCountsByType}
        stats={withSchoolCountTotal(toStats(SCHOOL_COUNT_BY_TYPE_FIELDS, section.schoolCountsByType), section.schoolCountsByType)}
      />

      <ReadOnlyTable title={educationDict.fields.schoolFacilities} columns={SCHOOL_FACILITY_COLUMNS} rows={toRows(section.schoolFacilities ?? [])} />
      <ReadOnlyTable title={educationDict.fields.specialAttentionSchools} columns={SPECIAL_ATTENTION_SCHOOL_COLUMNS} rows={toRows(section.specialAttentionSchools ?? [])} />
      <ReadOnlyTable title={educationDict.fields.closedSchools} columns={CLOSED_SCHOOL_COLUMNS} rows={toRows(section.closedSchools ?? [])} />
      <ReadOnlyTable title={educationDict.fields.privateInternationalSchools} columns={PRIVATE_INTERNATIONAL_SCHOOL_COLUMNS} rows={toRows(section.privateInternationalSchools ?? [])} />
      <ReadOnlyTable title={educationDict.fields.pirivenas} columns={PIRIVENA_COLUMNS} rows={toRows(section.pirivenas ?? [])} />
      <ReadOnlyTable title={educationDict.fields.vocationalInstitutes} columns={VOCATIONAL_INSTITUTE_COLUMNS} rows={toRows(section.vocationalInstitutes ?? [])} />
      <ReadOnlyTable title={educationDict.fields.preschools} columns={PRESCHOOL_COLUMNS} rows={toRows(section.preschools ?? [])} />
      <ReadOnlyTable title={educationDict.fields.dhammaEducationInstitutions} columns={DHAMMA_EDUCATION_INSTITUTION_COLUMNS} rows={toRows(section.dhammaEducationInstitutions ?? [])} />
      <ReadOnlyTable title={educationDict.fields.tertiaryInstitutions} columns={TERTIARY_INSTITUTION_COLUMNS} rows={toRows(section.tertiaryInstitutions ?? [])} />
      <ReadOnlyTable title={educationDict.fields.tuitionCenters} columns={TUITION_CENTER_COLUMNS} rows={toRows(section.tuitionCenters ?? [])} />

      <ReadOnlyStats title={educationDict.fields.outOfSchoolChildren} stats={withSexTotal(toStats(SEX_COUNT_FIELDS, section.outOfSchoolChildren), section.outOfSchoolChildren)} />
      <ReadOnlyStats
        title={educationDict.fields.childrenInProbationOrDetention}
        stats={withSexTotal(toStats(SEX_COUNT_FIELDS, section.childrenInProbationOrDetention), section.childrenInProbationOrDetention)}
      />
    </div>
  );
}

/** Whole-division rollup of every approved GN division's Education data: scalar groups are
 *  summed, and every repeatable list is pooled with a GN Division column added so each row's
 *  source division is still visible — same shape `aggregateEducation` already produces. */
function EducationAreaWideView({ aggregate, lang }: { aggregate: EducationAggregate; lang: "en" | "si" }) {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-fluid-sm text-muted-foreground">
        <Bilingual
          en="Aggregated across every GN division with an approved submission in your division. Select a GN division above to see its individual data."
          si="ඔබගේ කොට්ඨාසයේ අනුමත ඉදිරිපත් කිරීමක් ඇති සියලුම ග්‍රාම නිලධාරී වසම් හරහා එකතු කර ඇත. තනි වසමක දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් තෝරන්න."
        />
      </p>

      <ReadOnlyStats title={educationDict.fields.institutionCounts} stats={toStats(INSTITUTION_COUNT_FIELDS, aggregate.institutionCounts)} />
      <ReadOnlyStats
        title={educationDict.fields.schoolCountsByType}
        stats={withSchoolCountTotal(toStats(SCHOOL_COUNT_BY_TYPE_FIELDS, aggregate.schoolCountsByType), aggregate.schoolCountsByType)}
      />

      <ReadOnlyTable lang={lang} title={educationDict.fields.schoolFacilities} columns={[GN_DIVISION_COLUMN, ...SCHOOL_FACILITY_COLUMNS]} rows={toRows(aggregate.schoolFacilities.rows)} />
      <ReadOnlyTable lang={lang} title={educationDict.fields.specialAttentionSchools} columns={[GN_DIVISION_COLUMN, ...SPECIAL_ATTENTION_SCHOOL_COLUMNS]} rows={toRows(aggregate.specialAttentionSchools.rows)} />
      <ReadOnlyTable lang={lang} title={educationDict.fields.closedSchools} columns={[GN_DIVISION_COLUMN, ...CLOSED_SCHOOL_COLUMNS]} rows={toRows(aggregate.closedSchools.rows)} />
      <ReadOnlyTable lang={lang} title={educationDict.fields.privateInternationalSchools} columns={[GN_DIVISION_COLUMN, ...PRIVATE_INTERNATIONAL_SCHOOL_COLUMNS]} rows={toRows(aggregate.privateInternationalSchools.rows)} />
      <ReadOnlyTable lang={lang} title={educationDict.fields.pirivenas} columns={[GN_DIVISION_COLUMN, ...PIRIVENA_COLUMNS]} rows={toRows(aggregate.pirivenas.rows)} />
      <ReadOnlyTable lang={lang} title={educationDict.fields.vocationalInstitutes} columns={[GN_DIVISION_COLUMN, ...VOCATIONAL_INSTITUTE_COLUMNS]} rows={toRows(aggregate.vocationalInstitutes.rows)} />
      <ReadOnlyTable lang={lang} title={educationDict.fields.preschools} columns={[GN_DIVISION_COLUMN, ...PRESCHOOL_COLUMNS]} rows={toRows(aggregate.preschools.rows)} />
      <ReadOnlyTable lang={lang} title={educationDict.fields.dhammaEducationInstitutions} columns={[GN_DIVISION_COLUMN, ...DHAMMA_EDUCATION_INSTITUTION_COLUMNS]} rows={toRows(aggregate.dhammaEducationInstitutions.rows)} />
      <ReadOnlyTable lang={lang} title={educationDict.fields.tertiaryInstitutions} columns={[GN_DIVISION_COLUMN, ...TERTIARY_INSTITUTION_COLUMNS]} rows={toRows(aggregate.tertiaryInstitutions.rows)} />
      <ReadOnlyTable lang={lang} title={educationDict.fields.tuitionCenters} columns={[GN_DIVISION_COLUMN, ...TUITION_CENTER_COLUMNS]} rows={toRows(aggregate.tuitionCenters.rows)} />

      <ReadOnlyStats title={educationDict.fields.outOfSchoolChildren} stats={withSexTotal(toStats(SEX_COUNT_FIELDS, aggregate.outOfSchoolChildren), aggregate.outOfSchoolChildren)} />
      <ReadOnlyStats
        title={educationDict.fields.childrenInProbationOrDetention}
        stats={withSexTotal(toStats(SEX_COUNT_FIELDS, aggregate.childrenInProbationOrDetention), aggregate.childrenInProbationOrDetention)}
      />
    </div>
  );
}
