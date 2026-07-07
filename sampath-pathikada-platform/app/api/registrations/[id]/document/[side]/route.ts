import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { getSession } from "@/lib/auth";
import { findRecord, type TableKey } from "@/lib/registrations";
import { resolveVerificationDocPath, mimeTypeForPath } from "@/lib/verification-docs";

type Params = { params: Promise<{ id: string; side: string }> };

/* ── GET /api/registrations/[id]/document/[side]?role=gn|rs ──────────────────
   Super-Admin/Admin-only streaming route for verification document images.
   Never exposes the raw filesystem path — the client only ever sends id+side,
   and this route looks up the real (temporary) path from the DB itself.
──────────────────────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id, side } = await params;
  if (side !== "front" && side !== "back") {
    return NextResponse.json({ ok: false, message: "Invalid side." }, { status: 400 });
  }

  const tableKey = (new URL(req.url).searchParams.get("role") ?? "gn") as TableKey;
  if (!["gn", "rs"].includes(tableKey)) {
    return NextResponse.json({ ok: false, message: "role must be 'gn' or 'rs'." }, { status: 400 });
  }

  const reg = await findRecord(id, tableKey);
  if (!reg) return NextResponse.json({ ok: false, message: "Not found." }, { status: 404 });

  const relativePath = side === "front"
    ? (reg as any).verificationDocFrontPath
    : (reg as any).verificationDocBackPath;

  if (!relativePath) {
    return NextResponse.json({ ok: false, message: "Not found." }, { status: 404 });
  }

  try {
    const absPath = resolveVerificationDocPath(relativePath);
    const buffer = await fs.readFile(absPath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeTypeForPath(relativePath),
        "Cache-Control": "no-store",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Not found." }, { status: 404 });
  }
}
