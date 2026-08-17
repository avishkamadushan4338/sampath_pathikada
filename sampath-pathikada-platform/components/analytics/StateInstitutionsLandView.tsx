"use client";

import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyTable, type ReadOnlyColumn } from "@/components/analytics/ReadOnlyTable";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { stateInstitutionsLandDict } from "@/lib/i18n/sections/state-institutions-land";
import { useAreaAnalytics } from "@/hooks/use-area-analytics";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { AreaProfileAggregate } from "@/lib/analytics/aggregate-sections";

const USABLE_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const GN_DIVISION_COLUMN: ReadOnlyColumn = { key: "gnName", label: { en: "GN Division", si: "ග්‍රාම නිලධාරී වසම" } };

/** Whole-division rollup: every approved GN division's State Institutions & Land rows pooled
 *  together, each tagged with its source GN division so the DS can still tell them apart. */
function StateInstitutionsLandAreaWideView({ aggregate, lang }: { aggregate: AreaProfileAggregate; lang: "en" | "si" }) {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-fluid-sm text-muted-foreground">
        <Bilingual
          en="Aggregated across every GN division with an approved submission in your division. Select a GN division above to see its individual data."
          si="ඔබගේ කොට්ඨාසයේ අනුමත ඉදිරිපත් කිරීමක් ඇති සියලුම ග්‍රාම නිලධාරී වසම් හරහා එකතු කර ඇත. තනි වසමක දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් තෝරන්න."
        />
      </p>
      <ReadOnlyTable
        lang={lang}
        title={stateInstitutionsLandDict.fields.stateInstitutions}
        columns={[
          GN_DIVISION_COLUMN,
          { key: "name", label: { en: "Institution Name", si: "ආයතනයේ නම" } },
          { key: "address", label: { en: "Address", si: "ලිපිනය" } },
        ]}
        rows={aggregate.stateInstitutions.rows}
      />
      <ReadOnlyTable
        lang={lang}
        title={stateInstitutionsLandDict.fields.illegalStructures}
        columns={[
          GN_DIVISION_COLUMN,
          { key: "buildingName", label: { en: "Name of the Abandoned Building", si: "අත්හැර දමන ලද ගොඩනැගිල්ලේ නම" } },
          { key: "purposeUsed", label: { en: "Purpose Used For", si: "යොදා ගත් කාර්යය" } },
          { key: "usable", label: { en: "Usable Condition", si: "භාවිතයට ගත හැකි මට්ටමක පවතිනවාද" }, options: USABLE_OPTIONS },
          { key: "owningInstitution", label: { en: "Owning Institution", si: "ගොඩනැගිල්ල අයත් ආයතනය" } },
        ]}
        rows={aggregate.illegalStructures.rows}
      />
      <ReadOnlyTable
        lang={lang}
        title={stateInstitutionsLandDict.fields.developmentProjects}
        columns={[
          GN_DIVISION_COLUMN,
          { key: "projectName", label: { en: "Name of the Stalled Project(s)", si: "අතරමං නවතාදමා ඇති ව්‍යාපෘතියේ/වල නම" } },
          { key: "owningInstitution", label: { en: "Owning Institution", si: "ව්‍යාපෘතිය අයත් ආයතනය" } },
          { key: "reasonForHalt", label: { en: "Reason for Halting", si: "නවතාදැමීමට හේතුව" } },
          { key: "currentStatus", label: { en: "Current Status", si: "වර්තමාන තත්වය" } },
        ]}
        rows={aggregate.developmentProjects.rows}
      />
    </div>
  );
}

/** GN-division-scoped view of the "State Institutions & Land" section (§2): a DS searches or
 *  selects a GN division from their own roster and sees that division's latest approved data —
 *  the same raw rows an EDO entered. Before a division is picked, falls back to the whole-division
 *  aggregate (every approved GN division's rows pooled together) rather than an empty prompt. */
export function StateInstitutionsLandView() {
  const { lang } = useLanguage();
  const { data: area, isLoading: areaLoading, isError: areaError } = useAreaAnalytics();

  return (
    <GnScopedSectionView
      prompt={{
        en: "Search or select a GN division above to view its State Institutions & Land data.",
        si: "එහි රාජ්‍ය ආයතන හා ඉඩම් දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
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
                en="Unable to load whole-division State Institutions & Land data right now. Please try again shortly."
                si="සම්පූර්ණ කොට්ඨාසයේ රාජ්‍ය ආයතන හා ඉඩම් තොරතුරු මෙම මොහොතේ පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
              />
            </CardContent>
          </Card>
        ) : (
          <StateInstitutionsLandAreaWideView aggregate={area.sections.areaProfile} lang={lang} />
        )
      }
    >
      {(profile) => {
        const section = profile.data.stateInstitutionsLand;
        return (
          <div className="flex flex-col gap-8">
            <ReadOnlyTable
              title={stateInstitutionsLandDict.fields.stateInstitutions}
              columns={[
                { key: "name", label: { en: "Institution Name", si: "ආයතනයේ නම" } },
                { key: "address", label: { en: "Address", si: "ලිපිනය" } },
              ]}
              rows={section?.stateInstitutions ?? []}
            />
            <ReadOnlyTable
              title={stateInstitutionsLandDict.fields.illegalStructures}
              columns={[
                { key: "buildingName", label: { en: "Name of the Abandoned Building", si: "අත්හැර දමන ලද ගොඩනැගිල්ලේ නම" } },
                { key: "purposeUsed", label: { en: "Purpose Used For", si: "යොදා ගත් කාර්යය" } },
                { key: "usable", label: { en: "Usable Condition", si: "භාවිතයට ගත හැකි මට්ටමක පවතිනවාද" }, options: USABLE_OPTIONS },
                { key: "owningInstitution", label: { en: "Owning Institution", si: "ගොඩනැගිල්ල අයත් ආයතනය" } },
              ]}
              rows={section?.illegalStructures ?? []}
            />
            <ReadOnlyTable
              title={stateInstitutionsLandDict.fields.developmentProjects}
              columns={[
                { key: "projectName", label: { en: "Name of the Stalled Project(s)", si: "අතරමං නවතාදමා ඇති ව්‍යාපෘතියේ/වල නම" } },
                { key: "owningInstitution", label: { en: "Owning Institution", si: "ව්‍යාපෘතිය අයත් ආයතනය" } },
                { key: "reasonForHalt", label: { en: "Reason for Halting", si: "නවතාදැමීමට හේතුව" } },
                { key: "currentStatus", label: { en: "Current Status", si: "වර්තමාන තත්වය" } },
              ]}
              rows={section?.developmentProjects ?? []}
            />
          </div>
        );
      }}
    </GnScopedSectionView>
  );
}
