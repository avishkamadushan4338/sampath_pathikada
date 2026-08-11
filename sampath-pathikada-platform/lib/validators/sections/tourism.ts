import { z } from "zod";

/* ── §13 සංචාරක — Tourism (commercial accommodation) ─────────────────────── */
/* Distinct from §2's attraction sites; this section covers hotels/guest houses only. */

const GUEST_ACCOMMODATION_TYPES = ["guesthouse", "villa", "homestay"] as const;

const HOTEL_CATEGORIES = ["star-graded", "non-star-graded", "guest-houses", "villa-homestay", "conference-centers"] as const;

export const hotelInventoryRowSchema = z.object({
  category: z.enum(HOTEL_CATEGORIES),
  hotelCount: z.coerce.number().int().min(0).default(0),
  roomCount: z.coerce.number().int().min(0).default(0),
});

export const guestAccommodationRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(GUEST_ACCOMMODATION_TYPES),
  address: z.string().min(1, "Address is required"),
  roomCount: z.coerce.number().int().min(0).default(0),
});

export const otherAccommodationRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  address: z.string().min(1, "Address is required"),
});

export const tourismSchemaStrict = z.object({
  hotelInventory: z.array(hotelInventoryRowSchema).length(HOTEL_CATEGORIES.length),
  guestAccommodations: z.array(guestAccommodationRowSchema).default([]),
  otherAccommodations: z.array(otherAccommodationRowSchema).default([]),
});

export type TourismData = z.infer<typeof tourismSchemaStrict>;

/* Draft-mode reuses the strict row schemas directly — a row's required fields (e.g. `name`)
 * still fail validation if blank, surfacing a "required" error in the UI, but that no longer
 * blocks saving: SectionForm always saves the draft regardless of validation outcome, it just
 * shows the errors alongside. Only the *array itself* is optional here, so an empty/untouched
 * table (no rows added yet) is still a valid draft. */
export const tourismSchemaPartial = z.object({
  hotelInventory: z.array(hotelInventoryRowSchema).optional(),
  guestAccommodations: z.array(guestAccommodationRowSchema).optional(),
  otherAccommodations: z.array(otherAccommodationRowSchema).optional(),
});

export { GUEST_ACCOMMODATION_TYPES, HOTEL_CATEGORIES };
