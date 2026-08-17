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
  /** Labels for keys that live INSIDE a repeatable row or nested object (e.g. a table column
   *  like `schoolName`), as opposed to `fields`, which only covers the section's top-level keys.
   *  Not exhaustiveness-checked like `fields` — a section can have many differently-shaped rows,
   *  so this is just an open lookup consulted by `SectionDetailViewer`.
   *
   *  Keyed by the row/column key alone (`"name"`) when that key means the same thing everywhere
   *  it appears in this section, or by `"<parentField>.<columnKey>"` (`"pirivenas.name"`) when the
   *  same generic key (e.g. `name`) means different things in different arrays within the same
   *  section — the compound form is looked up first. */
  rows?: Record<string, Translated>;
};
