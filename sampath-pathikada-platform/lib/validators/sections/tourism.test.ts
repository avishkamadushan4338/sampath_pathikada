import { describe, it, expect } from "vitest";
import {
  tourismSchemaStrict,
  tourismSchemaPartial,
  GUEST_ACCOMMODATION_TYPES,
  HOTEL_CATEGORIES,
} from "@/lib/validators/sections/tourism";

const validPayload = {
  hotelInventory: HOTEL_CATEGORIES.map((category) => ({ category, hotelCount: 1, roomCount: 10 })),
  guestAccommodations: [
    { name: "Lakeview Villa", type: "villa" as const, address: "123 Lake Road", roomCount: 5 },
  ],
  otherAccommodations: [{ name: "Backpacker's Nest", type: "hostel", address: "45 Beach Lane" }],
};

describe("tourismSchemaStrict", () => {
  it("accepts a fully populated payload", () => {
    const result = tourismSchemaStrict.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("defaults guestAccommodations/otherAccommodations to empty when omitted", () => {
    const result = tourismSchemaStrict.safeParse({ hotelInventory: validPayload.hotelInventory });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.guestAccommodations).toEqual([]);
      expect(result.data.otherAccommodations).toEqual([]);
    }
  });

  it("rejects hotelInventory with fewer rows than HOTEL_CATEGORIES", () => {
    const result = tourismSchemaStrict.safeParse({
      ...validPayload,
      hotelInventory: validPayload.hotelInventory.slice(0, HOTEL_CATEGORIES.length - 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects hotelInventory with more rows than HOTEL_CATEGORIES", () => {
    const result = tourismSchemaStrict.safeParse({
      ...validPayload,
      hotelInventory: [...validPayload.hotelInventory, { category: HOTEL_CATEGORIES[0], hotelCount: 1, roomCount: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts hotelInventory with exactly HOTEL_CATEGORIES.length rows", () => {
    const result = tourismSchemaStrict.safeParse({
      hotelInventory: HOTEL_CATEGORIES.map((category) => ({ category, hotelCount: 0, roomCount: 0 })),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing hotelInventory entirely", () => {
    const { hotelInventory, ...rest } = validPayload;
    void hotelInventory;
    const result = tourismSchemaStrict.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects a guest accommodation row missing a required field", () => {
    const result = tourismSchemaStrict.safeParse({
      ...validPayload,
      guestAccommodations: [{ type: "villa", roomCount: 5 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an other accommodation row missing a required field", () => {
    const result = tourismSchemaStrict.safeParse({
      ...validPayload,
      otherAccommodations: [{ name: "Backpacker's Nest" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid guest accommodation type enum value", () => {
    const result = tourismSchemaStrict.safeParse({
      ...validPayload,
      guestAccommodations: [{ ...validPayload.guestAccommodations[0], type: "not-a-real-type" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid hotel category enum value", () => {
    const result = tourismSchemaStrict.safeParse({
      ...validPayload,
      hotelInventory: [
        { category: "not-a-real-category", hotelCount: 1, roomCount: 1 },
        ...validPayload.hotelInventory.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("coerces numeric string room counts", () => {
    const result = tourismSchemaStrict.safeParse({
      ...validPayload,
      guestAccommodations: [{ ...validPayload.guestAccommodations[0], roomCount: "5" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.guestAccommodations[0].roomCount).toBe(5);
    }
  });
});

describe("tourismSchemaPartial", () => {
  it("accepts an empty object (fresh draft)", () => {
    const result = tourismSchemaPartial.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts an untouched table (no rows added yet)", () => {
    const result = tourismSchemaPartial.safeParse({ guestAccommodations: [] });
    expect(result.success).toBe(true);
  });

  it("accepts a hotelInventory array shorter than HOTEL_CATEGORIES.length once its rows are filled in", () => {
    // The partial schema drops the `.length()` constraint so a draft can be saved before
    // every fixed row has been filled in. category is always pre-set by the fixed-row
    // factory in page.tsx (never blank), so requiring it here doesn't affect this.
    const result = tourismSchemaPartial.safeParse({
      hotelInventory: [{ category: HOTEL_CATEGORIES[0], hotelCount: 0, roomCount: 0 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a hotelInventory row with hotelCount left blank", () => {
    const result = tourismSchemaPartial.safeParse({
      hotelInventory: [{ category: HOTEL_CATEGORIES[0], hotelCount: "", roomCount: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a hotelInventory row with roomCount left blank", () => {
    const result = tourismSchemaPartial.safeParse({
      hotelInventory: [{ category: HOTEL_CATEGORIES[0], hotelCount: 0, roomCount: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a hotelInventory row with hotelCount/roomCount explicitly set to 0 — 0 is a real answer, not a blank", () => {
    const result = tourismSchemaPartial.safeParse({
      hotelInventory: [{ category: HOTEL_CATEGORIES[0], hotelCount: 0, roomCount: 0 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a guest accommodation row added via the UI still left blank — surfaces a required error without blocking the draft save (SectionForm saves regardless)", () => {
    const result = tourismSchemaPartial.safeParse({
      guestAccommodations: [{ name: "", type: undefined, address: "", roomCount: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a guest accommodation row once its required fields are filled in", () => {
    const result = tourismSchemaPartial.safeParse({
      guestAccommodations: [{ name: "Lakeview Villa", type: "villa", address: "123 Lake Road", roomCount: 5 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an other accommodation row added via the UI still left blank", () => {
    const result = tourismSchemaPartial.safeParse({
      otherAccommodations: [{ name: "", type: "", address: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an other accommodation row once its required fields are filled in", () => {
    const result = tourismSchemaPartial.safeParse({
      otherAccommodations: [{ name: "Backpacker's Nest", type: "hostel", address: "45 Beach Lane" }],
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a genuinely invalid enum value", () => {
    const result = tourismSchemaPartial.safeParse({
      guestAccommodations: [{ name: "Lakeview Villa", type: "not-a-real-type", address: "123 Lake Road" }],
    });
    expect(result.success).toBe(false);
  });
});
