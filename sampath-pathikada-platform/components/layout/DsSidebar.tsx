"use client";

import { ReviewerSidebar } from "@/components/layout/ReviewerSidebar";

export function DsSidebar() {
  return (
    <ReviewerSidebar
      basePath="/divisional-secretariat"
      ariaLabel="Divisional Secretariat navigation"
      pendingBadgeQuery="/api/submissions?status=AD_APPROVED&limit=1"
    />
  );
}
