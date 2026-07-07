import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { findRecord, ROLE_LABELS, USER_ROLE_MAP, type TableKey } from "@/lib/registrations";
import { deleteVerificationDocs } from "@/lib/verification-docs";

type Params = { params: Promise<{ id: string }> };

/* ── GET /api/registrations/[id]?role=gn|rs ─────────────────────────── */
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const tableKey = (new URL(req.url).searchParams.get("role") ?? "gn") as TableKey;

  const reg = await findRecord(id, tableKey);
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
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json() as {
    action: "approve" | "reject";
    role: TableKey;          // which table: "gn" | "rs"
    rejectionNote?: string;
  };

  const { action, role: tableKey, rejectionNote } = body;

  if (!tableKey || !["gn", "rs"].includes(tableKey)) {
    return NextResponse.json({ ok: false, message: "role must be 'gn' or 'rs'." }, { status: 400 });
  }

  const reg = await findRecord(id, tableKey);
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

    if (tableKey === "gn")  await prisma.economicDevelopmentOfficerRegistration.update({ where: { id }, data: updateData });
    else await prisma.regionalSecretaryRegistration.update({ where: { id }, data: updateData });

    // Delete the verification document files now that a decision has been made —
    // retaining ID images after review is not permitted.
    await deleteVerificationDocs(id, {
      front: (reg as any).verificationDocFrontPath,
      back:  (reg as any).verificationDocBackPath,
    });

    await prisma.auditLog.create({
      data: {
        action:      "Registration Rejected",
        description: `Rejected ${label} registration ${id} for ${reg.name} — ${rejectionNote.trim()}`,
        category:    "REGISTRATION",
        severity:    "INFO",
        userId:      session.userId,
        userName:    session.name,
      },
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

    await prisma.$transaction(async (tx) => {
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

      if (tableKey === "gn") await tx.economicDevelopmentOfficerRegistration.update({ where: { id }, data: approveData });
      else                   await tx.regionalSecretaryRegistration.update({ where: { id }, data: approveData });

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
    });

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
