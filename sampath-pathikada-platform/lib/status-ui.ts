import { Inbox, CheckCircle2, XCircle, MessageSquareWarning, FileEdit, type LucideIcon } from "lucide-react";
import { dictionary } from "@/lib/i18n/dictionary";
import type { Translated } from "@/lib/i18n/types";

export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "AD_APPROVED" | "APPROVED" | "REJECTED" | "REVISION_NEEDED";

export const STATUS_LABEL: Record<SubmissionStatus, Translated> = {
  DRAFT: dictionary.statusDraft,
  SUBMITTED: dictionary.statusSubmitted,
  AD_APPROVED: dictionary.statusAdApproved,
  APPROVED: dictionary.statusApproved,
  REJECTED: dictionary.statusRejected,
  REVISION_NEEDED: dictionary.statusRevisionNeeded,
};

export const STATUS_ICON: Record<SubmissionStatus, LucideIcon> = {
  DRAFT: FileEdit,
  SUBMITTED: Inbox,
  AD_APPROVED: Inbox,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  REVISION_NEEDED: MessageSquareWarning,
};

/** CSS var name (without the leading --) driving each status's color everywhere it appears. */
export const STATUS_COLOR_VAR: Record<SubmissionStatus, string> = {
  DRAFT: "--muted-foreground",
  SUBMITTED: "--status-pending",
  AD_APPROVED: "--status-pending",
  APPROVED: "--status-approved",
  REJECTED: "--status-rejected",
  REVISION_NEEDED: "--status-pending",
};

export const STATUS_BADGE_CLASS: Record<SubmissionStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  SUBMITTED: "bg-[hsl(var(--status-pending))]/15 text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending))]/30",
  AD_APPROVED: "bg-[hsl(var(--status-pending))]/15 text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending))]/30",
  APPROVED: "bg-[hsl(var(--status-approved))]/15 text-[hsl(var(--status-approved))] border-[hsl(var(--status-approved))]/30",
  REJECTED: "bg-[hsl(var(--status-rejected))]/15 text-[hsl(var(--status-rejected))] border-[hsl(var(--status-rejected))]/30",
  REVISION_NEEDED: "bg-[hsl(var(--status-pending))]/15 text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending))]/30",
};

/** Sort weight for the GN-division roster — lower sorts first (needs-attention first). */
export const STATUS_SORT_WEIGHT: Record<SubmissionStatus, number> = {
  SUBMITTED: 0,
  AD_APPROVED: 1,
  REVISION_NEEDED: 2,
  REJECTED: 3,
  APPROVED: 4,
  DRAFT: 5,
};

/** Per-section review badge — a subset of the same three states, reusing the whole-submission
 *  color tokens above so a section's badge and the whole-submission badge read consistently. */
export type SectionReviewState = "PENDING" | "APPROVED" | "REVISION_NEEDED";

export const SECTION_REVIEW_LABEL: Record<SectionReviewState, Translated> = {
  PENDING: dictionary.sectionReviewPending,
  APPROVED: dictionary.statusApproved,
  REVISION_NEEDED: dictionary.statusRevisionNeeded,
};

export const SECTION_REVIEW_ICON: Record<SectionReviewState, LucideIcon> = {
  PENDING: Inbox,
  APPROVED: CheckCircle2,
  REVISION_NEEDED: MessageSquareWarning,
};

export const SECTION_REVIEW_BADGE_CLASS: Record<SectionReviewState, string> = {
  PENDING: "bg-muted text-muted-foreground border-border",
  APPROVED: STATUS_BADGE_CLASS.APPROVED,
  REVISION_NEEDED: STATUS_BADGE_CLASS.REVISION_NEEDED,
};
