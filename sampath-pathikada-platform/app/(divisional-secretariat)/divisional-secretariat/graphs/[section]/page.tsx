"use client";

import { use } from "react";
import { DivisionSectionDetailView } from "@/components/review/DivisionSectionDetailView";

export default function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params);
  return <DivisionSectionDetailView section={section} basePath="/divisional-secretariat" />;
}
