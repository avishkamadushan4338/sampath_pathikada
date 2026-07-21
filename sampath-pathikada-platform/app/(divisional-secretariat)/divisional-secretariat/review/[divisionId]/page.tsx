"use client";

import { use, useRef, useState, type WheelEvent } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { CheckCircle2, XCircle, MessageSquareWarning, ArrowLeft, Loader2, ChartColumn } from "lucide-react";
import Link from "next/link";
import { Bilingual } from "@/components/Bilingual";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionDetailViewer } from "@/components/review/SectionDetailViewer";
import { DivisionGraphs } from "@/components/review/DivisionGraphs";
import { SECTION_KEYS } from "@/lib/types/submission";
import { SECTION_META } from "@/lib/i18n/section-meta";
import { DISTRICTS, GN_DIVISIONS } from "@/lib/registration-data";
import { STATUS_LABEL, STATUS_BADGE_CLASS, STATUS_ICON, type SubmissionStatus } from "@/lib/status-ui";
import { toast } from "sonner";

interface SubmissionDetail {
  id: string;
  year: number;
  district: string;
  dsDivision: string;
  gnDivision: string;
  status: SubmissionStatus;
  data: Record<string, unknown>;
  submittedBy: { name: string; email: string; phone: string | null; nic: string | null };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json.data as SubmissionDetail;
};

type DecisionAction = "approve" | "reject" | "request-revision";

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-2 h-8 w-64" />
      <Skeleton className="mb-6 h-5 w-96" />
      <Skeleton className="mb-6 h-12 w-full" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

export default function ReviewDetailPage({ params }: { params: Promise<{ divisionId: string }> }) {
  const { divisionId } = use(params);
  const { lang } = useLanguage();
  const router = useRouter();
  const { data: submission, isLoading, mutate } = useSWR(`/api/submissions/${divisionId}`, fetcher);

  const [pendingAction, setPendingAction] = useState<DecisionAction | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  function handleTabsWheel(e: WheelEvent<HTMLDivElement>) {
    const el = tabsScrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  }

  async function handleDecision() {
    if (!pendingAction) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${divisionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: pendingAction, note }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json.message ?? "Failed to record decision.");
        return;
      }
      toast.success(lang === "si" ? "තීරණය සටහන් කරන ලදී" : "Decision recorded");
      setPendingAction(null);
      setNote("");
      mutate();
      router.push("/divisional-secretariat/review");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !submission) {
    return <DetailSkeleton />;
  }

  const gn = GN_DIVISIONS.find((g) => g.id === submission.gnDivision);
  const district = DISTRICTS.find((d) => d.id === submission.district);
  const StatusIcon = STATUS_ICON[submission.status];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/divisional-secretariat/review"
        className="mb-4 inline-flex touch-target items-center gap-1.5 text-fluid-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        <Bilingual en="Back to Review Queue" si="සමාලෝචන පෝලිමට ආපසු" />
      </Link>

      {/* Sticky header */}
      <div className="sticky top-0 z-(--z-sticky) -mx-4 mb-6 border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-fluid-2xl font-semibold text-primary">
                {gn ? (lang === "si" ? gn.si : gn.en) : submission.gnDivision}
              </h1>
              <Badge variant="outline" className={`gap-1.5 ${STATUS_BADGE_CLASS[submission.status]}`}>
                <StatusIcon className="size-3.5" aria-hidden="true" />
                {STATUS_LABEL[submission.status][lang]}
              </Badge>
            </div>
            <p className="mt-1 text-fluid-sm text-muted-foreground">
              {district ? (lang === "si" ? district.si : district.en) : submission.district} ·{" "}
              {submission.submittedBy.name} · {submission.submittedBy.email} · {submission.year}
            </p>
          </div>

          {submission.status === "SUBMITTED" && (
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button className="touch-target gap-1.5" onClick={() => setPendingAction("approve")}>
                <CheckCircle2 className="size-4" />
                <Bilingual en="Approve" si="අනුමත කරන්න" />
              </Button>
              <Button variant="outline" className="touch-target gap-1.5" onClick={() => setPendingAction("request-revision")}>
                <MessageSquareWarning className="size-4" />
                <Bilingual en="Request Revision" si="සංශෝධනයක් ඉල්ලන්න" />
              </Button>
              <Button variant="destructive" className="touch-target gap-1.5" onClick={() => setPendingAction("reject")}>
                <XCircle className="size-4" />
                <Bilingual en="Reject" si="ප්‍රතික්ෂේප කරන්න" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Graphs overview + 14 raw-data sections via Tabs */}
      <Tabs defaultValue="graphs">
        <div ref={tabsScrollRef} onWheel={handleTabsWheel} className="no-scrollbar mb-4 overflow-x-auto">
          <TabsList variant="line" className="w-max min-w-full justify-start border-b border-border">
            <TabsTrigger value="graphs" className="gap-1.5 whitespace-nowrap">
              <ChartColumn className="size-3.5 shrink-0" aria-hidden="true" />
              <span className={lang === "si" ? "font-si" : "font-ui"}>
                <Bilingual en="Graphs" si="ප්‍රස්ථාර" />
              </span>
            </TabsTrigger>
            {SECTION_KEYS.map((key) => {
              const meta = SECTION_META[key];
              const Icon = meta.icon;
              return (
                <TabsTrigger key={key} value={key} className="gap-1.5 whitespace-nowrap">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold nums-tabular">
                    {meta.number}
                  </span>
                  <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className={lang === "si" ? "font-si" : "font-ui"}>
                    {lang === "si" ? meta.title.si : meta.title.en}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="graphs" className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <DivisionGraphs data={submission.data} />
        </TabsContent>

        {SECTION_KEYS.map((key) => (
          <TabsContent key={key} value={key} className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <SectionDetailViewer sectionKey={key} data={submission.data[key] as Record<string, unknown> | undefined} />
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "approve" && <Bilingual en="Approve this submission?" si="මෙම ඉදිරිපත් කිරීම අනුමත කරන්නද?" />}
              {pendingAction === "reject" && <Bilingual en="Reject this submission?" si="මෙම ඉදිරිපත් කිරීම ප්‍රතික්ෂේප කරන්නද?" />}
              {pendingAction === "request-revision" && (
                <Bilingual en="Request revision?" si="සංශෝධනයක් ඉල්ලන්නද?" />
              )}
            </DialogTitle>
          </DialogHeader>
          {pendingAction !== "approve" && (
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={lang === "si" ? "හේතුව විස්තර කරන්න..." : "Explain the reason..."}
              className="min-h-24"
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              <Bilingual en="Cancel" si="අවලංගු කරන්න" />
            </Button>
            <Button
              onClick={handleDecision}
              disabled={submitting || (pendingAction !== "approve" && !note.trim())}
              className="gap-2"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              <Bilingual en="Confirm" si="තහවුරු කරන්න" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
