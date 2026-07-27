"use client";

import { useState } from "react";
import { Table2, BarChart3 } from "lucide-react";
import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyStats, type ReadOnlyStat, type ReadOnlyStatGroup } from "@/components/analytics/ReadOnlyStats";
import { ReadOnlyTable, type ReadOnlyColumn } from "@/components/analytics/ReadOnlyTable";
import { BarCard, MeterCard, StatGrid, GOLD } from "@/components/charts/chart-primitives";
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
  { key: "total", label: { en: "Total Houses", si: "මුළු නිවාස ගණන" } },
  { key: "permanent", label: { en: "Permanent", si: "ස්ථිර" } },
  { key: "semiPermanent", label: { en: "Semi-Permanent", si: "අර්ධ ස්ථිර" } },
  { key: "nonPermanent", label: { en: "Non-Permanent", si: "අස්ථිර" } },
];

const SANITATION_FIELDS: { key: string; label: Translated }[] = [
  { key: "total", label: { en: "Total Households", si: "මුළු ගෘහ ඒකක" } },
  { key: "withoutSafeSanitation", label: { en: "Without Safe Sanitation", si: "ආරක්ෂිත සනීපාරක්ෂාව නොමැති" } },
  { key: "needingAssistance", label: { en: "Needing Assistance", si: "සහාය අවශ්‍ය" } },
];

/** Mirrors the official GN report's *භූගත ජලය / **නල ජලය / ***අනෙකුත් grouping — same 7
 *  underlying fields as before, just organized under those 3 headers instead of one flat row. */
const DRINKING_WATER_GROUPS: { label: Translated; fields: { key: string; label: Translated }[] }[] = [
  {
    label: { en: "Groundwater", si: "භූගත ජලය" },
    fields: [
      { key: "protectedWell", label: { en: "Protected Well", si: "ආරක්ෂිත ලිඳ" } },
      { key: "unprotectedWell", label: { en: "Unprotected Well", si: "අනාරක්ෂිත ලිඳ" } },
      { key: "tubeWell", label: { en: "Tube Well", si: "නළ ලිඳ" } },
    ],
  },
  {
    label: { en: "Pipe-Borne Water Supply", si: "නල ජලය" },
    fields: [
      { key: "pipedNational", label: { en: "National Water Supply", si: "ජාතික ජල සම්පාදනය" } },
      { key: "pipedRural", label: { en: "Rural / Local Water Supply", si: "ග්‍රාමීය ජල සම්පාදනය" } },
    ],
  },
  {
    label: { en: "Other", si: "අනෙකුත්" },
    fields: [
      { key: "riverCanalTank", label: { en: "River / Canal / Tank", si: "ගඟ/ඇළ/වැව්" } },
      { key: "bottledOther", label: { en: "Bottled / Other", si: "බෝතල් ජලය/වෙනත්" } },
    ],
  },
];

const UNDERSERVED_AREA_COLUMNS: ReadOnlyColumn[] = [
  { key: "area", label: { en: "Area Name", si: "ප්‍රදේශයේ නම" } },
  { key: "households", label: { en: "Households", si: "ගෘහ ඒකක" } },
  { key: "proposal", label: { en: "Proposal", si: "යෝජනාව" } },
];

const COMMUNITY_WATER_PROJECT_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Project Name", si: "ව්‍යාපෘතියේ නම" } },
  { key: "status", label: { en: "Status", si: "තත්ත්වය" } },
  { key: "householdsServed", label: { en: "Households Served", si: "සේවා ලබන ගෘහ ඒකක" } },
  { key: "authority", label: { en: "Authority", si: "අධිකාරිය" } },
];

const GN_DIVISION_COLUMN: ReadOnlyColumn = { key: "gnName", label: { en: "GN Division", si: "ග්‍රාම නිලධාරී වසම" } };

/** Builds the {key, label, value} triples ReadOnlyStats needs from a fixed field list plus
 *  whatever numeric object holds the actual figures — shared by the per-GN and area-wide
 *  renderings so both stay in sync with the same field set. */
function toStats(fields: { key: string; label: Translated }[], values: Record<string, number | undefined>): ReadOnlyStat[] {
  return fields.map((f) => ({ key: f.key, label: f.label, value: values[f.key]?.toString() }));
}

function toDrinkingWaterGroups(values: Record<string, number | undefined>): ReadOnlyStatGroup[] {
  return DRINKING_WATER_GROUPS.map((g) => ({ label: g.label, stats: toStats(g.fields, values) }));
}

interface HousingNumericData {
  housingCounts: HousingData["housingCounts"];
  householdsWithoutHousing: number;
  sanitation: HousingData["sanitation"];
  drinkingWaterSource: HousingData["drinkingWaterSource"];
  electricityAccessPercent: number | null;
  electricityTitle: Translated;
}

/** Table / Graph switch — a small segmented control, not a Tabs widget, since both modes show
 *  the exact same section (not separate content areas) and this reads as one persistent toggle. */
function ViewModeToggle({ value, onChange }: { value: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="inline-flex w-fit items-center gap-1 self-start rounded-lg border border-border bg-muted/40 p-1">
      <Button
        type="button"
        size="sm"
        variant={value === "stats" ? "default" : "ghost"}
        className="gap-1.5"
        onClick={() => onChange("stats")}
      >
        <Table2 className="size-4" />
        <Bilingual en="Table" si="වගුව" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "graph" ? "default" : "ghost"}
        className="gap-1.5"
        onClick={() => onChange("graph")}
      >
        <BarChart3 className="size-4" />
        <Bilingual en="Graph" si="ප්‍රස්ථාරය" />
      </Button>
    </div>
  );
}

/** Chart rendering for the four numeric groups — Housing Counts and Sanitation as bar charts
 *  (multi-category magnitude comparison), Electricity Access as a meter (a single ratio against
 *  a 0-100 limit is a meter, not a bar chart), Drinking Water as three grouped bar charts.
 *  Households Without Proper Housing stays a plain figure — a lone count has no useful chart
 *  form. Totals are never charted alongside their own subsets (Total Households at 685 next to
 *  Without Safe Sanitation at 18 would swamp the scale and shrink the figure that matters to an
 *  illegible sliver) — totals go in the overview stat card instead. */
function HousingGraphSection({ data }: { data: HousingNumericData }) {
  const { lang } = useLanguage();
  const t = (en: string, si: string) => (lang === "si" ? si : en);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <StatGrid
            items={[
              { en: "Total Houses", si: "මුළු නිවාස ගණන", value: data.housingCounts.total },
              { en: "Households Without Proper Housing", si: "නිසි නිවාසයක් නොමැති ගෘහ ඒකක", value: data.householdsWithoutHousing },
              { en: "Total Households (Sanitation)", si: "මුළු ගෘහ ඒකක (සනීපාරක්ෂාව)", value: data.sanitation.total },
            ]}
          />
        </CardContent>
      </Card>

      <BarCard
        titleEn="Housing by Type"
        titleSi="වර්ගය අනුව නිවාස"
        color={GOLD}
        rows={[
          { label: t("Permanent", "ස්ථිර"), value: data.housingCounts.permanent },
          { label: t("Semi-Permanent", "අර්ධ ස්ථිර"), value: data.housingCounts.semiPermanent },
          { label: t("Non-Permanent", "අස්ථිර"), value: data.housingCounts.nonPermanent },
        ]}
      />

      <BarCard
        titleEn="Sanitation Gaps"
        titleSi="සනීපාරක්ෂක අඩුපාඩු"
        color={GOLD}
        rows={[
          { label: t("Without Safe Sanitation", "ආරක්ෂිත සනීපාරක්ෂාව නොමැති"), value: data.sanitation.withoutSafeSanitation },
          { label: t("Needing Assistance", "සහාය අවශ්‍ය"), value: data.sanitation.needingAssistance },
        ]}
      />

      <MeterCard titleEn={data.electricityTitle.en} titleSi={data.electricityTitle.si} percent={data.electricityAccessPercent} color={GOLD} />

      {DRINKING_WATER_GROUPS.map((group) => (
        <BarCard
          key={group.label.en}
          titleEn={group.label.en}
          titleSi={group.label.si}
          color={GOLD}
          rows={group.fields.map((f) => ({
            label: t(f.label.en, f.label.si),
            value: data.drinkingWaterSource[f.key as keyof HousingData["drinkingWaterSource"]],
          }))}
        />
      ))}
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
            <HousingAreaWideView aggregate={area.sections.housing} viewMode={viewMode} />
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
            housingCounts: section.housingCounts,
            householdsWithoutHousing: section.householdsWithoutHousing,
            sanitation: section.sanitation,
            drinkingWaterSource: section.drinkingWaterSource,
            electricityAccessPercent: section.electricityAccessPercent,
            electricityTitle: housingDict.fields.electricityAccessPercent,
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
                    stats={[{ key: "value", label: { en: "Count", si: "ගණන" }, value: section.householdsWithoutHousing.toString() }]}
                  />

                  <ReadOnlyStats title={housingDict.fields.sanitation} stats={toStats(SANITATION_FIELDS, section.sanitation)} />

                  <ReadOnlyStats title={housingDict.fields.drinkingWaterSource} groups={toDrinkingWaterGroups(section.drinkingWaterSource)} />
                </>
              )}

              <ReadOnlyTable
                title={housingDict.fields.underservedAreas}
                columns={UNDERSERVED_AREA_COLUMNS}
                rows={section.underservedAreas.map((row) => ({
                  area: row.area,
                  households: row.households?.toString(),
                  proposal: row.proposal,
                }))}
              />

              {viewMode === "stats" && (
                <ReadOnlyStats
                  title={housingDict.fields.electricityAccessPercent}
                  stats={[{ key: "value", label: { en: "Percentage", si: "ප්‍රතිශතය" }, value: `${section.electricityAccessPercent}%` }]}
                />
              )}

              <ReadOnlyTable
                title={housingDict.fields.communityWaterProjects}
                columns={COMMUNITY_WATER_PROJECT_COLUMNS}
                rows={section.communityWaterProjects.map((row) => ({
                  name: row.name,
                  status: row.status,
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
 *  summed (or averaged, for electricity access), and the two per-division lists are pooled
 *  with a GN Division column added so each row's source division is still visible. */
function HousingAreaWideView({ aggregate, viewMode }: { aggregate: HousingAggregate; viewMode: ViewMode }) {
  const numericData: HousingNumericData = {
    housingCounts: aggregate.housingCounts,
    householdsWithoutHousing: aggregate.householdsWithoutHousing,
    sanitation: aggregate.sanitation,
    drinkingWaterSource: aggregate.drinkingWaterSource,
    electricityAccessPercent: aggregate.avgElectricityAccessPercent,
    electricityTitle: { en: "Average Electricity Access (%)", si: "සාමාන්‍ය විදුලි ප්‍රවේශය (%)" },
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
        title={housingDict.fields.underservedAreas}
        columns={[GN_DIVISION_COLUMN, ...UNDERSERVED_AREA_COLUMNS]}
        rows={aggregate.underservedAreas.rows.map((row) => ({
          gnName: row.gnName,
          area: row.area,
          households: row.households?.toString(),
          proposal: row.proposal,
        }))}
      />

      {viewMode === "stats" && (
        <ReadOnlyStats
          title={housingDict.fields.electricityAccessPercent}
          stats={[
            {
              key: "value",
              label: { en: "Average Percentage", si: "සාමාන්‍ය ප්‍රතිශතය" },
              value: aggregate.avgElectricityAccessPercent !== null ? `${aggregate.avgElectricityAccessPercent}%` : undefined,
            },
          ]}
        />
      )}

      <ReadOnlyTable
        title={housingDict.fields.communityWaterProjects}
        columns={[GN_DIVISION_COLUMN, ...COMMUNITY_WATER_PROJECT_COLUMNS]}
        rows={aggregate.communityWaterProjects.rows.map((row) => ({
          gnName: row.gnName,
          name: row.name,
          status: row.status,
          householdsServed: row.householdsServed?.toString(),
          authority: row.authority,
        }))}
      />
    </div>
  );
}
