"use client";

import { ReviewerSidebar } from "@/components/layout/ReviewerSidebar";

export function AdSidebar() {
  return (
    <ReviewerSidebar
      basePath="/assistant-director-planning"
      ariaLabel="Assistant Director Planning navigation"
      pendingBadgeQuery="/api/submissions?status=SUBMITTED&limit=1"
    />
  );
}
