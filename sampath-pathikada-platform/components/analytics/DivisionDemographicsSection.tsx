"use client";

import * as React from "react";
import { ArrowUp, Eye, Globe2, Home, MapPin, UserCheck, Users } from "lucide-react";
import { Bilingual } from "@/components/Bilingual";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DemographicsSectionAnalytics = {
  demographics: {
    totalPopulation: number;
    female: number;
    male: number;
    households: {
      total: number;
      femaleHeaded: number;
      displaced: number;
    };
  };
  gnBreakdown: Array<{
    gnId: string;
    gnName: string;
    demographics: {
      totalPopulation: number;
      female: number;
      male: number;
      households: {
        total: number;
        femaleHeaded: number;
        displaced: number;
      };
      foreignNationals?: {
        female: number;
        male: number;
        total: number;
      };
      registeredVoters?: {
        female: number;
        male: number;
        total: number;
      };
      populationByReligion: Array<{
        key: string;
        en: string;
        si: string;
        female: number;
        male: number;
        total: number;
      }>;
      populationByEthnicity: Array<{
        key: string;
        en: string;
        si: string;
        total: number;
      }>;
    } | null;
  }>;
};

type Props = {
  lang: "en" | "si";
  analytics: DemographicsSectionAnalytics | undefined;
  analyticsError: unknown;
  gnTotals: {
    totalPopulation: number;
    female: number;
    male: number;
    families: number;
  };
  gnReligionTotals: {
    buddhist: number;
    hindu: number;
    islam: number;
    catholic: number;
    otherChristians: number;
    other: number;
    collection: number;
  };
  gnEthnicityTotals: {
    sinhala: number;
    sriLankanTamil: number;
    indianTamil: number;
    sriLankanYonaka: number;
    burgher: number;
    malay: number;
    other: number;
    collection: number;
  };
  gnForeignNationalsTotals: {
    female: number;
    male: number;
    collection: number;
  };
  gnHouseholdsTotals: {
    totalHouseholds: number;
    femaleHeadedHouseholds: number;
    displacedHouseholds: number;
  };
  gnRegisteredVotersTotals: {
    female: number;
    male: number;
    total: number;
  };
};

function TopicCard({
  icon: Icon,
  titleEn,
  titleSi,
  onClick,
  buttonLabel,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  titleEn: string;
  titleSi: string;
  onClick?: () => void;
  buttonLabel?: { en: string; si: string };
}) {
  return (
    <Card className="card-lift overflow-hidden border-border/60 shadow-md">
      <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
            <Icon className="size-5" aria-hidden="true" />
          </span>
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

export function DivisionDemographicsSection({
  lang,
  analytics,
  analyticsError,
  gnTotals,
  gnReligionTotals,
  gnEthnicityTotals,
  gnForeignNationalsTotals,
  gnHouseholdsTotals,
  gnRegisteredVotersTotals,
}: Props) {
  const [showTotalPopulation, setShowTotalPopulation] = React.useState(false);
  const [showGnBreakdown, setShowGnBreakdown] = React.useState(false);
  const [showReligionDistribution, setShowReligionDistribution] = React.useState(false);
  const [showEthnicityDistribution, setShowEthnicityDistribution] = React.useState(false);
  const [showForeignNationals, setShowForeignNationals] = React.useState(false);
  const [showHouseholds, setShowHouseholds] = React.useState(false);
  const [showRegisteredVoters, setShowRegisteredVoters] = React.useState(false);
  const [expandedReligionRows, setExpandedReligionRows] = React.useState<Record<string, boolean>>({});

  const gnBreakdownRef = React.useRef<HTMLDivElement | null>(null);
  const religionTableRef = React.useRef<HTMLDivElement | null>(null);
  const ethnicityTableRef = React.useRef<HTMLDivElement | null>(null);
  const foreignTableRef = React.useRef<HTMLDivElement | null>(null);
  const householdsTableRef = React.useRef<HTMLDivElement | null>(null);
  const votersTableRef = React.useRef<HTMLDivElement | null>(null);

  const toggleReligionRow = (gnId: string) => {
    setExpandedReligionRows((prev) => ({ ...prev, [gnId]: !prev[gnId] }));
  };

  return (
    <div className="space-y-4">
      <Card className="card-lift overflow-hidden border-border/60 shadow-md">
        <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              <Users className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="min-w-0 font-display text-fluid-2xl font-semibold text-foreground">
              <Bilingual en="Total Population" si="මහජන සංඛ්‍යාව" />
            </CardTitle>
          </div>
          <div className="flex items-start justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowTotalPopulation((s) => !s)}>
              <Eye className="size-4" />
              <Bilingual en={showTotalPopulation ? "Hide" : "View"} si={showTotalPopulation ? "සඟවන්න" : "බලන්න"} />
            </Button>
          </div>
        </CardHeader>
        {showTotalPopulation && (
          <CardContent>
            {analyticsError ? (
              <div className="text-sm text-destructive">Unable to load demographics.</div>
            ) : !analytics ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-muted/50 p-4 text-sm md:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Total Population</p>
                    <p className="mt-1 text-fluid-lg font-semibold nums-tabular text-foreground">
                      {analytics.demographics.totalPopulation.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground"><Bilingual en="Female" si="ස්ත්‍රී" /></p>
                    <p className="mt-1 text-fluid-lg font-semibold nums-tabular text-foreground">
                      {analytics.demographics.female.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground"><Bilingual en="Male" si="පුරුෂ" /></p>
                    <p className="mt-1 text-fluid-lg font-semibold nums-tabular text-foreground">
                      {analytics.demographics.male.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground"><Bilingual en="Number of Families" si="පවුල් සංඛ්‍යාව" /></p>
                    <p className="mt-1 text-fluid-lg font-semibold nums-tabular text-foreground">
                      {analytics.demographics.households.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Card className="card-lift overflow-hidden border-border/60 shadow-md">
        <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="min-w-0 font-display text-fluid-2xl font-semibold text-foreground">
              <Bilingual en="Population by Grama Niladhari Divisions" si="ග්‍රාම නිලධාරී වසම් අනුව ජනගහනය" />
            </CardTitle>
          </div>
          <div className="flex items-start justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowGnBreakdown((s) => !s)}>
              <Eye className="size-4" />
              <Bilingual en={showGnBreakdown ? "Hide" : "View"} si={showGnBreakdown ? "සඟවන්න" : "බලන්න"} />
            </Button>
          </div>
        </CardHeader>
        {showGnBreakdown && (
          <CardContent>
            {analyticsError ? (
              <div className="text-sm text-destructive">Unable to load GN division totals.</div>
            ) : !analytics ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <div ref={gnBreakdownRef} className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3">GN Division</th>
                        <th className="px-3 py-3">Total Population</th>
                        <th className="px-3 py-3"><Bilingual en="Female" si="ස්ත්‍රී" /></th>
                        <th className="px-3 py-3"><Bilingual en="Male" si="පුරුෂ" /></th>
                        <th className="px-3 py-3">Families</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.gnBreakdown.map((g) => {
                        const demo = g.demographics;
                        return (
                          <React.Fragment key={g.gnId}>
                            <tr className="border-t last:border-b">
                              <td className="px-3 py-3 font-medium">{g.gnName}</td>
                              <td className="px-3 py-3">{demo ? demo.totalPopulation.toLocaleString() : "—"}</td>
                              <td className="px-3 py-3">{demo ? demo.female.toLocaleString() : "—"}</td>
                              <td className="px-3 py-3">{demo ? demo.male.toLocaleString() : "—"}</td>
                              <td className="px-3 py-3">{demo ? demo.households.total.toLocaleString() : "—"}</td>
                            </tr>
                            {demo && expandedReligionRows[g.gnId] ? (
                              <tr className="bg-muted/10">
                                <td className="p-0" colSpan={5}>
                                  <div className="overflow-hidden rounded-b-md border border-border bg-white dark:bg-slate-950">
                                    <div className="overflow-x-auto px-3 py-3">
                                      <table className="w-full text-left text-sm">
                                        <thead className="bg-muted/40 text-muted-foreground">
                                          <tr>
                                            <th className="px-3 py-2">Religion</th>
                                            <th className="px-3 py-2"><Bilingual en="Female" si="ස්ත්‍රී" /></th>
                                            <th className="px-3 py-2"><Bilingual en="Male" si="පුරුෂ" /></th>
                                            <th className="px-3 py-2">Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {demo.populationByReligion.map((row) => (
                                            <tr key={row.key} className="border-t last:border-b">
                                              <td className="px-3 py-2">{lang === "si" ? row.si : row.en}</td>
                                              <td className="px-3 py-2">{row.female.toLocaleString()}</td>
                                              <td className="px-3 py-2">{row.male.toLocaleString()}</td>
                                              <td className="px-3 py-2">{row.total.toLocaleString()}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted/40 text-muted-foreground">
                      <tr className="border-t">
                        <td className="px-3 py-3 font-semibold">Totals</td>
                        <td className="px-3 py-3 font-semibold">{gnTotals.totalPopulation.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnTotals.female.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnTotals.male.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnTotals.families.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => gnBreakdownRef.current?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <ArrowUp className="size-4" />
                    <Bilingual en="Back to top" si="ඉහළට" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <TopicCard
        icon={Globe2}
        titleEn="Population Distribution by Religion"
        titleSi="ආගම අනුව ජනගහනය"
        onClick={() => setShowReligionDistribution((value) => !value)}
        buttonLabel={{ en: showReligionDistribution ? "Hide" : "View", si: showReligionDistribution ? "සඟවන්න" : "බලන්න" }}
      />
      {showReligionDistribution && (
        <Card className="card-lift overflow-hidden border-border/60 shadow-md">
          <CardHeader>
            <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
              <Bilingual en="Population Distribution by Religion" si="ආගම අනුව ජනගහනය" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsError ? (
              <div className="text-sm text-destructive">Unable to load religion distribution.</div>
            ) : !analytics ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <div ref={religionTableRef} className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3">GN Division</th>
                        <th className="px-3 py-3">Buddhist</th>
                        <th className="px-3 py-3">Hindu</th>
                        <th className="px-3 py-3">Islam</th>
                        <th className="px-3 py-3">Roman Catholic</th>
                        <th className="px-3 py-3">Other Christians</th>
                        <th className="px-3 py-3">Other</th>
                        <th className="px-3 py-3">Collection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.gnBreakdown.map((gn) => {
                        const demo = gn.demographics;
                        const buddhist = demo?.populationByReligion.find((row) => row.key === "buddhist")?.total ?? 0;
                        const hindu = demo?.populationByReligion.find((row) => row.key === "hindu")?.total ?? 0;
                        const islam = demo?.populationByReligion.find((row) => row.key === "islam")?.total ?? 0;
                        const catholic = demo?.populationByReligion.find((row) => row.key === "catholic")?.total ?? 0;
                        const otherChristians = demo?.populationByReligion.find((row) => row.key === "other")?.total ?? 0;
                        const collection = buddhist + hindu + islam + catholic + otherChristians;
                        const other = demo ? Math.max(0, demo.totalPopulation - collection) : 0;

                        return (
                          <tr key={gn.gnId} className="border-t last:border-b">
                            <td className="px-3 py-3 font-medium">{gn.gnName}</td>
                            <td className="px-3 py-3">{demo ? buddhist.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? hindu.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? islam.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? catholic.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? otherChristians.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? other.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? collection.toLocaleString() : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted/40 text-muted-foreground">
                      <tr className="border-t">
                        <td className="px-3 py-3 font-semibold">Totals</td>
                        <td className="px-3 py-3 font-semibold">{gnReligionTotals.buddhist.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnReligionTotals.hindu.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnReligionTotals.islam.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnReligionTotals.catholic.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnReligionTotals.otherChristians.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnReligionTotals.other.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnReligionTotals.collection.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => religionTableRef.current?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <ArrowUp className="size-4" />
                    <Bilingual en="Back to top" si="ඉහළට" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <TopicCard
        icon={Users}
        titleEn="Population Distribution by Ethnicity"
        titleSi="ජාතිය අනුව ජනගහනය"
        onClick={() => setShowEthnicityDistribution((value) => !value)}
        buttonLabel={{ en: showEthnicityDistribution ? "Hide" : "View", si: showEthnicityDistribution ? "සඟවන්න" : "බලන්න" }}
      />
      {showEthnicityDistribution && (
        <Card className="card-lift overflow-hidden border-border/60 shadow-md">
          <CardHeader>
            <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
              <Bilingual en="Population Distribution by Ethnicity" si="ජාතිය අනුව ජනගහනය" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsError ? (
              <div className="text-sm text-destructive">Unable to load ethnicity distribution.</div>
            ) : !analytics ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <div ref={ethnicityTableRef} className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3">GN Division</th>
                        <th className="px-3 py-3">Sinhala</th>
                        <th className="px-3 py-3">Sri Lankan Tamil</th>
                        <th className="px-3 py-3">Indian Tamil</th>
                        <th className="px-3 py-3">Sri Lankan Yonaka</th>
                        <th className="px-3 py-3">Burger</th>
                        <th className="px-3 py-3">Malay</th>
                        <th className="px-3 py-3">Other</th>
                        <th className="px-3 py-3">Collection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.gnBreakdown.map((gn) => {
                        const demo = gn.demographics;
                        const sinhala = demo?.populationByEthnicity.find((row) => row.key === "sinhala")?.total ?? 0;
                        const sriLankanTamil = demo?.populationByEthnicity.find((row) => row.key === "tamil")?.total ?? 0;
                        const indianTamil = 0;
                        const sriLankanYonaka = demo?.populationByEthnicity.find((row) => row.key === "muslim")?.total ?? 0;
                        const burgher = demo?.populationByEthnicity.find((row) => row.key === "burgher")?.total ?? 0;
                        const malay = demo?.populationByEthnicity.find((row) => row.key === "malay")?.total ?? 0;
                        const other = demo?.populationByEthnicity.find((row) => row.key === "other")?.total ?? 0;
                        const collection = sinhala + sriLankanTamil + indianTamil + sriLankanYonaka + burgher + malay + other;

                        return (
                          <tr key={gn.gnId} className="border-t last:border-b">
                            <td className="px-3 py-3 font-medium">{gn.gnName}</td>
                            <td className="px-3 py-3">{demo ? sinhala.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? sriLankanTamil.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? indianTamil.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? sriLankanYonaka.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? burgher.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? malay.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? other.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{demo ? collection.toLocaleString() : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted/40 text-muted-foreground">
                      <tr className="border-t">
                        <td className="px-3 py-3 font-semibold">Totals</td>
                        <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.sinhala.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.sriLankanTamil.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.indianTamil.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.sriLankanYonaka.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.burgher.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.malay.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.other.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.collection.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => ethnicityTableRef.current?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <ArrowUp className="size-4" />
                    <Bilingual en="Back to top" si="ඉහළට" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <TopicCard
        icon={Globe2}
        titleEn="Expatriate population"
        titleSi="විදේශගත ජනගහනය"
        onClick={() => setShowForeignNationals((value) => !value)}
        buttonLabel={{ en: showForeignNationals ? "Hide" : "View", si: showForeignNationals ? "සඟවන්න" : "බලන්න" }}
      />
      {showForeignNationals && (
        <Card className="card-lift overflow-hidden border-border/60 shadow-md">
          <CardHeader>
            <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
              <Bilingual en="Expatriate Population (Residents Living Abroad)" si="විදේශගත ජනගහනය" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsError ? (
              <div className="text-sm text-destructive">Unable to load expatriate population data.</div>
            ) : !analytics ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <div ref={foreignTableRef} className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3">GN Division</th>
                        <th className="px-3 py-3"><Bilingual en="Female Count" si="ගැහැණු සංඛ්‍යාව" /></th>
                        <th className="px-3 py-3"><Bilingual en="Male Count" si="පිරිමි සංඛ්‍යාව" /></th>
                        <th className="px-3 py-3"><Bilingual en="Total Count" si="මුළු සංඛ්‍යාව" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.gnBreakdown.map((gn) => {
                        const foreign = gn.demographics?.foreignNationals;
                        return (
                          <tr key={gn.gnId} className="border-t last:border-b">
                            <td className="px-3 py-3 font-medium">{gn.gnName}</td>
                            <td className="px-3 py-3">{foreign ? foreign.female.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{foreign ? foreign.male.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{foreign ? foreign.total.toLocaleString() : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted/40 text-muted-foreground">
                      <tr className="border-t">
                        <td className="px-3 py-3 font-semibold">Totals</td>
                        <td className="px-3 py-3 font-semibold">{gnForeignNationalsTotals.female.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnForeignNationalsTotals.male.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnForeignNationalsTotals.collection.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => foreignTableRef.current?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <ArrowUp className="size-4" />
                    <Bilingual en="Back to top" si="ඉහළට" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <TopicCard
        icon={Home}
        titleEn="Number of Families"
        titleSi="මුළු පවුල් සංඛ්‍යාව"
        onClick={() => setShowHouseholds((value) => !value)}
        buttonLabel={{ en: showHouseholds ? "Hide" : "View", si: showHouseholds ? "සඟවන්න" : "බලන්න" }}
      />
      {showHouseholds && (
        <Card className="card-lift overflow-hidden border-border/60 shadow-md">
          <CardHeader>
            <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
              <Bilingual en="Number of Families in the Division" si="වසමේ මුළු පවුල් සංඛ්‍යාව" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsError ? (
              <div className="text-sm text-destructive">Unable to load families data.</div>
            ) : !analytics ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <div ref={householdsTableRef} className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3">GN Division</th>
                        <th className="px-3 py-3"><Bilingual en="Total Number of Families" si="මුළු පවුල් සංඛ්‍යාව" /></th>
                        <th className="px-3 py-3"><Bilingual en="Female-Headed Families" si="කාන්තා ගෘහමූලික පවුල් සංඛ්‍යාව" /></th>
                        <th className="px-3 py-3"><Bilingual en="Families with Children in Probation Care" si="පරිවාසගත ළමුන් සිටින පවුල් සංඛ්‍යාව" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.gnBreakdown.map((gn) => {
                        const households = gn.demographics?.households;
                        return (
                          <tr key={gn.gnId} className="border-t last:border-b">
                            <td className="px-3 py-3 font-medium">{gn.gnName}</td>
                            <td className="px-3 py-3">{households ? households.total.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{households ? households.femaleHeaded.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{households ? households.displaced.toLocaleString() : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted/40 text-muted-foreground">
                      <tr className="border-t">
                        <td className="px-3 py-3 font-semibold">Totals</td>
                        <td className="px-3 py-3 font-semibold">{gnHouseholdsTotals.totalHouseholds.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnHouseholdsTotals.femaleHeadedHouseholds.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnHouseholdsTotals.displacedHouseholds.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => householdsTableRef.current?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <ArrowUp className="size-4" />
                    <Bilingual en="Back to top" si="ඉහළට" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <TopicCard
        icon={UserCheck}
        titleEn="Number of registered voters"
        titleSi="ලියාපදිංචි ඡන්ද දායකයින් සංඛ්‍යාව"
        onClick={() => setShowRegisteredVoters((value) => !value)}
        buttonLabel={{ en: showRegisteredVoters ? "Hide" : "View", si: showRegisteredVoters ? "සඟවන්න" : "බලන්න" }}
      />
      {showRegisteredVoters && (
        <Card className="card-lift overflow-hidden border-border/60 shadow-md">
          <CardHeader>
            <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
              <Bilingual en="Number of Registered Voters" si="ලියාපදිංචි ඡන්ද දායකයින් සංඛ්‍යාව" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsError ? (
              <div className="text-sm text-destructive">Unable to load registered voters data.</div>
            ) : !analytics ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <div ref={votersTableRef} className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3">GN Division</th>
                        <th className="px-3 py-3"><Bilingual en="Female" si="ස්ත්‍රී" /></th>
                        <th className="px-3 py-3"><Bilingual en="Male" si="පුරුෂ" /></th>
                        <th className="px-3 py-3"><Bilingual en="Total" si="එකතුව" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.gnBreakdown.map((gn) => {
                        const voters = gn.demographics?.registeredVoters;
                        return (
                          <tr key={gn.gnId} className="border-t last:border-b">
                            <td className="px-3 py-3 font-medium">{gn.gnName}</td>
                            <td className="px-3 py-3">{voters ? voters.female.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{voters ? voters.male.toLocaleString() : "—"}</td>
                            <td className="px-3 py-3">{voters ? voters.total.toLocaleString() : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted/40 text-muted-foreground">
                      <tr className="border-t">
                        <td className="px-3 py-3 font-semibold">Totals</td>
                        <td className="px-3 py-3 font-semibold">{gnRegisteredVotersTotals.female.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnRegisteredVotersTotals.male.toLocaleString()}</td>
                        <td className="px-3 py-3 font-semibold">{gnRegisteredVotersTotals.total.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => votersTableRef.current?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <ArrowUp className="size-4" />
                    <Bilingual en="Back to top" si="ඉහළට" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
