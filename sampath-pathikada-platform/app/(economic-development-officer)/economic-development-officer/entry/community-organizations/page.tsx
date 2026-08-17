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
  "village-development-society": { en: "Village Development Society", si: "ග්‍රාම සංවර්ධන සමිති" },
  "youth-society": { en: "Youth Society", si: "යෞවන සමාජ සමිති" },
  "sports-club": { en: "Sports Society", si: "ක්‍රීඩා සමාජ" },
  "funeral-aid-society": { en: "Funeral & Welfare Society", si: "අවමංගලාය හා සුභසාධක සමිති" },
  "womens-society": { en: "Women's Society", si: "කාන්තා සමිති" },
  "elders-society": { en: "Elders' Society", si: "වැඩිහිටි සමිති" },
  "childrens-society": { en: "Children's Society", si: "ළමා සමාජ" },
  "samurdhi-society": { en: "Samurdhi Society", si: "සමෘද්ධි සමිති" },
  "friend-organization": { en: "Friend Organization / Friend Group", si: "මිතුරු සංවිධාන/මිතුරු හවුල්" },
  "ngo-committee": { en: "Non-Governmental Organization", si: "රාජ්‍ය නොවන සංවිධාන සමිති" },
  "farmer-society": { en: "Farmer Society", si: "ගොවි සමිති" },
  "religious-society": { en: "Religious Society", si: "ආගමික සමිති" },
  "sanasa-society": { en: "SANASA Society", si: "සණස සමිති" },
  "civil-defense-committee": { en: "Civil Defense Committee", si: "සිවිල් ආරක්ෂක කමිටු" },
  "prajashakthi-society": { en: "Prajashakthi Society", si: "ප්‍රජාශක්ති සමිති" },
};

function getEmptyValues(lang: "en" | "si"): CommunityOrganizationsDraft {
  return {
    organizationCounts: ORGANIZATION_TYPES.map((type) => ({
      type,
      typeLabel: ORGANIZATION_TYPE_LABELS[type][lang],
      count: 0,
    })),
    villageDevelopmentSocieties: [],
    youthSocieties: [],
    sportsClubs: [],
    funeralAidSocieties: [],
    womensSocieties: [],
    eldersSocieties: [],
    childrensSocieties: [],
    samurdhiSocieties: [],
    friendOrganizations: [],
    ngoCommittees: [],
    farmerSocieties: [],
    religiousSocieties: [],
    sanasaSocieties: [],
    civilDefenseCommittees: [],
    prajashakthiSocieties: [],
    cooperativeSocieties: [],
  };
}

function mergeWithSaved(empty: CommunityOrganizationsDraft, saved: CommunityOrganizationsDraft): CommunityOrganizationsDraft {
  const savedCountsByType = new Map((saved.organizationCounts ?? []).filter((r) => r?.type).map((r) => [r!.type, r]));

  return {
    ...empty,
    ...saved,
    organizationCounts: empty.organizationCounts?.map((row) => ({ ...row, ...savedCountsByType.get(row.type) })),
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
    { key: "typeLabel", label: { en: "Type", si: "වර්ගය" }, type: "readonly" },
    { key: "count", label: { en: "Society Count", si: "සමිති සංඛ්‍යාව" }, type: "number", required: true },
  ];

  const nameColumns = (nameLabel: { en: string; si: string }): RepeatableColumn[] => [
    { key: "name", label: nameLabel, type: "text", required: true },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text", required: true },
  ];

  const sportsClubColumns: RepeatableColumn[] = [
    { key: "nameAndAddress", label: { en: "Sports Society Name & Address", si: "ක්‍රීඩා සමාජවල නම හා ලිපිනය" }, type: "text", required: true },
    { key: "memberCount", label: { en: "Member Count", si: "සාමාජික ගණන" }, type: "number" },
    { key: "identifiedNeeds", label: { en: "Identified Needs", si: "හඳුනාගත් අවශ්‍යතා" }, type: "text" },
  ];

  const cooperativeSocietyColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Multi-Purpose Cooperative Society Name", si: "වි.සේවා.සමූපකාර සමිතියේ නම" }, type: "text", required: true },
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
      submission={submission}
      sectionKey="communityOrganizations"
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
          name="villageDevelopmentSocieties"
          title={communityOrganizationsDict.fields.villageDevelopmentSocieties}
          columns={nameColumns({ en: "Village Development Society Names", si: "ග්‍රාම සංවර්ධන සමිතිවල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="youthSocieties"
          title={communityOrganizationsDict.fields.youthSocieties}
          columns={nameColumns({ en: "Youth Society Names", si: "යෞවන සමාජ සමිතිවල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="sportsClubs"
          title={communityOrganizationsDict.fields.sportsClubs}
          columns={sportsClubColumns}
          emptyRowFactory={() => ({ nameAndAddress: "", memberCount: 0, identifiedNeeds: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="funeralAidSocieties"
          title={communityOrganizationsDict.fields.funeralAidSocieties}
          columns={nameColumns({ en: "Funeral & Welfare Society Names", si: "අවමංගලාය හා සුභසාධක සමිතිවල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="womensSocieties"
          title={communityOrganizationsDict.fields.womensSocieties}
          columns={nameColumns({ en: "Women's Society Names", si: "කාන්තා සමිතිවල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="eldersSocieties"
          title={communityOrganizationsDict.fields.eldersSocieties}
          columns={nameColumns({ en: "Elders' Society Names", si: "වැඩිහිටි සමිතිවල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="childrensSocieties"
          title={communityOrganizationsDict.fields.childrensSocieties}
          columns={nameColumns({ en: "Children's Society Names", si: "ළමා සමාජ සමිතිවල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="samurdhiSocieties"
          title={communityOrganizationsDict.fields.samurdhiSocieties}
          columns={nameColumns({ en: "Samurdhi Society Names", si: "සමෘද්ධි සමිතිවල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="friendOrganizations"
          title={communityOrganizationsDict.fields.friendOrganizations}
          columns={nameColumns({ en: "Friend Organization / Friend Group Names", si: "මිතුරු සංවිධාන/මිතුරු හවුල් වල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="ngoCommittees"
          title={communityOrganizationsDict.fields.ngoCommittees}
          columns={nameColumns({ en: "Non-Governmental Organization Names", si: "රාජ්‍ය නොවන සංවිධාන වල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="farmerSocieties"
          title={communityOrganizationsDict.fields.farmerSocieties}
          columns={nameColumns({ en: "Farmer Society Names", si: "ගොවි සමිතිවල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="religiousSocieties"
          title={communityOrganizationsDict.fields.religiousSocieties}
          columns={nameColumns({ en: "Religious Society Names", si: "ආගමික සමිතිවල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="sanasaSocieties"
          title={communityOrganizationsDict.fields.sanasaSocieties}
          columns={nameColumns({ en: "SANASA Society Names", si: "සණස සමිතිවල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="civilDefenseCommittees"
          title={communityOrganizationsDict.fields.civilDefenseCommittees}
          columns={nameColumns({ en: "Civil Defense Committee Names", si: "සිවිල් ආරක්ෂක සමිතිවල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="prajashakthiSocieties"
          title={communityOrganizationsDict.fields.prajashakthiSocieties}
          columns={nameColumns({ en: "Prajashakthi Society Names", si: "ප්‍රජාශක්ති සමිතිවල නම" })}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="cooperativeSocieties"
          title={communityOrganizationsDict.fields.cooperativeSocieties}
          columns={cooperativeSocietyColumns}
          emptyRowFactory={() => ({ name: "" })}
        />
      </div>
    </SectionForm>
  );
}
