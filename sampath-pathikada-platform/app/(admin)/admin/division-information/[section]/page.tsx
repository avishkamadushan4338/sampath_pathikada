"use client";

import { use, type ComponentType } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { Button } from "@/components/ui/button";
import { CURRENT_YEAR } from "@/lib/constants";
import { SECTION_KEYS, SECTION_ROUTES, type SectionKey } from "@/lib/types/submission";
import { SECTION_META } from "@/lib/i18n/section-meta";
import { SectionDetailViewer } from "@/components/review/SectionDetailViewer";
import { StateInstitutionsLandView } from "@/components/analytics/StateInstitutionsLandView";
import { PhysicalEnvironmentView } from "@/components/analytics/PhysicalEnvironmentView";
import { DemographicsView } from "@/components/analytics/DemographicsView";
import { HousingView } from "@/components/analytics/HousingView";
import { EducationView } from "@/components/analytics/EducationView";
import { ReligiousCulturalView } from "@/components/analytics/ReligiousCulturalView";
import { HealthView } from "@/components/analytics/HealthView";
import { EconomicAgricultureView } from "@/components/analytics/EconomicAgricultureView";
import { RoadInfrastructureView } from "@/components/analytics/RoadInfrastructureView";
import { IdentificationDirectoryView } from "@/components/analytics/IdentificationDirectoryView";
import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";

// These 10 sections have their own self-contained view component. Identification is always a
// whole-division administrative directory (registered EDOs + their jurisdictional areas), never
// scoped to one GN division — the same table the DS's own graphs page shows. The other 9 have a
// GN division picker plus a whole-division rollup fallback, all built in. The remaining 5
// (employment, socialWelfare, communityOrganizations, tourism, wasteDisaster) don't have that
// yet, so they fall back to the generic GN-scoped detail viewer below.
const RICH_SECTION_VIEWS: Partial<Record<SectionKey, ComponentType>> = {
  identification: IdentificationDirectoryView,
  stateInstitutionsLand: StateInstitutionsLandView,
  physicalEnvironment: PhysicalEnvironmentView,
  demographics: DemographicsView,
  housing: HousingView,
  education: EducationView,
  religiousCultural: ReligiousCulturalView,
  health: HealthView,
  economicAgriculture: EconomicAgricultureView,
  roadInfrastructure: RoadInfrastructureView,
};

const ROUTE_TO_SECTION_KEY = new Map<string, SectionKey>(SECTION_KEYS.map((key) => [SECTION_ROUTES[key], key]));

/** Generic per-section page for the 6 sections without a dedicated rich view yet: a GN division
 *  search/picker (the same shared control every rich view uses) and that division's raw approved
 *  section data — no whole-division rollup available for these, so a division must be picked. */
function BasicSectionView({ sectionKey }: { sectionKey: SectionKey }) {
  const { lang } = useLanguage();
  return (
    <GnScopedSectionView
      prompt={{
        en: `Search or select a GN division above to view its ${SECTION_META[sectionKey].title.en} data.`,
        si: `එහි ${SECTION_META[sectionKey].title.si} දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.`,
      }}
    >
      {(profile) => (
        <>
          <p className="mb-4 text-[12px] text-muted-foreground">
            {lang === "si" ? "අනුමත වර්ෂය" : "Approved year"}: {profile.year} · {lang === "si" ? "අනුමත දිනය" : "Approved on"}:{" "}
            {new Date(profile.approvedAt).toLocaleDateString(lang === "si" ? "si-LK" : "en-LK", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          <SectionDetailViewer sectionKey={sectionKey} data={profile.data[sectionKey] as Record<string, unknown> | undefined} />
        </>
      )}
    </GnScopedSectionView>
  );
}

export default function AdminDivisionInformationSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params);
  const { lang } = useLanguage();
  const sectionKey = ROUTE_TO_SECTION_KEY.get(section);

  if (!sectionKey) notFound();

  const meta = SECTION_META[sectionKey];
  const RichView = RICH_SECTION_VIEWS[sectionKey];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-fluid-3xl font-semibold text-primary">
            <Bilingual en={meta.title.en} si={meta.title.si} />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="h-11">
            {/* ADMIN has no AnalyticsScope picker — their dsDivision is fixed, and
                GET /api/export/csv/section infers it server-side from the session
                for this role, so only section+year need to be passed here. */}
            <a
              href={`/api/export/csv/section?section=${encodeURIComponent(section)}&year=${CURRENT_YEAR}`}
              download
              className="flex items-center gap-2"
            >
              <Download className="size-4" />
              <Bilingual en="Download CSV" si="CSV බාගන්න" />
            </a>
          </Button>
          <Button asChild variant="outline" className="h-11">
            <Link href="/admin/division-information" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              <Bilingual en="Back to Division Information" si="වසම් තොරතුරු වෙත ආපසු" />
            </Link>
          </Button>
        </div>
      </div>

      {RichView ? <RichView /> : <BasicSectionView sectionKey={sectionKey} />}
    </div>
  );
}
