"use client";

import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyTable } from "@/components/analytics/ReadOnlyTable";
import { physicalEnvironmentDict } from "@/lib/i18n/sections/physical-environment";

const OCCURRED_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const FREQUENCY_OPTIONS = [
  { value: "seasonal", label: { en: "Seasonal", si: "සෘතුමය" } },
  { value: "year-round", label: { en: "Year-round", si: "වර්ෂය පුරා" } },
];

/** GN-division-scoped view of the "Physical & Environment" section (§3): water sources,
 *  environmentally sensitive zones, natural resources, hazards, safe/evacuation locations, and
 *  existing/proposed tourist sites for whichever GN division the DS searches or selects. */
export function PhysicalEnvironmentView() {
  return (
    <GnScopedSectionView
      prompt={{
        en: "Search or select a GN division above to view its Physical & Environment data.",
        si: "එහි භෞතික හා පාරිසරික දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
      }}
    >
      {(profile) => {
        const section = profile.data.physicalEnvironment;
        return (
          <div className="flex flex-col gap-8">
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.waterSources}
              columns={[
                { key: "type", label: { en: "Type", si: "වර්ගය" } },
                { key: "name", label: { en: "Name", si: "නම" } },
              ]}
              rows={section?.waterSources ?? []}
            />
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.sensitiveZones}
              columns={[
                { key: "zoneName", label: { en: "Zone / Area Name", si: "කලාපයේ/ප්‍රදේශයේ නම" } },
                { key: "significance", label: { en: "Significance", si: "වැදගත්කම" } },
                { key: "managingAuthority", label: { en: "Managing Authority", si: "කළමනාකරණ අධිකාරිය" } },
              ]}
              rows={section?.sensitiveZones ?? []}
            />
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.naturalResources}
              columns={[
                { key: "resource", label: { en: "Resource", si: "සම්පත" } },
                { key: "notes", label: { en: "Notes", si: "සටහන්" } },
              ]}
              rows={section?.naturalResources ?? []}
            />
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.hazards}
              columns={[
                { key: "type", label: { en: "Hazard Type", si: "ආපදා වර්ගය" } },
                { key: "occurred", label: { en: "Occurred?", si: "සිදුවී ඇත්ද?" }, options: OCCURRED_OPTIONS },
                { key: "frequency", label: { en: "Frequency", si: "සංඛ්‍යාතය" } },
                { key: "cause", label: { en: "Cause", si: "හේතුව" } },
                { key: "mitigationProposal", label: { en: "Mitigation Proposal", si: "අවම කිරීමේ යෝජනාව" } },
              ]}
              rows={section?.hazards ?? []}
            />
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.safeLocations}
              columns={[
                { key: "name", label: { en: "Name", si: "නම" } },
                { key: "address", label: { en: "Address", si: "ලිපිනය" } },
              ]}
              rows={section?.safeLocations ?? []}
            />
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.touristSites}
              columns={[
                { key: "siteName", label: { en: "Site Name", si: "ස්ථානයේ නම" } },
                { key: "reasonForAttraction", label: { en: "Reason for Attraction", si: "ආකර්ෂණයට හේතුව" } },
                { key: "maintainedBy", label: { en: "Maintained By", si: "නඩත්තු කරන්නා" } },
                { key: "frequency", label: { en: "Frequency", si: "සංඛ්‍යාතය" }, options: FREQUENCY_OPTIONS },
              ]}
              rows={section?.touristSites ?? []}
            />
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.proposedTouristSites}
              columns={[
                { key: "siteName", label: { en: "Site Name", si: "ස්ථානයේ නම" } },
                { key: "specialFeatures", label: { en: "Special Features", si: "විශේෂ ලක්ෂණ" } },
                { key: "possibleActivities", label: { en: "Possible Activities", si: "කළ හැකි ක්‍රියාකාරකම්" } },
                { key: "currentAuthority", label: { en: "Current Authority", si: "වත්මන් අධිකාරිය" } },
              ]}
              rows={section?.proposedTouristSites ?? []}
            />
          </div>
        );
      }}
    </GnScopedSectionView>
  );
}
