"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, useFormContext, type FieldArrayWithId } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper, getErrorAtPath } from "@/components/forms/FormField";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bilingual } from "@/components/Bilingual";
import { dictionary } from "@/lib/i18n/dictionary";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { physicalEnvironmentDict } from "@/lib/i18n/sections/physical-environment";
import { physicalEnvironmentSchemaPartial, HAZARD_TYPES, WATER_SOURCE_TYPES } from "@/lib/validators/sections/physical-environment";
import { cn } from "@/lib/utils";
import { z } from "zod";

const CURRENT_YEAR = 2026;

type PhysicalEnvironmentDraft = z.infer<typeof physicalEnvironmentSchemaPartial>;

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const WATER_SOURCE_TYPE_LABELS: Record<(typeof WATER_SOURCE_TYPES)[number], { en: string; si: string }> = {
  river: { en: "River", si: "ගංගාව" },
  reservoir: { en: "Reservoir", si: "ජලාශය" },
  springs: { en: "Springs", si: "උල්පත්/ බුබුලු" },
  tank: { en: "Tank", si: "වැව" },
  streams: { en: "Streams", si: "දියඇලි" },
  publicWells: { en: "Public Wells (Count)", si: "පොදු ළිං(ගණන)" },
  tubeWells: { en: "Tube Wells (Count)", si: "නල ළිං(ගණන)" },
};

const HAZARD_TYPE_LABELS: Record<(typeof HAZARD_TYPES)[number], { en: string; si: string }> = {
  flood: { en: "Flood", si: "ගංවතුර" },
  drought: { en: "Drought", si: "නියඟය" },
  landslide: { en: "Landslide", si: "නායයාම" },
  deforestation: { en: "Deforestation", si: "වන විනාශය" },
  waterSourceDepletion: { en: "Water Source Depletion", si: "ජල මූලාශ්‍ර සිඳී යාම" },
  unauthorizedLandFilling: { en: "Unauthorized Filling & Construction on Low-Lying Land", si: "අනුමවත් පහත් බිම් ගොඩ කිරීම හා ඉදිකිරීම්" },
  unauthorizedWasteDisposal: { en: "Unauthorized Waste Disposal", si: "කැලිකසළ බැහැර කිරීම(අනුමවත්)" },
  wildElephantConflict: { en: "Wild Elephant Problem", si: "වනඅලි ගැටළුව" },
  coastalErosion: { en: "Coastal Erosion", si: "වෙරළ බාදනය" },
  illegalSandMining: { en: "Illegal Sand Mining / Dumping", si: "අනවසර වැලි ගොඩදැමීම" },
};

function buildEmptyValues(lang: "en" | "si"): PhysicalEnvironmentDraft {
  return {
    waterSources: WATER_SOURCE_TYPES.map((type) => ({
      type,
      typeLabel: WATER_SOURCE_TYPE_LABELS[type][lang],
      name: "",
    })),
    sensitiveZones: [],
    naturalResources: [],
    hazards: HAZARD_TYPES.map((type) => ({
      type,
      typeLabel: HAZARD_TYPE_LABELS[type][lang],
      occurred: "no",
      frequency: "",
      mitigationProposal: "",
    })),
    safeLocationsIdentified: "no",
    safeLocations: [],
    touristSites: [],
    proposedTouristSites: [],
  };
}

function mergeWithSaved(empty: PhysicalEnvironmentDraft, saved: PhysicalEnvironmentDraft, lang: "en" | "si"): PhysicalEnvironmentDraft {
  return {
    ...empty,
    ...saved,
    // Water sources are no longer a fixed 7-row checklist — the officer can add extra rows per
    // category (e.g. a second River), so a saved draft's array may be longer than the seeded
    // template and can't be zipped by index. Trust the saved array's own rows wholesale (falling
    // back to the freshly-seeded 7-category template only when nothing's been saved yet), just
    // refreshing `typeLabel` for the active language since that's display-only, not persisted
    // for translation purposes.
    waterSources: (saved.waterSources?.length ? saved.waterSources : empty.waterSources)?.map((row) => ({
      ...row,
      typeLabel:
        WATER_SOURCE_TYPE_LABELS[row.type as (typeof WATER_SOURCE_TYPES)[number]]?.[lang] ?? (row as Record<string, unknown>).typeLabel,
    })),
    // Environmental problems are no longer a fixed 10-row checklist either — the officer can add
    // extra rows per category (e.g. a second flood incident with a different time period), so a
    // saved draft's array may be longer than the seeded template and can't be zipped by index.
    // Same trust-wholesale approach as waterSources above.
    hazards: (saved.hazards?.length ? saved.hazards : empty.hazards)?.map((row) => ({
      ...row,
      typeLabel: HAZARD_TYPE_LABELS[row.type as (typeof HAZARD_TYPES)[number]]?.[lang] ?? (row as Record<string, unknown>).typeLabel,
    })),
  };
}

const sensitiveZoneColumns: RepeatableColumn[] = [
  { key: "zoneName", label: { en: "Environmentally Sensitive Zone / Location", si: "පාරිසරික වශයෙන් සංවේදී කලාප/ස්ථාන" }, type: "text", required: true },
  { key: "significance", label: { en: "Importance of the Location / Zone", si: "ස්ථානයේ /කලාපයේ වැදගත්කම" }, type: "text", required: true },
  { key: "managingAuthority", label: { en: "Managing Institution", si: "පාලනය කරනු ලබන ආයතනය" }, type: "text", required: true },
];

const naturalResourceColumns: RepeatableColumn[] = [
  { key: "resource", label: { en: "Physical Resource Identified in the Area", si: "ප්‍රදේශයේ හඳුනා ගන්නා ලද භෞතික සම්පත්" }, type: "text", required: true },
  {
    key: "utilizedForProduction",
    label: { en: "Used for Production / Development? (Yes/No)", si: "නිෂ්පාදනය කටයුත්තකට, සංවර්ධනයට යොදාගෙන තිබේද (ඇත/නැත)" },
    type: "select",
    options: YES_NO_OPTIONS,
    required: true,
  },
  { key: "notes", label: { en: "Notes", si: "සටහන්" }, type: "text" },
];

const safeLocationColumns: RepeatableColumn[] = [
  { key: "name", label: { en: "Name of the Safe Location", si: "ආරක්ෂිත ස්ථානයේ නම" }, type: "text", required: true },
  { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text", required: true },
];

const touristSiteColumns: RepeatableColumn[] = [
  { key: "siteName", label: { en: "Name of Location with Tourist Attraction", si: "සංචාරක ආකර්ෂණය සහිත ස්ථානය නම" }, type: "text", required: true },
  {
    key: "reasonForAttraction",
    label: { en: "Reason for Attraction / Specialty of the Location", si: "සංචාරක ආකර්ෂණය ඇතිවීමට හේතුව/ස්ථානයේ විශේෂත්වය" },
    type: "text",
    required: true,
  },
  { key: "maintainedBy", label: { en: "Managing Institution / Ownership", si: "පාලනය කරනු ලබන ආයතනය / අයිතිය" }, type: "text", required: true },
  {
    key: "frequency",
    label: { en: "* Tourist Visitation", si: "*සංචාරකයන්ගේ පැමිණීම" },
    type: "select",
    options: [
      { value: "seasonal", label: { en: "Seasonal / Periodic", si: "කාලීන" } },
      { value: "year-round", label: { en: "Year-round", si: "වර්ෂය පුරා" } },
    ],
  },
];

const proposedTouristSiteColumns: RepeatableColumn[] = [
  { key: "siteName", label: { en: "Name of Proposed Suitable Location", si: "සංචාරක ආකර්ෂණය ඇතිකිරීමට සුදුසු යෝජිත ස්ථානයේ නම" }, type: "text", required: true },
  { key: "specialFeatures", label: { en: "Specialty of the Proposed Location", si: "සංචාරක ආකර්ෂණය ඇතිකිරීමට යෝජිත ස්ථානයේ විශේෂත්වය" }, type: "text", required: true },
  {
    key: "possibleActivities",
    label: { en: "Activities Possible at the Location", si: "සංචාරක ආකර්ෂණය ඇතිකිරීමට එම ස්ථානයේ සිදුකිරීමට හැකි ක්‍රියාකාරකම්" },
    type: "text",
  },
  { key: "currentAuthority", label: { en: "* Institution Currently Managing / Ownership", si: "*දැනට පාලනය කරනු ලබන ආයතනය / අයිතිය" }, type: "text" },
];

export default function PhysicalEnvironmentPage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const emptyValues = useMemo(() => buildEmptyValues(lang), [lang]);

  const form = useForm<PhysicalEnvironmentDraft>({
    resolver: zodResolver(physicalEnvironmentSchemaPartial),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (submission?.data.physicalEnvironment) {
      form.reset(mergeWithSaved(emptyValues, submission.data.physicalEnvironment, lang));
    } else {
      form.reset(emptyValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission, emptyValues]);

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
      sectionNumber={3}
      title={physicalEnvironmentDict.title}
      description={physicalEnvironmentDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div>
        <WaterSourcesTable lang={lang} title={physicalEnvironmentDict.fields.waterSources} />
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
          emptyRowFactory={() => ({ resource: "", utilizedForProduction: "no", notes: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <HazardsTable lang={lang} title={physicalEnvironmentDict.fields.hazards} />
      </div>

      <div className="border-t border-border pt-6">
        <div className="mb-3 max-w-xs">
          <FieldWrapper
            name="safeLocationsIdentified"
            label={physicalEnvironmentDict.fields.safeLocationsIdentified}
            required
          >
            {({ id, describedBy, invalid }) => (
              <Select
                value={form.watch("safeLocationsIdentified") ?? "no"}
                onValueChange={(v) => form.setValue("safeLocationsIdentified", v as "yes" | "no", { shouldDirty: true })}
              >
                <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {lang === "si" ? o.label.si : o.label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FieldWrapper>
        </div>
        {form.watch("safeLocationsIdentified") === "yes" ? (
          <RepeatableTable
            name="safeLocations"
            title={physicalEnvironmentDict.fields.safeLocations}
            columns={safeLocationColumns}
            emptyRowFactory={() => ({ name: "", address: "" })}
          />
        ) : (
          <p lang={lang} className={cn("text-fluid-sm text-muted-foreground", lang === "si" && "font-si")}>
            <Bilingual
              en="Set “Identified Safe Location Exists?” to Yes to add safe locations / evacuation centers."
              si="ආරක්ෂිත ස්ථාන / සුරක්ෂිත මධ්‍යස්ථාන ඇතුළත් කිරීමට “හඳුනාගත් ආරක්ෂිත ස්ථාන ඇත/නැත” යන්න ඔව් ලෙස සකසන්න."
            />
          </p>
        )}
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

type WaterSourceRow = { type: (typeof WATER_SOURCE_TYPES)[number]; typeLabel: string; name?: string };

/** Water sources are a fixed 7-category checklist (river, reservoir, ...), but a GN division can
 *  have more than one of a given category (e.g. two rivers) — unlike every other RepeatableTable
 *  in this app, "add a row" here means "add another row for THIS category", inserted right after
 *  it, not an unrelated blank row appended at the end. The first row of each category is the
 *  checklist anchor and can't be removed (every category must stay represented); rows added via
 *  "+" are extras and can be deleted again. This per-category insert/anchor behavior is specific
 *  enough to this one table that it isn't worth generalizing into the shared RepeatableTable. */
function WaterSourcesTable({ lang, title }: { lang: "en" | "si"; title: Parameters<typeof RepeatableTable>[0]["title"] }) {
  const { control, register } = useFormContext<PhysicalEnvironmentDraft>();
  const { fields, insert, remove } = useFieldArray({ control, name: "waterSources" });
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  const seenTypes = new Set<string>();
  const isAnchor = fields.map((field) => {
    const row = field as FieldArrayWithId<PhysicalEnvironmentDraft, "waterSources"> & WaterSourceRow;
    const first = !seenTypes.has(row.type);
    seenTypes.add(row.type);
    return first;
  });

  function addAnother(index: number) {
    const row = fields[index] as FieldArrayWithId<PhysicalEnvironmentDraft, "waterSources"> & WaterSourceRow;
    // `typeLabel` is a display-only field seeded by buildEmptyValues/mergeWithSaved — it isn't
    // part of the Zod-inferred type useFieldArray expects, same as elsewhere in this codebase
    // (e.g. RepeatableTable's own `append(emptyRowFactory() as never)`).
    insert(index + 1, { type: row.type, typeLabel: row.typeLabel, name: "" } as never);
  }

  function requestRemove(index: number) {
    const row = fields[index] as FieldArrayWithId<PhysicalEnvironmentDraft, "waterSources"> & WaterSourceRow;
    if (row.name) setPendingDeleteIndex(index);
    else remove(index);
  }

  return (
    <div className="flex flex-col gap-3">
      {title && (
        <h2 lang={lang} className={cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? title.si : title.en}
        </h2>
      )}
      <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
        {fields.map((field, index) => {
          const row = field as FieldArrayWithId<PhysicalEnvironmentDraft, "waterSources"> & WaterSourceRow;
          return (
            <div key={field.id} className="flex items-center gap-3">
              <span lang={lang} className={cn("w-40 shrink-0 text-fluid-sm text-muted-foreground", lang === "si" && "font-si")}>
                {row.typeLabel}
              </span>
              <Input className="flex-1" placeholder={dictionary.name?.[lang]} {...register(`waterSources.${index}.name`)} />
              {isAnchor[index] ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="touch-target shrink-0"
                  onClick={() => addAnother(index)}
                  aria-label={dictionary.add[lang]}
                >
                  <Plus className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="touch-target shrink-0 text-destructive hover:text-destructive"
                  onClick={() => requestRemove(index)}
                  aria-label={dictionary.delete[lang]}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <AlertDialog open={pendingDeleteIndex !== null} onOpenChange={(open) => !open && setPendingDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Bilingual {...dictionary.deleteConfirm} />
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Bilingual {...dictionary.cancel} />
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDeleteIndex !== null) remove(pendingDeleteIndex);
                setPendingDeleteIndex(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Bilingual {...dictionary.delete} />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type HazardRow = {
  type: (typeof HAZARD_TYPES)[number];
  typeLabel: string;
  occurred: "yes" | "no";
  frequency?: string;
  mitigationProposal?: string;
};

/** Environmental problems are a fixed 10-category checklist, but the same problem can occur more
 *  than once with a different time period and remedy (e.g. a monsoon flood and a separate flash
 *  flood) — same per-category insert/anchor pattern as WaterSourcesTable above. The "Occurred?"
 *  select lives only on each category's anchor row (extras are only ever created once that's
 *  already "yes", so they don't need their own copy of the question), and the time-period /
 *  remedial-measure inputs plus "+" only appear while occurred is "yes". */
function HazardsTable({ lang, title }: { lang: "en" | "si"; title: Parameters<typeof RepeatableTable>[0]["title"] }) {
  const { control, register, watch, setValue, formState } = useFormContext<PhysicalEnvironmentDraft>();
  const { fields, insert, remove } = useFieldArray({ control, name: "hazards" });
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  const seenTypes = new Set<string>();
  const isAnchor = fields.map((field) => {
    const row = field as FieldArrayWithId<PhysicalEnvironmentDraft, "hazards"> & HazardRow;
    const first = !seenTypes.has(row.type);
    seenTypes.add(row.type);
    return first;
  });

  function addAnother(index: number) {
    const row = fields[index] as FieldArrayWithId<PhysicalEnvironmentDraft, "hazards"> & HazardRow;
    insert(index + 1, { type: row.type, typeLabel: row.typeLabel, occurred: "yes", frequency: "", mitigationProposal: "" } as never);
  }

  function requestRemove(index: number) {
    const row = fields[index] as FieldArrayWithId<PhysicalEnvironmentDraft, "hazards"> & HazardRow;
    if (row.frequency || row.mitigationProposal) setPendingDeleteIndex(index);
    else remove(index);
  }

  return (
    <div className="flex flex-col gap-3">
      {title && (
        <h2 lang={lang} className={cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? title.si : title.en}
        </h2>
      )}
      <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
        {fields.map((field, index) => {
          const row = field as FieldArrayWithId<PhysicalEnvironmentDraft, "hazards"> & HazardRow;
          const occurred = watch(`hazards.${index}.occurred`) ?? "no";
          const showDetails = isAnchor[index] ? occurred === "yes" : true;
          const frequencyError = getErrorAtPath(formState.errors as Record<string, unknown>, `hazards.${index}.frequency`);
          const mitigationError = getErrorAtPath(formState.errors as Record<string, unknown>, `hazards.${index}.mitigationProposal`);
          return (
            <div key={field.id} className="flex flex-col gap-2 border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-3">
                <span lang={lang} className={cn("w-56 shrink-0 text-fluid-sm font-medium text-foreground", lang === "si" && "font-si")}>
                  {isAnchor[index] ? row.typeLabel : ""}
                </span>
                {isAnchor[index] ? (
                  <Select
                    value={occurred}
                    onValueChange={(v) => setValue(`hazards.${index}.occurred`, v as "yes" | "no", { shouldDirty: true })}
                  >
                    <SelectTrigger className="w-32 shrink-0" aria-label={`${row.typeLabel} — ${lang === "si" ? "ඇත/නැත" : "Occurred?"}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {lang === "si" ? o.label.si : o.label.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="touch-target shrink-0 text-destructive hover:text-destructive"
                    onClick={() => requestRemove(index)}
                    aria-label={dictionary.delete[lang]}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
              {showDetails && (
                <div className="flex flex-wrap items-start gap-3 pl-0 sm:pl-62">
                  <div className="flex min-w-48 flex-1 flex-col gap-1">
                    <span lang={lang} className={cn("text-fluid-xs text-muted-foreground", lang === "si" && "font-si")}>
                      <Bilingual en="If Yes, the Common Time Period" si="ඇත්නම් බහුලව සිදුවන කාල සීමාව" />
                    </span>
                    <Input aria-invalid={!!frequencyError} {...register(`hazards.${index}.frequency`)} />
                    {frequencyError?.message && <p className="text-fluid-xs text-destructive">{String(frequencyError.message)}</p>}
                  </div>
                  <div className="flex min-w-48 flex-1 flex-col gap-1">
                    <span lang={lang} className={cn("text-fluid-xs text-muted-foreground", lang === "si" && "font-si")}>
                      <Bilingual en="Proposed Remedial Measures for the Problem" si="ගැටළුව සඳහා ගතයුතු පිළියම් යෝජනා" />
                    </span>
                    <Input aria-invalid={!!mitigationError} {...register(`hazards.${index}.mitigationProposal`)} />
                    {mitigationError?.message && <p className="text-fluid-xs text-destructive">{String(mitigationError.message)}</p>}
                  </div>
                  {isAnchor[index] && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="touch-target mt-5 shrink-0"
                      onClick={() => addAnother(index)}
                      aria-label={dictionary.add[lang]}
                    >
                      <Plus className="size-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AlertDialog open={pendingDeleteIndex !== null} onOpenChange={(open) => !open && setPendingDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Bilingual {...dictionary.deleteConfirm} />
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Bilingual {...dictionary.cancel} />
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDeleteIndex !== null) remove(pendingDeleteIndex);
                setPendingDeleteIndex(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Bilingual {...dictionary.delete} />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
