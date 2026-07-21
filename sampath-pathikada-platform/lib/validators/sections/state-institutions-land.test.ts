import { describe, it, expect } from "vitest";
import { stateInstitutionsLandSchemaStrict } from "@/lib/validators/sections/state-institutions-land";

describe("stateInstitutionsLandSchemaStrict", () => {
  it("defaults array fields to empty when omitted", () => {
    const result = stateInstitutionsLandSchemaStrict.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stateInstitutions).toEqual([]);
      expect(result.data.illegalStructures).toEqual([]);
      expect(result.data.developmentProjects).toEqual([]);
    }
  });

  it("rejects a development project row missing a required field", () => {
    const result = stateInstitutionsLandSchemaStrict.safeParse({
      developmentProjects: [{ name: "New Bridge", status: "ongoing" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a fully populated payload", () => {
    const result = stateInstitutionsLandSchemaStrict.safeParse({
      stateInstitutions: [{ name: "Divisional Secretariat Office", address: "Main Street, Galle" }],
      illegalStructures: [{ description: "Unauthorized kiosk", location: "Near the bus stand" }],
      developmentProjects: [{ name: "New Bridge", status: "ongoing", location: "River crossing" }],
    });
    expect(result.success).toBe(true);
  });
});
