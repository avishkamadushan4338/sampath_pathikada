"use client";

import * as React from "react";
import { ArrowUp, Eye, Users } from "lucide-react";
import { Bilingual } from "@/components/Bilingual";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrganizationRow = {
  id: string;
  type: string;
  name: string;
  address?: string;
  memberCount?: number;
  identifiedNeeds?: string;
};

type TableRow = {
  en: string;
  si: string;
  count: number;
};

type Props = {
  lang: "en" | "si";
  communityOrganizationsGnDivision: string;
  onCommunityOrganizationsGnDivisionChange: (value: string) => void;
  employmentGnOptions: Array<{ id: string; en: string; si: string }>;
  analyticsError: unknown;
  analytics: {
    sections: {
      communityWelfare: {
        organizationCounts: Array<{ en: string; count: number }>;
        organizationDirectory: {
          rows: Array<{
            gnId?: string;
            name?: string;
            type?: string;
            address?: string;
            memberCount?: number;
            identifiedNeeds?: string;
          }>;
        };
        cooperativeSocieties: { rows: Array<{ gnId?: string; name?: string }> };
      };
    };
  } | undefined;
};

function TopicCard({
  icon: Icon,
  titleEn,
  titleSi,
  onClick,
  buttonLabel,
}: {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  titleEn: string;
  titleSi: string;
  onClick?: () => void;
  buttonLabel?: { en: string; si: string };
}) {
  return (
    <Card className="card-lift overflow-hidden border-border/60 shadow-md">
      <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {Icon ? (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              <Icon className="size-5" aria-hidden="true" />
            </span>
          ) : null}
          <CardTitle className="min-w-0 font-display text-fluid-2xl font-semibold text-foreground">
            <Bilingual en={titleEn} si={titleSi} />
          </CardTitle>
        </div>
        <div className="flex items-start justify-end">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onClick}>
            <Eye className="size-4" />
            <Bilingual en={buttonLabel?.en ?? "View"} si={buttonLabel?.si ?? "බලන්න"} />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

interface CommunityOrganizationDirectoryTableProps {
  titleEn: string;
  titleSi: string;
  nameHeaderEn: string;
  nameHeaderSi: string;
  rows: OrganizationRow[];
  tableRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  error: unknown;
  showAddress?: boolean;
  showMembersAndNeeds?: boolean;
}

function CommunityOrganizationDirectoryTable({
  titleEn,
  titleSi,
  nameHeaderEn,
  nameHeaderSi,
  rows,
  tableRef,
  isLoading,
  error,
  showAddress = true,
  showMembersAndNeeds = false,
}: CommunityOrganizationDirectoryTableProps) {
  const colSpan = (showAddress ? 2 : 1) + (showMembersAndNeeds ? 2 : 0);

  return (
    <Card className="card-lift overflow-hidden border-border/60 shadow-md">
      <CardHeader>
        <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
          <Bilingual en={titleEn} si={titleSi} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-destructive">Unable to load organization directory.</div>
        ) : isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <div ref={tableRef} className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">{nameHeaderEn}</th>
                    {showAddress && <th className="px-3 py-3">Address</th>}
                    {showMembersAndNeeds && <th className="px-3 py-3">Member Count</th>}
                    {showMembersAndNeeds && <th className="px-3 py-3">Identified Needs</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td className="px-3 py-3" colSpan={colSpan}>
                        <span className="text-muted-foreground">No records available.</span>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="border-t last:border-b">
                        <td className="px-3 py-3 font-medium">{row.name || "—"}</td>
                        {showAddress && <td className="px-3 py-3">{row.address || "—"}</td>}
                        {showMembersAndNeeds && <td className="px-3 py-3">{row.memberCount ?? "—"}</td>}
                        {showMembersAndNeeds && <td className="px-3 py-3">{row.identifiedNeeds || "—"}</td>}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => tableRef.current?.scrollIntoView({ behavior: "smooth" })}>
                <ArrowUp className="size-4" />
                <Bilingual en="Back to top" si="ඉහළට" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const COMMUNITY_ORGANIZATION_CARDS: Array<{ en: string; si: string }> = [
  { en: "Community, Governmental, and Non-Governmental Organizations", si: "ප්‍රජාමූල, රාජ්‍ය හා රාජ්‍ය නොවන සංවිධාන" },
  { en: "Village Development Societies", si: "ග්‍රාම සංවර්ධන සමිති" },
  { en: "Youth Clubs", si: "යෞවන සමාජ" },
  { en: "Sports Clubs", si: "ක්‍රීඩා සමාජ" },
  { en: "Funeral Welfare Societies", si: "අවමංගල්‍යාධාර හා සුභසාධක සමිති" },
  { en: "Women's Societies", si: "කාන්තා සමිති" },
  { en: "Senior Citizens' Societies", si: "වැඩිහිටි සමිති" },
  { en: "Children's Clubs", si: "ළමා සමාජ" },
  { en: "Samurdhi Societies", si: "සමෘද්ධි සමිති" },
  { en: "Mithuru Organizations / Mithuru Partnerships", si: "මිතුරු සංවිධාන / මිතුරු හවුල්" },
  { en: "Non-Governmental Organizations", si: "රාජ්‍ය නොවන සංවිධාන" },
  { en: "Farmers' Societies", si: "ගොවි සමිති" },
  { en: "Religious Societies", si: "ආගමික සමිති" },
  { en: "Sanasa (Credit/Microfinance) Society", si: "සණස (ණය / සුළු මූල්‍ය) සමිති" },
  { en: "Civil Defense Committees", si: "සිවිල් ආරක්ෂක කමිටු" },
  { en: "Community Empowerment Societies", si: "ප්‍රජා සවිබල ගැන්වීමේ සමිති" },
  { en: "Information Regarding Cooperative Societies Operating Within the Grama Niladhari Division", si: "ග්‍රාම නිලධාරී වසම තුළ ක්‍රියාත්මක සමූපකාර සමිති පිළිබඳ තොරතුරු" },
];

const COMMUNITY_ORGANIZATION_TABLE_ROWS: Array<{ en: string; si: string; matchEn: string[] }> = [
  { en: "Village Development Society", si: "ග්‍රාම සංවර්ධන සමිතිය", matchEn: ["Village Development Society"] },
  { en: "Youth Club", si: "යෞවන සමාජය", matchEn: ["Youth Society", "Youth Club"] },
  { en: "Sports Club", si: "ක්‍රීඩා සමාජය", matchEn: ["Sports Club"] },
  { en: "Funeral Welfare Society", si: "අවමංගල්‍යාධාර හා සුභසාධක සමිතිය", matchEn: ["Funeral Aid Society", "Funeral Welfare Society"] },
  { en: "Women's Society", si: "කාන්තා සමිතිය", matchEn: ["Women's Society"] },
  { en: "Senior Citizens' Society", si: "වැඩිහිටි සමිතිය", matchEn: ["Elders' Society", "Senior Citizens' Society"] },
  { en: "Children's Club", si: "ළමා සමාජය", matchEn: ["Children's Society", "Children's Club"] },
  { en: "Samurdhi Society", si: "සමෘද්ධි සමිතිය", matchEn: ["Samurdhi Society"] },
  { en: "Mithuru Organization / Mithuru Partnership", si: "මිතුරු සංවිධාන / මිතුරු හවුල්", matchEn: ["Friend Organization / Association", "Mithuru Organization / Mithuru Partnership"] },
  { en: "Non-Governmental Organization", si: "රාජ්‍ය නොවන සංවිධානය", matchEn: ["Non-Governmental Organization Committee", "Non-Governmental Organization"] },
  { en: "Farmers' Society", si: "ගොවි සමිතිය", matchEn: ["Farmer Society", "Farmers' Society"] },
  { en: "Religious Society", si: "ආගමික සමිතිය", matchEn: ["Religious Society"] },
  { en: "Sanasa (Credit/Microfinance) Society", si: "සණස (ණය / සුළු මූල්‍ය) සමිතිය", matchEn: ["SANASA Society", "Sanasa (Credit/Microfinance) Society"] },
  { en: "Civil Defense Committees", si: "සිවිල් ආරක්ෂක කමිටු", matchEn: ["Civil Defense Committee", "Civil Defense Committees"] },
  { en: "Praja Shakthi (Community Empowerment) Society", si: "ප්‍රජා ශක්ති (ප්‍රජා සවිබල ගැන්වීමේ) සමිතිය", matchEn: ["Prajashakthi Society", "Praja Shakthi (Community Empowerment) Society"] },
];

export function CommunityOrganizationsSection({
  lang,
  communityOrganizationsGnDivision,
  onCommunityOrganizationsGnDivisionChange,
  employmentGnOptions,
  analyticsError,
  analytics,
}: Props) {
  const [showCommunityOrganizationsTable, setShowCommunityOrganizationsTable] = React.useState(false);
  const [showVillageDevelopmentSocieties, setShowVillageDevelopmentSocieties] = React.useState(false);
  const [showYouthClubs, setShowYouthClubs] = React.useState(false);
  const [showSportsClubs, setShowSportsClubs] = React.useState(false);
  const [showFuneralWelfareSocieties, setShowFuneralWelfareSocieties] = React.useState(false);
  const [showWomensSocieties, setShowWomensSocieties] = React.useState(false);
  const [showSeniorCitizensSocieties, setShowSeniorCitizensSocieties] = React.useState(false);
  const [showChildrensClubs, setShowChildrensClubs] = React.useState(false);
  const [showSamurdhiSocieties, setShowSamurdhiSocieties] = React.useState(false);
  const [showMithuruOrganizations, setShowMithuruOrganizations] = React.useState(false);
  const [showNonGovernmentalOrganizations, setShowNonGovernmentalOrganizations] = React.useState(false);
  const [showFarmersSocieties, setShowFarmersSocieties] = React.useState(false);
  const [showReligiousSocieties, setShowReligiousSocieties] = React.useState(false);
  const [showSanasaSocieties, setShowSanasaSocieties] = React.useState(false);
  const [showCivilDefenseCommittees, setShowCivilDefenseCommittees] = React.useState(false);
  const [showPrajaShakthiSocieties, setShowPrajaShakthiSocieties] = React.useState(false);
  const [showCooperativeSocieties, setShowCooperativeSocieties] = React.useState(false);

  const communityOrganizationsTableRef = React.useRef<HTMLDivElement | null>(null);
  const villageDevelopmentSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const youthClubsTableRef = React.useRef<HTMLDivElement | null>(null);
  const sportsClubsTableRef = React.useRef<HTMLDivElement | null>(null);
  const funeralWelfareSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const womensSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const seniorCitizensSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const childrensClubsTableRef = React.useRef<HTMLDivElement | null>(null);
  const samurdhiSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const mithuruOrganizationsTableRef = React.useRef<HTMLDivElement | null>(null);
  const nonGovernmentalOrganizationsTableRef = React.useRef<HTMLDivElement | null>(null);
  const farmersSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const religiousSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const sanasaSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const civilDefenseCommitteesTableRef = React.useRef<HTMLDivElement | null>(null);
  const prajaShakthiSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const cooperativeSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);

  const communityOrganizationTableRows = React.useMemo(() => {
    const organizationCounts = analytics?.sections.communityWelfare.organizationCounts ?? [];
    const countByLabel = new Map(organizationCounts.map((row) => [row.en, row.count]));

    return COMMUNITY_ORGANIZATION_TABLE_ROWS.map((row) => {
      const count = row.matchEn.reduce((sum, label) => sum + (countByLabel.get(label) ?? 0), 0);
      return {
        en: row.en,
        si: row.si,
        count,
      };
    });
  }, [analytics]);

  const communityOrganizationDirectoryRows = React.useMemo(() => {
    const rows = analytics?.sections.communityWelfare.organizationDirectory.rows ?? [];
    return rows.map((row, index) => ({
      id: `${row.gnId}-${row.name}-${row.type}-${index}`,
      type: row.type,
      name: row.name ?? "",
      address: row.address ?? "",
      memberCount: row.memberCount,
      identifiedNeeds: row.identifiedNeeds,
    }));
  }, [analytics]);

  const getOrganizationRowsByType = React.useCallback(
    (type: string) => communityOrganizationDirectoryRows.filter((row) => row.type === type),
    [communityOrganizationDirectoryRows]
  );

  const villageDevelopmentSocietyRows = React.useMemo(() => getOrganizationRowsByType("village-development-society"), [getOrganizationRowsByType]);
  const youthClubRows = React.useMemo(() => getOrganizationRowsByType("youth-society"), [getOrganizationRowsByType]);
  const sportsClubRows = React.useMemo(() => getOrganizationRowsByType("sports-club"), [getOrganizationRowsByType]);
  const funeralWelfareSocietyRows = React.useMemo(() => getOrganizationRowsByType("funeral-aid-society"), [getOrganizationRowsByType]);
  const womensSocietyRows = React.useMemo(() => getOrganizationRowsByType("womens-society"), [getOrganizationRowsByType]);
  const seniorCitizensSocietyRows = React.useMemo(() => getOrganizationRowsByType("elders-society"), [getOrganizationRowsByType]);
  const childrensClubRows = React.useMemo(() => getOrganizationRowsByType("childrens-society"), [getOrganizationRowsByType]);
  const samurdhiSocietyRows = React.useMemo(() => getOrganizationRowsByType("samurdhi-society"), [getOrganizationRowsByType]);
  const mithuruOrganizationRows = React.useMemo(() => getOrganizationRowsByType("friend-organization"), [getOrganizationRowsByType]);
  const nonGovernmentalOrganizationRows = React.useMemo(() => getOrganizationRowsByType("ngo-committee"), [getOrganizationRowsByType]);
  const farmersSocietyRows = React.useMemo(() => getOrganizationRowsByType("farmer-society"), [getOrganizationRowsByType]);
  const religiousSocietyRows = React.useMemo(() => getOrganizationRowsByType("religious-society"), [getOrganizationRowsByType]);
  const sanasaSocietyRows = React.useMemo(() => getOrganizationRowsByType("sanasa-society"), [getOrganizationRowsByType]);
  const civilDefenseCommitteeRows = React.useMemo(() => getOrganizationRowsByType("civil-defense-committee"), [getOrganizationRowsByType]);
  const prajaShakthiSocietyRows = React.useMemo(() => getOrganizationRowsByType("prajashakthi-society"), [getOrganizationRowsByType]);
  const cooperativeSocietyRows = React.useMemo(() => {
    const rows = analytics?.sections.communityWelfare.cooperativeSocieties.rows ?? [];
    return rows.map((row, index) => ({
      id: `${row.gnId}-${row.name}-${index}`,
      type: "cooperative-society",
      name: row.name ?? "",
      address: "",
      memberCount: undefined,
      identifiedNeeds: undefined,
    }));
  }, [analytics]);

  return (
    <div className="space-y-4">
      <div className="max-w-xs space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
        <p className="text-sm font-medium text-foreground">
          <Bilingual en="Filter by GN Division" si="ග්‍රාම නිලධාරී වසම අනුව පෙරහන්න" />
        </p>
        <Select value={communityOrganizationsGnDivision} onValueChange={onCommunityOrganizationsGnDivisionChange}>
          <SelectTrigger className="h-10 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === "si" ? "සියලුම ග්‍රාම නිලධාරී වසම්" : "All GN divisions"}</SelectItem>
            {employmentGnOptions.map((gn) => (
              <SelectItem key={gn.id} value={gn.id}>
                {lang === "si" ? gn.si : gn.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TopicCard
        icon={Users}
        titleEn={COMMUNITY_ORGANIZATION_CARDS[0]?.en ?? "Community Organizations"}
        titleSi={COMMUNITY_ORGANIZATION_CARDS[0]?.si ?? "ප්‍රජා සංවිධාන"}
        onClick={() => setShowCommunityOrganizationsTable((value) => !value)}
        buttonLabel={{ en: showCommunityOrganizationsTable ? "Hide" : "View", si: showCommunityOrganizationsTable ? "සඟවන්න" : "බලන්න" }}
      />
      {showCommunityOrganizationsTable && (
        <Card className="card-lift overflow-hidden border-border/60 shadow-md">
          <CardHeader>
            <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
              <Bilingual en="Community, Governmental, and Non-Governmental Organizations" si="ප්‍රජාමූල, රාජ්‍ය හා රාජ්‍ය නොවන සංවිධාන" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsError ? (
              <div className="text-sm text-destructive">Unable to load organization data.</div>
            ) : !analytics ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <div ref={communityOrganizationsTableRef} className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3"><Bilingual en="Society type" si="සමිති වර්ගය" /></th>
                        <th className="px-3 py-3"><Bilingual en="Number of Societies" si="සමිති සංඛ්‍යාව" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {communityOrganizationTableRows.map((row) => (
                        <tr key={row.en} className="border-t last:border-b">
                          <td className="px-3 py-3 font-medium">
                            <Bilingual en={row.en} si={row.si} />
                          </td>
                          <td className="px-3 py-3 nums-tabular">{row.count.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => communityOrganizationsTableRef.current?.scrollIntoView({ behavior: "smooth" })}>
                    <ArrowUp className="size-4" />
                    <Bilingual en="Back to top" si="ඉහළට" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <TopicCard titleEn="Village Development Societies" titleSi="ග්‍රාම සංවර්ධන සමිති" onClick={() => setShowVillageDevelopmentSocieties((value) => !value)} buttonLabel={{ en: showVillageDevelopmentSocieties ? "Hide" : "View", si: showVillageDevelopmentSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showVillageDevelopmentSocieties && (
        <CommunityOrganizationDirectoryTable titleEn="Village Development Societies" titleSi="ග්‍රාම සංවර්ධන සමිති" nameHeaderEn="Name of Village Development Societies" nameHeaderSi="ග්‍රාම සංවර්ධන සමිතියේ නම" rows={villageDevelopmentSocietyRows} tableRef={villageDevelopmentSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Youth Clubs" titleSi="යෞවන සමාජ" onClick={() => setShowYouthClubs((value) => !value)} buttonLabel={{ en: showYouthClubs ? "Hide" : "View", si: showYouthClubs ? "සඟවන්න" : "බලන්න" }} />
      {showYouthClubs && (
        <CommunityOrganizationDirectoryTable titleEn="Youth Clubs" titleSi="යෞවන සමාජ" nameHeaderEn="Name of Youth Clubs" nameHeaderSi="යෞවන සමාජයේ නම" rows={youthClubRows} tableRef={youthClubsTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Sports Clubs" titleSi="ක්‍රීඩා සමාජ" onClick={() => setShowSportsClubs((value) => !value)} buttonLabel={{ en: showSportsClubs ? "Hide" : "View", si: showSportsClubs ? "සඟවන්න" : "බලන්න" }} />
      {showSportsClubs && (
        <CommunityOrganizationDirectoryTable titleEn="Sports Clubs" titleSi="ක්‍රීඩා සමාජ" nameHeaderEn="Name of Sports Clubs" nameHeaderSi="ක්‍රීඩා සමාජයේ නම" rows={sportsClubRows} tableRef={sportsClubsTableRef} isLoading={!analytics} error={analyticsError} showMembersAndNeeds />
      )}

      <TopicCard titleEn="Funeral Welfare Societies" titleSi="අවමංගල්‍යාධාර සමිති" onClick={() => setShowFuneralWelfareSocieties((value) => !value)} buttonLabel={{ en: showFuneralWelfareSocieties ? "Hide" : "View", si: showFuneralWelfareSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showFuneralWelfareSocieties && (
        <CommunityOrganizationDirectoryTable titleEn="Funeral Welfare Societies" titleSi="අවමංගල්‍යාධාර සමිති" nameHeaderEn="Name of Funeral Welfare Societies" nameHeaderSi="අවමංගල්‍යාධාර සමිතියේ නම" rows={funeralWelfareSocietyRows} tableRef={funeralWelfareSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Women's Societies" titleSi="කාන්තා සමිති" onClick={() => setShowWomensSocieties((value) => !value)} buttonLabel={{ en: showWomensSocieties ? "Hide" : "View", si: showWomensSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showWomensSocieties && (
        <CommunityOrganizationDirectoryTable titleEn="Women's Societies" titleSi="කාන්තා සමිති" nameHeaderEn="Name of Women's Societies" nameHeaderSi="කාන්තා සමිතියේ නම" rows={womensSocietyRows} tableRef={womensSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Senior Citizens' Societies" titleSi="වැඩිහිටි සමිති" onClick={() => setShowSeniorCitizensSocieties((value) => !value)} buttonLabel={{ en: showSeniorCitizensSocieties ? "Hide" : "View", si: showSeniorCitizensSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showSeniorCitizensSocieties && (
        <CommunityOrganizationDirectoryTable titleEn="Senior Citizens' Societies" titleSi="වැඩිහිටි සමිති" nameHeaderEn="Name of Senior Citizens' Societies" nameHeaderSi="වැඩිහිටි සමිතියේ නම" rows={seniorCitizensSocietyRows} tableRef={seniorCitizensSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Children's Clubs" titleSi="ළමා සමාජ" onClick={() => setShowChildrensClubs((value) => !value)} buttonLabel={{ en: showChildrensClubs ? "Hide" : "View", si: showChildrensClubs ? "සඟවන්න" : "බලන්න" }} />
      {showChildrensClubs && (
        <CommunityOrganizationDirectoryTable titleEn="Children's Clubs" titleSi="ළමා සමාජ" nameHeaderEn="Name of Children's Clubs" nameHeaderSi="ළමා සමාජයේ නම" rows={childrensClubRows} tableRef={childrensClubsTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Samurdhi Society" titleSi="සමෘද්ධි සමිතිය" onClick={() => setShowSamurdhiSocieties((value) => !value)} buttonLabel={{ en: showSamurdhiSocieties ? "Hide" : "View", si: showSamurdhiSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showSamurdhiSocieties && (
        <CommunityOrganizationDirectoryTable titleEn="Samurdhi Society" titleSi="සමෘද්ධි සමිතිය" nameHeaderEn="Name of Samurdhi Societies" nameHeaderSi="සමෘද්ධි සමිතියේ නම" rows={samurdhiSocietyRows} tableRef={samurdhiSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Mithuru Organization / Mithuru Partnership" titleSi="මිතුරු සංවිධාන / මිතුරු හවුල්" onClick={() => setShowMithuruOrganizations((value) => !value)} buttonLabel={{ en: showMithuruOrganizations ? "Hide" : "View", si: showMithuruOrganizations ? "සඟවන්න" : "බලන්න" }} />
      {showMithuruOrganizations && (
        <CommunityOrganizationDirectoryTable titleEn="Mithuru Organization / Mithuru Partnership" titleSi="මිතුරු සංවිධාන / මිතුරු හවුල්" nameHeaderEn="Name of Mithuru Organizations / Mithuru Partnerships" nameHeaderSi="මිතුරු සංවිධානයේ නම / මිතුරු හවුල්ලේ නම" rows={mithuruOrganizationRows} tableRef={mithuruOrganizationsTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Non-Governmental Organization" titleSi="රාජ්‍ය නොවන සංවිධානය" onClick={() => setShowNonGovernmentalOrganizations((value) => !value)} buttonLabel={{ en: showNonGovernmentalOrganizations ? "Hide" : "View", si: showNonGovernmentalOrganizations ? "සඟවන්න" : "බලන්න" }} />
      {showNonGovernmentalOrganizations && (
        <CommunityOrganizationDirectoryTable titleEn="Non-Governmental Organization" titleSi="රාජ්‍ය නොවන සංවිධානය" nameHeaderEn="Name of Non-Governmental Organizations" nameHeaderSi="රාජ්‍ය නොවන සංවිධානයේ නම" rows={nonGovernmentalOrganizationRows} tableRef={nonGovernmentalOrganizationsTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Farmers' Society" titleSi="ගොවි සමිතිය" onClick={() => setShowFarmersSocieties((value) => !value)} buttonLabel={{ en: showFarmersSocieties ? "Hide" : "View", si: showFarmersSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showFarmersSocieties && (
        <CommunityOrganizationDirectoryTable titleEn="Farmers' Society" titleSi="ගොවි සමිතිය" nameHeaderEn="Name of Farmers' Societies" nameHeaderSi="ගොවි සමිතියේ නම" rows={farmersSocietyRows} tableRef={farmersSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Religious Society" titleSi="ආගමික සමිතිය" onClick={() => setShowReligiousSocieties((value) => !value)} buttonLabel={{ en: showReligiousSocieties ? "Hide" : "View", si: showReligiousSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showReligiousSocieties && (
        <CommunityOrganizationDirectoryTable titleEn="Religious Society" titleSi="ආගමික සමිතිය" nameHeaderEn="Name of Religious Societies" nameHeaderSi="ආගමික සමිතියේ නම" rows={religiousSocietyRows} tableRef={religiousSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Sanasa (Credit/Microfinance) Society" titleSi="සණස (ණය / සුළු මූල්‍ය) සමිතිය" onClick={() => setShowSanasaSocieties((value) => !value)} buttonLabel={{ en: showSanasaSocieties ? "Hide" : "View", si: showSanasaSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showSanasaSocieties && (
        <CommunityOrganizationDirectoryTable titleEn="Sanasa (Credit/Microfinance) Society" titleSi="සණස (ණය / සුළු මූල්‍ය) සමිතිය" nameHeaderEn="Name of Sanasa Societies" nameHeaderSi="සණස (ණය / සුළු මූල්‍ය) සමිතියේ නම" rows={sanasaSocietyRows} tableRef={sanasaSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Civil Defense Committees" titleSi="සිවිල් ආරක්ෂක කමිටු" onClick={() => setShowCivilDefenseCommittees((value) => !value)} buttonLabel={{ en: showCivilDefenseCommittees ? "Hide" : "View", si: showCivilDefenseCommittees ? "සඟවන්න" : "බලන්න" }} />
      {showCivilDefenseCommittees && (
        <CommunityOrganizationDirectoryTable titleEn="Civil Defense Committees" titleSi="සිවිල් ආරක්ෂක කමිටු" nameHeaderEn="Name of Civil Defense Committees" nameHeaderSi="සිවිල් ආරක්ෂක කමිටු නම" rows={civilDefenseCommitteeRows} tableRef={civilDefenseCommitteesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Praja Shakthi (Community Empowerment) Society" titleSi="ප්‍රජා ශක්ති (ප්‍රජා සවිබල ගැන්වීමේ) සමිතිය" onClick={() => setShowPrajaShakthiSocieties((value) => !value)} buttonLabel={{ en: showPrajaShakthiSocieties ? "Hide" : "View", si: showPrajaShakthiSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showPrajaShakthiSocieties && (
        <CommunityOrganizationDirectoryTable titleEn="Praja Shakthi (Community Empowerment) Society" titleSi="ප්‍රජා ශක්ති (ප්‍රජා සවිබල ගැන්වීමේ) සමිතිය" nameHeaderEn="Name of Praja Shakthi Societies" nameHeaderSi="ප්‍රජා ශක්ති (ප්‍රජා සවිබල ගැන්වීමේ) සමිතියේ නම" rows={prajaShakthiSocietyRows} tableRef={prajaShakthiSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn={COMMUNITY_ORGANIZATION_CARDS[16]?.en ?? "Cooperative Societies"} titleSi={COMMUNITY_ORGANIZATION_CARDS[16]?.si ?? "සමූපකාර සමිති"} onClick={() => setShowCooperativeSocieties((value) => !value)} buttonLabel={{ en: showCooperativeSocieties ? "Hide" : "View", si: showCooperativeSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showCooperativeSocieties && (
        <CommunityOrganizationDirectoryTable titleEn="Information Regarding Cooperative Societies Operating Within the Grama Niladhari Division" titleSi="ග්‍රාම නිලධාරී වසම තුළ ක්‍රියාත්මක සමූපකාර සමිති පිළිබඳ තොරතුරු" nameHeaderEn="Name of Multi-Purpose Cooperative Society (MPCS)" nameHeaderSi="බහු කාර්ය සමූපකාර සමිතියේ (MPCS) නම" rows={cooperativeSocietyRows} tableRef={cooperativeSocietiesTableRef} isLoading={!analytics} error={analyticsError} showAddress={false} />
      )}
    </div>
  );
}
