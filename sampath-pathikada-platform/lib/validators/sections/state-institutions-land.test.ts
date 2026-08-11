import { describe, it, expect } from "vitest";
import {
  stateInstitutionsLandSchemaStrict,
  stateInstitutionsLandSchemaPartial,
} from "@/lib/validators/sections/state-institutions-land";

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
      developmentProjects: [{ projectName: "New Bridge", owningInstitution: "RDA" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an illegal structure row missing a required field", () => {
    const result = stateInstitutionsLandSchemaStrict.safeParse({
      illegalStructures: [{ buildingName: "Kiosk", purposeUsed: "Shop" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a fully populated payload", () => {
    const result = stateInstitutionsLandSchemaStrict.safeParse({
      stateInstitutions: [{ name: "Divisional Secretariat Office", address: "Main Street, Galle" }],
      illegalStructures: [
        {
          buildingName: "Unauthorized kiosk",
          purposeUsed: "Retail shop",
          usable: "yes",
          owningInstitution: "Galle Municipal Council",
        },
      ],
      developmentProjects: [
        {
          projectName: "New Bridge",
          owningInstitution: "Road Development Authority",
          reasonForHalt: "Funding delay",
          currentStatus: "Awaiting funds",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("stateInstitutionsLandSchemaPartial", () => {
  it("accepts an empty object (fresh draft)", () => {
    const result = stateInstitutionsLandSchemaPartial.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts untouched directories (no rows added yet)", () => {
    const result = stateInstitutionsLandSchemaPartial.safeParse({
      stateInstitutions: [],
      illegalStructures: [],
      developmentProjects: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a state institution row added via the UI still left blank — surfaces a required error without blocking the draft save (SectionForm saves regardless)", () => {
    const result = stateInstitutionsLandSchemaPartial.safeParse({
      stateInstitutions: [{ name: "", address: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a state institution row once its required fields are filled in", () => {
    const result = stateInstitutionsLandSchemaPartial.safeParse({
      stateInstitutions: [{ name: "Divisional Secretariat Office", address: "Main Street, Galle" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an illegal structure row added via the UI still left blank", () => {
    const result = stateInstitutionsLandSchemaPartial.safeParse({
      illegalStructures: [{ buildingName: "", purposeUsed: "", usable: undefined, owningInstitution: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an illegal structure row once its required fields are filled in", () => {
    const result = stateInstitutionsLandSchemaPartial.safeParse({
      illegalStructures: [
        {
          buildingName: "Unauthorized kiosk",
          purposeUsed: "Retail shop",
          usable: "yes",
          owningInstitution: "Galle Municipal Council",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a development project row added via the UI still left blank", () => {
    const result = stateInstitutionsLandSchemaPartial.safeParse({
      developmentProjects: [{ projectName: "New Bridge", owningInstitution: "RDA" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a development project row once its required fields are filled in", () => {
    const result = stateInstitutionsLandSchemaPartial.safeParse({
      developmentProjects: [
        {
          projectName: "New Bridge",
          owningInstitution: "Road Development Authority",
          reasonForHalt: "Funding delay",
          currentStatus: "Awaiting funds",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a genuinely invalid usable enum value", () => {
    const result = stateInstitutionsLandSchemaPartial.safeParse({
      illegalStructures: [
        {
          buildingName: "Kiosk",
          purposeUsed: "Shop",
          usable: "not-a-real-value",
          owningInstitution: "Galle Municipal Council",
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
