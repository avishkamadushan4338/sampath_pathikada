"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Download } from "lucide-react";
import { useDivisionProfile, type DivisionProfileResult } from "@/hooks/use-division-profile";
import { GnDivisionCombobox } from "@/components/analytics/GnDivisionCombobox";
import { Bilingual } from "@/components/Bilingual";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsScope } from "@/lib/analytics-scope-context";
import { scopeToGnRoster } from "@/lib/analytics-scope";
import type { Translated } from "@/lib/i18n/types";

interface GnScopedSectionViewProps {
  /** Shown in the empty state before a GN division is picked — describe what this section holds.
   *  Ignored when `unselectedContent` is provided. */
  prompt: Translated;
  /** Rendered instead of the default `prompt` card while no GN division is selected — e.g. a
   *  whole-division (all GN divisions) aggregate view, so the DS sees area-wide data by default. */
  unselectedContent?: ReactNode;
  children: (profile: DivisionProfileResult) => ReactNode;
}

/** Shared shell for every GN-division-scoped "My Division Information" section page: a DS
 *  searches/selects a GN division from their own roster, and once its latest approved record
 *  (DivisionProfile) loads, `children` renders that section's tables. Centralizes the
 *  roster scoping and the not-selected/loading/error/no-approved-record states so each section
 *  view only has to define its own tables. */
export function GnScopedSectionView({ prompt, unselectedContent, children }: GnScopedSectionViewProps) {
  const scope = useAnalyticsScope();
  const [gnDivision, setGnDivision] = useState<string | null>(null);
  const { profile, isLoading, isError } = useDivisionProfile(gnDivision);

  const roster = useMemo(() => (scope ? scopeToGnRoster(scope) : []), [scope]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <GnDivisionCombobox divisions={roster} value={gnDivision} onChange={setGnDivision} />
        {profile && (
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <a href={`/api/division-profile/csv?gnDivision=${encodeURIComponent(profile.gnDivision)}`} download>
              <Download className="size-4" aria-hidden="true" />
              <Bilingual en="Download CSV" si="CSV බාගන්න" />
            </a>
          </Button>
        )}
      </div>

      {!gnDivision ? (
        unselectedContent ?? (
          <Card>
            <CardContent className="text-fluid-sm text-muted-foreground">
              <Bilingual en={prompt.en} si={prompt.si} />
            </CardContent>
          </Card>
        )
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="text-fluid-sm text-muted-foreground">
            <Bilingual
              en="Unable to load this division's data right now. Please try again shortly."
              si="මෙම වසමේ දත්ත මෙම මොහොතේ පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
            />
          </CardContent>
        </Card>
      ) : !profile ? (
        <Card>
          <CardContent className="text-fluid-sm text-muted-foreground">
            <Bilingual
              en="This GN division has no approved submission yet, so no data is available."
              si="මෙම ග්‍රාම නිලධාරී වසම සඳහා තවම අනුමත ඉදිරිපත් කිරීමක් නොමැති බැවින් දත්ත නොමැත."
            />
          </CardContent>
        </Card>
      ) : (
        children(profile)
      )}
    </div>
  );
}
