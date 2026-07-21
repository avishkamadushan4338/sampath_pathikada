import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, getSession } from "@/lib/auth";
import { type TableKey } from "@/lib/registrations";
import { saveVerificationDoc, deleteVerificationDocs, cleanupPartialUpload, InvalidDocumentError } from "@/lib/verification-docs";
import { verifyOrigin } from "@/lib/csrf";

/* ─── Role → table mapping ───────────────────────────────────────────────────
   Incoming `role` values (from the public form):
     "economic-development-officer" | "divisional-secretariat"
   Normalised to these keys which map to Prisma delegates.
──────────────────────────────────────────────────────────────────────────── */

function resolveTable(role: string): TableKey | null {
  const r = role.toLowerCase().replace(/_/g, "-");
  if (r === "economic-development-officer") return "gn";
  if (r === "divisional-secretariat")        return "ds";
  return null;
}

const TABLE_LABELS: Record<TableKey, string> = {
  gn:  "Economic Development Officer",
  ds:  "Divisional Secretariat",
};

const VALID_DOC_TYPES = new Set(["NIC", "DRIVING_LICENSE", "PASSPORT"]);

/* ─── Stale-upload cleanup ────────────────────────────────────────────────────
   No cron/job runner exists in this project, so pending registrations whose
   verification documents were never reviewed are opportunistically cleaned up
   whenever a Super Admin loads the registrations list (throttled to at most
   once an hour per server instance).
──────────────────────────────────────────────────────────────────────────── */
const RETENTION_DAYS = Number(process.env.VERIFICATION_DOC_RETENTION_DAYS ?? 14);
let lastStaleCleanupAt = 0;

async function cleanupStaleVerificationDocs() {
  const now = Date.now();
  if (now - lastStaleCleanupAt < 60 * 60 * 1000) return; // throttle: once per hour
  lastStaleCleanupAt = now;

  const cutoff = new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const where = {
    status: "PENDING" as const,
    submittedAt: { lt: cutoff },
    OR: [{ verificationDocFrontPath: { not: null } }, { verificationDocBackPath: { not: null } }],
  };

  const [staleGn, staleDs] = await Promise.all([
    prisma.economicDevelopmentOfficerRegistration.findMany({ where, select: { id: true, verificationDocFrontPath: true, verificationDocBackPath: true } }),
    prisma.divisionalSecretariatRegistration.findMany({ where, select: { id: true, verificationDocFrontPath: true, verificationDocBackPath: true } }),
  ]);

  await Promise.all(
    [...staleGn, ...staleDs].map(row =>
      deleteVerificationDocs(row.id, { front: row.verificationDocFrontPath, back: row.verificationDocBackPath })
    )
  );

  if (staleGn.length) {
    await prisma.economicDevelopmentOfficerRegistration.updateMany({
      where: { id: { in: staleGn.map(r => r.id) } },
      data: { verificationDocFrontPath: null, verificationDocBackPath: null, verificationDocDeletedAt: new Date() },
    });
  }
  if (staleDs.length) {
    await prisma.divisionalSecretariatRegistration.updateMany({
      where: { id: { in: staleDs.map(r => r.id) } },
      data: { verificationDocFrontPath: null, verificationDocBackPath: null, verificationDocDeletedAt: new Date() },
    });
  }
}

/* ── GET /api/registrations ── super-admin list (all three tables) ─────────── */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") ?? "all";
  const tableParam  = searchParams.get("role")   ?? "all";   // "gn" | "ds" | "all"
  const search      = searchParams.get("search") ?? "";
  const page        = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const pageSize    = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const countsOnly  = searchParams.get("countsOnly") === "true";

  const statusFilter  = statusParam !== "all" ? statusParam.toUpperCase() as any : undefined;
  const searchFilter  = search ? {
    OR: [
      { name:     { contains: search } },
      { email:    { contains: search } },
      { nic:      { contains: search } },
      { district: { contains: search } },
    ],
  } : {};

  const baseWhere = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...searchFilter,
  };

  // Lightweight mode: return status counts (total/pending/approved/rejected) via
  // one round trip using indexed COUNT queries instead of transferring full rows.
  if (countsOnly) {
    const whereFor = (status?: "PENDING" | "APPROVED" | "REJECTED") => ({
      ...(status ? { status } : {}),
      ...searchFilter,
    });
    const countBoth = (where: object) => Promise.all([
      prisma.economicDevelopmentOfficerRegistration.count({ where }),
      prisma.divisionalSecretariatRegistration.count({ where }),
    ]).then(([a, b]) => a + b);

    const [total, pending, approved, rejected] = await Promise.all([
      countBoth(whereFor()),
      countBoth(whereFor("PENDING")),
      countBoth(whereFor("APPROVED")),
      countBoth(whereFor("REJECTED")),
    ]);

    return NextResponse.json({ ok: true, counts: { total, pending, approved, rejected } });
  }

  await cleanupStaleVerificationDocs().catch(err => console.error("[stale-doc-cleanup]", err));

  const baseSelect = {
    id: true, name: true, email: true, phone: true,
    nic: true, district: true, dsDivision: true,
    status: true, rejectionNote: true, submittedAt: true, approvedAt: true,
    approvedBy: { select: { name: true } },
    verificationDocType: true,
    verificationDocFrontPath: true,
    verificationDocBackPath: true,
  } as const;

  // Query only the requested table(s) in parallel
  type GnRow = Awaited<ReturnType<typeof prisma.economicDevelopmentOfficerRegistration.findMany<{ where: typeof baseWhere; select: typeof baseSelect & { gnDivision: true } }>>>;
  type DsRow = Awaited<ReturnType<typeof prisma.divisionalSecretariatRegistration.findMany<{ where: typeof baseWhere; select: typeof baseSelect }>>>;

  // Bound each table's query to the rows we could possibly need (page * pageSize from
  // each side, worst case), instead of pulling every matching row before merging/slicing.
  const mergedLimit = page * pageSize;

  const [gnRows, dsRows, gnTotal, dsTotal] = await Promise.all([
    (tableParam === "all" || tableParam === "gn")
      ? prisma.economicDevelopmentOfficerRegistration.findMany({
          where: baseWhere,
          orderBy: { submittedAt: "desc" },
          take: mergedLimit,
          select: { ...baseSelect, gnDivision: true },
        })
      : ([] as GnRow),
    (tableParam === "all" || tableParam === "ds")
      ? prisma.divisionalSecretariatRegistration.findMany({
          where: baseWhere,
          orderBy: { submittedAt: "desc" },
          take: mergedLimit,
          select: baseSelect,
        })
      : ([] as DsRow),
    (tableParam === "all" || tableParam === "gn")
      ? prisma.economicDevelopmentOfficerRegistration.count({ where: baseWhere })
      : 0,
    (tableParam === "all" || tableParam === "ds")
      ? prisma.divisionalSecretariatRegistration.count({ where: baseWhere })
      : 0,
  ]);

  // Tag each row with its role and merge — never serialize raw document paths to the client,
  // only presence flags; images are served through the authenticated document-viewer route.
  const withDocFlags = (verificationDocFrontPath: string | null, verificationDocBackPath: string | null) => ({
    hasDocFront: !!verificationDocFrontPath,
    hasDocBack:  !!verificationDocBackPath,
  });

  const gnMapped = gnRows.map(({ verificationDocFrontPath, verificationDocBackPath, ...r }) => ({
    ...r, ...withDocFlags(verificationDocFrontPath, verificationDocBackPath),
    role: "economic-development-officer" as const, roleLabel: "Economic Development Officer",
  }));
  const dsMapped = dsRows.map(({ verificationDocFrontPath, verificationDocBackPath, ...r }) => ({
    ...r, ...withDocFlags(verificationDocFrontPath, verificationDocBackPath),
    role: "divisional-secretariat" as const, roleLabel: "Divisional Secretariat",
  }));

  const all: Array<typeof gnMapped[number] | typeof dsMapped[number]> = [...gnMapped, ...dsMapped];
  all.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  // Merge-then-slice pagination: each side already contributed at most `mergedLimit`
  // rows (ordered), so slicing the merged, sorted set yields the correct page.
  const total    = gnTotal + dsTotal;
  const pageData = all.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({ ok: true, data: pageData, total, page, pageSize });
}

/* ── POST /api/registrations ── public self-registration (multipart/form-data) ──
   Text fields + verification document images (docType, docFront, docBack)
   arrive together in one multipart request.
──────────────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  let registrationId: string | undefined;

  try {
    const form = await req.formData();
    const str = (key: string) => (form.get(key) as string | null)?.toString() ?? "";

    const firstName = str("firstName"), lastName = str("lastName"), name = str("name");
    const email = str("email"), phone = str("phone"), nic = str("nic"), password = str("password");
    const role = str("role"), district = str("district"), dsDivision = str("dsDivision");
    const gnDivision = str("gnDivision");
    const localGovt = str("localGovt"), electoral = str("electoral"), farmers = str("farmers");
    const eduZone = str("eduZone"), eduDiv = str("eduDiv"), mahaweli = str("mahaweli");
    const docType = str("docType");
    const docFront = form.get("docFront") as File | null;
    const docBack  = form.get("docBack") as File | null;

    // Validate required common fields
    if (!name || !email || !phone || !nic || !password || !role || !district || !dsDivision) {
      return NextResponse.json({ ok: false, message: "All required fields must be filled." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ ok: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }

    const tableKey = resolveTable(role);
    if (!tableKey) {
      return NextResponse.json({ ok: false, message: "Invalid role. Must be economic-development-officer or divisional-secretariat." }, { status: 400 });
    }

    // Economic Development Officers must provide gnDivision
    if (tableKey === "gn" && !gnDivision?.trim()) {
      return NextResponse.json({ ok: false, message: "GN Division is required for this registration type." }, { status: 400 });
    }

    // Validate verification document
    if (!VALID_DOC_TYPES.has(docType)) {
      return NextResponse.json({ ok: false, message: "Please select a valid document type (NIC, Driving License, or Passport)." }, { status: 400 });
    }
    if (!docFront || docFront.size === 0) {
      return NextResponse.json({ ok: false, message: "A front-side document image is required." }, { status: 400 });
    }
    if (docType !== "PASSPORT" && (!docBack || docBack.size === 0)) {
      return NextResponse.json({ ok: false, message: "A back-side document image is required for NIC and Driving License." }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const nicTrimmed = nic.trim();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined;

    // Duplicate check across both tables + users table
    const [gnDup, dsDup, userDup] = await Promise.all([
      prisma.economicDevelopmentOfficerRegistration.findFirst({
        where: { OR: [{ email: emailLower }, { nic: nicTrimmed }], status: { not: "REJECTED" } },
        select: { id: true, email: true },
      }),
      prisma.divisionalSecretariatRegistration.findFirst({
        where: { OR: [{ email: emailLower }, { nic: nicTrimmed }], status: { not: "REJECTED" } },
        select: { id: true, email: true },
      }),
      prisma.user.findFirst({
        where: { OR: [{ email: emailLower }, { nic: nicTrimmed }] },
        select: { id: true },
      }),
    ]);

    if (gnDup || dsDup) {
      return NextResponse.json({ ok: false, message: "A registration with this email or NIC already exists and is pending or approved." }, { status: 409 });
    }
    if (userDup) {
      return NextResponse.json({ ok: false, message: "An account with this email or NIC already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const commonData = {
      firstName:       firstName?.trim() || null,
      lastName:        lastName?.trim()  || null,
      name:            name.trim(),
      email:           emailLower,
      phone:           phone.trim(),
      nic:             nicTrimmed,
      passwordHash,
      district:        district.trim(),
      dsDivision:      dsDivision.trim(),
      submittedFromIp: ip ?? null,
      verificationDocType: docType as "NIC" | "DRIVING_LICENSE" | "PASSPORT",
    };

    // 1. Create the DB row first (doc paths null) to get a real id for the file path.
    if (tableKey === "gn") {
      const rec = await prisma.economicDevelopmentOfficerRegistration.create({
        data: {
          ...commonData,
          gnDivision: gnDivision!.trim(),
          localGovt:  localGovt?.trim()  || null,
          electoral:  electoral?.trim()  || null,
          farmers:    farmers?.trim()    || null,
          eduZone:    eduZone?.trim()    || null,
          eduDiv:     eduDiv?.trim()     || null,
          mahaweli:   mahaweli?.trim()   || null,
        },
      });
      registrationId = rec.id;
    } else {
      const rec = await prisma.divisionalSecretariatRegistration.create({ data: commonData });
      registrationId = rec.id;
    }

    // 2. Write document files to disk, then persist their relative paths.
    try {
      const frontPath = await saveVerificationDoc(registrationId, "front", docFront);
      const backPath  = docBack && docBack.size > 0 ? await saveVerificationDoc(registrationId, "back", docBack) : null;

      const docUpdate = { verificationDocFrontPath: frontPath, verificationDocBackPath: backPath };
      if (tableKey === "gn") await prisma.economicDevelopmentOfficerRegistration.update({ where: { id: registrationId }, data: docUpdate });
      else                   await prisma.divisionalSecretariatRegistration.update({ where: { id: registrationId }, data: docUpdate });
    } catch (docErr) {
      // Roll back: remove the just-created row and any partially-written files.
      // Prisma transactions can't span filesystem writes, so this is a manual two-phase cleanup.
      await cleanupPartialUpload(registrationId);
      if (tableKey === "gn") await prisma.economicDevelopmentOfficerRegistration.delete({ where: { id: registrationId } }).catch(() => {});
      else                   await prisma.divisionalSecretariatRegistration.delete({ where: { id: registrationId } }).catch(() => {});

      const message = docErr instanceof InvalidDocumentError ? docErr.message : "Failed to process the uploaded document image.";
      return NextResponse.json({ ok: false, message }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        action:      "Registration Submitted",
        description: `New ${TABLE_LABELS[tableKey]} registration: ${name.trim()} (${emailLower})`,
        category:    "REGISTRATION",
        severity:    "INFO",
        userName:    name.trim(),
        userIp:      ip ?? null,
        metadata:    { table: tableKey, id: registrationId },
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Registration submitted successfully. You will be notified once reviewed.",
      id:   registrationId,
      role: tableKey,
    }, { status: 201 });

  } catch (err) {
    console.error("[POST /api/registrations]", err);
    return NextResponse.json({ ok: false, message: "An unexpected error occurred." }, { status: 500 });
  }
}
