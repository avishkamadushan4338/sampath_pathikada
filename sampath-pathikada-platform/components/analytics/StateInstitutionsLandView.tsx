"use client";

import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyTable } from "@/components/analytics/ReadOnlyTable";
import { stateInstitutionsLandDict } from "@/lib/i18n/sections/state-institutions-land";

const USABLE_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
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
                { key: "buildingName", label: { en: "Building Name", si: "ගොඩනැගිල්ලේ නම" } },
                { key: "purposeUsed", label: { en: "Purpose Used For", si: "යොදාගත් කාර්යය" } },
                { key: "usable", label: { en: "Usable Condition", si: "භාවිතයට ගත හැකිද" }, options: USABLE_OPTIONS },
                { key: "owningInstitution", label: { en: "Owning Institution", si: "අයත් ආයතනය" } },
              ]}
              rows={section?.illegalStructures ?? []}
            />
            <ReadOnlyTable
              title={stateInstitutionsLandDict.fields.developmentProjects}
              columns={[
                { key: "projectName", label: { en: "Project Name", si: "ව්‍යාපෘතියේ නම" } },
                { key: "owningInstitution", label: { en: "Owning Institution", si: "අයත් ආයතනය" } },
                { key: "reasonForHalt", label: { en: "Reason for Halting", si: "නවතාදැමීමට හේතුව" } },
                { key: "currentStatus", label: { en: "Current Status", si: "වර්තමාන තත්ත්වය" } },
              ]}
              rows={section?.developmentProjects ?? []}
            />
          </div>
        );
      }}
    </GnScopedSectionView>
  );
}
