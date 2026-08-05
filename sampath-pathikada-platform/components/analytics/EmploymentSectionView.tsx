"use client";

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

interface EmploymentEducationRow {
  en: string;
  si: string;
  count: number;
}

interface EmploymentTrainingNeedRow {
  en: string;
  si: string;
  enLines: string[];
  siLines: string[];
  count: number;
}

interface SelfEmploymentActivityRow {
  en: string;
  si: string;
  count: number;
}

interface SelfEmployedPersonRow {
  id: string;
  field: string;
  personName: string;
  telephone: string;
  market: string;
}

interface EmploymentSectionViewProps {
  lang: string;
  employmentGnDivision: string;
  onEmploymentGnDivisionChange: (value: string) => void;
  employmentGnOptions: GnOption[];
  analyticsError: unknown;
  hasAnalytics: boolean;
  employmentEducationRows: EmploymentEducationRow[];
  employmentTrainingNeedRows: EmploymentTrainingNeedRow[];
  selfEmploymentActivityRows: SelfEmploymentActivityRow[];
  selfEmployedPersonRows: SelfEmployedPersonRow[];
}

export function EmploymentSectionView({
  lang,
  employmentGnDivision,
  onEmploymentGnDivisionChange,
  employmentGnOptions,
  analyticsError,
  hasAnalytics,
  employmentEducationRows,
  employmentTrainingNeedRows,
  selfEmploymentActivityRows,
  selfEmployedPersonRows,
}: EmploymentSectionViewProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-fluid-xl font-semibold text-foreground">
        <Bilingual en="Job Outlook" si="රැකියා ඉදිරි දැක්ම" />
      </h2>
      <GnDivisionFilterSelect
        lang={lang}
        value={employmentGnDivision}
        onValueChange={onEmploymentGnDivisionChange}
        options={employmentGnOptions}
      />
      {analyticsError ? (
        <div className="text-sm text-destructive">Unable to load employment data.</div>
      ) : !hasAnalytics ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <>
          <AnalyticsTableWrapper>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>
                    <Bilingual en="Number of people seeking employment by education" si="අධ්‍යාපනය අනුව රැකියා අපේක්ෂකයන්" />
                  </TableHead>
                  <TableHead>
                    <Bilingual en="Number of Persons" si="පුද්ගලයන් සංඛ්‍යාව" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employmentEducationRows.map((row) => (
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
          <h3 className="pt-3 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual
              en="Number of people who wish to receive vocational training but do not meet the qualifications required for vocational training"
              si="වෘත්තීය පුහුණුව ලබා ගැනීමට කැමති නමුත් ඒ සඳහා අවශ්‍ය සුදුසුකම් සපුරා නොමැති පුද්ගලයන් සංඛ්‍යාව"
            />
          </h3>
          <AnalyticsTableWrapper>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead />
                  <TableHead>
                    <Bilingual en="Number of Persons" si="පුද්ගලයන් සංඛ්‍යාව" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employmentTrainingNeedRows.map((row) => (
                  <TableRow key={row.en}>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        {row.enLines.map((enLine, index) => (
                          <div key={enLine}>
                            <Bilingual en={enLine} si={row.siLines[index] ?? row.si} />
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="nums-tabular">{row.count.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AnalyticsTableWrapper>
          <h3 className="pt-3 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual en="Self-Employment Related Information" si="ස්වයං රැකියා ආශ්‍රිත තොරතුරු" />
          </h3>
          <AnalyticsTableWrapper>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>
                    <Bilingual en="Self-Employment Activity" si="ස්වයං රැකියා ක්‍රියාකාරකම" />
                  </TableHead>
                  <TableHead>
                    <Bilingual en="Number of Persons" si="පුද්ගලයන් සංඛ්‍යාව" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selfEmploymentActivityRows.map((row) => (
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
          <h3 className="pt-3 font-display text-fluid-lg font-semibold text-foreground">
            <Bilingual en="Information on Persons Engaged in Self-Employment" si="ස්වයං රැකියාවල නියුතු පුද්ගලයන් පිළිබඳ තොරතුරු" />
          </h3>
          <AnalyticsTableWrapper>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>
                    <Bilingual en="Self-Employment Field" si="ස්වයං රැකියා ක්ෂේත්‍රය" />
                  </TableHead>
                  <TableHead>
                    <Bilingual en="Person's Name" si="පුද්ගලයාගේ නම" />
                  </TableHead>
                  <TableHead>
                    <Bilingual en="Telephone Number" si="දුරකථන අංකය" />
                  </TableHead>
                  <TableHead>
                    <Bilingual en="Market" si="වෙළඳපොළ" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selfEmployedPersonRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                      <Bilingual en="No self-employed persons recorded for this division." si="මෙම වසම සඳහා ස්වයං රැකියාවල නියුතු පුද්ගලයන් සටහන් වී නොමැත." />
                    </TableCell>
                  </TableRow>
                ) : (
                  selfEmployedPersonRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.field || "—"}</TableCell>
                      <TableCell>{row.personName || "—"}</TableCell>
                      <TableCell className="nums-tabular">{row.telephone}</TableCell>
                      <TableCell>{row.market || "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AnalyticsTableWrapper>
        </>
      )}
    </div>
  );
}
