"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { communityOrganizationsDict } from "@/lib/i18n/sections/community-organizations";
import {
  communityOrganizationsSchemaPartial,
  ORGANIZATION_TYPES,
} from "@/lib/validators/sections/community-organizations";
import { z } from "zod";

const CURRENT_YEAR = 2026;

type CommunityOrganizationsDraft = z.infer<typeof communityOrganizationsSchemaPartial>;

const ORGANIZATION_TYPE_LABELS: Record<(typeof ORGANIZATION_TYPES)[number], { en: string; si: string }> = {
  "village-development-society": { en: "Village Development Society", si: "ග්‍රාම සංවර්ධන සමිතිය" },
  "youth-society": { en: "Youth Society", si: "යෞවන සමිතිය" },
  "sports-club": { en: "Sports Club", si: "ක්‍රීඩා සමාජය" },
  "funeral-aid-society": { en: "Funeral Aid Society", si: "අවමංගල්‍ය සහන සමිතිය" },
  "womens-society": { en: "Women's Society", si: "කාන්තා සමිතිය" },
  "elders-society": { en: "Elders' Society", si: "වැඩිහිටි සමිතිය" },
  "childrens-society": { en: "Children's Society", si: "ළමා සමිතිය" },
  "samurdhi-society": { en: "Samurdhi Society", si: "සමෘද්ධි සමිතිය" },
  "friend-organization": { en: "Friend Organization / Association", si: "මිතුරු සංවිධාන/මිතුරු හවුල්" },
  "ngo-committee": { en: "Non-Governmental Organization Committee", si: "රාජ්‍ය නොවන සංවිධාන සමිති" },
  "farmer-society": { en: "Farmer Society", si: "ගොවි සංවිධානය" },
  "religious-society": { en: "Religious Society", si: "ආගමික සමිතිය" },
  "sanasa-society": { en: "SANASA Society", si: "සණස සමිතිය" },
  "civil-defense-committee": { en: "Civil Defense Committee", si: "සිවිල් ආරක්ෂක කමිටුව" },
  "prajashakthi-society": { en: "Prajashakthi Society", si: "ප්‍රජාශක්ති සමිතිය" },
};

function getEmptyValues(lang: "en" | "si"): CommunityOrganizationsDraft {
  return {
    organizationCounts: ORGANIZATION_TYPES.map((type) => ({
      type,
      typeLabel: ORGANIZATION_TYPE_LABELS[type][lang],
      count: 0,
    })),
    organizationDirectory: [],
    cooperativeSocieties: [],
  };
}

function mergeWithSaved(empty: CommunityOrganizationsDraft, saved: CommunityOrganizationsDraft): CommunityOrganizationsDraft {
  return {
    ...empty,
    ...saved,
    organizationCounts: empty.organizationCounts?.map((row, i) => ({ ...row, ...saved.organizationCounts?.[i] })),
  };
}

export default function CommunityOrganizationsPage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const form = useForm<CommunityOrganizationsDraft>({
    resolver: zodResolver(communityOrganizationsSchemaPartial),
    defaultValues: getEmptyValues(lang),
  });

  useEffect(() => {
    if (submission?.data.communityOrganizations) {
      form.reset(mergeWithSaved(getEmptyValues(lang), submission.data.communityOrganizations));
    } else {
      form.reset(getEmptyValues(lang));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission, lang]);

  async function handleSave(values: CommunityOrganizationsDraft) {
    await saveSection("communityOrganizations", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const organizationCountColumns: RepeatableColumn[] = [
    { key: "typeLabel", label: { en: "Organization Type", si: "සංවිධාන වර්ගය" }, type: "readonly" },
    { key: "count", label: { en: "Count", si: "සංඛ්‍යාව" }, type: "number" },
  ];

  const organizationDirectoryColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    {
      key: "type",
      label: { en: "Type", si: "වර්ගය" },
      type: "select",
      options: ORGANIZATION_TYPES.map((type) => ({ value: type, label: ORGANIZATION_TYPE_LABELS[type] })),
    },
    { key: "memberCount", label: { en: "Member Count (Sports Clubs)", si: "සාමාජික ගණන (ක්‍රීඩා සමාජ)" }, type: "number" },
    { key: "identifiedNeeds", label: { en: "Identified Needs (Sports Clubs)", si: "හඳුනාගත් අවශ්‍යතා (ක්‍රීඩා සමාජ)" }, type: "text" },
  ];

  const cooperativeSocietyColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Society Name", si: "සමිතියේ නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
  ];

  return (
    <SectionForm
      sectionNumber={13}
      title={communityOrganizationsDict.title}
      description={communityOrganizationsDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div>
        <RepeatableTable
          name="organizationCounts"
          title={communityOrganizationsDict.fields.organizationCounts}
          columns={organizationCountColumns}
          fixedRows
          emptyRowFactory={() => ({
            type: ORGANIZATION_TYPES[0],
            typeLabel: ORGANIZATION_TYPE_LABELS[ORGANIZATION_TYPES[0]][lang],
            count: 0,
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="organizationDirectory"
          title={communityOrganizationsDict.fields.organizationDirectory}
          columns={organizationDirectoryColumns}
          emptyRowFactory={() => ({ name: "", address: "", type: ORGANIZATION_TYPES[0], memberCount: 0, identifiedNeeds: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="cooperativeSocieties"
          title={communityOrganizationsDict.fields.cooperativeSocieties}
          columns={cooperativeSocietyColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>
    </SectionForm>
  );
}
