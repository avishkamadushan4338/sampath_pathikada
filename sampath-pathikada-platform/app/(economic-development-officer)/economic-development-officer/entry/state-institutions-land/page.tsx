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
    { key: "name", label: { en: "Institution Name", si: "ආයතනයේ නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
  ];

  const illegalStructureColumns: RepeatableColumn[] = [
    { key: "description", label: { en: "Description", si: "විස්තරය" }, type: "text" },
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text" },
  ];

  const developmentProjectColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Project Name", si: "ව්‍යාපෘතියේ නම" }, type: "text" },
    {
      key: "status",
      label: { en: "Status", si: "තත්ත්වය" },
      type: "select",
      options: [
        { value: "ongoing", label: { en: "Ongoing", si: "ක්‍රියාත්මක" } },
        { value: "new", label: { en: "New", si: "නව" } },
      ],
    },
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text" },
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
          emptyRowFactory={() => ({ description: "", location: "" })}
        />

        <RepeatableTable
          name="developmentProjects"
          title={stateInstitutionsLandDict.fields.developmentProjects}
          columns={developmentProjectColumns}
          emptyRowFactory={() => ({ name: "", status: "ongoing", location: "" })}
        />
      </div>
    </SectionForm>
  );
}
