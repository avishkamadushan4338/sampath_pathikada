import { z } from "zod";

/** Shared row shapes reused across many sections' repeatable tables. */

export const nameAddressRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
});
export type NameAddressRow = z.infer<typeof nameAddressRowSchema>;
export const nameAddressRowPartialSchema = nameAddressRowSchema.partial();

export const nameAddressPhoneRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().optional(),
});
export type NameAddressPhoneRow = z.infer<typeof nameAddressPhoneRowSchema>;
export const nameAddressPhoneRowPartialSchema = nameAddressPhoneRowSchema.partial();

export const countRowSchema = z.object({
  label: z.string().min(1),
  count: z.coerce.number().int().min(0).default(0),
});
export type CountRow = z.infer<typeof countRowSchema>;

export const sexCountSchema = z.object({
  female: z.coerce.number().int().min(0).default(0),
  male: z.coerce.number().int().min(0).default(0),
});
export type SexCount = z.infer<typeof sexCountSchema>;
export const sexCountPartialSchema = sexCountSchema.partial();

export const yesNo = z.enum(["yes", "no"]);
export type YesNo = z.infer<typeof yesNo>;

/** Phone numbers as entered on Sri Lankan government forms: 0XXXXXXXXX (10 digits). */
export const phoneSchema = z
  .string()
  .regex(/^0\d{9}$/, "Enter a valid 10-digit phone number (e.g. 0771234567)");
export const phoneOptionalSchema = z
  .union([phoneSchema, z.literal("")])
  .optional();
