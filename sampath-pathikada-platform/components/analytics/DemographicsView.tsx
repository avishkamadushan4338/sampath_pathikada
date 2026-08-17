"use client";

import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyStats, type ReadOnlyStat } from "@/components/analytics/ReadOnlyStats";
import { ReadOnlyTable, type ReadOnlyColumn } from "@/components/analytics/ReadOnlyTable";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAreaAnalytics } from "@/hooks/use-area-analytics";
import { demographicsDict } from "@/lib/i18n/sections/demographics";
import type { Translated } from "@/lib/i18n/types";
import {
  AGE_BAND_LABELS,
  ETHNICITY_LABELS,
  RELIGION_LABELS,
  DISABILITY_LABELS,
  type DemographicsAggregate,
} from "@/lib/analytics/aggregate-demographics";
import { AGE_BANDS, ETHNICITIES, RELIGIONS, DISABILITY_TYPES } from "@/lib/validators/sections/demographics";
import type { DemographicsData } from "@/lib/validators/sections/demographics";

const AGE_BAND_OPTIONS = AGE_BANDS.map((band) => ({ value: band, label: AGE_BAND_LABELS[band] }));
const ETHNICITY_OPTIONS = ETHNICITIES.map((key) => ({ value: key, label: ETHNICITY_LABELS[key] }));
const RELIGION_OPTIONS = RELIGIONS.map((key) => ({ value: key, label: RELIGION_LABELS[key] }));
const DISABILITY_OPTIONS = DISABILITY_TYPES.map((key) => ({ value: key, label: DISABILITY_LABELS[key] }));

const AGE_COLUMNS: ReadOnlyColumn[] = [
  { key: "band", label: { en: "Age Group", si: "වයස් කාණ්ඩය" }, options: AGE_BAND_OPTIONS },
  { key: "female", label: { en: "Female", si: "ගැහැණු" } },
  { key: "male", label: { en: "Male", si: "පිරිමි" } },
  { key: "total", label: { en: "Total", si: "මුළු එකතුව" } },
];

const ETHNICITY_COLUMNS: ReadOnlyColumn[] = [
  { key: "ethnicity", label: { en: "Ethnicity", si: "ජාතිකත්වය" }, options: ETHNICITY_OPTIONS },
  { key: "female", label: { en: "Female", si: "ගැහැණු" } },
  { key: "male", label: { en: "Male", si: "පිරිමි" } },
  { key: "total", label: { en: "Total", si: "මුළු එකතුව" } },
];

const RELIGION_COLUMNS: ReadOnlyColumn[] = [
  { key: "religion", label: { en: "Religion", si: "ආගම" }, options: RELIGION_OPTIONS },
  { key: "female", label: { en: "Female", si: "ගැහැණු" } },
  { key: "male", label: { en: "Male", si: "පිරිමි" } },
  { key: "total", label: { en: "Total", si: "මුළු එකතුව" } },
];

const DISABILITY_COLUMNS_GN: ReadOnlyColumn[] = [
  { key: "type", label: { en: "Disability Type", si: "ආබාධ වර්ගය" }, options: DISABILITY_OPTIONS },
  { key: "under18Female", label: { en: "Under 18 – Female", si: "අවු. 18ට අඩු – ගැහැණු" } },
  { key: "under18Male", label: { en: "Under 18 – Male", si: "අවු. 18ට අඩු – පිරිමි" } },
  { key: "over18Female", label: { en: "18+ – Female", si: "අවු. 18+ – ගැහැණු" } },
  { key: "over18Male", label: { en: "18+ – Male", si: "අවු. 18+ – පිරිමි" } },
  { key: "total", label: { en: "Total", si: "මුළු එකතුව" } },
];

const DISABILITY_COLUMNS_AREA: ReadOnlyColumn[] = [
  { key: "type", label: { en: "Disability Type", si: "ආබාධ වර්ගය" }, options: DISABILITY_OPTIONS },
  { key: "female", label: { en: "Female", si: "ගැහැණු" } },
  { key: "male", label: { en: "Male", si: "පිරිමි" } },
  { key: "total", label: { en: "Total", si: "මුළු එකතුව" } },
];

const TOTAL_POPULATION_FIELDS: { key: string; label: Translated }[] = [
  { key: "totalPopulation", label: { en: "Total Population", si: "මුළු ජනගහනය" } },
  { key: "female", label: { en: "Female", si: "ගැහැණු" } },
  { key: "male", label: { en: "Male", si: "පිරිමි" } },
];

const SEX_TOTAL_FIELDS: { key: string; label: Translated }[] = [
  { key: "female", label: { en: "Female", si: "ගැහැණු" } },
  { key: "male", label: { en: "Male", si: "පිරිමි" } },
  { key: "total", label: { en: "Total", si: "මුළු එකතුව" } },
];

const HOUSEHOLD_FIELDS: { key: string; label: Translated }[] = [
  { key: "total", label: { en: "Total Households", si: "මුළු ගෘහ ඒකක" } },
  { key: "femaleHeaded", label: { en: "Female-Headed Households", si: "ගැහැණුන් ප්‍රධාන ගෘහ ඒකක" } },
  { key: "displaced", label: { en: "Displaced Households", si: "අවතැන් වූ ගෘහ ඒකක" } },
];

/** Builds the {key, label, value} triples ReadOnlyStats needs from a fixed field list plus
 *  whatever numeric object holds the actual figures — shared by the per-GN and area-wide
 *  renderings so both stay in sync with the same field set. `values` can be `undefined` — every
 *  sub-group in this section's schema is optional at save time (a draft can be submitted, and
 *  later approved, having only ever had some of its subsections filled in), so an approved
 *  record's `demographics.households` etc. is not guaranteed to exist even though
 *  `DemographicsData`'s strict type claims it always does. */
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

function sumSex(rows: { female?: number; male?: number }[]): { female: number; male: number; total: number } {
  const totals = rows.reduce<{ female: number; male: number }>(
    (acc, r) => ({ female: acc.female + (r.female ?? 0), male: acc.male + (r.male ?? 0) }),
    { female: 0, male: 0 }
  );
  return { ...totals, total: totals.female + totals.male };
}

/** GN-division-scoped view of the "Demographics" section (§3): population by age, ethnicity,
 *  religion, and disability status, plus foreign nationals, households, and registered voters,
 *  for whichever GN division the DS searches or selects — or, before any division is picked, the
 *  whole-division aggregate across every approved GN division. */
export function DemographicsView() {
  const { data: area, isLoading: areaLoading, isError: areaError } = useAreaAnalytics();

  return (
    <GnScopedSectionView
      prompt={{
        en: "Search or select a GN division above to view its Demographics data.",
        si: "එහි ජනගහන තොරතුරු බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
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
                en="Unable to load whole-division Demographics data right now. Please try again shortly."
                si="සම්පූර්ණ කොට්ඨාසයේ ජනගහන තොරතුරු මෙම මොහොතේ පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
              />
            </CardContent>
          </Card>
        ) : (
          <DemographicsAreaWideView aggregate={area.demographics} />
        )
      }
    >
      {(profile) => {
        const section = profile.data.demographics;

        if (!section) {
          return (
            <Card>
              <CardContent className="text-fluid-sm text-muted-foreground">
                <Bilingual
                  en="This GN division's approved submission doesn't include Demographics data yet."
                  si="මෙම ග්‍රාම නිලධාරී වසමේ අනුමත ඉදිරිපත් කිරීමේ ජනගහන තොරතුරු තවම ඇතුළත් නොවේ."
                />
              </CardContent>
            </Card>
          );
        }

        return <DemographicsSectionContent section={section} />;
      }}
    </GnScopedSectionView>
  );
}

// Every sub-group/array here is optional in the underlying schema (demographicsSchemaPartial) — a
// submission can be approved having only ever had some of its subsections saved. `DemographicsData`'s
// strict type claims these always exist, but at runtime they may not, so every read of an approved
// GN division's `demographics` section falls back to an empty array/undefined rather than assuming
// completeness. (Rows within an array that does exist are still guaranteed complete — the row
// schemas themselves aren't partial, only the containing array/object is optional.)
function DemographicsSectionContent({ section }: { section: DemographicsData }) {
  const ageTotals = sumSex(section.populationByAge ?? []);
  const foreignTotals = sumSex(section.foreignNationals ? [section.foreignNationals] : []);
  const voterTotals = sumSex(section.registeredVoters ? [section.registeredVoters] : []);

  const ageRows = (section.populationByAge ?? []).map((r) => ({ band: r.band, female: r.female, male: r.male, total: (r.female ?? 0) + (r.male ?? 0) }));
  const ethnicityRows = (section.populationByEthnicity ?? []).map((r) => ({
    ethnicity: r.ethnicity,
    female: r.female,
    male: r.male,
    total: (r.female ?? 0) + (r.male ?? 0),
  }));
  const religionRows = (section.populationByReligion ?? []).map((r) => ({
    religion: r.religion,
    female: r.female,
    male: r.male,
    total: (r.female ?? 0) + (r.male ?? 0),
  }));
  const disabilityRows = (section.disabilities ?? []).map((r) => ({
    type: r.type,
    under18Female: r.under18.female,
    under18Male: r.under18.male,
    over18Female: r.over18.female,
    over18Male: r.over18.male,
    total: (r.under18.female ?? 0) + (r.under18.male ?? 0) + (r.over18.female ?? 0) + (r.over18.male ?? 0),
  }));

  return (
    <div className="flex flex-col gap-8">
      <ReadOnlyStats
        title={{ en: "Total Population", si: "මුළු ජනගහනය" }}
        stats={toStats(TOTAL_POPULATION_FIELDS, { totalPopulation: ageTotals.total, female: ageTotals.female, male: ageTotals.male })}
      />

      <ReadOnlyTable title={demographicsDict.fields.populationByAge} columns={AGE_COLUMNS} rows={toRows(ageRows)} />
      <ReadOnlyTable title={demographicsDict.fields.populationByEthnicity} columns={ETHNICITY_COLUMNS} rows={toRows(ethnicityRows)} />
      <ReadOnlyTable title={demographicsDict.fields.populationByReligion} columns={RELIGION_COLUMNS} rows={toRows(religionRows)} />

      <ReadOnlyStats
        title={demographicsDict.fields.foreignNationals}
        stats={toStats(SEX_TOTAL_FIELDS, { female: foreignTotals.female, male: foreignTotals.male, total: foreignTotals.total })}
      />
      <ReadOnlyStats title={demographicsDict.fields.households} stats={toStats(HOUSEHOLD_FIELDS, section.households)} />
      <ReadOnlyTable title={demographicsDict.fields.disabilities} columns={DISABILITY_COLUMNS_GN} rows={toRows(disabilityRows)} />
      <ReadOnlyStats
        title={demographicsDict.fields.registeredVoters}
        stats={toStats(SEX_TOTAL_FIELDS, { female: voterTotals.female, male: voterTotals.male, total: voterTotals.total })}
      />
    </div>
  );
}

/** Whole-division rollup of every approved GN division's Demographics data — age, ethnicity,
 *  religion, and disability categories are summed across divisions, foreign nationals/households/
 *  registered voters are summed directly, and disability rows collapse the under-18/18+ split
 *  into a single female/male total (the per-age-band split isn't meaningful once pooled across
 *  many divisions) — same shape `aggregateDemographics` already produces. */
function DemographicsAreaWideView({ aggregate }: { aggregate: DemographicsAggregate }) {
  const ageRows = aggregate.populationByAge.map((r) => ({ band: r.band, female: r.female, male: r.male, total: r.total }));
  const ethnicityRows = aggregate.populationByEthnicity.map((r) => ({ ethnicity: r.key, female: r.female, male: r.male, total: r.total }));
  const religionRows = aggregate.populationByReligion.map((r) => ({ religion: r.key, female: r.female, male: r.male, total: r.total }));
  const disabilityRows = aggregate.disabilities.map((r) => ({ type: r.key, female: r.female, male: r.male, total: r.total }));

  return (
    <div className="flex flex-col gap-8">
      <p className="text-fluid-sm text-muted-foreground">
        <Bilingual
          en="Aggregated across every GN division with an approved submission in your division. Select a GN division above to see its individual data."
          si="ඔබගේ කොට්ඨාසයේ අනුමත ඉදිරිපත් කිරීමක් ඇති සියලුම ග්‍රාම නිලධාරී වසම් හරහා එකතු කර ඇත. තනි වසමක දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් තෝරන්න."
        />
      </p>

      <ReadOnlyStats
        title={{ en: "Total Population", si: "මුළු ජනගහනය" }}
        stats={toStats(TOTAL_POPULATION_FIELDS, { totalPopulation: aggregate.totalPopulation, female: aggregate.female, male: aggregate.male })}
      />

      <ReadOnlyTable title={demographicsDict.fields.populationByAge} columns={AGE_COLUMNS} rows={toRows(ageRows)} />
      <ReadOnlyTable title={demographicsDict.fields.populationByEthnicity} columns={ETHNICITY_COLUMNS} rows={toRows(ethnicityRows)} />
      <ReadOnlyTable title={demographicsDict.fields.populationByReligion} columns={RELIGION_COLUMNS} rows={toRows(religionRows)} />

      <ReadOnlyStats title={demographicsDict.fields.foreignNationals} stats={toStats(SEX_TOTAL_FIELDS, { ...aggregate.foreignNationals })} />
      <ReadOnlyStats title={demographicsDict.fields.households} stats={toStats(HOUSEHOLD_FIELDS, aggregate.households)} />
      <ReadOnlyTable title={demographicsDict.fields.disabilities} columns={DISABILITY_COLUMNS_AREA} rows={toRows(disabilityRows)} />
      <ReadOnlyStats title={demographicsDict.fields.registeredVoters} stats={toStats(SEX_TOTAL_FIELDS, { ...aggregate.registeredVoters })} />

      <p className="text-fluid-xs text-muted-foreground">
        <Bilingual
          en="Note: for GN divisions with no approved data, figures above only reflect divisions that have submitted."
          si="සටහන: අනුමත දත්ත නොමැති ග්‍රාම නිලධාරී වසම් සඳහා, ඉහත සංඛ්‍යා ලේඛන ඉදිරිපත් කර ඇති වසම් පමණක් පිළිබිඹු කරයි."
        />
      </p>
    </div>
  );
}
