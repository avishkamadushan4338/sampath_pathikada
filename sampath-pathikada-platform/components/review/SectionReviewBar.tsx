"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MessageSquareWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bilingual } from "@/components/Bilingual";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { dictionary } from "@/lib/i18n/dictionary";
import { toast } from "sonner";
import type { SectionKey } from "@/lib/types/submission";
import { getStageForRole, type SectionReview } from "@/lib/submission-review";
import { SECTION_REVIEW_BADGE_CLASS, SECTION_REVIEW_ICON, SECTION_REVIEW_LABEL, type SectionReviewState } from "@/lib/status-ui";

interface SectionReviewBarProps {
  submissionId: string;
  sectionKey: SectionKey;
  review: SectionReview | undefined;
  /** Who made `review`'s decision, resolved from `reviewedById` — undefined while unresolved
   *  (still loading) or if no decision has been recorded yet for this section. */
  reviewer?: { name: string; role: string };
  /** Whether the whole submission is currently under review — a DS can only decide a section
   *  while that's true; once fully APPROVED/REJECTED there's nothing left to decide. */
  canDecide: boolean;
  /** Receives the PATCH response's `data` (the updated submission row) so the caller can merge
   *  it into its own cache directly instead of re-fetching to pick up this same result. */
  onDecided: (data: unknown) => void;
}

type PendingAction = "approve" | "request-revision" | null;

export function SectionReviewBar({ submissionId, sectionKey, review, reviewer, canDecide, onDecided }: SectionReviewBarProps) {
  const { lang } = useLanguage();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const state: SectionReviewState = review?.status ?? "PENDING";
  const StateIcon = SECTION_REVIEW_ICON[state];

  async function handleConfirm() {
    if (!pendingAction) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/sections/${sectionKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: pendingAction, note: note.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json.message ?? "Failed to record decision.");
        return;
      }
      toast.success(lang === "si" ? "තීරණය සටහන් කරන ලදී" : "Decision recorded");
      setPendingAction(null);
      setNote("");
      onDecided(json.data);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={`gap-1.5 ${SECTION_REVIEW_BADGE_CLASS[state]}`}>
          <StateIcon className="size-3.5" aria-hidden="true" />
          {SECTION_REVIEW_LABEL[state][lang]}
        </Badge>
        {review && (
          <span className="text-fluid-xs text-muted-foreground">
            {reviewer && `${reviewer.name} (${getStageForRole(reviewer.role) ?? reviewer.role}) · `}
            {new Date(review.reviewedAt).toLocaleDateString(lang === "si" ? "si-LK" : "en-LK")}
          </span>
        )}
        {review?.note && state === "REVISION_NEEDED" && (
          <span className="text-fluid-xs text-muted-foreground">— {review.note}</span>
        )}
      </div>

      {canDecide && (
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" className="touch-target gap-1.5" onClick={() => setPendingAction("approve")}>
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            <Bilingual {...dictionary.approveSection} />
          </Button>
          <Button size="sm" variant="outline" className="touch-target gap-1.5" onClick={() => setPendingAction("request-revision")}>
            <MessageSquareWarning className="size-3.5" aria-hidden="true" />
            <Bilingual {...dictionary.requestSectionRevision} />
          </Button>
        </div>
      )}

      <Dialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "approve" ? (
                <Bilingual en="Approve this section?" si="මෙම කොටස අනුමත කරන්නද?" />
              ) : (
                <Bilingual en="Request revision for this section?" si="මෙම කොටසෙහි සංශෝධනයක් ඉල්ලන්නද?" />
              )}
            </DialogTitle>
          </DialogHeader>
          {pendingAction === "request-revision" && (
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={lang === "si" ? "හේතුව විස්තර කරන්න..." : "Explain what needs to change..."}
              className="min-h-24"
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              <Bilingual {...dictionary.cancel} />
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={submitting || (pendingAction === "request-revision" && !note.trim())}
              className="gap-2"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              <Bilingual {...dictionary.confirm} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
