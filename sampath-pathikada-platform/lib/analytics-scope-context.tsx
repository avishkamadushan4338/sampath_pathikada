"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSession } from "@/hooks/use-session";
import type { AnalyticsScope } from "@/lib/analytics-scope";

const AnalyticsScopeContext = createContext<AnalyticsScope | null | undefined>(undefined);

/** Makes an explicit scope (island/district/DS-division/GN-division) available to every
 *  "My Division Information" view underneath it, without threading a `scope` prop through the 9+
 *  leaf section components that call `useAreaAnalytics()`/`GnScopedSectionView` directly. Only
 *  Super Admin's Data View needs this — DS and AD pages render without a provider and fall back
 *  to their own `session.dsDivision`, exactly as before this feature existed. */
export function AnalyticsScopeProvider({ scope, children }: { scope: AnalyticsScope; children: ReactNode }) {
  return <AnalyticsScopeContext.Provider value={scope}>{children}</AnalyticsScopeContext.Provider>;
}

/** Resolves the active analytics scope: an explicit `AnalyticsScopeProvider` above in the tree
 *  wins; otherwise falls back to the signed-in user's own DS division (DS/AD's normal case).
 *  Returns `null` if neither is available (no provider and no assigned division), which callers
 *  treat as "nothing to show yet" — same as today's `!user?.dsDivision` gate. */
export function useAnalyticsScope(): AnalyticsScope | null {
  const provided = useContext(AnalyticsScopeContext);
  const { user } = useSession();
  if (provided !== undefined) return provided;
  return user?.dsDivision ? { level: "ds", dsDivisionId: user.dsDivision } : null;
}
