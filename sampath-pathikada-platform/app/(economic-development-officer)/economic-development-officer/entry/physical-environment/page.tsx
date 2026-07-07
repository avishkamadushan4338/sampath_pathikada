"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { physicalEnvironmentDict } from "@/lib/i18n/sections/physical-environment";
import { physicalEnvironmentSchemaPartial } from "@/lib/validators/sections/physical-environment";
import { z } from "zod";

const CURRENT_YEAR = 2026;

type PhysicalEnvironmentDraft = z.infer<typeof physicalEnvironmentSchemaPartial>;

const EMPTY_VALUES: PhysicalEnvironmentDraft = {
  waterSources: [],
  sensitiveZones: [],
  naturalResources: [],
  hazards: [],
  safeLocations: [],
  touristSites: [],
  proposedTouristSites: [],
};

const waterSourceColumns: RepeatableColumn[] = [
  { key: "type", label: { en: "Type", si: "වර්ගය" }, type: "text" },
  { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
];

const sensitiveZoneColumns: RepeatableColumn[] = [
  { key: "zoneName", label: { en: "Zone / Area Name", si: "කලාපයේ/ප්‍රදේශයේ නම" }, type: "text" },
  { key: "significance", label: { en: "Significance", si: "වැදගත්කම" }, type: "text" },
  { key: "managingAuthority", label: { en: "Managing Authority", si: "කළමනාකරණ අධිකාරිය" }, type: "text" },
];

const naturalResourceColumns: RepeatableColumn[] = [
  { key: "resource", label: { en: "Resource", si: "සම්පත" }, type: "text" },
  { key: "notes", label: { en: "Notes", si: "සටහන්" }, type: "text" },
];

const hazardColumns: RepeatableColumn[] = [
  { key: "type", label: { en: "Hazard Type", si: "ආපදා වර්ගය" }, type: "text" },
  {
    key: "occurred",
    label: { en: "Occurred?", si: "සිදුවී ඇත්ද?" },
    type: "select",
    options: [
      { value: "yes", label: { en: "Yes", si: "ඔව්" } },
      { value: "no", label: { en: "No", si: "නැත" } },
    ],
  },
  { key: "frequency", label: { en: "Frequency", si: "සංඛ්‍යාතය" }, type: "text" },
  { key: "cause", label: { en: "Cause", si: "හේතුව" }, type: "text" },
  { key: "mitigationProposal", label: { en: "Mitigation Proposal", si: "අවම කිරීමේ යෝජනාව" }, type: "text" },
];

const safeLocationColumns: RepeatableColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
  { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
];

const touristSiteColumns: RepeatableColumn[] = [
  { key: "siteName", label: { en: "Site Name", si: "ස්ථානයේ නම" }, type: "text" },
  { key: "reasonForAttraction", label: { en: "Reason for Attraction", si: "ආකර්ෂණයට හේතුව" }, type: "text" },
  { key: "maintainedBy", label: { en: "Maintained By", si: "නඩත්තු කරන්නා" }, type: "text" },
  {
    key: "frequency",
    label: { en: "Frequency", si: "සංඛ්‍යාතය" },
    type: "select",
    options: [
      { value: "seasonal", label: { en: "Seasonal", si: "සෘතුමය" } },
      { value: "year-round", label: { en: "Year-round", si: "වර්ෂය පුරා" } },
    ],
  },
];

const proposedTouristSiteColumns: RepeatableColumn[] = [
  { key: "siteName", label: { en: "Site Name", si: "ස්ථානයේ නම" }, type: "text" },
  { key: "specialFeatures", label: { en: "Special Features", si: "විශේෂ ලක්ෂණ" }, type: "text" },
  { key: "possibleActivities", label: { en: "Possible Activities", si: "කළ හැකි ක්‍රියාකාරකම්" }, type: "text" },
  { key: "currentAuthority", label: { en: "Current Authority", si: "වත්මන් අධිකාරිය" }, type: "text" },
];

export default function PhysicalEnvironmentPage() {
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const form = useForm<PhysicalEnvironmentDraft>({
    resolver: zodResolver(physicalEnvironmentSchemaPartial),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (submission?.data.physicalEnvironment) {
      form.reset({ ...EMPTY_VALUES, ...submission.data.physicalEnvironment });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

  async function handleSave(values: PhysicalEnvironmentDraft) {
    await saveSection("physicalEnvironment", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  return (
    <SectionForm
      sectionNumber={2}
      title={physicalEnvironmentDict.title}
      description={physicalEnvironmentDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div>
        <RepeatableTable
          name="waterSources"
          title={physicalEnvironmentDict.fields.waterSources}
          columns={waterSourceColumns}
          emptyRowFactory={() => ({ type: "", name: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="sensitiveZones"
          title={physicalEnvironmentDict.fields.sensitiveZones}
          columns={sensitiveZoneColumns}
          emptyRowFactory={() => ({ zoneName: "", significance: "", managingAuthority: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="naturalResources"
          title={physicalEnvironmentDict.fields.naturalResources}
          columns={naturalResourceColumns}
          emptyRowFactory={() => ({ resource: "", notes: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="hazards"
          title={physicalEnvironmentDict.fields.hazards}
          columns={hazardColumns}
          emptyRowFactory={() => ({ type: "", occurred: "no", frequency: "", cause: "", mitigationProposal: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="safeLocations"
          title={physicalEnvironmentDict.fields.safeLocations}
          columns={safeLocationColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="touristSites"
          title={physicalEnvironmentDict.fields.touristSites}
          columns={touristSiteColumns}
          emptyRowFactory={() => ({ siteName: "", reasonForAttraction: "", maintainedBy: "", frequency: "seasonal" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="proposedTouristSites"
          title={physicalEnvironmentDict.fields.proposedTouristSites}
          columns={proposedTouristSiteColumns}
          emptyRowFactory={() => ({ siteName: "", specialFeatures: "", possibleActivities: "", currentAuthority: "" })}
        />
      </div>
    </SectionForm>
  );
}
