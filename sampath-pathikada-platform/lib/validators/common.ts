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

/** Every count in this app is normally allowed to default to 0 (via `.default(0)` elsewhere in
 *  this file) — but a handful of sections need the stronger guarantee that the officer has
 *  actually looked at and entered every cell, not left it on a silent default. A blank input
 *  binds as an empty string, not `undefined`, and `z.coerce.number()` on its own would coerce ""
 *  to 0 (JS: `Number("") === 0`), silently treating "never touched" as a valid zero — the
 *  preprocess step here catches "" (and null) first and turns it back into `undefined`, so a
 *  genuinely blank cell surfaces as a real "required" error instead of quietly passing as zero.
 *
 *  `z.preprocess` statically types its input as `unknown` (unlike `z.coerce.number()`, which —
 *  despite coercing at runtime — declares both its input and output as `number`, matching what
 *  every other count field in this codebase relies on for `useForm<T>` compatibility). Cast to
 *  the same `number`-in/`number`-out shape so this field type-checks the same way as a plain
 *  `z.coerce.number()` field would; the runtime behavior above is unaffected by the cast. */
export function requiredCount(message: string): z.ZodType<number, z.ZodTypeDef, number> {
  return z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number({ required_error: message, invalid_type_error: message }).int().min(0, message)
  ) as unknown as z.ZodType<number, z.ZodTypeDef, number>;
}

/** Phone numbers as entered on Sri Lankan government forms: 0XXXXXXXXX (10 digits). */
export const phoneSchema = z
  .string()
  .regex(/^0\d{9}$/, "Enter a valid 10-digit phone number (e.g. 0771234567)");
export const phoneOptionalSchema = z
  .union([phoneSchema, z.literal("")])
  .optional();
