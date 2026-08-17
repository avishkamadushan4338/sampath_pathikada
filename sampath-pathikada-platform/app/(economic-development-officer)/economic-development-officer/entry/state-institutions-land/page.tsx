"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { stateInstitutionsLandDict } from "@/lib/i18n/sections/state-institutions-land";
import {
  stateInstitutionsLandSchemaPartial,
  type StateInstitutionsLandDraft,
} from "@/lib/validators/sections/state-institutions-land";

const CURRENT_YEAR = 2026;

const EMPTY_VALUES: StateInstitutionsLandDraft = {
  stateInstitutions: [],
  illegalStructures: [],
  developmentProjects: [],
};

export default function StateInstitutionsLandPage() {
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const form = useForm<StateInstitutionsLandDraft>({
    resolver: zodResolver(stateInstitutionsLandSchemaPartial),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (submission?.data.stateInstitutionsLand) {
      form.reset({ ...EMPTY_VALUES, ...submission.data.stateInstitutionsLand });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

  async function handleSave(values: StateInstitutionsLandDraft) {
    await saveSection("stateInstitutionsLand", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const stateInstitutionColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Institution Name", si: "ආයතනයේ නම" }, type: "text", required: true },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text", required: true },
  ];

  const illegalStructureColumns: RepeatableColumn[] = [
    { key: "buildingName", label: { en: "Name of the Abandoned Building", si: "අත්හැර දමන ලද ගොඩනැගිල්ලේ නම" }, type: "text", required: true },
    { key: "purposeUsed", label: { en: "Purpose Used For", si: "යොදා ගත් කාර්යය" }, type: "text", required: true },
    {
      key: "usable",
      label: { en: "Usable Condition", si: "භාවිතයට ගත හැකි මට්ටමක පවතිනවාද" },
      type: "select",
      required: true,
      options: [
        { value: "yes", label: { en: "Yes", si: "ඔව්" } },
        { value: "no", label: { en: "No", si: "නැත" } },
      ],
    },
    { key: "owningInstitution", label: { en: "Owning Institution", si: "ගොඩනැගිල්ල අයත් ආයතනය" }, type: "text", required: true },
  ];

  const developmentProjectColumns: RepeatableColumn[] = [
    { key: "projectName", label: { en: "Name of the Stalled Project(s)", si: "අතරමං නවතාදමා ඇති ව්‍යාපෘතියේ/වල නම" }, type: "text", required: true },
    { key: "owningInstitution", label: { en: "Owning Institution", si: "ව්‍යාපෘතිය අයත් ආයතනය" }, type: "text", required: true },
    { key: "reasonForHalt", label: { en: "Reason for Halting", si: "නවතාදැමීමට හේතුව" }, type: "text", required: true },
    { key: "currentStatus", label: { en: "Current Status", si: "වර්තමාන තත්වය" }, type: "text", required: true },
  ];

  return (
    <SectionForm
      sectionNumber={2}
      title={stateInstitutionsLandDict.title}
      description={stateInstitutionsLandDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
      submission={submission}
      sectionKey="stateInstitutionsLand"
    >
      <div>
        <RepeatableTable
          name="stateInstitutions"
          title={stateInstitutionsLandDict.fields.stateInstitutions}
          columns={stateInstitutionColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="flex flex-col gap-6 border-t border-border pt-6">
        <RepeatableTable
          name="illegalStructures"
          title={stateInstitutionsLandDict.fields.illegalStructures}
          columns={illegalStructureColumns}
          emptyRowFactory={() => ({ buildingName: "", purposeUsed: "", usable: "no", owningInstitution: "" })}
        />

        <RepeatableTable
          name="developmentProjects"
          title={stateInstitutionsLandDict.fields.developmentProjects}
          columns={developmentProjectColumns}
          emptyRowFactory={() => ({ projectName: "", owningInstitution: "", reasonForHalt: "", currentStatus: "" })}
        />
      </div>
    </SectionForm>
  );
}
