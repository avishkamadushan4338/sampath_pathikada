import { getStageForRole } from "@/lib/submission-review";

export const REVIEWER_ROLES = ["ASSISTANT_DIRECTOR_PLANNING", "DIVISIONAL_SECRETARIAT", "ADMIN", "SUPER_ADMIN"];

/** An Assistant Director Planning, Divisional Secretariat, or division-scoped Admin outside a
 *  submission's DS division must see the same 404 as a genuinely-missing submission — a 403
 *  would leak that a submission exists somewhere outside their authorization boundary. Shared by
 *  every route that reads or reviews a single submission (whole-submission and per-section) so
 *  this scoping rule can't drift between them.
 *
 *  Beyond dsDivision, AD and DS are also scoped to their own review stage: once AD clears every
 *  section the submission moves into DS's queue, and AD should no longer be able to open it (nor
 *  should DS be able to open a submission still awaiting AD) — same leak-avoidance reasoning.
 *  ADMIN/SUPER_ADMIN bypass the stage check, matching their existing "see everything in scope"
 *  behavior. */
export function isOutOfScope(
  session: { role: string; dsDivision: string | null },
  submission: { dsDivision: string; reviewStage: string }
): boolean {
  if (
    (session.role === "ASSISTANT_DIRECTOR_PLANNING" || session.role === "DIVISIONAL_SECRETARIAT" || session.role === "ADMIN") &&
    submission.dsDivision !== session.dsDivision
  ) {
    return true;
  }
  const ownStage = getStageForRole(session.role);
  if (ownStage && submission.reviewStage !== ownStage) return true;
  return false;
}
