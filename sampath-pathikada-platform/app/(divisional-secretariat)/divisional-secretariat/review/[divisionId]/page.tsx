"use client";

import { use } from "react";
import { ReviewDetailView } from "@/components/review/ReviewDetailView";

export default function ReviewDetailPage({ params }: { params: Promise<{ divisionId: string }> }) {
  const { divisionId } = use(params);
  return (
    <ReviewDetailView
      divisionId={divisionId}
      basePath="/divisional-secretariat"
      terminalStatuses={["APPROVED", "REJECTED"]}
    />
  );
}
