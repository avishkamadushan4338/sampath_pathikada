import { Inbox, CheckCircle2, XCircle, MessageSquareWarning, FileEdit, type LucideIcon } from "lucide-react";
import { dictionary } from "@/lib/i18n/dictionary";
import type { Translated } from "@/lib/i18n/types";

export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "REVISION_NEEDED";

export const STATUS_LABEL: Record<SubmissionStatus, Translated> = {
  DRAFT: dictionary.statusDraft,
  SUBMITTED: dictionary.statusSubmitted,
  APPROVED: dictionary.statusApproved,
  REJECTED: dictionary.statusRejected,
  REVISION_NEEDED: dictionary.statusRevisionNeeded,
};

export const STATUS_ICON: Record<SubmissionStatus, LucideIcon> = {
  DRAFT: FileEdit,
  SUBMITTED: Inbox,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  REVISION_NEEDED: MessageSquareWarning,
};

/** CSS var name (without the leading --) driving each status's color everywhere it appears. */
export const STATUS_COLOR_VAR: Record<SubmissionStatus, string> = {
  DRAFT: "--muted-foreground",
  SUBMITTED: "--status-pending",
  APPROVED: "--status-approved",
  REJECTED: "--status-rejected",
  REVISION_NEEDED: "--status-pending",
};

export const STATUS_BADGE_CLASS: Record<SubmissionStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  SUBMITTED: "bg-[hsl(var(--status-pending))]/15 text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending))]/30",
  APPROVED: "bg-[hsl(var(--status-approved))]/15 text-[hsl(var(--status-approved))] border-[hsl(var(--status-approved))]/30",
  REJECTED: "bg-[hsl(var(--status-rejected))]/15 text-[hsl(var(--status-rejected))] border-[hsl(var(--status-rejected))]/30",
  REVISION_NEEDED: "bg-[hsl(var(--status-pending))]/15 text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending))]/30",
};

/** Sort weight for the GN-division roster — lower sorts first (needs-attention first). */
export const STATUS_SORT_WEIGHT: Record<SubmissionStatus, number> = {
  SUBMITTED: 0,
  REVISION_NEEDED: 1,
  REJECTED: 2,
  APPROVED: 3,
  DRAFT: 4,
};
