"use client";

import * as React from "react";
import type { AreaProfileAggregate } from "@/lib/analytics/aggregate-sections";
import { Bilingual } from "@/components/Bilingual";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AnalyticsTableWrapper,
  GnDivisionFilterSelect,
} from "@/components/analytics/AnalyticsSectionShells";

interface GnOption {
  id: string;
  en: string;
  si: string;
}

interface WasteDisasterSectionViewProps {
  lang: string;
  wasteGnDivision: string;
  onWasteGnDivisionChange: (value: string) => void;
  employmentGnOptions: GnOption[];
  analyticsError: unknown;
  areaProfile: AreaProfileAggregate | undefined;
}

function ShareCell({ count, total }: { count: number; total: number }) {
  return (
    <TableCell className="nums-tabular">
      {count.toLocaleString()} / {total.toLocaleString()}
    </TableCell>
  );
}

export function WasteDisasterSectionView({
  lang,
  wasteGnDivision,
  onWasteGnDivisionChange,
  employmentGnOptions,
  analyticsError,
  areaProfile,
}: WasteDisasterSectionViewProps) {
  const totalGns = areaProfile?.coverage.wasteDisaster.total ?? 0;
  const wasteManagement = areaProfile?.wasteManagement;

  return (
    <div className="space-y-4">
      <GnDivisionFilterSelect
        lang={lang}
        value={wasteGnDivision}
        onValueChange={onWasteGnDivisionChange}
        options={employmentGnOptions}
      />

      {analyticsError ? (
        <div className="text-sm text-destructive">
          <Bilingual en="Unable to load waste management data." si="කසළ කළමනාකරණ දත්ත පූරණය කළ නොහැක." />
        </div>
      ) : !areaProfile || !wasteManagement ? (
        <div className="text-sm text-muted-foreground">
          <Bilingual en="Loading…" si="පූරණය වෙමින්..." />
        </div>
      ) : (
        <>
          <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual en="Waste Collection Arrangements" si="කසළ එකතු කිරීමේ විධිවිධාන" />
          </h3>

          <AnalyticsTableWrapper>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>
                    <Bilingual en="Indicator" si="දර්ශකය" />
                  </TableHead>
                  <TableHead>
                    <Bilingual en="GN Divisions (Yes / Total)" si="ග්‍රාම නිලධාරී වසම් (ඔව් / මුළු)" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    <Bilingual
                      en="Has a waste and garbage collection arrangement"
                      si="කසළ හා අපද්‍රව්‍ය එකතු කිරීමේ විධිවිධානයක් ඇත"
                    />
                  </TableCell>
                  <ShareCell count={wasteManagement.divisionsWithProgram} total={totalGns} />
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <Bilingual
                      en="Public is informed of the collection schedule"
                      si="එකතු කිරීමේ කාලසටහන මහජනතාව දැනුවත් කර ඇත"
                    />
                  </TableCell>
                  <ShareCell count={wasteManagement.divisionsWithPublicInformed} total={totalGns} />
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <Bilingual
                      en="Has a designated composting or waste disposal site"
                      si="කොම්පෝස්ට් කිරීමේ හෝ කසළ බැහැර කිරීමේ නම් කළ ස්ථානයක් ඇත"
                    />
                  </TableCell>
                  <ShareCell count={wasteManagement.divisionsWithCompostSite} total={totalGns} />
                </TableRow>
              </TableBody>
            </Table>
          </AnalyticsTableWrapper>

          <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual en="Collection Frequency" si="අපද්‍රව්‍ය රැස්කරන වාරගණන" />
          </h3>

          <AnalyticsTableWrapper>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>
                    <Bilingual en="Frequency" si="වාරගණන" />
                  </TableHead>
                  <TableHead>
                    <Bilingual en="Number of GN Divisions" si="ග්‍රාම නිලධාරී වසම් සංඛ්‍යාව" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wasteManagement.collectionFrequency.map((row) => (
                  <TableRow key={row.en}>
                    <TableCell className="font-medium">
                      <Bilingual en={row.en} si={row.si} />
                    </TableCell>
                    <TableCell className="nums-tabular">{row.count.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AnalyticsTableWrapper>

          <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual en="Collection Method" si="අපද්‍රව්‍ය රැස්කරන ක්‍රමවේදය" />
          </h3>

          <AnalyticsTableWrapper>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>
                    <Bilingual en="Method" si="ක්‍රමය" />
                  </TableHead>
                  <TableHead>
                    <Bilingual en="Number of GN Divisions" si="ග්‍රාම නිලධාරී වසම් සංඛ්‍යාව" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wasteManagement.collectionMethod.map((row) => (
                  <TableRow key={row.en}>
                    <TableCell className="font-medium">
                      <Bilingual en={row.en} si={row.si} />
                    </TableCell>
                    <TableCell className="nums-tabular">{row.count.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AnalyticsTableWrapper>

          <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual
              en="Disposal Method (Where No Collection Arrangement Exists)"
              si="කසළ බැහැර කරන ආකාරය (විධිවිධානයක් නොපවතින විට)"
            />
          </h3>

          <AnalyticsTableWrapper>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>
                    <Bilingual en="Waste Disposal Method" si="කසළ හා ඝන අපද්‍රව්‍ය ක්‍රමවත්ව ඉවත් කිරීම" />
                  </TableHead>
                  <TableHead>
                    <Bilingual en="Number of GN Divisions" si="ග්‍රාම නිලධාරී වසම් සංඛ්‍යාව" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wasteManagement.disposalMethodIfNoProgram.map((row) => (
                  <TableRow key={row.en}>
                    <TableCell className="font-medium">
                      <Bilingual en={row.en} si={row.si} />
                    </TableCell>
                    <TableCell className="nums-tabular">{row.presentCount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AnalyticsTableWrapper>
        </>
      )}
    </div>
  );
}
