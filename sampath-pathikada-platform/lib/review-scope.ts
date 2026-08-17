export const REVIEWER_ROLES = ["DIVISIONAL_SECRETARIAT", "ADMIN", "SUPER_ADMIN"];

/** A Divisional Secretariat or division-scoped Admin outside a submission's DS
 *  division must see the same 404 as a genuinely-missing submission — a 403
 *  would leak that a submission exists somewhere outside their authorization
 *  boundary. Shared by every route that reads or reviews a single submission
 *  (whole-submission and per-section) so this scoping rule can't drift between
 *  them. */
export function isOutOfScope(session: { role: string; dsDivision: string | null }, submissionDsDivision: string): boolean {
  return (
    (session.role === "DIVISIONAL_SECRETARIAT" || session.role === "ADMIN") &&
    submissionDsDivision !== session.dsDivision
  );
}
