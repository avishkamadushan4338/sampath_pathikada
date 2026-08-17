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
  "childrens-home": { en: "Children's Home", si: "ළමා නිවාස" },
  "certified-school": { en: "Certified School", si: "සහතික කල පාසල්" },
  "probation-home": { en: "Reformatory Home", si: "නිවර්තන නිවාස" },
  "detention-home": { en: "Detention Home", si: "රැදවුම් නිවාස" },
};

const CHILDRENS_HOME_AUTHORITY_LABELS: Record<
  (typeof CHILDRENS_HOME_AUTHORITY_TYPES)[number],
  { en: string; si: string }
> = {
  govt: { en: "Government", si: "රාජ්‍ය" },
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
    { key: "name", label: { en: "Elders' Home Name", si: "වැඩිහිටි නිවාසය නම" }, type: "text", required: true },
    {
      key: "authority",
      label: { en: "Maintaining Authority", si: "පාලනය කරනු ලබන ආයතනය" },
      type: "select",
      options: ELDERS_HOME_AUTHORITY_TYPES.map((v) => ({ value: v, label: ELDERS_HOME_AUTHORITY_LABELS[v] })),
      required: true,
    },
    { key: "phone", label: { en: "Phone Number", si: "දුරකථන අංකය" }, type: "text" },
    { key: "infrastructureNeeds", label: { en: "Infrastructure Facility Needs", si: "යටිතල පහසුකම්වල අවශ්‍යතාව" }, type: "text" },
    { key: "capacity", label: { en: "Elders' Home Capacity", si: "වැඩිහිටි නිවාසයේ ධාරිතාව" }, type: "number" },
    { key: "residentCount.female", label: { en: "Current Residents - Female", si: "දැනට සිටින වැඩිහිටියන් - ගැහැණු" }, type: "number" },
    { key: "residentCount.male", label: { en: "Current Residents - Male", si: "දැනට සිටින වැඩිහිටියන් - පිරිමි" }, type: "number" },
  ];

  const childrensHomeColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Children's Home Name", si: "ළමා නිවාසය නම" }, type: "text", required: true },
    {
      key: "authority",
      label: { en: "Maintaining Authority", si: "පාලනය කරනු ලබන ආයතනය" },
      type: "select",
      options: CHILDRENS_HOME_AUTHORITY_TYPES.map((v) => ({ value: v, label: CHILDRENS_HOME_AUTHORITY_LABELS[v] })),
      required: true,
    },
    {
      key: "type",
      label: { en: "Type", si: "වර්ගය" },
      type: "select",
      options: CHILDRENS_HOME_TYPES.map((v) => ({ value: v, label: CHILDRENS_HOME_TYPE_LABELS[v] })),
      required: true,
    },
    { key: "capacity", label: { en: "Children's Home Capacity", si: "ළමා නිවාසයේ ධාරිතාව" }, type: "number" },
    { key: "residentCount.female", label: { en: "Current Children - Female", si: "දැනට සිටින ළමයින් - ගැහැණු" }, type: "number" },
    { key: "residentCount.male", label: { en: "Current Children - Male", si: "දැනට සිටින ළමයින් - පිරිමි" }, type: "number" },
    {
      key: "residentCount.total",
      label: { en: "Current Children - Total", si: "දැනට සිටින ළමයින් - එකතුව" },
      type: "computed",
      compute: (row) => {
        const rc = (row as { residentCount?: { female?: number; male?: number } }).residentCount;
        return (Number(rc?.female) || 0) + (Number(rc?.male) || 0);
      },
    },
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
      submission={submission}
      sectionKey="socialWelfare"
    >
      <div>
        <h2 lang={lang} className={cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? socialWelfareDict.fields.welfarePaymentHouseholdCounts.si : socialWelfareDict.fields.welfarePaymentHouseholdCounts.en}
        </h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="welfarePaymentHouseholdCountsTotal" label={{ en: "Total Household Count", si: "මුළු පවුල් ගණන" }}>
            {({ id }) => (
              <Input
                id={id}
                readOnly
                disabled
                value={
                  (Number(form.watch("welfarePaymentHouseholdCounts.rs2500")) || 0) +
                  (Number(form.watch("welfarePaymentHouseholdCounts.rs5000")) || 0) +
                  (Number(form.watch("welfarePaymentHouseholdCounts.rs8500")) || 0) +
                  (Number(form.watch("welfarePaymentHouseholdCounts.rs15000")) || 0)
                }
                className="nums-tabular"
              />
            )}
          </FieldWrapper>
          <FieldWrapper name="welfarePaymentHouseholdCounts.rs2500" label={{ en: "Rs. 2,500 - Transitional", si: "රු.2500 සංක්‍රාන්තික" }}>
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
          <FieldWrapper name="welfarePaymentHouseholdCounts.rs5000" label={{ en: "Rs. 5,000 - At Risk", si: "රු.5000 අවධානමට ලක් වූ" }}>
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
          <FieldWrapper name="welfarePaymentHouseholdCounts.rs8500" label={{ en: "Rs. 8,500 - Poor", si: "රු.8500 දිලිඳු" }}>
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
          <FieldWrapper name="welfarePaymentHouseholdCounts.rs15000" label={{ en: "Rs. 15,000 - Extremely Poor", si: "රු.15000 අන්ත දිලිඳු" }}>
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
          <FieldWrapper name="welfarePaymentHouseholdCounts.totalAswesumaRecipients" label={{ en: "Total Aswesuma Recipients", si: "අස්වැසුම ප්‍රතිලාභී මුළ" }}>
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
          <FieldWrapper name="allowanceRecipientCounts.disabilityAllowance" label={{ en: "Disability Allowance", si: "ආබාධිත දීමනා" }}>
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
          <FieldWrapper name="allowanceRecipientCounts.elderlyAllowance" label={{ en: "Elderly Allowance", si: "වැඩිහිටි දීමනා" }}>
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
          <FieldWrapper name="allowanceRecipientCounts.nutritionAllowance" label={{ en: "Nutrition Stamp", si: "පෝෂණ මුද්දර" }}>
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
          <FieldWrapper name="allowanceRecipientCounts.publicAssistance" label={{ en: "Public Assistance", si: "මහජන ආධාර" }}>
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
          <FieldWrapper name="allowanceRecipientCounts.diseaseAidWheelchair" label={{ en: "Disease Aid - Kidney", si: "රෝගාධාර - වකුගඩු ආධාර" }}>
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
          <FieldWrapper name="allowanceRecipientCounts.diseaseAidThalassemia" label={{ en: "Disease Aid - Thalassemia", si: "රෝගාධාර - තැලිසීමියා" }}>
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
            authority: "govt",
            type: "childrens-home",
            capacity: 0,
            residentCount: { female: 0, male: 0 },
          })}
        />
      </div>
    </SectionForm>
  );
}
