import { SECTION_DICTS } from "@/lib/i18n/sections";
import type { SectionKey } from "@/lib/types/submission";

export function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

/** `parentKey` is the immediate containing field's key (an array field like `pirivenas`, or a
 *  nested-object field like `institutionCounts`) — the same generic key (`name`, `type`, ...)
 *  can mean different things in different rows/objects within one section, so a `"<parent>.<key>"`
 *  entry in `dict.rows` is tried first; a flat `dict.rows[key]` entry covers keys that mean the
 *  same thing everywhere in the section. Framework-agnostic (no React) so it can be shared by the
 *  on-screen SectionDetailViewer and the server-side profile-CSV builder. */
export function resolveLabel(sectionKey: SectionKey, fieldKey: string, lang: "en" | "si", parentKey?: string): string {
  const dict = SECTION_DICTS[sectionKey];
  if (parentKey) {
    const compound = dict?.rows?.[`${parentKey}.${fieldKey}`];
    if (compound) return lang === "si" ? compound.si : compound.en;
  }
  const topLevel = dict?.fields?.[fieldKey];
  if (topLevel) return lang === "si" ? topLevel.si : topLevel.en;
  const row = dict?.rows?.[fieldKey];
  if (row) return lang === "si" ? row.si : row.en;
  return humanizeKey(fieldKey);
}
