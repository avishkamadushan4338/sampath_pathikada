import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { GN_DIVISIONS } from "@/lib/registration-data";
import { buildProfileCsvBlocks } from "@/lib/analytics/profile-csv";
import { toCsvTextMultiBlock } from "@/lib/analytics/csv-export";
import type { SubmissionData } from "@/lib/types/submission";

const ALLOWED_ROLES = ["ASSISTANT_DIRECTOR_PLANNING", "DIVISIONAL_SECRETARIAT", "ADMIN", "SUPER_ADMIN"];

/* ── GET /api/division-profile/csv?gnDivision=<id> ── full-detail CSV download of one GN
   division's latest approved record — every section, every listed row (not just counts), for
   whoever can already view that profile via GET /api/division-profile. Same auth/scope model,
   copied verbatim so the two routes can never drift apart on who can see what. ──────────────── */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const gnDivision = new URL(req.url).searchParams.get("gnDivision");
  if (!gnDivision) {
    return NextResponse.json({ ok: false, message: "gnDivision is required." }, { status: 400 });
  }

  const gn = GN_DIVISIONS.find((g) => g.id === gnDivision);

  const outOfScope =
    !gn ||
    ((session.role === "ASSISTANT_DIRECTOR_PLANNING" || session.role === "DIVISIONAL_SECRETARIAT" || session.role === "ADMIN") && gn.dsId !== session.dsDivision);
  if (outOfScope) {
    return NextResponse.json({ ok: false, message: "Unknown GN division." }, { status: 404 });
  }

  const profile = await prisma.divisionProfile.findUnique({
    where: { gnDivision },
    select: { gnDivision: true, data: true, year: true, approvedAt: true },
  });

  if (!profile) {
    return NextResponse.json({ ok: false, message: "No approved record for this GN division yet." }, { status: 404 });
  }

  const blocks = buildProfileCsvBlocks(profile.data as SubmissionData, "en");
  const csvText = toCsvTextMultiBlock(blocks);

  // UTF-8 BOM so Excel correctly detects encoding for Sinhala names embedded in the data.
  const buffer = Buffer.concat([Buffer.from("﻿", "utf-8"), Buffer.from(csvText, "utf-8")]);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${gnDivision}-${profile.year}-profile.csv"`,
    },
  });
}
