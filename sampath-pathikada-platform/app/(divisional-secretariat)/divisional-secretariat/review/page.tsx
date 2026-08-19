"use client";

import { ReviewQueueView, type StatusFilterOption } from "@/components/review/ReviewQueueView";
import { STATUS_LABEL } from "@/lib/status-ui";

const DS_STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: "AD_APPROVED", label: STATUS_LABEL.AD_APPROVED },
  { value: "REVISION_NEEDED", label: STATUS_LABEL.REVISION_NEEDED },
  { value: "APPROVED", label: STATUS_LABEL.APPROVED },
  { value: "REJECTED", label: STATUS_LABEL.REJECTED },
  { value: "all", label: { en: "All statuses", si: "සියලුම තත්ත්ව" } },
];

export default function ReviewQueuePage() {
  return (
    <ReviewQueueView
      basePath="/divisional-secretariat"
      defaultStatusFilter="AD_APPROVED"
      statusFilterOptions={DS_STATUS_FILTER_OPTIONS}
    />
  );
}
