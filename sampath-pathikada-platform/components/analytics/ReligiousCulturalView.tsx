"use client";

import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyStats, type ReadOnlyStatGroup } from "@/components/analytics/ReadOnlyStats";
import { ReadOnlyTable, type ReadOnlyColumn } from "@/components/analytics/ReadOnlyTable";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAreaAnalytics } from "@/hooks/use-area-analytics";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { religiousCulturalDict } from "@/lib/i18n/sections/religious-cultural";
import type { AreaProfileAggregate } from "@/lib/analytics/aggregate-sections";
import type { ReligiousCulturalData } from "@/lib/validators/sections/religious-cultural";
import { HERITAGE_SITE_TYPES } from "@/lib/validators/sections/religious-cultural";

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const HERITAGE_SITE_TYPE_LABELS: Record<(typeof HERITAGE_SITE_TYPES)[number], { en: string; si: string }> = {
  "temple-vihara": { en: "Temple / Vihara", si: "පන්සල්/විහාරස්ථාන" },
  "forest-hermitage": { en: "Forest Hermitage", si: "අරණ්‍ය සේනාසන" },
  asapuwa: { en: "Asapuwa", si: "අසපුව" },
  "meditation-center": { en: "Meditation Center", si: "භාවනා මධ්‍යස්ථාන" },
  "nuns-hermitage": { en: "Nun's Hermitage", si: "මෙහෙනි ආරාම" },
  mosque: { en: "Mosque", si: "ඉස්ලාම් පල්ලි" },
  "catholic-church": { en: "Catholic Church", si: "කතෝලික පල්ලි" },
  kovil: { en: "Kovil", si: "කෝවිල්" },
  devalaya: { en: "Devalaya", si: "දේවාල" },
};

const GN_DIVISION_COLUMN: ReadOnlyColumn = { key: "gnName", label: { en: "GN Division", si: "ග්‍රාම නිලධාරී වසම" } };

const HERITAGE_SITE_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "type", label: { en: "Type", si: "වර්ගය" }, options: HERITAGE_SITE_TYPES.map((t) => ({ value: t, label: HERITAGE_SITE_TYPE_LABELS[t] })) },
  { key: "significance", label: { en: "Reason for Being Special", si: "සුවිශේෂි වීමට හේතු" } },
  {
    key: "usedForDhammaOrGovtPurpose",
    label: { en: "Used for Dhamma School / Pirivena / Govt Purpose?", si: "දහම් පාසල්/පිරිවෙන් හෝ රජයේ කාර්යන් සඳහා භාවිතා කරනවාද" },
    options: YES_NO_OPTIONS,
  },
  { key: "taskDescription", label: { en: "Describe the Activity", si: "කාර්යය විස්තර කරන්න" } },
];

const ART_ACADEMY_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "registrationNumber", label: { en: "Registration No", si: "ලියාපදිංචි අංකය" } },
  { key: "studentCount", label: { en: "Student Count", si: "ශිෂ්‍ය සංඛ්‍යාව" } },
];

const TRADITIONAL_ARTIST_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "artForm", label: { en: "Art Form", si: "කලා ස්වරූපය" } },
  { key: "description", label: { en: "Description", si: "විස්තරය" } },
];

function toRows(rows: Record<string, unknown>[]): Record<string, string | undefined>[] {
  return rows.map((row) => {
    const out: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(row)) {
      out[key] = value === undefined || value === null ? undefined : String(value);
    }
    return out;
  });
}

// Every sub-group here (temples/meheniArama/kovils/mosques/churches) is optional in the
// underlying schema (religiousCulturalSchemaPartial) — a submission can be approved having only
// ever had some of religiousSiteCounts' subsections saved, or `religiousSiteCounts` itself never
// saved at all. `ReligiousCulturalData`'s strict type claims these always exist, but at runtime
// they may not, so every read falls back to these zeroed shapes rather than assuming completeness.
const EMPTY_SITE_COUNT: { count: number; clergyCount: number } = { count: 0, clergyCount: 0 };
const EMPTY_CHURCH_COUNT: { count: number; priestsCount: number; nunsCount: number } = { count: 0, priestsCount: 0, nunsCount: 0 };

function religiousSiteCountGroups(counts: Partial<ReligiousCulturalData["religiousSiteCounts"]> | undefined): ReadOnlyStatGroup[] {
  const temples = counts?.temples ?? EMPTY_SITE_COUNT;
  const meheniArama = counts?.meheniArama ?? EMPTY_SITE_COUNT;
  const mosques = counts?.mosques ?? EMPTY_SITE_COUNT;
  const churches = counts?.churches ?? EMPTY_CHURCH_COUNT;
  const kovils = counts?.kovils ?? EMPTY_SITE_COUNT;

  return [
    {
      label: { en: "Buddhist Temples / Hermitages / Monasteries / Asapu", si: "බෞද්ධ පන්සල්/සේනාසන/ආරාම/අසපු" },
      stats: [
        { key: "temples-count", label: { en: "Number of Places", si: "ස්ථාන ගණන" }, value: temples.count.toString() },
        { key: "temples-clergy", label: { en: "Buddhist Monks", si: "බුද්ධ ස්වාමීන් වහන්සේලා" }, value: temples.clergyCount.toString() },
      ],
    },
    {
      label: { en: "Nunneries / Meheni Arama", si: "මෙහෙණි ආරාම" },
      stats: [
        { key: "meheni-count", label: { en: "Number of Places", si: "ස්ථාන ගණන" }, value: meheniArama.count.toString() },
        { key: "meheni-clergy", label: { en: "Buddhist Nuns", si: "මෙහෙණි වහන්සේලා" }, value: meheniArama.clergyCount.toString() },
      ],
    },
    {
      label: { en: "Mosques", si: "පල්ලි" },
      stats: [
        { key: "mosque-count", label: { en: "Number of Places", si: "ස්ථාන ගණන" }, value: mosques.count.toString() },
        { key: "mosque-clergy", label: { en: "Mawlawis", si: "මෝල්වි" }, value: mosques.clergyCount.toString() },
      ],
    },
    {
      label: { en: "Catholic Churches", si: "කතෝලික පල්ලි" },
      stats: [
        { key: "church-count", label: { en: "Number of Places", si: "ස්ථාන ගණන" }, value: churches.count.toString() },
        { key: "church-priests", label: { en: "Priests", si: "පියතුමන්ලා" }, value: churches.priestsCount.toString() },
        { key: "church-nuns", label: { en: "Nuns / Sisters", si: "කන්‍යා සොයුරියන්" }, value: churches.nunsCount.toString() },
      ],
    },
    {
      label: { en: "Hindu Kovils / Temples", si: "හින්දු කෝවිල්" },
      stats: [
        { key: "kovil-count", label: { en: "Number of Places", si: "ස්ථාන ගණන" }, value: kovils.count.toString() },
        { key: "kovil-clergy", label: { en: "Priests / Poojaris", si: "පූජක වරුන්" }, value: kovils.clergyCount.toString() },
      ],
    },
  ];
}

/** GN-division-scoped view of the "Religious & Cultural" section (§7): religious site and
 *  clergy counts, heritage sites, art academies, and traditional artists for whichever GN
 *  division the DS searches or selects — or, before any division is picked, the whole-division
 *  aggregate across every approved GN division. */
export function ReligiousCulturalView() {
  const { lang } = useLanguage();
  const { data: area, isLoading: areaLoading, isError: areaError } = useAreaAnalytics();

  return (
    <GnScopedSectionView
      prompt={{
        en: "Search or select a GN division above to view its Religious & Cultural data.",
        si: "එහි ආගමික හා සංස්කෘතික තොරතුරු බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
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
                en="Unable to load whole-division Religious & Cultural data right now. Please try again shortly."
                si="සම්පූර්ණ කොට්ඨාසයේ ආගමික හා සංස්කෘතික තොරතුරු මෙම මොහොතේ පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
              />
            </CardContent>
          </Card>
        ) : (
          <ReligiousCulturalAreaWideView aggregate={area.sections.areaProfile} lang={lang} />
        )
      }
    >
      {(profile) => {
        const section = profile.data.religiousCultural;

        if (!section) {
          return (
            <Card>
              <CardContent className="text-fluid-sm text-muted-foreground">
                <Bilingual
                  en="This GN division's approved submission doesn't include Religious & Cultural data yet."
                  si="මෙම ග්‍රාම නිලධාරී වසමේ අනුමත ඉදිරිපත් කිරීමේ ආගමික හා සංස්කෘතික තොරතුරු තවම ඇතුළත් නොවේ."
                />
              </CardContent>
            </Card>
          );
        }

        return <ReligiousCulturalSectionContent section={section} />;
      }}
    </GnScopedSectionView>
  );
}

function ReligiousCulturalSectionContent({ section }: { section: ReligiousCulturalData }) {
  return (
    <div className="flex flex-col gap-8">
      <ReadOnlyStats title={religiousCulturalDict.fields.religiousSiteCounts} groups={religiousSiteCountGroups(section.religiousSiteCounts)} />
      <ReadOnlyTable title={religiousCulturalDict.fields.heritageSites} columns={HERITAGE_SITE_COLUMNS} rows={toRows(section.heritageSites ?? [])} />
      <ReadOnlyTable title={religiousCulturalDict.fields.artAcademies} columns={ART_ACADEMY_COLUMNS} rows={toRows(section.artAcademies ?? [])} />
      <ReadOnlyTable title={religiousCulturalDict.fields.traditionalArtists} columns={TRADITIONAL_ARTIST_COLUMNS} rows={toRows(section.traditionalArtists ?? [])} />
    </div>
  );
}

/** Whole-division rollup of every approved GN division's Religious & Cultural data: site/clergy
 *  counts summed across divisions, and every directory pooled with a GN Division column added —
 *  same shape `aggregateAreaProfile` already produces. */
function ReligiousCulturalAreaWideView({ aggregate, lang }: { aggregate: AreaProfileAggregate; lang: "en" | "si" }) {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-fluid-sm text-muted-foreground">
        <Bilingual
          en="Aggregated across every GN division with an approved submission in your division. Select a GN division above to see its individual data."
          si="ඔබගේ කොට්ඨාසයේ අනුමත ඉදිරිපත් කිරීමක් ඇති සියලුම ග්‍රාම නිලධාරී වසම් හරහා එකතු කර ඇත. තනි වසමක දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් තෝරන්න."
        />
      </p>

      <ReadOnlyStats title={religiousCulturalDict.fields.religiousSiteCounts} groups={religiousSiteCountGroups(aggregate.religiousSiteCounts)} />
      <ReadOnlyTable lang={lang} title={religiousCulturalDict.fields.heritageSites} columns={[GN_DIVISION_COLUMN, ...HERITAGE_SITE_COLUMNS]} rows={toRows(aggregate.heritageSites.rows)} />
      <ReadOnlyTable lang={lang} title={religiousCulturalDict.fields.artAcademies} columns={[GN_DIVISION_COLUMN, ...ART_ACADEMY_COLUMNS]} rows={toRows(aggregate.artAcademies.rows)} />
      <ReadOnlyTable lang={lang} title={religiousCulturalDict.fields.traditionalArtists} columns={[GN_DIVISION_COLUMN, ...TRADITIONAL_ARTIST_COLUMNS]} rows={toRows(aggregate.traditionalArtists.rows)} />
    </div>
  );
}
