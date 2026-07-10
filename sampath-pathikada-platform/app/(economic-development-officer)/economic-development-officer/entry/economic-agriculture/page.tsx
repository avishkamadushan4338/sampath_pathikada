"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper } from "@/components/forms/FormField";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { economicAgricultureDict } from "@/lib/i18n/sections/economic-agriculture";
import { economicAgricultureSchemaPartial, INDUSTRY_SIZES } from "@/lib/validators/sections/economic-agriculture";
import { cn } from "@/lib/utils";
import type { z } from "zod";

const CURRENT_YEAR = 2026;

type EconomicAgricultureDraft = z.infer<typeof economicAgricultureSchemaPartial>;

const EMPTY_VALUES: EconomicAgricultureDraft = {
  landUse: [],
  animalHusbandryCounts: {
    cattleFarming: 0,
    beekeeping: 0,
  },
  animalHusbandryDirectory: [],
  specialEconomicActivities: [],
  abandonedPaddyLand: {
    extentHectares: 0,
    canBeReactivatedExtent: 0,
    reason: "",
    actionPlan: "",
  },
  agriMachinery: [],
  forestDamage: [],
  livestockFarms: [],
  industries: [],
  marineFisheries: {
    householdCount: 0,
    activeFishermenCount: 0,
    societyCount: 0,
  },
  inlandFisheries: {
    householdCount: 0,
    activeFishermenCount: 0,
    societyCount: 0,
  },
  fishLandingSites: [],
  saltProductionPresent: "no",
  saltProductionDirectory: [],
  teaEstates: [],
};

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const INDUSTRY_SIZE_LABELS: Record<(typeof INDUSTRY_SIZES)[number], { en: string; si: string }> = {
  household: { en: "Household", si: "ගෘහස්ථ" },
  small: { en: "Small", si: "කුඩා" },
  large: { en: "Large", si: "විශාල" },
};

export default function EconomicAgriculturePage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const form = useForm<EconomicAgricultureDraft>({
    resolver: zodResolver(economicAgricultureSchemaPartial),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (submission?.data.economicAgriculture) {
      form.reset({ ...EMPTY_VALUES, ...submission.data.economicAgriculture });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

  async function handleSave(values: EconomicAgricultureDraft) {
    await saveSection("economicAgriculture", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const landUseColumns: RepeatableColumn[] = [
    { key: "landType", label: { en: "Land Type", si: "ඉඩම් වර්ගය" }, type: "text" },
    { key: "extentHectares", label: { en: "Extent (Hectares)", si: "ප්‍රමාණය (හෙක්ටයාර)" }, type: "number" },
  ];

  const animalHusbandryDirectoryColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    { key: "phone", label: { en: "Phone", si: "දුරකථන අංකය" }, type: "text" },
    { key: "type", label: { en: "Type", si: "වර්ගය" }, type: "text" },
  ];

  const specialEconomicActivityColumns: RepeatableColumn[] = [
    { key: "activity", label: { en: "Activity", si: "ක්‍රියාකාරකම" }, type: "text" },
    { key: "description", label: { en: "Description", si: "විස්තරය" }, type: "text" },
    { key: "beneficiaries", label: { en: "Beneficiaries", si: "ප්‍රතිලාභීන්" }, type: "text" },
  ];

  const agriMachineryColumns: RepeatableColumn[] = [
    { key: "label", label: { en: "Machinery", si: "යන්ත්‍රෝපකරණය" }, type: "text" },
    { key: "count", label: { en: "Count", si: "ගණන" }, type: "number" },
  ];

  const forestDamageColumns: RepeatableColumn[] = [
    { key: "label", label: { en: "Type of Damage", si: "විනාශයේ වර්ගය" }, type: "text" },
    {
      key: "present",
      label: { en: "Present", si: "පවතී ද" },
      type: "select",
      options: YES_NO_OPTIONS,
    },
  ];

  const livestockFarmColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    { key: "animalType", label: { en: "Animal Type", si: "සත්ව වර්ගය" }, type: "text" },
    { key: "count", label: { en: "Count", si: "ගණන" }, type: "number" },
  ];

  const industryColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "productType", label: { en: "Product Type", si: "නිෂ්පාදන වර්ගය" }, type: "text" },
    { key: "employeeCount", label: { en: "Employee Count", si: "සේවක සංඛ්‍යාව" }, type: "number" },
    {
      key: "size",
      label: { en: "Size", si: "ප්‍රමාණය" },
      type: "select",
      options: INDUSTRY_SIZES.map((s) => ({ value: s, label: INDUSTRY_SIZE_LABELS[s] })),
    },
  ];

  const fishLandingSiteColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text" },
  ];

  const saltProductionColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text" },
  ];

  const teaEstateColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "extentHectares", label: { en: "Extent (Hectares)", si: "ප්‍රමාණය (හෙක්ටයාර)" }, type: "number" },
    { key: "ownership", label: { en: "Ownership", si: "හිමිකාරිත්වය" }, type: "text" },
  ];

  const headingClass = cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading");

  return (
    <SectionForm
      sectionNumber={10}
      title={economicAgricultureDict.title}
      description={economicAgricultureDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div className="border-t-0 pt-0">
        <RepeatableTable
          name="landUse"
          title={economicAgricultureDict.fields.landUse}
          columns={landUseColumns}
          emptyRowFactory={() => ({ landType: "", extentHectares: 0 })}
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 lang={lang} className={headingClass}>
          {economicAgricultureDict.fields.animalHusbandryCounts[lang]}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="animalHusbandryCounts.cattleFarming" label={{ en: "Cattle Farming", si: "ගවපාලනය" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("animalHusbandryCounts.cattleFarming")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="animalHusbandryCounts.beekeeping" label={{ en: "Beekeeping", si: "මී මැසි පාලනය" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("animalHusbandryCounts.beekeeping")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="animalHusbandryDirectory"
          title={economicAgricultureDict.fields.animalHusbandryDirectory}
          columns={animalHusbandryDirectoryColumns}
          emptyRowFactory={() => ({ name: "", address: "", phone: "", type: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="specialEconomicActivities"
          title={economicAgricultureDict.fields.specialEconomicActivities}
          columns={specialEconomicActivityColumns}
          emptyRowFactory={() => ({ activity: "", description: "", beneficiaries: "" })}
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 lang={lang} className={headingClass}>
          {economicAgricultureDict.fields.abandonedPaddyLand[lang]}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="abandonedPaddyLand.extentHectares" label={{ en: "Extent (Hectares)", si: "ප්‍රමාණය (හෙක්ටයාර)" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("abandonedPaddyLand.extentHectares")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="abandonedPaddyLand.canBeReactivatedExtent" label={{ en: "Extent That Can Be Reactivated", si: "යළි වගා කළ හැකි ප්‍රමාණය" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("abandonedPaddyLand.canBeReactivatedExtent")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="abandonedPaddyLand.reason" label={{ en: "Reason", si: "හේතුව" }} className="sm:col-span-2">
            {({ id, describedBy, invalid }) => (
              <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("abandonedPaddyLand.reason")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="abandonedPaddyLand.actionPlan" label={{ en: "Action Plan", si: "ක්‍රියාකාරී සැලැස්ම" }} className="sm:col-span-2">
            {({ id, describedBy, invalid }) => (
              <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("abandonedPaddyLand.actionPlan")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="agriMachinery"
          title={economicAgricultureDict.fields.agriMachinery}
          columns={agriMachineryColumns}
          emptyRowFactory={() => ({ label: "", count: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="forestDamage"
          title={economicAgricultureDict.fields.forestDamage}
          columns={forestDamageColumns}
          emptyRowFactory={() => ({ label: "", present: "no" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="livestockFarms"
          title={economicAgricultureDict.fields.livestockFarms}
          columns={livestockFarmColumns}
          emptyRowFactory={() => ({ name: "", address: "", animalType: "", count: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="industries"
          title={economicAgricultureDict.fields.industries}
          columns={industryColumns}
          emptyRowFactory={() => ({ name: "", productType: "", employeeCount: 0, size: "household" })}
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 lang={lang} className={headingClass}>
          {economicAgricultureDict.fields.marineFisheries[lang]}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="marineFisheries.householdCount" label={{ en: "Household Count", si: "ගෘහ ඒකක සංඛ්‍යාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("marineFisheries.householdCount")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="marineFisheries.activeFishermenCount" label={{ en: "Active Fishermen Count", si: "ක්‍රියාකාරී ධීවරයන් සංඛ්‍යාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("marineFisheries.activeFishermenCount")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="marineFisheries.societyCount" label={{ en: "Society Count", si: "සංගම් සංඛ්‍යාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("marineFisheries.societyCount")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 lang={lang} className={headingClass}>
          {economicAgricultureDict.fields.inlandFisheries[lang]}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="inlandFisheries.householdCount" label={{ en: "Household Count", si: "ගෘහ ඒකක සංඛ්‍යාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("inlandFisheries.householdCount")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="inlandFisheries.activeFishermenCount" label={{ en: "Active Fishermen Count", si: "ක්‍රියාකාරී ධීවරයන් සංඛ්‍යාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("inlandFisheries.activeFishermenCount")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="inlandFisheries.societyCount" label={{ en: "Society Count", si: "සංගම් සංඛ්‍යාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("inlandFisheries.societyCount")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="fishLandingSites"
          title={economicAgricultureDict.fields.fishLandingSites}
          columns={fishLandingSiteColumns}
          emptyRowFactory={() => ({ name: "", location: "" })}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper name="saltProductionPresent" label={economicAgricultureDict.fields.saltProductionPresent}>
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("saltProductionPresent") ?? ""}
              onValueChange={(v) => form.setValue("saltProductionPresent", v as "yes" | "no", { shouldDirty: true })}
            >
              <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YES_NO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {lang === "si" ? opt.label.si : opt.label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="saltProductionDirectory"
          title={economicAgricultureDict.fields.saltProductionDirectory}
          columns={saltProductionColumns}
          emptyRowFactory={() => ({ name: "", location: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="teaEstates"
          title={economicAgricultureDict.fields.teaEstates}
          columns={teaEstateColumns}
          emptyRowFactory={() => ({ name: "", extentHectares: 0, ownership: "" })}
        />
      </div>
    </SectionForm>
  );
}
