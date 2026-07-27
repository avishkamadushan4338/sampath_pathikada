"use client";

import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyTable } from "@/components/analytics/ReadOnlyTable";
import { stateInstitutionsLandDict } from "@/lib/i18n/sections/state-institutions-land";

const STATUS_OPTIONS = [
  { value: "ongoing", label: { en: "Ongoing", si: "ක්‍රියාත්මක" } },
  { value: "new", label: { en: "New", si: "නව" } },
];

/** GN-division-scoped view of the "State Institutions & Land" section (§2): a DS searches or
 *  selects a GN division from their own roster and sees that division's latest approved data —
 *  the same raw rows an EDO entered, not an area-wide aggregate. */
export function StateInstitutionsLandView() {
  return (
    <GnScopedSectionView
      prompt={{
        en: "Search or select a GN division above to view its State Institutions & Land data.",
        si: "එහි රාජ්‍ය ආයතන හා ඉඩම් දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
      }}
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
                { key: "description", label: { en: "Description", si: "විස්තරය" } },
                { key: "location", label: { en: "Location", si: "ස්ථානය" } },
              ]}
              rows={section?.illegalStructures ?? []}
            />
            <ReadOnlyTable
              title={stateInstitutionsLandDict.fields.developmentProjects}
              columns={[
                { key: "name", label: { en: "Project Name", si: "ව්‍යාපෘතියේ නම" } },
                { key: "status", label: { en: "Status", si: "තත්ත්වය" }, options: STATUS_OPTIONS },
                { key: "location", label: { en: "Location", si: "ස්ථානය" } },
              ]}
              rows={section?.developmentProjects ?? []}
            />
          </div>
        );
      }}
    </GnScopedSectionView>
  );
}
