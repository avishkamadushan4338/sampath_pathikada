"use client";

import { Bilingual } from "@/components/Bilingual";
import {
  AnalyticsTableWrapper,
  GnDivisionFilterSelect,
} from "@/components/analytics/AnalyticsSectionShells";

interface GnOption {
  id: string;
  en: string;
  si: string;
}

interface ReligiousCounts {
  temples: { count: number; clergyCount: number };
  meheniArama: { count: number; clergyCount: number };
  mosques: { count: number; clergyCount: number };
  churches: { count: number; priestsCount: number; nunsCount: number };
  kovils: { count: number; clergyCount: number };
}

interface ReligiousHeritageRow {
  gnId: string;
  name?: string;
  type?: string;
  significance?: string;
  usedForDhammaOrGovtPurpose?: string;
  taskDescription?: string;
}

interface ReligiousArtAcademyRow {
  gnId: string;
  name?: string;
  registrationNumber?: string;
  studentCount?: number;
}

interface ReligiousTraditionalArtistRow {
  gnId: string;
  name?: string;
  artForm?: string;
  description?: string;
}

interface ReligiousCulturalSectionViewProps {
  lang: string;
  religiousGnDivision: string;
  onReligiousGnDivisionChange: (value: string) => void;
  employmentGnOptions: GnOption[];
  analyticsError: unknown;
  hasAnalytics: boolean;
  religiousSiteCounts: ReligiousCounts | undefined;
  religiousHeritageRows: ReligiousHeritageRow[];
  religiousArtAcademyRows: ReligiousArtAcademyRow[];
  religiousTraditionalArtistRows: ReligiousTraditionalArtistRow[];
}

export function ReligiousCulturalSectionView({
  lang,
  religiousGnDivision,
  onReligiousGnDivisionChange,
  employmentGnOptions,
  analyticsError,
  hasAnalytics,
  religiousSiteCounts,
  religiousHeritageRows,
  religiousArtAcademyRows,
  religiousTraditionalArtistRows,
}: ReligiousCulturalSectionViewProps) {
  return (
    <div className="space-y-4">
      <GnDivisionFilterSelect
        lang={lang}
        value={religiousGnDivision}
        onValueChange={onReligiousGnDivisionChange}
        options={employmentGnOptions}
      />

      {analyticsError ? (
        <div className="text-sm text-destructive">Unable to load religious and cultural data.</div>
      ) : !hasAnalytics || !religiousSiteCounts ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <>
          <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual
              en="Total Number of Religious Places"
              si="ආගමික ස්ථාන මුළු සංඛ්‍යාව"
            />
          </h3>

          <AnalyticsTableWrapper horizontalScroll>
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="border-r border-border px-3 py-3" rowSpan={2}>Indicator</th>
                    <th className="border-r border-border px-3 py-3">Buddhist Temples / Hermitages / Monasteries / Asapu</th>
                    <th className="border-r border-border px-3 py-3">Nunneries / Meheni Arama</th>
                    <th className="border-r border-border px-3 py-3">Mosques</th>
                    <th className="border-r border-l border-border px-3 py-3 text-center" colSpan={2}>Catholic Churches</th>
                    <th className="px-3 py-3">Hindu Kovils / Temples</th>
                  </tr>
                  <tr>
                    <th className="border-t border-r border-border px-3 py-3 text-center font-semibold">Buddhist Monks</th>
                    <th className="border-t border-r border-border px-3 py-3 text-center font-semibold">Buddhist Nuns</th>
                    <th className="border-t border-r border-border px-3 py-3 text-center font-semibold">Mawlawis</th>
                    <th className="border-t border-r border-l border-border px-3 py-3 text-center font-semibold">Priests</th>
                    <th className="border-t border-r border-border px-3 py-3 text-center font-semibold">Nuns / Sisters</th>
                    <th className="border-t border-border px-3 py-3 text-center font-semibold">Priests / Poojaris</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="border-r border-border px-3 py-3 font-medium">Number of Religious Places</td>
                    <td className="border-r border-border px-3 py-3 nums-tabular">{religiousSiteCounts.temples.count.toLocaleString()}</td>
                    <td className="border-r border-border px-3 py-3 nums-tabular">{religiousSiteCounts.meheniArama.count.toLocaleString()}</td>
                    <td className="border-r border-border px-3 py-3 nums-tabular">{religiousSiteCounts.mosques.count.toLocaleString()}</td>
                    <td className="border-r border-border px-3 py-3 nums-tabular text-center">{religiousSiteCounts.churches.count.toLocaleString()}</td>
                    <td className="border-r border-border px-3 py-3 text-center text-muted-foreground">—</td>
                    <td className="px-3 py-3 nums-tabular">{religiousSiteCounts.kovils.count.toLocaleString()}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="border-r border-border px-3 py-3 font-medium">Number of Clergy / Religious Leaders</td>
                    <td className="border-r border-border px-3 py-3 nums-tabular">{religiousSiteCounts.temples.clergyCount.toLocaleString()}</td>
                    <td className="border-r border-border px-3 py-3 nums-tabular">{religiousSiteCounts.meheniArama.clergyCount.toLocaleString()}</td>
                    <td className="border-r border-border px-3 py-3 nums-tabular">{religiousSiteCounts.mosques.clergyCount.toLocaleString()}</td>
                    <td className="border-r border-border px-3 py-3 nums-tabular">{religiousSiteCounts.churches.priestsCount.toLocaleString()}</td>
                    <td className="border-r border-border px-3 py-3 nums-tabular">{religiousSiteCounts.churches.nunsCount.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{religiousSiteCounts.kovils.clergyCount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
          </AnalyticsTableWrapper>

          <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual
              en="Names of Religious Places / Sacred Sites in the Area"
              si="ප්‍රදේශයේ ආගමික ස්ථාන / පූජනීය ස්ථානවල නම්"
            />
          </h3>

          <AnalyticsTableWrapper horizontalScroll>
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">Name of Religious Place / Sacred Site</th>
                    <th className="px-3 py-3">Category / Type</th>
                    <th className="px-3 py-3">Reason for Being Special / Notable</th>
                    <th className="px-3 py-3">Used for Dhamma Schools / Pirivenas or Government Purposes?</th>
                    <th className="px-3 py-3">Describe the Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {religiousHeritageRows.length === 0 ? (
                    <tr className="border-t last:border-b">
                      <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                        No religious place / sacred site records available.
                      </td>
                    </tr>
                  ) : (
                    religiousHeritageRows.map((row, index) => (
                      <tr key={`${row.gnId}-${row.name}-${index}`} className="border-t last:border-b">
                        <td className="px-3 py-3">{row.name || "—"}</td>
                        <td className="px-3 py-3">{row.type || "—"}</td>
                        <td className="px-3 py-3">{row.significance || "—"}</td>
                        <td className="px-3 py-3">
                          {row.usedForDhammaOrGovtPurpose === "yes"
                            ? "Yes"
                            : row.usedForDhammaOrGovtPurpose === "no"
                            ? "No"
                            : "—"}
                        </td>
                        <td className="px-3 py-3">{row.taskDescription || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </AnalyticsTableWrapper>

          <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual en="Art Academies" si="කලා අභ්‍යාස මධ්‍යස්ථාන" />
          </h3>

          <AnalyticsTableWrapper horizontalScroll>
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Registration No</th>
                    <th className="px-3 py-3">Student Count</th>
                  </tr>
                </thead>
                <tbody>
                  {religiousArtAcademyRows.length === 0 ? (
                    <tr className="border-t last:border-b">
                      <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                        No art academy records available.
                      </td>
                    </tr>
                  ) : (
                    religiousArtAcademyRows.map((row, index) => (
                      <tr key={`${row.gnId}-${row.name}-${index}`} className="border-t last:border-b">
                        <td className="px-3 py-3">{row.name || "—"}</td>
                        <td className="px-3 py-3">{row.registrationNumber || "—"}</td>
                        <td className="px-3 py-3 nums-tabular">{(row.studentCount ?? 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </AnalyticsTableWrapper>

          <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual en="Traditional Artists" si="සම්ප්‍රදායික කලාකරුවන්" />
          </h3>

          <AnalyticsTableWrapper horizontalScroll>
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Art Form</th>
                    <th className="px-3 py-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {religiousTraditionalArtistRows.length === 0 ? (
                    <tr className="border-t last:border-b">
                      <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                        No traditional artist records available.
                      </td>
                    </tr>
                  ) : (
                    religiousTraditionalArtistRows.map((row, index) => (
                      <tr key={`${row.gnId}-${row.name}-${index}`} className="border-t last:border-b">
                        <td className="px-3 py-3">{row.name || "—"}</td>
                        <td className="px-3 py-3">{row.artForm || "—"}</td>
                        <td className="px-3 py-3">{row.description || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </AnalyticsTableWrapper>
        </>
      )}
    </div>
  );
}
