import { describe, it, expect } from "vitest";
import { isOutOfScope, REVIEWER_ROLES } from "@/lib/review-scope";

const AD_SESSION = { role: "ASSISTANT_DIRECTOR_PLANNING", dsDivision: "ds-1" };
const DS_SESSION = { role: "DIVISIONAL_SECRETARIAT", dsDivision: "ds-1" };
const ADMIN_SESSION = { role: "ADMIN", dsDivision: "ds-1" };
const SUPER_ADMIN_SESSION = { role: "SUPER_ADMIN", dsDivision: null };

describe("REVIEWER_ROLES", () => {
  it("includes AD, DS, ADMIN, and SUPER_ADMIN", () => {
    expect(REVIEWER_ROLES).toEqual(
      expect.arrayContaining(["ASSISTANT_DIRECTOR_PLANNING", "DIVISIONAL_SECRETARIAT", "ADMIN", "SUPER_ADMIN"])
    );
  });
});

describe("isOutOfScope", () => {
  it("AD in their own division and stage is in scope", () => {
    expect(isOutOfScope(AD_SESSION, { dsDivision: "ds-1", reviewStage: "AD" })).toBe(false);
  });

  it("DS in their own division and stage is in scope", () => {
    expect(isOutOfScope(DS_SESSION, { dsDivision: "ds-1", reviewStage: "DS" })).toBe(false);
  });

  it("AD cannot see a submission already handed off to DS's stage, even in their own division", () => {
    expect(isOutOfScope(AD_SESSION, { dsDivision: "ds-1", reviewStage: "DS" })).toBe(true);
  });

  it("DS cannot see a submission still awaiting AD, even in their own division", () => {
    expect(isOutOfScope(DS_SESSION, { dsDivision: "ds-1", reviewStage: "AD" })).toBe(true);
  });

  it("AD cannot see a submission in a different DS division, regardless of stage", () => {
    expect(isOutOfScope(AD_SESSION, { dsDivision: "ds-2", reviewStage: "AD" })).toBe(true);
  });

  it("DS cannot see a submission in a different DS division, regardless of stage", () => {
    expect(isOutOfScope(DS_SESSION, { dsDivision: "ds-2", reviewStage: "DS" })).toBe(true);
  });

  it("ADMIN is scoped by dsDivision but bypasses the stage check", () => {
    expect(isOutOfScope(ADMIN_SESSION, { dsDivision: "ds-1", reviewStage: "AD" })).toBe(false);
    expect(isOutOfScope(ADMIN_SESSION, { dsDivision: "ds-1", reviewStage: "DS" })).toBe(false);
    expect(isOutOfScope(ADMIN_SESSION, { dsDivision: "ds-2", reviewStage: "AD" })).toBe(true);
  });

  it("SUPER_ADMIN is never out of scope, regardless of division or stage", () => {
    expect(isOutOfScope(SUPER_ADMIN_SESSION, { dsDivision: "ds-1", reviewStage: "AD" })).toBe(false);
    expect(isOutOfScope(SUPER_ADMIN_SESSION, { dsDivision: "ds-2", reviewStage: "DS" })).toBe(false);
  });
});
