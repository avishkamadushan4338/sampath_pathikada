"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Loader2, CheckCircle2, XCircle, MessageSquareWarning } from "lucide-react";
import { Bilingual } from "@/components/Bilingual";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionDataViewer } from "@/components/review/SectionDataViewer";
import { SECTION_KEYS } from "@/lib/types/submission";
import { SECTION_META } from "@/lib/i18n/section-meta";
import { DISTRICTS, GN_DIVISIONS } from "@/lib/registration-data";
import { toast } from "sonner";

interface SubmissionDetail {
  id: string;
  year: number;
  district: string;
  dsDivision: string;
  gnDivision: string;
  status: string;
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

export default function ReviewDetailPage({ params }: { params: Promise<{ divisionId: string }> }) {
  const { divisionId } = use(params);
  const { lang } = useLanguage();
  const router = useRouter();
  const { data: submission, isLoading, mutate } = useSWR(`/api/submissions/${divisionId}`, fetcher);

  const [pendingAction, setPendingAction] = useState<DecisionAction | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      router.push("/regional-secretary/review");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !submission) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const gn = GN_DIVISIONS.find((g) => g.id === submission.gnDivision);
  const district = DISTRICTS.find((d) => d.id === submission.district);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-fluid-2xl font-semibold text-primary">
            {gn ? (lang === "si" ? gn.si : gn.en) : submission.gnDivision}
          </h1>
          <p className="mt-1 text-fluid-sm text-muted-foreground">
            {district ? (lang === "si" ? district.si : district.en) : submission.district} ·{" "}
            {submission.submittedBy.name} · {submission.submittedBy.email} · {submission.year}
          </p>
        </div>
        <Badge className="w-fit">{submission.status}</Badge>
      </div>

      {submission.status === "SUBMITTED" && (
        <div className="mb-6 flex flex-wrap gap-2">
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

      <Accordion type="multiple" className="flex flex-col gap-2">
        {SECTION_KEYS.map((key) => {
          const meta = SECTION_META[key];
          return (
            <AccordionItem key={key} value={key} className="rounded-lg border border-border px-4">
              <AccordionTrigger className="text-fluid-base">
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold nums-tabular">
                    {meta.number}
                  </span>
                  {lang === "si" ? meta.title.si : meta.title.en}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="border-none shadow-none">
                  <CardContent className="px-0">
                    <SectionDataViewer data={submission.data[key] as Record<string, unknown> | undefined} />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

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
