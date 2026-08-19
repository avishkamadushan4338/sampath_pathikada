import { SECTION_KEYS, type SectionKey } from "@/lib/types/submission";
import type { SubmissionStatus } from "@/lib/status-ui";

export type ReviewStage = "AD" | "DS";

/** Maps a reviewer's role to the review stage they own. Not a reviewer role → null. Centralizes
 *  the role↔stage mapping so API routes and UI don't hardcode it in multiple places. */
export function getStageForRole(role: string): ReviewStage | null {
  if (role === "ASSISTANT_DIRECTOR_PLANNING") return "AD";
  if (role === "DIVISIONAL_SECRETARIAT") return "DS";
  return null;
}

/* ── §Per-section review (AD, then DS) ────────────────────────────────────────
 * Pure functions only (no @/lib/db import) — this module is imported by both
 * server API routes and the client-side SectionForm.tsx, so the server guard
 * and the client-side lock UI always agree on the same rules. */

export type SectionDecision = "APPROVED" | "REVISION_NEEDED";

export interface SectionReview {
  status: SectionDecision;
  note: string | null;
  reviewedById: string;
  reviewedAt: string; // ISO 8601 — Json columns can't hold a Date
}

export type SectionReviews = Partial<Record<SectionKey, SectionReview>>;

/** "PENDING" is the absence of an entry — never stored explicitly. */
export type SectionReviewState = "PENDING" | SectionDecision;

/** Narrows the raw Json column (unknown shape — possibly SQL NULL, possibly a stale key from a
 *  renamed section, possibly hand-edited) to a trusted map. Drops anything that doesn't look
 *  like a valid entry rather than throwing — a corrupt/unrecognized entry must degrade to
 *  "pending", never be trusted as "approved". */
export function parseSectionReviews(raw: unknown): SectionReviews {
  if (raw == null || typeof raw !== "object") return {};
  const result: SectionReviews = {};
  for (const key of SECTION_KEYS) {
    const entry = (raw as Record<string, unknown>)[key];
    if (
      entry &&
      typeof entry === "object" &&
      ((entry as SectionReview).status === "APPROVED" || (entry as SectionReview).status === "REVISION_NEEDED") &&
      typeof (entry as SectionReview).reviewedById === "string" &&
      typeof (entry as SectionReview).reviewedAt === "string"
    ) {
      const note = (entry as SectionReview).note;
      result[key] = {
        status: (entry as SectionReview).status,
        note: typeof note === "string" ? note : null,
        reviewedById: (entry as SectionReview).reviewedById,
        reviewedAt: (entry as SectionReview).reviewedAt,
      };
    }
  }
  return result;
}

export function getSectionReviewState(reviews: SectionReviews, key: SectionKey): SectionReviewState {
  return reviews[key]?.status ?? "PENDING";
}

export interface DerivedStatus {
  status: "SUBMITTED" | "AD_APPROVED" | "APPROVED" | "REVISION_NEEDED";
  reviewStage: ReviewStage;
}

/** Derives the whole-submission status (and, since review is now two-stage, which stage owns the
 *  submission next) from the 15 section decisions plus the stage those decisions were made at.
 *  Only meaningful while the submission is under review — callers gate on `isUnderReview()`
 *  before calling this; a DRAFT or REJECTED submission has no section decisions to derive from.
 *  Iterates `SECTION_KEYS` (never `Object.keys(reviews)`) so a stale/unknown key can never
 *  satisfy "all approved", and a genuinely absent key always counts as pending.
 *
 *  A reviewer's REVISION_NEEDED flag never itself changes `reviewStage` — it stays with whichever
 *  stage raised it, which is exactly what lets a resubmit return to that same stage (AD-flagged →
 *  back to AD; DS-flagged → straight back to DS, since AD already cleared everything once). Full
 *  approval at the AD stage flips the stage to DS rather than completing the submission; full
 *  approval at the DS stage is the only path that reaches the terminal APPROVED status. */
export function deriveSubmissionStatus(reviews: SectionReviews, stage: ReviewStage): DerivedStatus {
  if (SECTION_KEYS.some((key) => reviews[key]?.status === "REVISION_NEEDED")) {
    return { status: "REVISION_NEEDED", reviewStage: stage };
  }
  if (SECTION_KEYS.every((key) => reviews[key]?.status === "APPROVED")) {
    return stage === "AD" ? { status: "AD_APPROVED", reviewStage: "DS" } : { status: "APPROVED", reviewStage: "DS" };
  }
  return { status: "SUBMITTED", reviewStage: stage };
}

/** Whether a submission is actively going through per-section review (as opposed to not yet
 *  submitted, or already fully decided one way or the other). */
export function isUnderReview(status: SubmissionStatus): boolean {
  return status === "SUBMITTED" || status === "AD_APPROVED" || status === "REVISION_NEEDED";
}

export type SectionEditability = "editable" | "revision-needed" | "locked-approved" | "locked-submitted";

/** The actual security boundary for per-section editing (enforced server-side in
 *  `my-submission/[year]/route.ts`; `SectionForm.tsx` calls this too, but only for UX — a
 *  disabled form, not the real lock). A section is editable only pre-submission (DRAFT),
 *  post-rejection (REJECTED, matching today's whole-submission behavior), or once a reviewer has
 *  specifically flagged *that* section for revision — never merely because some *other* section
 *  is still pending or flagged. AD_APPROVED (awaiting DS) behaves exactly like SUBMITTED (awaiting
 *  AD) here — either way the EDO can't touch a section until its own decision says otherwise. */
export function getSectionEditability(status: SubmissionStatus, reviews: SectionReviews, key: SectionKey): SectionEditability {
  if (status === "DRAFT" || status === "REJECTED") return "editable";
  if (status === "APPROVED") return "locked-approved";
  // SUBMITTED, AD_APPROVED, or REVISION_NEEDED — depends on this section's own decision.
  const state = getSectionReviewState(reviews, key);
  if (state === "APPROVED") return "locked-approved";
  if (state === "REVISION_NEEDED") return "revision-needed";
  return "locked-submitted";
}

export function countSectionReviews(reviews: SectionReviews): {
  approved: number;
  revisionNeeded: number;
  pending: number;
  total: number;
} {
  let approved = 0;
  let revisionNeeded = 0;
  for (const key of SECTION_KEYS) {
    const state = getSectionReviewState(reviews, key);
    if (state === "APPROVED") approved++;
    else if (state === "REVISION_NEEDED") revisionNeeded++;
  }
  return { approved, revisionNeeded, pending: SECTION_KEYS.length - approved - revisionNeeded, total: SECTION_KEYS.length };
}
