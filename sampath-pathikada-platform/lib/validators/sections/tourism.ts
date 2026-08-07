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

/* Draft-mode row schemas built from scratch rather than `.partial()` on the strict schemas
 * above: `.partial()` only allows a field to be *missing*, it doesn't relax `min(1)`, so a row
 * added via the "Add" button (whose fields start as "") would still fail validation and
 * silently block saving. */
const guestAccommodationRowPartialSchema = z.object({
  name: z.string().optional(),
  type: z.enum(GUEST_ACCOMMODATION_TYPES).optional(),
  address: z.string().optional(),
  roomCount: z.coerce.number().int().min(0).optional(),
});

const otherAccommodationRowPartialSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  address: z.string().optional(),
});

export const tourismSchemaPartial = z.object({
  hotelInventory: z.array(hotelInventoryRowSchema.partial()).optional(),
  guestAccommodations: z.array(guestAccommodationRowPartialSchema).optional(),
  otherAccommodations: z.array(otherAccommodationRowPartialSchema).optional(),
});

export { GUEST_ACCOMMODATION_TYPES, HOTEL_CATEGORIES };
