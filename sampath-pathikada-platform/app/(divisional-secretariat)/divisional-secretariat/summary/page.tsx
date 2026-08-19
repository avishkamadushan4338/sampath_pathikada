"use client";

import { ReviewerSummaryView } from "@/components/review/ReviewerSummaryView";

export default function SummaryPage() {
  return <ReviewerSummaryView awaitingReviewStatus="AD_APPROVED" />;
}
