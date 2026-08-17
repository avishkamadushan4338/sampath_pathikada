"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { tourismDict } from "@/lib/i18n/sections/tourism";
import { tourismSchemaPartial, GUEST_ACCOMMODATION_TYPES, HOTEL_CATEGORIES } from "@/lib/validators/sections/tourism";
import { z } from "zod";

const CURRENT_YEAR = 2026;

type TourismDraft = z.infer<typeof tourismSchemaPartial>;

const GUEST_ACCOMMODATION_TYPE_LABELS: Record<(typeof GUEST_ACCOMMODATION_TYPES)[number], { en: string; si: string }> = {
  guesthouse: { en: "Guest House", si: "ගෙස්ට් හවුස්" },
  villa: { en: "Villa", si: "විලා" },
  homestay: { en: "Homestay", si: "හෝම්ස්ටේ" },
};

const HOTEL_CATEGORY_LABELS: Record<(typeof HOTEL_CATEGORIES)[number], { en: string; si: string }> = {
  "star-graded": { en: "Number of Star-Graded Hotels", si: "තරු පන්තියේ හෝටල් සංඛ්‍යාව" },
  "non-star-graded": { en: "Number of Non-Star-Graded Hotels", si: "තරු පන්තියේ නොවන හෝටල් සංඛ්‍යාව" },
  "guest-houses": { en: "Number of Guest Houses", si: "ගෙස්ට් හවුස් සංඛ්‍යාව" },
  "villa-homestay": { en: "Villas / Home Stay", si: "විලාස්/home stay" },
  "conference-centers": { en: "Massage Centers", si: "සම්භාහන මධ්‍යස්ථාන" },
};

function buildEmptyValues(lang: "en" | "si"): TourismDraft {
  return {
    hotelInventory: HOTEL_CATEGORIES.map((category) => ({
      category,
      categoryLabel: HOTEL_CATEGORY_LABELS[category][lang],
      hotelCount: 0,
      roomCount: 0,
    })),
    guestAccommodations: [],
    otherAccommodations: [],
  };
}

function mergeWithSaved(empty: TourismDraft, saved: TourismDraft): TourismDraft {
  const savedByCategory = new Map((saved.hotelInventory ?? []).filter((r) => r?.category).map((r) => [r!.category, r]));

  return {
    ...empty,
    ...saved,
    hotelInventory: empty.hotelInventory?.map((row) => ({ ...row, ...savedByCategory.get(row.category) })),
  };
}

export default function TourismPage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const emptyValues = useMemo(() => buildEmptyValues(lang), [lang]);

  const form = useForm<TourismDraft>({
    resolver: zodResolver(tourismSchemaPartial),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (submission?.data.tourism) {
      form.reset(mergeWithSaved(emptyValues, submission.data.tourism));
    } else {
      form.reset(emptyValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission, emptyValues]);

  async function handleSave(values: TourismDraft) {
    await saveSection("tourism", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const hotelInventoryColumns: RepeatableColumn[] = [
    { key: "categoryLabel", label: { en: "Hotel Category", si: "හෝටල් වර්ග" }, type: "readonly" },
    { key: "hotelCount", label: { en: "Number of Hotels", si: "හෝටල් සංඛ්‍යාව" }, type: "number", required: true },
    {
      key: "roomCount",
      label: { en: "Rooms Providing Residential Facilities", si: "නේවාසික පහසුකම් ලබාදෙන කාමර ගණන" },
      type: "number",
      required: true,
    },
  ];

  const guestAccommodationColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text", required: true },
    {
      key: "type",
      label: { en: "Type", si: "වර්ගය" },
      type: "select",
      options: GUEST_ACCOMMODATION_TYPES.map((t) => ({ value: t, label: GUEST_ACCOMMODATION_TYPE_LABELS[t] })),
      required: true,
    },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text", required: true },
    { key: "roomCount", label: { en: "Number of Rooms", si: "කාමර සංඛ්‍යාව" }, type: "number" },
  ];

  const otherAccommodationColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text", required: true },
    { key: "type", label: { en: "Type", si: "වර්ගය" }, type: "text", required: true },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text", required: true },
  ];

  return (
    <SectionForm
      sectionNumber={14}
      title={tourismDict.title}
      description={tourismDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
      submission={submission}
      sectionKey="tourism"
    >
      <div className="border-t border-border pt-6 first:border-0 first:pt-0">
        <RepeatableTable
          name="hotelInventory"
          title={tourismDict.fields.hotelInventory}
          columns={hotelInventoryColumns}
          fixedRows
          emptyRowFactory={() => ({
            category: HOTEL_CATEGORIES[0],
            categoryLabel: HOTEL_CATEGORY_LABELS[HOTEL_CATEGORIES[0]][lang],
            hotelCount: 0,
            roomCount: 0,
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="guestAccommodations"
          title={tourismDict.fields.guestAccommodations}
          columns={guestAccommodationColumns}
          emptyRowFactory={() => ({ name: "", type: "guesthouse", address: "", roomCount: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="otherAccommodations"
          title={tourismDict.fields.otherAccommodations}
          columns={otherAccommodationColumns}
          emptyRowFactory={() => ({ name: "", type: "", address: "" })}
        />
      </div>
    </SectionForm>
  );
}
