"use client";

import { useState } from "react";
import { Table2, BarChart3 } from "lucide-react";
import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyStats, type ReadOnlyStat, type ReadOnlyStatGroup } from "@/components/analytics/ReadOnlyStats";
import { ReadOnlyTable, type ReadOnlyColumn } from "@/components/analytics/ReadOnlyTable";
import { ColumnCard, DonutCard, GOLD, MAROON, GREEN, AMBER, GOLD_DEEP } from "@/components/charts/chart-primitives";
import { useAreaAnalytics } from "@/hooks/use-area-analytics";
import { Bilingual } from "@/components/Bilingual";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { housingDict } from "@/lib/i18n/sections/housing";
import type { Translated } from "@/lib/i18n/types";
import type { HousingData } from "@/lib/validators/sections/housing";
import type { HousingAggregate } from "@/lib/analytics/aggregate-sections";

type ViewMode = "stats" | "graph";

const HOUSING_COUNTS_FIELDS: { key: string; label: Translated }[] = [
  { key: "total", label: { en: "Total Housing Count", si: "මුළු නිවාස සංඛ්‍යාව" } },
  { key: "permanent", label: { en: "* Permanent Housing Count", si: "*ස්ථීර නිවාස සංඛ්‍යාව" } },
  { key: "semiPermanent", label: { en: "** Semi-Permanent Housing Count", si: "**අර්ධ ස්ථීර නිවාස සංඛ්‍යාව" } },
  { key: "nonPermanent", label: { en: "*** Non-Permanent Housing Count", si: "***අස්ථීර නිවාස සංඛ්‍යාව" } },
];

const SANITATION_FIELDS: { key: string; label: Translated }[] = [
  { key: "total", label: { en: "Total Housing Count", si: "මුළු නිවාස සංඛ්‍යාව" } },
  {
    key: "withoutSafeSanitation",
    label: { en: "Houses Without Hygienic Toilet Facilities", si: "සෞඛ්‍යාරක්ෂිත වැසිකිලි පහසුකම් නොමැති නිවාස සංඛ්‍යාව" },
  },
  {
    key: "needingAssistance",
    label: { en: "Houses That Should Be Given Toilet Assistance", si: "වැසිකිලි ආධාර ලබාදිය යුතු නිවාස සංඛ්‍යාව" },
  },
];

/** Mirrors the official GN report's *භූගත ජලය / **නල ජලය / ***අනෙකුත් grouping — 11
 *  underlying fields organized under those 3 headers. */
const DRINKING_WATER_GROUPS: { label: Translated; fields: { key: string; label: Translated }[] }[] = [
  {
    label: { en: "Groundwater", si: "භූගත ජලය" },
    fields: [
      { key: "well", label: { en: "Well", si: "ළිඳ" } },
      { key: "tubeWell", label: { en: "Tube Well", si: "නල ළිඳ" } },
      { key: "spring", label: { en: "Bubble / Spring", si: "බුබුළු/උල්පත" } },
    ],
  },
  {
    label: { en: "Piped Water", si: "නල ජලය" },
    fields: [
      { key: "pipedNational", label: { en: "National Water Supply Board", si: "ජාතික ජල සම්පාදන මණ්ඩලය" } },
      { key: "pipedLocalGovt", label: { en: "Provincial Water Board Institutions", si: "පළාත් ජල පාලන ආයතන" } },
      { key: "pipedCommunity", label: { en: "Community-Based Organizations", si: "ප්‍රජාමූල සංවිධාන" } },
    ],
  },
  {
    label: { en: "Other", si: "අනෙකුත්" },
    fields: [
      { key: "tankRiverCanalOther", label: { en: "Tank / River / Canal / Stream / Other", si: "වැව්/ගංගා/ඇල/දොළ/වෙනත්" } },
      { key: "bottled", label: { en: "Bottled Water", si: "බෝතල් කළ ජලය" } },
      { key: "treated", label: { en: "Associated / Treated Water", si: "ප්‍රති ආශ්‍රිත ජලය" } },
      { key: "bowser", label: { en: "Bowser", si: "බවුසර්" } },
      { key: "other", label: { en: "Other", si: "වෙනත්" } },
    ],
  },
];

const ELECTRICITY_ACCESS_FIELDS: { key: string; label: Translated }[] = [
  { key: "total", label: { en: "Total Housing Count", si: "මුළු නිවාස සංඛ්‍යාව" } },
  { key: "withElectricity", label: { en: "With Electricity Facility", si: "විදුලිබල පහසුකම් සහිත" } },
  { key: "withSolar", label: { en: "With Solar Power", si: "සූර්ය බල ශක්තිය සහිත" } },
  { key: "withoutElectricity", label: { en: "Without Electricity Facility", si: "විදුලිබල පහසුකම් නොමැති" } },
  { key: "needingAssistance", label: { en: "Should Be Given Electricity Assistance", si: "විදුලි ආධාර ලබාදිය යුතු" } },
];

const UNDERSERVED_AREA_COLUMNS: ReadOnlyColumn[] = [
  { key: "area", label: { en: "Area with Difficulty", si: "දුෂ්කරතා සහිත ප්‍රදේශ" } },
  { key: "difficultyDescription", label: { en: "The Difficulty", si: "දුෂ්කරතාවය" } },
  { key: "households", label: { en: "Number of Families", si: "පවුල් සංඛ්‍යාව" } },
  { key: "proposal", label: { en: "Proposed Remedy", si: "දුෂ්කරතාවයට යෝජනා කරන පිළියම" } },
];

const COMMUNITY_WATER_PROJECT_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name of the Water Project", si: "ජල ව්‍යාපෘතියේ නම" } },
  { key: "functional", label: { en: "Is It Operational?", si: "ක්‍රියාත්මක තත්ත්වයේ ඇත/නැත" } },
  { key: "householdsServed", label: { en: "Number of Families Benefiting", si: "පහසුකම් ලබාගන්නා පවුල් සංඛ්‍යාව" } },
  { key: "authority", label: { en: "* Ownership", si: "*අයිතිය" } },
];

const GN_DIVISION_COLUMN: ReadOnlyColumn = { key: "gnName", label: { en: "GN Division", si: "ග්‍රාම නිලධාරී වසම" } };

/** Builds the {key, label, value} triples ReadOnlyStats needs from a fixed field list plus
 *  whatever numeric object holds the actual figures — shared by the per-GN and area-wide
 *  renderings so both stay in sync with the same field set. `values` can be `undefined` — every
 *  sub-group in this section's schema is optional at save time (a draft can be submitted, and
 *  later approved, having only ever had some of its subsections filled in), so an approved
 *  record's `housing.sanitation` etc. is not guaranteed to exist even though `HousingData`'s
 *  strict type claims it always does. */
function toStats(
  fields: { key: string; label: Translated }[],
  values: Record<string, number | undefined> | undefined
): ReadOnlyStat[] {
  return fields.map((f) => ({ key: f.key, label: f.label, value: values?.[f.key]?.toString() }));
}

function toDrinkingWaterGroups(values: Record<string, number | undefined>): ReadOnlyStatGroup[] {
  return DRINKING_WATER_GROUPS.map((g) => ({ label: g.label, stats: toStats(g.fields, values) }));
}

interface HousingNumericData {
  housingCounts: HousingData["housingCounts"];
  householdsWithoutHousing: number;
  sanitation: HousingData["sanitation"];
  drinkingWaterSource: HousingData["drinkingWaterSource"];
  electricityAccess: HousingData["electricityAccess"];
}

// Every sub-group here is optional in the underlying schema (housingSchemaPartial) — a submission
// can be approved having only ever had some of its subsections saved. `HousingData`'s strict type
// claims these always exist, but at runtime they may not, so every read of an approved GN
// division's `housing` section falls back to these zeroed shapes rather than assuming completeness.
const EMPTY_HOUSING_COUNTS: HousingData["housingCounts"] = { total: 0, permanent: 0, semiPermanent: 0, nonPermanent: 0 };
const EMPTY_SANITATION: HousingData["sanitation"] = { total: 0, withoutSafeSanitation: 0, needingAssistance: 0 };
const EMPTY_DRINKING_WATER_SOURCE: HousingData["drinkingWaterSource"] = {
  well: 0, tubeWell: 0, spring: 0, pipedNational: 0, pipedLocalGovt: 0, pipedCommunity: 0,
  tankRiverCanalOther: 0, bottled: 0, treated: 0, bowser: 0, other: 0,
};
const EMPTY_ELECTRICITY_ACCESS: HousingData["electricityAccess"] = {
  total: 0, withElectricity: 0, withSolar: 0, withoutElectricity: 0, needingAssistance: 0,
};

/** Table / Graph switch — a small segmented control, not a Tabs widget, since both modes show
 *  the exact same section (not separate content areas) and this reads as one persistent toggle. */
function ViewModeToggle({ value, onChange }: { value: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="inline-flex w-fit items-center gap-1 self-start rounded-lg border border-border bg-muted/40 p-1">
      <Button
        type="button"
        variant={value === "stats" ? "default" : "ghost"}
        className="h-11 gap-1.5 px-5"
        onClick={() => onChange("stats")}
      >
        <Table2 className="size-4" />
        <Bilingual en="Table" si="වගුව" />
      </Button>
      <Button
        type="button"
        variant={value === "graph" ? "default" : "ghost"}
        className="h-11 gap-1.5 px-5"
        onClick={() => onChange("graph")}
      >
        <BarChart3 className="size-4" />
        <Bilingual en="Graph" si="ප්‍රස්ථාරය" />
      </Button>
    </div>
  );
}

/** A small darkening ramp within the Housing gold family for the 3 housing-type slices — an
 *  ordinal-style progression (Permanent -> Semi -> Non-Permanent) rather than unrelated
 *  categorical hues, since these are shades of "how permanent," not distinct identities.
 *  GOLD/AMBER/GOLD_DEEP are theme-aware CSS vars (see chart-primitives.tsx), each
 *  independently validated against both the light and dark card surface. */
const HOUSING_TYPE_COLORS = { permanent: GOLD, semiPermanent: AMBER, nonPermanent: GOLD_DEEP };

/** 4 charts, one per numeric group. Housing Counts and Electricity Access are donuts (their
 *  slices sum to a meaningful total — total houses — so the total anchors the center).
 *  Sanitation is also a donut. Drinking Water combines all of that group's figures —
 *  including totals — into a single bar chart. */
function HousingGraphSection({ data }: { data: HousingNumericData }) {
  const { lang } = useLanguage();
  const t = (en: string, si: string) => (lang === "si" ? si : en);

  return (
    <div className="grid gap-6">
      <DonutCard
        titleEn={housingDict.fields.housingCounts.en}
        titleSi={housingDict.fields.housingCounts.si}
        totalLabel={{ en: "Total Housing Count", si: "මුළු නිවාස සංඛ්‍යාව" }}
        slices={[
          { label: t("Permanent", "ස්ථීර"), value: data.housingCounts.permanent, color: HOUSING_TYPE_COLORS.permanent },
          { label: t("Semi-Permanent", "අර්ධ ස්ථීර"), value: data.housingCounts.semiPermanent, color: HOUSING_TYPE_COLORS.semiPermanent },
          { label: t("Non-Permanent", "අස්ථීර"), value: data.housingCounts.nonPermanent, color: HOUSING_TYPE_COLORS.nonPermanent },
        ]}
        footer={
          <p className="mt-4 border-t border-border pt-3 text-fluid-sm text-muted-foreground">
            <Bilingual en="Families without housing: " si="නිවාස නොමැති පවුල්: " />
            <span className="font-semibold nums-tabular text-foreground">{data.householdsWithoutHousing}</span>
          </p>
        }
      />

      <DonutCard
        titleEn={housingDict.fields.sanitation.en}
        titleSi={housingDict.fields.sanitation.si}
        totalLabel={{ en: "Total Housing Count", si: "මුළු නිවාස සංඛ්‍යාව" }}
        slices={[
          {
            label: t("Adequately Served", "ප්‍රමාණවත් සේවා ලබන"),
            value: Math.max(0, data.sanitation.total - data.sanitation.withoutSafeSanitation),
            color: GREEN,
          },
          {
            label: t("Without Hygienic Toilet Facilities", "සෞඛ්‍යාරක්ෂිත වැසිකිලි පහසුකම් නොමැති"),
            value: data.sanitation.withoutSafeSanitation,
            color: MAROON,
            subBreakdown: {
              label: t("Needing Toilet Assistance", "වැසිකිලි ආධාර ලබාදිය යුතු"),
              value: data.sanitation.needingAssistance,
            },
          },
        ]}
      />

      <ColumnCard
        titleEn={housingDict.fields.drinkingWaterSource.en}
        titleSi={housingDict.fields.drinkingWaterSource.si}
        color={GOLD}
        rows={DRINKING_WATER_GROUPS.flatMap((group) =>
          group.fields.map((f) => ({
            label: t(f.label.en, f.label.si),
            value: data.drinkingWaterSource[f.key as keyof HousingData["drinkingWaterSource"]],
          }))
        )}
      />

      <DonutCard
        titleEn={housingDict.fields.electricityAccess.en}
        titleSi={housingDict.fields.electricityAccess.si}
        totalLabel={{ en: "Total Housing Count", si: "මුළු නිවාස සංඛ්‍යාව" }}
        slices={[
          { label: t("With Electricity Facility", "විදුලිබල පහසුකම් සහිත"), value: data.electricityAccess.withElectricity, color: GREEN },
          { label: t("With Solar Power", "සූර්ය බල ශක්තිය සහිත"), value: data.electricityAccess.withSolar, color: GOLD },
          { label: t("Without Electricity Facility", "විදුලිබල පහසුකම් නොමැති"), value: data.electricityAccess.withoutElectricity, color: MAROON },
        ]}
        footer={
          <p className="mt-4 border-t border-border pt-3 text-fluid-sm text-muted-foreground">
            <Bilingual en="Should be given electricity assistance: " si="විදුලි ආධාර ලබාදිය යුතු: " />
            <span className="font-semibold nums-tabular text-foreground">{data.electricityAccess.needingAssistance}</span>
          </p>
        }
      />
    </div>
  );
}

/** GN-division-scoped view of the "Housing" section (§5): housing stock, sanitation,
 *  drinking water sources, electricity access, and underserved areas / community water
 *  projects for whichever GN division the DS searches or selects — or, before any division
 *  is picked, the whole-division aggregate across every approved GN division. A Table/Graph
 *  toggle at the top switches the four numeric groups between stat tiles and charts; the two
 *  entry lists (Underserved Areas, Community Water Projects) stay tables in both modes. */
export function HousingView() {
  const { lang } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>("stats");
  const { data: area, isLoading: areaLoading, isError: areaError } = useAreaAnalytics();

  return (
    <div className="flex flex-col gap-6">
      <ViewModeToggle value={viewMode} onChange={setViewMode} />

      <GnScopedSectionView
        prompt={{
          en: "Search or select a GN division above to view its Housing data.",
          si: "එහි නිවාස තොරතුරු බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
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
                  en="Unable to load whole-division Housing data right now. Please try again shortly."
                  si="සම්පූර්ණ කොට්ඨාසයේ නිවාස තොරතුරු මෙම මොහොතේ පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
                />
              </CardContent>
            </Card>
          ) : (
            <HousingAreaWideView aggregate={area.sections.housing} viewMode={viewMode} lang={lang} />
          )
        }
      >
        {(profile) => {
          const section = profile.data.housing;

          if (!section) {
            return (
              <Card>
                <CardContent className="text-fluid-sm text-muted-foreground">
                  <Bilingual
                    en="This GN division's approved submission doesn't include Housing data yet."
                    si="මෙම ග්‍රාම නිලධාරී වසමේ අනුමත ඉදිරිපත් කිරීමේ නිවාස තොරතුරු තවම ඇතුළත් නොවේ."
                  />
                </CardContent>
              </Card>
            );
          }

          const numericData: HousingNumericData = {
            housingCounts: section.housingCounts ?? EMPTY_HOUSING_COUNTS,
            householdsWithoutHousing: section.householdsWithoutHousing ?? 0,
            sanitation: section.sanitation ?? EMPTY_SANITATION,
            drinkingWaterSource: section.drinkingWaterSource ?? EMPTY_DRINKING_WATER_SOURCE,
            electricityAccess: section.electricityAccess ?? EMPTY_ELECTRICITY_ACCESS,
          };

          return (
            <div className="flex flex-col gap-8">
              {viewMode === "graph" ? (
                <HousingGraphSection data={numericData} />
              ) : (
                <>
                  <ReadOnlyStats title={housingDict.fields.housingCounts} stats={toStats(HOUSING_COUNTS_FIELDS, section.housingCounts)} />

                  <ReadOnlyStats
                    title={housingDict.fields.householdsWithoutHousing}
                    stats={[{ key: "value", label: { en: "Count", si: "ගණන" }, value: section.householdsWithoutHousing?.toString() }]}
                  />

                  <ReadOnlyStats title={housingDict.fields.sanitation} stats={toStats(SANITATION_FIELDS, section.sanitation)} />

                  <ReadOnlyStats title={housingDict.fields.drinkingWaterSource} groups={toDrinkingWaterGroups(section.drinkingWaterSource)} />
                </>
              )}

              <ReadOnlyTable
                title={housingDict.fields.underservedAreas}
                columns={UNDERSERVED_AREA_COLUMNS}
                rows={(section.underservedAreas ?? []).map((row) => ({
                  area: row.area,
                  difficultyDescription: row.difficultyDescription,
                  households: row.households?.toString(),
                  proposal: row.proposal,
                }))}
              />

              {viewMode === "stats" && (
                <ReadOnlyStats title={housingDict.fields.electricityAccess} stats={toStats(ELECTRICITY_ACCESS_FIELDS, section.electricityAccess)} />
              )}

              <ReadOnlyTable
                title={housingDict.fields.communityWaterProjects}
                columns={COMMUNITY_WATER_PROJECT_COLUMNS}
                rows={(section.communityWaterProjects ?? []).map((row) => ({
                  name: row.name,
                  functional: row.functional,
                  householdsServed: row.householdsServed?.toString(),
                  authority: row.authority,
                }))}
              />
            </div>
          );
        }}
      </GnScopedSectionView>
    </div>
  );
}

/** Whole-division rollup of every approved GN division's Housing data: scalar groups are
 *  summed, and the two per-division lists are pooled with a GN Division column added so
 *  each row's source division is still visible. */
function HousingAreaWideView({ aggregate, viewMode, lang }: { aggregate: HousingAggregate; viewMode: ViewMode; lang: "en" | "si" }) {
  const numericData: HousingNumericData = {
    housingCounts: aggregate.housingCounts,
    householdsWithoutHousing: aggregate.householdsWithoutHousing,
    sanitation: aggregate.sanitation,
    drinkingWaterSource: aggregate.drinkingWaterSource,
    electricityAccess: aggregate.electricityAccess,
  };

  return (
    <div className="flex flex-col gap-8">
      <p className="text-fluid-sm text-muted-foreground">
        <Bilingual
          en="Aggregated across every GN division with an approved submission in your division. Select a GN division above to see its individual data."
          si="ඔබගේ කොට්ඨාසයේ අනුමත ඉදිරිපත් කිරීමක් ඇති සියලුම ග්‍රාම නිලධාරී වසම් හරහා එකතු කර ඇත. තනි වසමක දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් තෝරන්න."
        />
      </p>

      {viewMode === "graph" ? (
        <HousingGraphSection data={numericData} />
      ) : (
        <>
          <ReadOnlyStats title={housingDict.fields.housingCounts} stats={toStats(HOUSING_COUNTS_FIELDS, aggregate.housingCounts)} />

          <ReadOnlyStats
            title={housingDict.fields.householdsWithoutHousing}
            stats={[{ key: "value", label: { en: "Count", si: "ගණන" }, value: aggregate.householdsWithoutHousing.toString() }]}
          />

          <ReadOnlyStats title={housingDict.fields.sanitation} stats={toStats(SANITATION_FIELDS, aggregate.sanitation)} />

          <ReadOnlyStats title={housingDict.fields.drinkingWaterSource} groups={toDrinkingWaterGroups(aggregate.drinkingWaterSource)} />
        </>
      )}

      <ReadOnlyTable
        lang={lang}
        title={housingDict.fields.underservedAreas}
        columns={[GN_DIVISION_COLUMN, ...UNDERSERVED_AREA_COLUMNS]}
        rows={aggregate.underservedAreas.rows.map((row) => ({
          gnName: row.gnName,
          gnNameSi: row.gnNameSi,
          area: row.area,
          difficultyDescription: row.difficultyDescription,
          households: row.households?.toString(),
          proposal: row.proposal,
        }))}
      />

      {viewMode === "stats" && (
        <ReadOnlyStats title={housingDict.fields.electricityAccess} stats={toStats(ELECTRICITY_ACCESS_FIELDS, aggregate.electricityAccess)} />
      )}

      <ReadOnlyTable
        lang={lang}
        title={housingDict.fields.communityWaterProjects}
        columns={[GN_DIVISION_COLUMN, ...COMMUNITY_WATER_PROJECT_COLUMNS]}
        rows={aggregate.communityWaterProjects.rows.map((row) => ({
          gnName: row.gnName,
          gnNameSi: row.gnNameSi,
          name: row.name,
          functional: row.functional,
          householdsServed: row.householdsServed?.toString(),
          authority: row.authority,
        }))}
      />
    </div>
  );
}
