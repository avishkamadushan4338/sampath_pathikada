import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

/* ─────────────────────────────────────────────────────────────────────────────
   Verification documents (NIC / Driving License / Passport images) are used
   ONLY to let a Super Admin verify an applicant's identity before approving
   their registration. Retaining these images afterward is not permitted, so
   they are written to a temporary, non-public folder and hard-deleted the
   instant an approve/reject decision is made (see deleteVerificationDocs).
──────────────────────────────────────────────────────────────────────────── */

export type DocSide = "front" | "back";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "verification-uploads");
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

export class InvalidDocumentError extends Error {}

function extForFormat(format: string): string {
  return format === "jpeg" ? "jpg" : format;
}

function mimeForExt(ext: string): string {
  if (ext === "jpg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "application/octet-stream";
}

function registrationDir(registrationId: string): string {
  return path.join(STORAGE_ROOT, registrationId);
}

/**
 * Validates, re-encodes (stripping EXIF/GPS metadata), and writes an uploaded
 * document image to disk. Returns the relative path to persist in the DB.
 * Throws InvalidDocumentError for oversized files or unsupported/undetectable formats.
 */
export async function saveVerificationDoc(
  registrationId: string,
  side: DocSide,
  file: File
): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new InvalidDocumentError(`${side} image must be 5MB or smaller.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(buffer).metadata().catch(() => null);

  if (!meta?.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw new InvalidDocumentError(`${side} image must be a JPG, PNG, or WEBP file.`);
  }

  const ext = extForFormat(meta.format);
  const processed = await sharp(buffer)
    .rotate() // apply EXIF orientation, then strip metadata (default sharp behaviour)
    .resize({ width: 2000, withoutEnlargement: true })
    .toFormat(meta.format as "jpeg" | "png" | "webp", meta.format === "jpeg" ? { quality: 85 } : undefined)
    .toBuffer();

  const dir = registrationDir(registrationId);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${side}.${ext}`;
  await fs.writeFile(path.join(dir, filename), processed);

  return `${registrationId}/${filename}`;
}

/** Resolves a DB-stored relative path to an absolute filesystem path. Server-side only. */
export function resolveVerificationDocPath(relativePath: string): string {
  const resolved = path.join(STORAGE_ROOT, relativePath);
  if (!resolved.startsWith(STORAGE_ROOT)) {
    throw new InvalidDocumentError("Invalid document path.");
  }
  return resolved;
}

export function mimeTypeForPath(relativePath: string): string {
  return mimeForExt(path.extname(relativePath).slice(1).toLowerCase());
}

/**
 * Best-effort deletion of a registration's verification document files.
 * Never throws — a filesystem issue must never block an approve/reject decision.
 */
export async function deleteVerificationDocs(
  registrationId: string,
  paths: { front: string | null; back: string | null }
): Promise<void> {
  const dir = registrationDir(registrationId);

  for (const relativePath of [paths.front, paths.back]) {
    if (!relativePath) continue;
    try {
      await fs.unlink(resolveVerificationDocPath(relativePath));
    } catch (err: any) {
      if (err?.code !== "ENOENT") {
        console.error(`[verification-docs] failed to delete ${relativePath}:`, err);
      }
    }
  }

  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (err) {
    console.error(`[verification-docs] failed to clean up directory ${dir}:`, err);
  }
}

/** Cleans up partially-written files if registration creation fails after upload. */
export async function cleanupPartialUpload(registrationId: string): Promise<void> {
  try {
    await fs.rm(registrationDir(registrationId), { recursive: true, force: true });
  } catch (err) {
    console.error(`[verification-docs] failed to clean up partial upload ${registrationId}:`, err);
  }
}
