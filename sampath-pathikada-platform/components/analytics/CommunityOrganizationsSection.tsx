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

type NameAddressRow = { id: string; name: string; address?: string };
type SportsClubDisplayRow = { id: string; name: string; memberCount?: number; identifiedNeeds?: string };
type CooperativeRow = { id: string; name: string };

type Props = {
  lang: "en" | "si";
  communityOrganizationsGnDivision: string;
  onCommunityOrganizationsGnDivisionChange: (value: string) => void;
  employmentGnOptions: Array<{ id: string; en: string; si: string }>;
  analyticsError: unknown;
  analytics: {
    sections: {
      communityWelfare: {
        organizationCounts: Array<{ en: string; si: string; count: number }>;
        villageDevelopmentSocieties: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        youthSocieties: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        sportsClubs: { rows: Array<{ gnId?: string; nameAndAddress?: string; memberCount?: number; identifiedNeeds?: string }> };
        funeralAidSocieties: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        womensSocieties: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        eldersSocieties: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        childrensSocieties: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        samurdhiSocieties: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        friendOrganizations: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        ngoCommittees: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        farmerSocieties: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        religiousSocieties: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        sanasaSocieties: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        civilDefenseCommittees: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
        prajashakthiSocieties: { rows: Array<{ gnId?: string; name?: string; address?: string }> };
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
  lang: "en" | "si";
  titleEn: string;
  titleSi: string;
  nameHeaderEn: string;
  nameHeaderSi: string;
  rows: Array<{ id: string; name: string; address?: string; memberCount?: number; identifiedNeeds?: string }>;
  tableRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  error: unknown;
  showAddress?: boolean;
  showMembersAndNeeds?: boolean;
}

function CommunityOrganizationDirectoryTable({
  lang,
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
          <div className="text-sm text-destructive">
            <Bilingual en="Unable to load organization directory." si="සංවිධාන ලැයිස්තුව පූරණය කළ නොහැක." />
          </div>
        ) : isLoading ? (
          <div className="text-sm text-muted-foreground">
            <Bilingual en="Loading…" si="පූරණය වෙමින්..." />
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <div ref={tableRef} className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">{lang === "si" ? nameHeaderSi : nameHeaderEn}</th>
                    {showAddress && <th className="px-3 py-3"><Bilingual en="Address" si="ලිපිනය" /></th>}
                    {showMembersAndNeeds && <th className="px-3 py-3"><Bilingual en="Member Count" si="සාමාජික සංඛ්‍යාව" /></th>}
                    {showMembersAndNeeds && <th className="px-3 py-3"><Bilingual en="Identified Needs" si="හඳුනාගත් අවශ්‍යතා" /></th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td className="px-3 py-3" colSpan={colSpan}>
                        <span className="text-muted-foreground">
                          <Bilingual en="No records available." si="වාර්තා නොමැත." />
                        </span>
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
  const [showYouthSocieties, setShowYouthSocieties] = React.useState(false);
  const [showSportsClubs, setShowSportsClubs] = React.useState(false);
  const [showFuneralAidSocieties, setShowFuneralAidSocieties] = React.useState(false);
  const [showWomensSocieties, setShowWomensSocieties] = React.useState(false);
  const [showEldersSocieties, setShowEldersSocieties] = React.useState(false);
  const [showChildrensSocieties, setShowChildrensSocieties] = React.useState(false);
  const [showSamurdhiSocieties, setShowSamurdhiSocieties] = React.useState(false);
  const [showFriendOrganizations, setShowFriendOrganizations] = React.useState(false);
  const [showNgoCommittees, setShowNgoCommittees] = React.useState(false);
  const [showFarmerSocieties, setShowFarmerSocieties] = React.useState(false);
  const [showReligiousSocieties, setShowReligiousSocieties] = React.useState(false);
  const [showSanasaSocieties, setShowSanasaSocieties] = React.useState(false);
  const [showCivilDefenseCommittees, setShowCivilDefenseCommittees] = React.useState(false);
  const [showPrajashakthiSocieties, setShowPrajashakthiSocieties] = React.useState(false);
  const [showCooperativeSocieties, setShowCooperativeSocieties] = React.useState(false);

  const communityOrganizationsTableRef = React.useRef<HTMLDivElement | null>(null);
  const villageDevelopmentSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const youthSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const sportsClubsTableRef = React.useRef<HTMLDivElement | null>(null);
  const funeralAidSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const womensSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const eldersSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const childrensSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const samurdhiSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const friendOrganizationsTableRef = React.useRef<HTMLDivElement | null>(null);
  const ngoCommitteesTableRef = React.useRef<HTMLDivElement | null>(null);
  const farmerSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const religiousSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const sanasaSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const civilDefenseCommitteesTableRef = React.useRef<HTMLDivElement | null>(null);
  const prajashakthiSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const cooperativeSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);

  const organizationCountRows = analytics?.sections.communityWelfare.organizationCounts ?? [];

  function nameAddressRows(rows: Array<{ gnId?: string; name?: string; address?: string }> | undefined): NameAddressRow[] {
    return (rows ?? []).map((row, index) => ({ id: `${row.gnId}-${row.name}-${index}`, name: row.name ?? "", address: row.address ?? "" }));
  }

  const villageDevelopmentSocietyRows = React.useMemo(
    () => nameAddressRows(analytics?.sections.communityWelfare.villageDevelopmentSocieties.rows),
    [analytics]
  );
  const youthSocietyRows = React.useMemo(() => nameAddressRows(analytics?.sections.communityWelfare.youthSocieties.rows), [analytics]);
  const sportsClubRows = React.useMemo<SportsClubDisplayRow[]>(
    () =>
      (analytics?.sections.communityWelfare.sportsClubs.rows ?? []).map((row, index) => ({
        id: `${row.gnId}-${row.nameAndAddress}-${index}`,
        name: row.nameAndAddress ?? "",
        memberCount: row.memberCount,
        identifiedNeeds: row.identifiedNeeds,
      })),
    [analytics]
  );
  const funeralAidSocietyRows = React.useMemo(
    () => nameAddressRows(analytics?.sections.communityWelfare.funeralAidSocieties.rows),
    [analytics]
  );
  const womensSocietyRows = React.useMemo(() => nameAddressRows(analytics?.sections.communityWelfare.womensSocieties.rows), [analytics]);
  const eldersSocietyRows = React.useMemo(() => nameAddressRows(analytics?.sections.communityWelfare.eldersSocieties.rows), [analytics]);
  const childrensSocietyRows = React.useMemo(
    () => nameAddressRows(analytics?.sections.communityWelfare.childrensSocieties.rows),
    [analytics]
  );
  const samurdhiSocietyRows = React.useMemo(
    () => nameAddressRows(analytics?.sections.communityWelfare.samurdhiSocieties.rows),
    [analytics]
  );
  const friendOrganizationRows = React.useMemo(
    () => nameAddressRows(analytics?.sections.communityWelfare.friendOrganizations.rows),
    [analytics]
  );
  const ngoCommitteeRows = React.useMemo(() => nameAddressRows(analytics?.sections.communityWelfare.ngoCommittees.rows), [analytics]);
  const farmerSocietyRows = React.useMemo(() => nameAddressRows(analytics?.sections.communityWelfare.farmerSocieties.rows), [analytics]);
  const religiousSocietyRows = React.useMemo(
    () => nameAddressRows(analytics?.sections.communityWelfare.religiousSocieties.rows),
    [analytics]
  );
  const sanasaSocietyRows = React.useMemo(() => nameAddressRows(analytics?.sections.communityWelfare.sanasaSocieties.rows), [analytics]);
  const civilDefenseCommitteeRows = React.useMemo(
    () => nameAddressRows(analytics?.sections.communityWelfare.civilDefenseCommittees.rows),
    [analytics]
  );
  const prajashakthiSocietyRows = React.useMemo(
    () => nameAddressRows(analytics?.sections.communityWelfare.prajashakthiSocieties.rows),
    [analytics]
  );
  const cooperativeSocietyRows = React.useMemo<CooperativeRow[]>(
    () =>
      (analytics?.sections.communityWelfare.cooperativeSocieties.rows ?? []).map((row, index) => ({
        id: `${row.gnId}-${row.name}-${index}`,
        name: row.name ?? "",
      })),
    [analytics]
  );

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
        titleEn="Community, Governmental, and Non-Governmental Organizations"
        titleSi="ප්‍රජාමූල, රාජ්‍ය හා රාජ්‍ය නොවන සංවිධාන"
        onClick={() => setShowCommunityOrganizationsTable((value) => !value)}
        buttonLabel={{ en: showCommunityOrganizationsTable ? "Hide" : "View", si: showCommunityOrganizationsTable ? "සඟවන්න" : "බලන්න" }}
      />
      {showCommunityOrganizationsTable && (
        <Card className="card-lift overflow-hidden border-border/60 shadow-md">
          <CardHeader>
            <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
              <Bilingual en="Society Types" si="සමිති වර්ගය" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsError ? (
              <div className="text-sm text-destructive">
                <Bilingual en="Unable to load organization data." si="සංවිධාන දත්ත පූරණය කළ නොහැක." />
              </div>
            ) : !analytics ? (
              <div className="text-sm text-muted-foreground">
                <Bilingual en="Loading…" si="පූරණය වෙමින්..." />
              </div>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <div ref={communityOrganizationsTableRef} className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3"><Bilingual en="Society Type" si="සමිති වර්ගය" /></th>
                        <th className="px-3 py-3"><Bilingual en="Society Count" si="සමිති සංඛ්‍යාව" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizationCountRows.map((row) => (
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

      <TopicCard titleEn="Village Development Societies" titleSi="ග්‍රාම සංවර්ධන සමිති" onClick={() => setShowVillageDevelopmentSocieties((v) => !v)} buttonLabel={{ en: showVillageDevelopmentSocieties ? "Hide" : "View", si: showVillageDevelopmentSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showVillageDevelopmentSocieties && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Village Development Societies" titleSi="ග්‍රාම සංවර්ධන සමිති" nameHeaderEn="Village Development Society Names" nameHeaderSi="ග්‍රාම සංවර්ධන සමිතිවල නම" rows={villageDevelopmentSocietyRows} tableRef={villageDevelopmentSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Youth Societies" titleSi="යෞවන සමාජ සමිති" onClick={() => setShowYouthSocieties((v) => !v)} buttonLabel={{ en: showYouthSocieties ? "Hide" : "View", si: showYouthSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showYouthSocieties && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Youth Societies" titleSi="යෞවන සමාජ සමිති" nameHeaderEn="Youth Society Names" nameHeaderSi="යෞවන සමාජ සමිතිවල නම" rows={youthSocietyRows} tableRef={youthSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Sports Societies" titleSi="ක්‍රීඩා සමාජ" onClick={() => setShowSportsClubs((v) => !v)} buttonLabel={{ en: showSportsClubs ? "Hide" : "View", si: showSportsClubs ? "සඟවන්න" : "බලන්න" }} />
      {showSportsClubs && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Sports Societies" titleSi="ක්‍රීඩා සමාජ" nameHeaderEn="Sports Society Name & Address" nameHeaderSi="ක්‍රීඩා සමාජවල නම හා ලිපිනය" rows={sportsClubRows} tableRef={sportsClubsTableRef} isLoading={!analytics} error={analyticsError} showAddress={false} showMembersAndNeeds />
      )}

      <TopicCard titleEn="Funeral & Welfare Societies" titleSi="අවමංගල්‍යය හා සුභසාධක සමිති" onClick={() => setShowFuneralAidSocieties((v) => !v)} buttonLabel={{ en: showFuneralAidSocieties ? "Hide" : "View", si: showFuneralAidSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showFuneralAidSocieties && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Funeral & Welfare Societies" titleSi="අවමංගල්‍යය හා සුභසාධක සමිති" nameHeaderEn="Funeral & Welfare Society Names" nameHeaderSi="අවමංගල්‍යය හා සුභසාධක සමිතිවල නම" rows={funeralAidSocietyRows} tableRef={funeralAidSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Women's Societies" titleSi="කාන්තා සමිති" onClick={() => setShowWomensSocieties((v) => !v)} buttonLabel={{ en: showWomensSocieties ? "Hide" : "View", si: showWomensSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showWomensSocieties && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Women's Societies" titleSi="කාන්තා සමිති" nameHeaderEn="Women's Society Names" nameHeaderSi="කාන්තා සමිතිවල නම" rows={womensSocietyRows} tableRef={womensSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Elders' Societies" titleSi="වැඩිහිටි සමිති" onClick={() => setShowEldersSocieties((v) => !v)} buttonLabel={{ en: showEldersSocieties ? "Hide" : "View", si: showEldersSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showEldersSocieties && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Elders' Societies" titleSi="වැඩිහිටි සමිති" nameHeaderEn="Elders' Society Names" nameHeaderSi="වැඩිහිටි සමිතිවල නම" rows={eldersSocietyRows} tableRef={eldersSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Children's Societies" titleSi="ළමා සමාජ" onClick={() => setShowChildrensSocieties((v) => !v)} buttonLabel={{ en: showChildrensSocieties ? "Hide" : "View", si: showChildrensSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showChildrensSocieties && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Children's Societies" titleSi="ළමා සමාජ" nameHeaderEn="Children's Society Names" nameHeaderSi="ළමා සමාජ සමිතිවල නම" rows={childrensSocietyRows} tableRef={childrensSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Samurdhi Societies" titleSi="සමෘද්ධි සමිති" onClick={() => setShowSamurdhiSocieties((v) => !v)} buttonLabel={{ en: showSamurdhiSocieties ? "Hide" : "View", si: showSamurdhiSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showSamurdhiSocieties && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Samurdhi Societies" titleSi="සමෘද්ධි සමිති" nameHeaderEn="Samurdhi Society Names" nameHeaderSi="සමෘද්ධි සමිතිවල නම" rows={samurdhiSocietyRows} tableRef={samurdhiSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Friend Organizations / Friend Groups" titleSi="මිතුරු සංවිධාන/මිතුරු හවුල්" onClick={() => setShowFriendOrganizations((v) => !v)} buttonLabel={{ en: showFriendOrganizations ? "Hide" : "View", si: showFriendOrganizations ? "සඟවන්න" : "බලන්න" }} />
      {showFriendOrganizations && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Friend Organizations / Friend Groups" titleSi="මිතුරු සංවිධාන/මිතුරු හවුල්" nameHeaderEn="Friend Organization / Friend Group Names" nameHeaderSi="මිතුරු සංවිධාන/මිතුරු හවුල් වල නම" rows={friendOrganizationRows} tableRef={friendOrganizationsTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Non-Governmental Organizations" titleSi="රාජ්‍ය නොවන සංවිධාන" onClick={() => setShowNgoCommittees((v) => !v)} buttonLabel={{ en: showNgoCommittees ? "Hide" : "View", si: showNgoCommittees ? "සඟවන්න" : "බලන්න" }} />
      {showNgoCommittees && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Non-Governmental Organizations" titleSi="රාජ්‍ය නොවන සංවිධාන" nameHeaderEn="Non-Governmental Organization Names" nameHeaderSi="රාජ්‍ය නොවන සංවිධාන වල නම" rows={ngoCommitteeRows} tableRef={ngoCommitteesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Farmer Societies" titleSi="ගොවි සමිති" onClick={() => setShowFarmerSocieties((v) => !v)} buttonLabel={{ en: showFarmerSocieties ? "Hide" : "View", si: showFarmerSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showFarmerSocieties && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Farmer Societies" titleSi="ගොවි සමිති" nameHeaderEn="Farmer Society Names" nameHeaderSi="ගොවි සමිතිවල නම" rows={farmerSocietyRows} tableRef={farmerSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Religious Societies" titleSi="ආගමික සමිති" onClick={() => setShowReligiousSocieties((v) => !v)} buttonLabel={{ en: showReligiousSocieties ? "Hide" : "View", si: showReligiousSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showReligiousSocieties && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Religious Societies" titleSi="ආගමික සමිති" nameHeaderEn="Religious Society Names" nameHeaderSi="ආගමික සමිතිවල නම" rows={religiousSocietyRows} tableRef={religiousSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="SANASA Societies" titleSi="සණස සමිති" onClick={() => setShowSanasaSocieties((v) => !v)} buttonLabel={{ en: showSanasaSocieties ? "Hide" : "View", si: showSanasaSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showSanasaSocieties && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="SANASA Societies" titleSi="සණස සමිති" nameHeaderEn="SANASA Society Names" nameHeaderSi="සණස සමිතිවල නම" rows={sanasaSocietyRows} tableRef={sanasaSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Civil Defense Committees" titleSi="සිවිල් ආරක්ෂක කමිටු" onClick={() => setShowCivilDefenseCommittees((v) => !v)} buttonLabel={{ en: showCivilDefenseCommittees ? "Hide" : "View", si: showCivilDefenseCommittees ? "සඟවන්න" : "බලන්න" }} />
      {showCivilDefenseCommittees && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Civil Defense Committees" titleSi="සිවිල් ආරක්ෂක කමිටු" nameHeaderEn="Civil Defense Committee Names" nameHeaderSi="සිවිල් ආරක්ෂක සමිතිවල නම" rows={civilDefenseCommitteeRows} tableRef={civilDefenseCommitteesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Prajashakthi Societies" titleSi="ප්‍රජාශක්ති සමිති" onClick={() => setShowPrajashakthiSocieties((v) => !v)} buttonLabel={{ en: showPrajashakthiSocieties ? "Hide" : "View", si: showPrajashakthiSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showPrajashakthiSocieties && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Prajashakthi Societies" titleSi="ප්‍රජාශක්ති සමිති" nameHeaderEn="Prajashakthi Society Names" nameHeaderSi="ප්‍රජාශක්ති සමිතිවල නම" rows={prajashakthiSocietyRows} tableRef={prajashakthiSocietiesTableRef} isLoading={!analytics} error={analyticsError} />
      )}

      <TopicCard titleEn="Information About Active Cooperative Societies Within the GN Division" titleSi="ග්‍රාම නිලධාරී වසම තුල ක්‍රියාත්මක සමුපකාර සමිති පිළිබඳ තොරතුරු" onClick={() => setShowCooperativeSocieties((v) => !v)} buttonLabel={{ en: showCooperativeSocieties ? "Hide" : "View", si: showCooperativeSocieties ? "සඟවන්න" : "බලන්න" }} />
      {showCooperativeSocieties && (
        <CommunityOrganizationDirectoryTable lang={lang} titleEn="Information About Active Cooperative Societies Within the GN Division" titleSi="ග්‍රාම නිලධාරී වසම තුල ක්‍රියාත්මක සමුපකාර සමිති පිළිබඳ තොරතුරු" nameHeaderEn="Multi-Purpose Cooperative Society Name" nameHeaderSi="වි.සේවා.සමූපකාර සමිතියේ නම" rows={cooperativeSocietyRows} tableRef={cooperativeSocietiesTableRef} isLoading={!analytics} error={analyticsError} showAddress={false} />
      )}
    </div>
  );
}
