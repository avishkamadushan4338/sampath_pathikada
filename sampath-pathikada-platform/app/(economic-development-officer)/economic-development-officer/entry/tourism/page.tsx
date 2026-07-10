"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { tourismDict } from "@/lib/i18n/sections/tourism";
import { tourismSchemaPartial, GUEST_ACCOMMODATION_TYPES } from "@/lib/validators/sections/tourism";
import { z } from "zod";

const CURRENT_YEAR = 2026;

type TourismDraft = z.infer<typeof tourismSchemaPartial>;

const EMPTY_VALUES: TourismDraft = {
  hotelInventory: [],
  guestAccommodations: [],
  otherAccommodations: [],
};

const STAR_GRADE_OPTIONS = [
  { value: "1-star", label: { en: "1 Star", si: "තරු 1" } },
  { value: "2-star", label: { en: "2 Star", si: "තරු 2" } },
  { value: "3-star", label: { en: "3 Star", si: "තරු 3" } },
  { value: "4-star", label: { en: "4 Star", si: "තරු 4" } },
  { value: "5-star", label: { en: "5 Star", si: "තරු 5" } },
  { value: "unclassified", label: { en: "Unclassified", si: "වර්ගීකරණය නොකළ" } },
];

const GUEST_ACCOMMODATION_TYPE_LABELS: Record<(typeof GUEST_ACCOMMODATION_TYPES)[number], { en: string; si: string }> = {
  guesthouse: { en: "Guest House", si: "ගෙස්ට් හවුස්" },
  villa: { en: "Villa", si: "විලා" },
  homestay: { en: "Homestay", si: "හෝම්ස්ටේ" },
};

export default function TourismPage() {
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const form = useForm<TourismDraft>({
    resolver: zodResolver(tourismSchemaPartial),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (submission?.data.tourism) {
      form.reset({ ...EMPTY_VALUES, ...submission.data.tourism });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

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
    {
      key: "starGrade",
      label: { en: "Star Grade", si: "තරු ශ්‍රේණිය" },
      type: "select",
      options: STAR_GRADE_OPTIONS,
    },
    { key: "hotelCount", label: { en: "Number of Hotels", si: "හෝටල් සංඛ්‍යාව" }, type: "number" },
    { key: "roomCount", label: { en: "Number of Rooms", si: "කාමර සංඛ්‍යාව" }, type: "number" },
  ];

  const guestAccommodationColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    {
      key: "type",
      label: { en: "Type", si: "වර්ගය" },
      type: "select",
      options: GUEST_ACCOMMODATION_TYPES.map((t) => ({ value: t, label: GUEST_ACCOMMODATION_TYPE_LABELS[t] })),
    },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    { key: "roomCount", label: { en: "Number of Rooms", si: "කාමර සංඛ්‍යාව" }, type: "number" },
  ];

  const otherAccommodationColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "type", label: { en: "Type", si: "වර්ගය" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
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
    >
      <div className="border-t border-border pt-6 first:border-0 first:pt-0">
        <RepeatableTable
          name="hotelInventory"
          title={tourismDict.fields.hotelInventory}
          columns={hotelInventoryColumns}
          emptyRowFactory={() => ({ starGrade: "", hotelCount: 0, roomCount: 0 })}
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
