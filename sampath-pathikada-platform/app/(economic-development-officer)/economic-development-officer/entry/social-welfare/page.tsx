"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper } from "@/components/forms/FormField";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { Input } from "@/components/ui/input";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { socialWelfareDict } from "@/lib/i18n/sections/social-welfare";
import {
  socialWelfareSchemaPartial,
  ELDERS_HOME_AUTHORITY_TYPES,
  CHILDRENS_HOME_AUTHORITY_TYPES,
} from "@/lib/validators/sections/social-welfare";
import { z } from "zod";
import { cn } from "@/lib/utils";

const CURRENT_YEAR = 2026;

type SocialWelfareDraft = z.infer<typeof socialWelfareSchemaPartial>;

const EMPTY_VALUES: SocialWelfareDraft = {
  welfarePaymentHouseholdCounts: {
    rs2500: 0,
    rs5000: 0,
    rs8500: 0,
    rs15000: 0,
    noBenefit: 0,
  },
  allowanceRecipientCounts: {
    disabilityAllowance: 0,
    elderlyAllowance: 0,
    nutritionAllowance: 0,
    publicAssistance: 0,
    sickAllowance: 0,
    other: 0,
  },
  eldersHomes: [],
  childrensHomes: [],
};

const ELDERS_HOME_AUTHORITY_LABELS: Record<(typeof ELDERS_HOME_AUTHORITY_TYPES)[number], { en: string; si: string }> = {
  govt: { en: "Government", si: "රාජ්‍ය" },
  private: { en: "Private", si: "පෞද්ගලික" },
};

const CHILDRENS_HOME_AUTHORITY_LABELS: Record<
  (typeof CHILDRENS_HOME_AUTHORITY_TYPES)[number],
  { en: string; si: string }
> = {
  govt: { en: "Government", si: "රාජ්‍ය" },
  ngo: { en: "NGO", si: "රාජ්‍ය නොවන සංවිධාන" },
  private: { en: "Private", si: "පෞද්ගලික" },
};

export default function SocialWelfarePage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const form = useForm<SocialWelfareDraft>({
    resolver: zodResolver(socialWelfareSchemaPartial),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (submission?.data.socialWelfare) {
      form.reset({ ...EMPTY_VALUES, ...submission.data.socialWelfare });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

  async function handleSave(values: SocialWelfareDraft) {
    await saveSection("socialWelfare", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const eldersHomeColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    {
      key: "authority",
      label: { en: "Authority", si: "පාලන අධිකාරිය" },
      type: "select",
      options: ELDERS_HOME_AUTHORITY_TYPES.map((v) => ({ value: v, label: ELDERS_HOME_AUTHORITY_LABELS[v] })),
    },
    { key: "residentCount", label: { en: "Resident Count", si: "වාසීන් සංඛ්‍යාව" }, type: "number" },
  ];

  const childrensHomeColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    {
      key: "authority",
      label: { en: "Authority", si: "පාලන අධිකාරිය" },
      type: "select",
      options: CHILDRENS_HOME_AUTHORITY_TYPES.map((v) => ({ value: v, label: CHILDRENS_HOME_AUTHORITY_LABELS[v] })),
    },
    { key: "residentCount", label: { en: "Resident Count", si: "වාසීන් සංඛ්‍යාව" }, type: "number" },
  ];

  return (
    <SectionForm
      sectionNumber={11}
      title={socialWelfareDict.title}
      description={socialWelfareDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div>
        <h2 lang={lang} className={cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? socialWelfareDict.fields.welfarePaymentHouseholdCounts.si : socialWelfareDict.fields.welfarePaymentHouseholdCounts.en}
        </h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="welfarePaymentHouseholdCounts.rs2500" label={{ en: "Rs. 2,500", si: "රු. 2,500" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("welfarePaymentHouseholdCounts.rs2500")}
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="welfarePaymentHouseholdCounts.rs5000" label={{ en: "Rs. 5,000", si: "රු. 5,000" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("welfarePaymentHouseholdCounts.rs5000")}
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="welfarePaymentHouseholdCounts.rs8500" label={{ en: "Rs. 8,500", si: "රු. 8,500" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("welfarePaymentHouseholdCounts.rs8500")}
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="welfarePaymentHouseholdCounts.rs15000" label={{ en: "Rs. 15,000", si: "රු. 15,000" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("welfarePaymentHouseholdCounts.rs15000")}
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="welfarePaymentHouseholdCounts.noBenefit" label={{ en: "No Benefit", si: "ප්‍රතිලාභ නොලැබූ" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("welfarePaymentHouseholdCounts.noBenefit")}
              />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 lang={lang} className={cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? socialWelfareDict.fields.allowanceRecipientCounts.si : socialWelfareDict.fields.allowanceRecipientCounts.en}
        </h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="allowanceRecipientCounts.disabilityAllowance" label={{ en: "Disability Allowance", si: "ආබාධිත දීමනාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("allowanceRecipientCounts.disabilityAllowance")}
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="allowanceRecipientCounts.elderlyAllowance" label={{ en: "Elderly Allowance", si: "වැඩිහිටි දීමනාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("allowanceRecipientCounts.elderlyAllowance")}
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="allowanceRecipientCounts.nutritionAllowance" label={{ en: "Nutrition Allowance", si: "පෝෂණ දීමනාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("allowanceRecipientCounts.nutritionAllowance")}
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="allowanceRecipientCounts.publicAssistance" label={{ en: "Public Assistance", si: "මහජන සහන ආධාර" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("allowanceRecipientCounts.publicAssistance")}
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="allowanceRecipientCounts.sickAllowance" label={{ en: "Sick Allowance", si: "රෝගී දීමනාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("allowanceRecipientCounts.sickAllowance")}
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="allowanceRecipientCounts.other" label={{ en: "Other", si: "වෙනත්" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("allowanceRecipientCounts.other")}
              />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="eldersHomes"
          title={socialWelfareDict.fields.eldersHomes}
          columns={eldersHomeColumns}
          emptyRowFactory={() => ({ name: "", address: "", authority: "govt", residentCount: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="childrensHomes"
          title={socialWelfareDict.fields.childrensHomes}
          columns={childrensHomeColumns}
          emptyRowFactory={() => ({ name: "", address: "", authority: "govt", residentCount: 0 })}
        />
      </div>
    </SectionForm>
  );
}
