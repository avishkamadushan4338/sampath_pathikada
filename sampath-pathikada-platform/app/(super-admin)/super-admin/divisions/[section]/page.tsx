"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { AnalyticsScopeProvider } from "@/lib/analytics-scope-context";
import { scopeFromSearchParams } from "@/lib/analytics-scope-url";
import { DivisionSectionDetailView } from "@/components/review/DivisionSectionDetailView";

export default function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params);
  const searchParams = useSearchParams();
  const scope = scopeFromSearchParams(searchParams);

  return (
    <AnalyticsScopeProvider scope={scope}>
      <DivisionSectionDetailView section={section} basePath="/super-admin/divisions" />
    </AnalyticsScopeProvider>
  );
}
