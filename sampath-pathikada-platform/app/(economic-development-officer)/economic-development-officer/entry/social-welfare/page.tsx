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
  CHILDRENS_HOME_TYPES,
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
    totalAswesumaRecipients: 0,
  },
  allowanceRecipientCounts: {
    disabilityAllowance: 0,
    elderlyAllowance: 0,
    nutritionAllowance: 0,
    publicAssistance: 0,
    diseaseAidWheelchair: 0,
    diseaseAidCancer: 0,
    diseaseAidThalassemia: 0,
    diseaseAidDiabetes: 0,
    other: 0,
  },
  eldersHomes: [],
  childrensHomes: [],
};

const ELDERS_HOME_AUTHORITY_LABELS: Record<(typeof ELDERS_HOME_AUTHORITY_TYPES)[number], { en: string; si: string }> = {
  govt: { en: "Government", si: "රාජ්‍ය" },
  private: { en: "Private", si: "පෞද්ගලික" },
};

const CHILDRENS_HOME_TYPE_LABELS: Record<(typeof CHILDRENS_HOME_TYPES)[number], { en: string; si: string }> = {
  "childrens-home": { en: "Children's Home", si: "ළමා නිවාසය" },
  "certified-school": { en: "Certified School", si: "සහතික කළ පාසල" },
  "probation-home": { en: "Probation Home", si: "සේවන නිවාසය" },
  "detention-home": { en: "Detention Home", si: "රඳවා තැබීමේ නිවාසය" },
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
    { key: "phone", label: { en: "Phone", si: "දුරකථන අංකය" }, type: "text" },
    { key: "infrastructureNeeds", label: { en: "Infrastructure Needs", si: "යටිතල පහසුකම්වල අවශ්‍යතාව" }, type: "text" },
    { key: "capacity", label: { en: "Capacity", si: "ධාරිතාව" }, type: "number" },
    { key: "residentCount.female", label: { en: "Residents - Female", si: "වාසීන් - ස්ත්‍රී" }, type: "number" },
    { key: "residentCount.male", label: { en: "Residents - Male", si: "වාසීන් - පුරුෂ" }, type: "number" },
  ];

  const childrensHomeColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    {
      key: "type",
      label: { en: "Type", si: "වර්ගය" },
      type: "select",
      options: CHILDRENS_HOME_TYPES.map((v) => ({ value: v, label: CHILDRENS_HOME_TYPE_LABELS[v] })),
    },
    {
      key: "authority",
      label: { en: "Authority", si: "පාලන අධිකාරිය" },
      type: "select",
      options: CHILDRENS_HOME_AUTHORITY_TYPES.map((v) => ({ value: v, label: CHILDRENS_HOME_AUTHORITY_LABELS[v] })),
    },
    { key: "phone", label: { en: "Phone", si: "දුරකථන අංකය" }, type: "text" },
    { key: "infrastructureNeeds", label: { en: "Infrastructure Needs", si: "යටිතල පහසුකම්වල අවශ්‍යතාව" }, type: "text" },
    { key: "capacity", label: { en: "Capacity", si: "ධාරිතාව" }, type: "number" },
    { key: "residentCount.female", label: { en: "Residents - Female", si: "වාසීන් - ස්ත්‍රී" }, type: "number" },
    { key: "residentCount.male", label: { en: "Residents - Male", si: "වාසීන් - පුරුෂ" }, type: "number" },
  ];

  return (
    <SectionForm
      sectionNumber={12}
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
          <FieldWrapper name="welfarePaymentHouseholdCounts.totalAswesumaRecipients" label={{ en: "Total Aswesuma Recipients", si: "අස්වැසුම ප්‍රතිලාභී මුළු" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("welfarePaymentHouseholdCounts.totalAswesumaRecipients")}
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
          <FieldWrapper name="allowanceRecipientCounts.diseaseAidWheelchair" label={{ en: "Disease Aid - Wheelchair", si: "රෝගාධාර - වීල්චෙයාර්" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("allowanceRecipientCounts.diseaseAidWheelchair")}
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="allowanceRecipientCounts.diseaseAidCancer" label={{ en: "Disease Aid - Cancer", si: "රෝගාධාර - පිළිකා" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("allowanceRecipientCounts.diseaseAidCancer")}
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="allowanceRecipientCounts.diseaseAidThalassemia" label={{ en: "Disease Aid - Thalassemia", si: "රෝගාධාර - තැලසීමියා" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("allowanceRecipientCounts.diseaseAidThalassemia")}
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="allowanceRecipientCounts.diseaseAidDiabetes" label={{ en: "Disease Aid - Diabetes", si: "රෝගාධාර - දියවැඩියාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("allowanceRecipientCounts.diseaseAidDiabetes")}
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
          emptyRowFactory={() => ({
            name: "",
            address: "",
            authority: "govt",
            phone: "",
            infrastructureNeeds: "",
            capacity: 0,
            residentCount: { female: 0, male: 0 },
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="childrensHomes"
          title={socialWelfareDict.fields.childrensHomes}
          columns={childrensHomeColumns}
          emptyRowFactory={() => ({
            name: "",
            address: "",
            type: "childrens-home",
            authority: "govt",
            phone: "",
            infrastructureNeeds: "",
            capacity: 0,
            residentCount: { female: 0, male: 0 },
          })}
        />
      </div>
    </SectionForm>
  );
}
