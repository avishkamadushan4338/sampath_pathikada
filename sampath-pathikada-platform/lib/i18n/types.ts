export interface Translated {
  en: string;
  si: string;
  helpEn?: string;
  helpSi?: string;
}

/**
 * A section dictionary is typed by the union of field-name keys from that
 * section's Zod-inferred data type, so adding a field to a schema without
 * adding its translation is a compile error.
 */
export type SectionDictionary<TFields extends string> = {
  title: Translated;
  description?: Translated;
  fields: Record<TFields, Translated>;
};
