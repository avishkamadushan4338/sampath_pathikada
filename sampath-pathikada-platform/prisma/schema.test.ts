import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import path from "path";

// Regression coverage for the removal of the unused AdminInvite model (production-readiness
// cleanup: it had a real DB table but zero application code, UI, API, or test references —
// admin accounts are created directly via POST /api/users instead). These guard against the
// model, its migration, or the empty lib/permissions.ts stub silently reappearing.

const schemaPath = path.join(__dirname, "schema.prisma");
const schema = readFileSync(schemaPath, "utf8");

describe("prisma/schema.prisma — AdminInvite removal", () => {
  it("no longer defines an AdminInvite model", () => {
    expect(schema).not.toMatch(/model\s+AdminInvite\b/);
  });

  it("no longer maps an admin_invites table", () => {
    expect(schema).not.toContain("admin_invites");
  });

  it("has a DropTable migration for admin_invites", () => {
    const migrationsDir = path.join(__dirname, "migrations");
    const dropMigration = path.join(migrationsDir, "20260820061130_drop_admin_invite_model", "migration.sql");
    expect(existsSync(dropMigration)).toBe(true);
    const sql = readFileSync(dropMigration, "utf8");
    expect(sql).toMatch(/DROP TABLE `admin_invites`/);
  });
});

describe("lib/permissions.ts removal", () => {
  it("the empty, unused permissions stub file no longer exists", () => {
    const permissionsPath = path.join(__dirname, "..", "lib", "permissions.ts");
    expect(existsSync(permissionsPath)).toBe(false);
  });
});
