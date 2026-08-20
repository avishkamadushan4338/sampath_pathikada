import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import path from "path";

// Regression coverage for the removal of the "Roles & Permissions" nav item and page. It was a
// client-only mock (hardcoded fake role/permission data, no API, no persistence — the schema has
// no Role/Permission model to persist against) that had been reachable from the live Super Admin
// sidebar for ~6 weeks with no backend. Production-readiness cleanup removed the page and its nav
// entry rather than leaving a dead link in a shipped admin surface.

const superAdminDir = path.join(__dirname);
const layoutSource = readFileSync(path.join(superAdminDir, "layout.tsx"), "utf8");

describe("super-admin layout — Roles & Permissions removal", () => {
  it("no longer links to /super-admin/roles-permissions in the nav config", () => {
    expect(layoutSource).not.toContain("roles-permissions");
  });

  it("no longer has a 'Roles & Permissions' nav label", () => {
    expect(layoutSource).not.toContain("Roles &amp; Permissions");
  });

  it("the roles-permissions page directory no longer exists", () => {
    expect(existsSync(path.join(superAdminDir, "roles-permissions"))).toBe(false);
  });

  it("still renders the other Control-group nav items (Audit Logs, Backups) — removal was scoped, not a full section wipe", () => {
    expect(layoutSource).toContain("/super-admin/audit-logs");
    expect(layoutSource).toContain("/super-admin/backups");
  });
});
