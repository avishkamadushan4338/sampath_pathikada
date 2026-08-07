"use client";

import { Bilingual } from "@/components/Bilingual";
import {
  AnalyticsTableWrapper,
  GnDivisionFilterSelect,
} from "@/components/analytics/AnalyticsSectionShells";
import { HERITAGE_SITE_TYPES } from "@/lib/validators/sections/religious-cultural";

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

const HERITAGE_SITE_TYPE_LABELS: Record<(typeof HERITAGE_SITE_TYPES)[number], { en: string; si: string }> = {
  "temple-vihara": { en: "Temple / Vihara", si: "පන්සල්/විහාරස්ථාන" },
  "forest-hermitage": { en: "Forest Hermitage", si: "අරණ්‍ය සේනාසන" },
  asapuwa: { en: "Asapuwa", si: "අසපුව" },
  "meditation-center": { en: "Meditation Center", si: "භාවනා මධ්‍යස්ථාන" },
  "nuns-hermitage": { en: "Nun's Hermitage", si: "මෙහෙනි ආරාම" },
  mosque: { en: "Mosque", si: "ඉස්ලාම් පල්ලි" },
  "catholic-church": { en: "Catholic Church", si: "කතෝලික පල්ලි" },
  kovil: { en: "Kovil", si: "කෝවිල්" },
  devalaya: { en: "Devalaya", si: "දේවාල" },
};

function heritageTypeLabel(type: string | undefined, lang: string): string {
  if (!type) return "—";
  const label = HERITAGE_SITE_TYPE_LABELS[type as (typeof HERITAGE_SITE_TYPES)[number]];
  if (!label) return type;
  return lang === "si" ? label.si : label.en;
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
        <div className="text-sm text-destructive">
          <Bilingual en="Unable to load religious and cultural data." si="ආගමික හා සංස්කෘතික තොරතුරු පූරණය කළ නොහැක." />
        </div>
      ) : !hasAnalytics || !religiousSiteCounts ? (
        <div className="text-sm text-muted-foreground">
          <Bilingual en="Loading…" si="පූරණය වෙමින්…" />
        </div>
      ) : (
        <>
          <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual en="Total Number of All Religious Sites" si="සියලුම ආගමික ස්ථාන සංඛ්‍යාව" />
          </h3>

          <AnalyticsTableWrapper horizontalScroll>
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="border-r border-border px-3 py-3" rowSpan={2} />
                    <th className="border-r border-border px-3 py-3">
                      <Bilingual en="Temple / Forest Hermitage / Asapuwa" si="පන්සල්/ආරණ්‍ය විහාරස්ථාන/අසපුව" />
                    </th>
                    <th className="border-r border-border px-3 py-3">
                      <Bilingual en="Nun Hermitages" si="මෙහෙනි ආරාම" />
                    </th>
                    <th className="border-r border-border px-3 py-3">
                      <Bilingual en="Mosques" si="ඉස්ලාම් පල්ලි" />
                    </th>
                    <th className="border-r border-l border-border px-3 py-3 text-center" colSpan={2}>
                      <Bilingual en="Catholic Churches" si="කතෝලික පල්ලි" />
                    </th>
                    <th className="px-3 py-3">
                      <Bilingual en="Kovils" si="කෝවිල්" />
                    </th>
                  </tr>
                  <tr>
                    <th className="border-t border-r border-border px-3 py-3 text-center font-semibold">
                      <Bilingual en="Monks" si="භික්ෂූන් වහන්සේලා" />
                    </th>
                    <th className="border-t border-r border-border px-3 py-3 text-center font-semibold">
                      <Bilingual en="Nuns" si="මෙහෙනීන් වහන්සේලා" />
                    </th>
                    <th className="border-t border-r border-border px-3 py-3 text-center font-semibold">
                      <Bilingual en="Moulavis" si="මවුලවිතුමන්ලා" />
                    </th>
                    <th className="border-t border-r border-l border-border px-3 py-3 text-center font-semibold">
                      <Bilingual en="Priests" si="පියතුමන්ලා" />
                    </th>
                    <th className="border-t border-r border-border px-3 py-3 text-center font-semibold">
                      <Bilingual en="Nuns / Sisters" si="කන්‍යා සොයුරියන්" />
                    </th>
                    <th className="border-t border-border px-3 py-3 text-center font-semibold">
                      <Bilingual en="Priests / Poojaris" si="පූජකතුමන්ලා /පූසාරි" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="border-r border-border px-3 py-3 font-medium">
                      <Bilingual en="Number of Religious Sites" si="ආගමික ස්ථාන ගණන" />
                    </td>
                    <td className="border-r border-border px-3 py-3 nums-tabular">{religiousSiteCounts.temples.count.toLocaleString()}</td>
                    <td className="border-r border-border px-3 py-3 nums-tabular">{religiousSiteCounts.meheniArama.count.toLocaleString()}</td>
                    <td className="border-r border-border px-3 py-3 nums-tabular">{religiousSiteCounts.mosques.count.toLocaleString()}</td>
                    <td className="border-r border-border px-3 py-3 nums-tabular text-center">{religiousSiteCounts.churches.count.toLocaleString()}</td>
                    <td className="border-r border-border px-3 py-3 text-center text-muted-foreground">—</td>
                    <td className="px-3 py-3 nums-tabular">{religiousSiteCounts.kovils.count.toLocaleString()}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="border-r border-border px-3 py-3 font-medium">
                      <Bilingual en="Number of Clergy" si="පූජ්‍ය පක්ෂ සංඛ්‍යාව" />
                    </td>
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
              en="Names of Sacred Sites Among the Religious Sites in the Area"
              si="ප්‍රදේශයේ ඇති ආගමික ස්ථානයන්හි පූජනීය ස්ථානයන්හි නම"
            />
          </h3>

          <AnalyticsTableWrapper horizontalScroll>
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">
                      <Bilingual en="Name of Religious Site / Sacred Site" si="ආගමික ස්ථානයන්හි /පූජනීය ස්ථානයේ නම" />
                    </th>
                    <th className="px-3 py-3">
                      <Bilingual en="* Type" si="*වර්ගය" />
                    </th>
                    <th className="px-3 py-3">
                      <Bilingual en="Reason for Being Special" si="සුවිශේෂී වීමට හේතු" />
                    </th>
                    <th className="px-3 py-3">
                      <Bilingual
                        en="Used for Dhamma School / Pirivena / Govt Purpose?"
                        si="දහම් පාසල්/පිරිවෙන් හෝ රජයේ කාර්යන් සඳහා භාවිතා කරනවාද"
                      />
                    </th>
                    <th className="px-3 py-3">
                      <Bilingual en="Describe the Task" si="එම කටයුත්ත විස්තර කරන්න" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {religiousHeritageRows.length === 0 ? (
                    <tr className="border-t last:border-b">
                      <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                        <Bilingual en="No sacred site records available." si="පූජනීය ස්ථාන වාර්තා නොමැත." />
                      </td>
                    </tr>
                  ) : (
                    religiousHeritageRows.map((row, index) => (
                      <tr key={`${row.gnId}-${row.name}-${index}`} className="border-t last:border-b">
                        <td className="px-3 py-3">{row.name || "—"}</td>
                        <td className="px-3 py-3">{heritageTypeLabel(row.type, lang)}</td>
                        <td className="px-3 py-3">{row.significance || "—"}</td>
                        <td className="px-3 py-3">
                          {row.usedForDhammaOrGovtPurpose === "yes" ? (
                            <Bilingual en="Yes" si="ඔව්" />
                          ) : row.usedForDhammaOrGovtPurpose === "no" ? (
                            <Bilingual en="No" si="නැත" />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-3">{row.taskDescription || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </AnalyticsTableWrapper>
          <p className="text-fluid-xs text-muted-foreground">
            <Bilingual
              en="* Type: (1. Temple / Vihara) (2. Forest Hermitage) (3. Asapuwa) (4. Meditation Center) (5. Nun's Hermitage) (6. Mosque) (7. Catholic Church) (8. Kovil) (9. Devalaya)"
              si="*වර්ගය-( 1-පන්සල්/විහාරස්ථාන) ( 2- ආරණ්‍ය සේනාසන) (3 අසපුව) (4-භාවනා මධ්‍යස්ථාන) (5- මෙහෙනි ආරාම ) (6පල්ලි- ඉස්ලාම් පල්ලි) (7-කතෝලික පල්ලි) (8-කෝවිල්) (9- දේවාල)"
            />
          </p>

          <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual en="Details of Art Institutions" si="කලායතන පිළිබඳ විස්තර" />
          </h3>

          <AnalyticsTableWrapper horizontalScroll>
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">
                      <Bilingual en="Name of Art Institution" si="කලායතනයේ නම" />
                    </th>
                    <th className="px-3 py-3">
                      <Bilingual en="Registration No" si="ලියාපදිංචි අංකය" />
                    </th>
                    <th className="px-3 py-3">
                      <Bilingual en="Student Count" si="සිසුන් ගණන" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {religiousArtAcademyRows.length === 0 ? (
                    <tr className="border-t last:border-b">
                      <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                        <Bilingual en="No art institution records available." si="කලායතන වාර්තා නොමැත." />
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
            <Bilingual
              en="Main Cultural Aspects Present in the Area — Artists Produced / Art Lineages"
              si="ප්‍රදේශයෙන් පවතින ප්‍රධාන සංස්කෘතිකාංග - බිහිවූ කලාකරුවන්/කලා පරම්පරාවල්"
            />
          </h3>

          <AnalyticsTableWrapper horizontalScroll>
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">
                      <Bilingual en="* Famous Art Field" si="*ප්‍රසිද්ධ කලා ක්ෂේත්‍රය" />
                    </th>
                    <th className="px-3 py-3">
                      <Bilingual en="Artists Produced" si="බිහිවූ කලාකරුවන්" />
                    </th>
                    <th className="px-3 py-3">
                      <Bilingual en="Description" si="විස්තරය" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {religiousTraditionalArtistRows.length === 0 ? (
                    <tr className="border-t last:border-b">
                      <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                        <Bilingual en="No cultural aspect records available." si="සංස්කෘතිකාංග වාර්තා නොමැත." />
                      </td>
                    </tr>
                  ) : (
                    religiousTraditionalArtistRows.map((row, index) => (
                      <tr key={`${row.gnId}-${row.name}-${index}`} className="border-t last:border-b">
                        <td className="px-3 py-3">{row.artForm || "—"}</td>
                        <td className="px-3 py-3">{row.name || "—"}</td>
                        <td className="px-3 py-3">{row.description || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </AnalyticsTableWrapper>
          <p className="text-fluid-xs text-muted-foreground">
            <Bilingual
              en="* e.g. writers, poets, lyricists, bali thovil, puppet dance, painting artists, drumming artists, and other various cultural aspects."
              si="* ලේඛකයන්, කවියන්, ගීතඥයන්, බලි තොවිල්, රුකඩ නැටුම්, විත්‍ර ශිල්පීන්, බෙර වාදන ශිල්පීන් ආදී විවිධ සංස්කෘතිකාංග"
            />
          </p>
        </>
      )}
    </div>
  );
}
