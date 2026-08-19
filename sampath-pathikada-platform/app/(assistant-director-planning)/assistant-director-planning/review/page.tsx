"use client";

import { ReviewQueueView, type StatusFilterOption } from "@/components/review/ReviewQueueView";
import { STATUS_LABEL } from "@/lib/status-ui";

const AD_STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: "SUBMITTED", label: STATUS_LABEL.SUBMITTED },
  { value: "REVISION_NEEDED", label: STATUS_LABEL.REVISION_NEEDED },
  { value: "all", label: { en: "All statuses", si: "සියලුම තත්ත්ව" } },
];

export default function ReviewQueuePage() {
  return (
    <ReviewQueueView
      basePath="/assistant-director-planning"
      defaultStatusFilter="SUBMITTED"
      statusFilterOptions={AD_STATUS_FILTER_OPTIONS}
    />
  );
}
