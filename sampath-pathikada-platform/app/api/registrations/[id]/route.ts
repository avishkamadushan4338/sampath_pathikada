import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/prisma-client";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { findRecord, ROLE_LABELS, USER_ROLE_MAP, type TableKey } from "@/lib/registrations";
import { deleteVerificationDocs } from "@/lib/verification-docs";
import { verifyOrigin } from "@/lib/csrf";
import { logAudit } from "@/lib/audit-log";

type Params = { params: Promise<{ id: string }> };

/* ── GET /api/registrations/[id]?role=gn|ds ─────────────────────────── */
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const tableKey = (new URL(req.url).searchParams.get("role") ?? "gn") as TableKey;

  // ADMIN is scoped to their own division — SUPER_ADMIN is unrestricted. An ADMIN with no
  // division assigned gets nothing rather than falling through to an unscoped query.
  if (session.role !== "SUPER_ADMIN" && !session.dsDivision) {
    return NextResponse.json({ ok: false, message: "No division assigned to this account." }, { status: 403 });
  }
  // Returning the same 404 for "doesn't exist" and "exists but out of scope" avoids leaking which is which.
  const scopeDivision = session.role === "SUPER_ADMIN" ? null : session.dsDivision;
  const reg = await findRecord(id, tableKey, scopeDivision);
  if (!reg) return NextResponse.json({ ok: false, message: "Registration not found." }, { status: 404 });

  // Never serialize passwordHash or raw document paths to the client —
  // only expose presence flags; images are served through the authenticated
  // document-viewer route, never as raw paths.
  const { passwordHash, verificationDocFrontPath, verificationDocBackPath, ...safe } = reg as any;

  return NextResponse.json({
    ok: true,
    data: {
      ...safe,
      tableKey,
      hasDocFront: !!verificationDocFrontPath,
      hasDocBack: !!verificationDocBackPath,
    },
  });
}

/* ── PATCH /api/registrations/[id] ── approve or reject ─────────────────── */
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json() as {
    action: "approve" | "reject";
    role: TableKey;          // which table: "gn" | "ds"
    rejectionNote?: string;
  };

  const { action, role: tableKey, rejectionNote } = body;

  if (!tableKey || !["gn", "ad", "ds"].includes(tableKey)) {
    return NextResponse.json({ ok: false, message: "role must be 'gn', 'ad', or 'ds'." }, { status: 400 });
  }

  if (session.role !== "SUPER_ADMIN" && !session.dsDivision) {
    return NextResponse.json({ ok: false, message: "No division assigned to this account." }, { status: 403 });
  }
  const scopeDivision = session.role === "SUPER_ADMIN" ? null : session.dsDivision;
  const reg = await findRecord(id, tableKey, scopeDivision);
  if (!reg) return NextResponse.json({ ok: false, message: "Registration not found." }, { status: 404 });
  if (reg.status !== "PENDING") {
    return NextResponse.json({ ok: false, message: "This registration has already been processed." }, { status: 409 });
  }

  const label = ROLE_LABELS[tableKey];

  /* ── Reject ── */
  if (action === "reject") {
    if (!rejectionNote?.trim()) {
      return NextResponse.json({ ok: false, message: "Rejection note is required." }, { status: 400 });
    }

    const updateData = {
      status: "REJECTED" as const,
      rejectionNote: rejectionNote.trim(),
      verificationDocFrontPath: null,
      verificationDocBackPath: null,
      verificationDocDeletedAt: new Date(),
    };

    if (tableKey === "gn")      await prisma.economicDevelopmentOfficerRegistration.update({ where: { id }, data: updateData });
    else if (tableKey === "ad") await prisma.assistantDirectorPlanningRegistration.update({ where: { id }, data: updateData });
    else                        await prisma.divisionalSecretariatRegistration.update({ where: { id }, data: updateData });

    // Delete the verification document files now that a decision has been made —
    // retaining ID images after review is not permitted.
    await deleteVerificationDocs(id, {
      front: (reg as any).verificationDocFrontPath,
      back:  (reg as any).verificationDocBackPath,
    });

    logAudit({
      action:      "Registration Rejected",
      description: `Rejected ${label} registration ${id} for ${reg.name} — ${rejectionNote.trim()}`,
      category:    "REGISTRATION",
      severity:    "INFO",
      userId:      session.userId,
      userName:    session.name,
    });

    return NextResponse.json({ ok: true, message: `${label} registration rejected.` });
  }

  /* ── Approve ── */
  if (action === "approve") {
    // Guard: no duplicate user
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: reg.email }, ...(reg.nic ? [{ nic: reg.nic }] : [])] },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ ok: false, message: "A user account with this email/NIC already exists." }, { status: 409 });
    }

    // Guard: a division has exactly one active AD and one active DS — never two people holding
    // the same reviewer role for the same division at once, which would make "the AD"/"the DS"
    // for that division ambiguous. Deliberately scoped to ACTIVE users only: a previously
    // suspended/deactivated holder doesn't block approving their replacement. Economic
    // Development Officers (tableKey "gn") are intentionally excluded — many EDOs per GN division
    // is expected, not a conflict.
    //
    // Fast-path pre-check outside the transaction, for a quick error on the common
    // (non-concurrent) case — the real guarantee against two concurrent approvals both
    // passing this check is the re-check inside the Serializable transaction below.
    if (tableKey === "ad" || tableKey === "ds") {
      const existingHolder = await prisma.user.findFirst({
        where: { role: USER_ROLE_MAP[tableKey], dsDivision: reg.dsDivision, status: "ACTIVE" },
        select: { name: true, email: true },
      });
      if (existingHolder) {
        return NextResponse.json(
          {
            ok: false,
            message: `${existingHolder.name} (${existingHolder.email}) is already the active ${label} for this division. Reassign or deactivate them first.`,
          },
          { status: 409 }
        );
      }
    }

    try {
      await prisma.$transaction(
        async (tx) => {
          // Re-check inside the transaction: with Serializable isolation, if a concurrent
          // approval for the same division committed between our pre-check above and here,
          // MySQL will surface that as a serialization failure on commit — caught below.
          if (tableKey === "ad" || tableKey === "ds") {
            const holder = await tx.user.findFirst({
              where: { role: USER_ROLE_MAP[tableKey], dsDivision: reg.dsDivision, status: "ACTIVE" },
              select: { id: true },
            });
            if (holder) {
              throw new Error("ACTIVE_HOLDER_CONFLICT");
            }
          }

          // Create the user account — password already hashed from registration.
          // NOTE: verification doc paths are intentionally NEVER copied to User —
          // they are deleted immediately after this transaction commits (legal requirement).
          const newUser = await tx.user.create({
            data: {
              email:            reg.email,
              passwordHash:     reg.passwordHash,
              name:             reg.name,
              phone:            reg.phone,
              nic:              reg.nic,
              role:             USER_ROLE_MAP[tableKey],
              status:           "ACTIVE",
              district:         reg.district,
              dsDivision:       reg.dsDivision,
              gnDivision:       (reg as any).gnDivision ?? undefined,
              localGovt:        (reg as any).localGovt ?? undefined,
              electoral:        (reg as any).electoral ?? undefined,
              farmers:          (reg as any).farmers ?? undefined,
              eduZone:          (reg as any).eduZone ?? undefined,
              eduDiv:           (reg as any).eduDiv ?? undefined,
              mahaweli:         (reg as any).mahaweli ?? undefined,
              emailVerified:    true,
              mustResetPassword: false,
              createdById:      session.userId,
            },
          });

          // Mark registration approved
          const approveData = {
            status:      "APPROVED" as const,
            approvedAt:  new Date(),
            approvedById: session.userId,
            verificationDocFrontPath: null,
            verificationDocBackPath: null,
            verificationDocDeletedAt: new Date(),
          };

          if (tableKey === "gn")      await tx.economicDevelopmentOfficerRegistration.update({ where: { id }, data: approveData });
          else if (tableKey === "ad") await tx.assistantDirectorPlanningRegistration.update({ where: { id }, data: approveData });
          else                        await tx.divisionalSecretariatRegistration.update({ where: { id }, data: approveData });

          await tx.auditLog.create({
            data: {
              action:      "Registration Approved",
              description: `Approved ${label}: ${reg.name} (${reg.email}) → User ID ${newUser.id}`,
              category:    "REGISTRATION",
              severity:    "SUCCESS",
              userId:      session.userId,
              userName:    session.name,
              metadata:    { newUserId: newUser.id, table: tableKey, registrationId: id },
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch (err) {
      if (err instanceof Error && err.message === "ACTIVE_HOLDER_CONFLICT") {
        return NextResponse.json(
          { ok: false, message: `Another ${label} was approved for this division at the same time. Refresh and try again.` },
          { status: 409 }
        );
      }
      throw err;
    }

    // Only delete files after the transaction has committed successfully —
    // if approval failed/rolled back, the evidence files must still exist.
    await deleteVerificationDocs(id, {
      front: (reg as any).verificationDocFrontPath,
      back:  (reg as any).verificationDocBackPath,
    });

    return NextResponse.json({ ok: true, message: `${label} approved — user account created.` });
  }

  return NextResponse.json({ ok: false, message: "Invalid action. Use 'approve' or 'reject'." }, { status: 400 });
}
