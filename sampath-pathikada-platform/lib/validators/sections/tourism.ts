import { z } from "zod";

/* ── §13 සංචාරක — Tourism (commercial accommodation) ─────────────────────── */
/* Distinct from §2's attraction sites; this section covers hotels/guest houses only. */

const GUEST_ACCOMMODATION_TYPES = ["guesthouse", "villa", "homestay"] as const;

export const hotelInventoryRowSchema = z.object({
  starGrade: z.string().min(1, "Star grade is required"),
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
  hotelInventory: z.array(hotelInventoryRowSchema).default([]),
  guestAccommodations: z.array(guestAccommodationRowSchema).default([]),
  otherAccommodations: z.array(otherAccommodationRowSchema).default([]),
});

export type TourismData = z.infer<typeof tourismSchemaStrict>;

export const tourismSchemaPartial = z.object({
  hotelInventory: z.array(hotelInventoryRowSchema.partial()).optional(),
  guestAccommodations: z.array(guestAccommodationRowSchema.partial()).optional(),
  otherAccommodations: z.array(otherAccommodationRowSchema.partial()).optional(),
});

export { GUEST_ACCOMMODATION_TYPES };
