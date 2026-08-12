"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useFormContext, type FieldValues, type ArrayPath } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { dictionary } from "@/lib/i18n/dictionary";
import { getErrorAtPath } from "@/components/forms/FormField";
import type { Translated } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

export interface RepeatableColumn {
  key: string;
  label: Translated;
  type: "text" | "number" | "select" | "readonly" | "computed";
  options?: { value: string; label: Translated }[];
  placeholder?: Translated;
  /** Marks the column as mandatory per the row's Zod schema (e.g. a directory row's "name")
   *  — shows the same "*" indicator FieldWrapper uses for standalone required fields, so
   *  required-ness reads consistently whether a field lives in a table or its own row. */
  required?: boolean;
  /** Required when type is "computed" — derives a live display value (e.g. a row total) from
   *  the row's current values. Reactive: recomputes on every keystroke in that row. */
  compute?: (row: Record<string, unknown>) => string | number;
  /** Card-layout only: columns sharing the same group text render together in one labeled
   *  sub-box instead of as separate cells scattered across the card's field grid — e.g. an
   *  "Under 18" group containing just Female/Male, rather than each cell independently
   *  spelling out "Under 18 - Female" / "Under 18 - Male" and wrapping awkwardly at narrow
   *  widths. Columns must be adjacent in the `columns` array to be grouped together. In the
   *  wide `<table>` layout (only reachable via `preferTableLayout`), the same grouping becomes
   *  a spanning group header above the individual field headers instead. */
  group?: Translated;
  /** When this returns true for the row's current values, the column can't be edited and its
   *  value is cleared — e.g. "Count" only makes sense once "Present" is Yes, so it's locked (and
   *  blanked out) while Present is No, rather than sitting there editable but meaningless. Text
   *  and number columns only. */
  disabledWhen?: (row: Record<string, unknown>) => boolean;
}

interface RepeatableTableProps<T extends FieldValues> {
  name: ArrayPath<T>;
  columns: RepeatableColumn[];
  title?: Translated;
  /** When true, rows can't be added/removed — used for schema-fixed matrices (e.g. age bands). */
  fixedRows?: boolean;
  /** Overrides the "6+ columns always uses cards" rule. That rule exists because a wide row of
   *  *text* fields (names, addresses) forces each one into an unreadable sliver — but a row of
   *  narrow number/select fields doesn't have that problem, and for a table with many rows (e.g.
   *  8 disability types), one compact row per record beats one tall card per record. Only makes
   *  sense for columns that are actually narrow; a text-heavy 6+ column table should still use
   *  the default card layout. */
  preferTableLayout?: boolean;
  emptyRowFactory: () => Record<string, unknown>;
}

function hasAnyValue(row: Record<string, unknown>): boolean {
  return Object.values(row).some((v) => v !== "" && v !== undefined && v !== null);
}

interface ColumnGroup {
  group?: Translated;
  columns: RepeatableColumn[];
}

/** Adjacent columns sharing the same `group` collapse into one entry; everything else stays its
 *  own single-column "group". Comparing by the *active-language* text (not object identity)
 *  means callers can just repeat the same `{ en, si }` literal on each column without having to
 *  share a single object reference. */
function groupColumns(columns: RepeatableColumn[], lang: "en" | "si"): ColumnGroup[] {
  const groups: ColumnGroup[] = [];
  for (const col of columns) {
    const label = col.group ? col.group[lang] : undefined;
    const last = groups[groups.length - 1];
    const lastLabel = last?.group ? last.group[lang] : undefined;
    if (label && last && label === lastLabel) {
      last.columns.push(col);
    } else {
      groups.push({ group: col.group, columns: [col] });
    }
  }
  return groups;
}

export function RepeatableTable<T extends FieldValues>({
  name,
  columns,
  title,
  fixedRows = false,
  preferTableLayout = false,
  emptyRowFactory,
}: RepeatableTableProps<T>) {
  const { lang } = useLanguage();
  const { control, watch, formState } = useFormContext<T>();
  const { fields, append, remove } = useFieldArray({ control, name });
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  // A cross-field rule (e.g. "at least one row required") targets the array field itself, not
  // any single row — react-hook-form files that under `<name>.root` once the array already has
  // per-row errors of its own, but falls back to `<name>` directly when it doesn't, so check both.
  const arrayError =
    getErrorAtPath(formState.errors as Record<string, unknown>, `${name}.root`) ??
    getErrorAtPath(formState.errors as Record<string, unknown>, name);

  /** Past ~5 columns, a horizontal table forces every input into a sliver too narrow to read
   *  or type into (school names, multi-word select options), no matter how wide the screen is —
   *  it's not a viewport problem, it's a "too many fields for one row" problem. So heavy rows
   *  always render as the labeled-card layout instead of only falling back to it on narrow
   *  containers; simpler rows keep the space-efficient table on wide containers.
   *  `preferTableLayout` opts a specific heavy-but-narrow table (see prop doc) back out of that
   *  default. */
  const useCardLayout = columns.length >= 6 && !preferTableLayout;

  function requestRemove(index: number) {
    const row = watch(`${name}.${index}` as never) as unknown as Record<string, unknown>;
    if (row && hasAnyValue(row)) {
      setPendingDeleteIndex(index);
    } else {
      remove(index);
    }
  }

  function confirmRemove() {
    if (pendingDeleteIndex !== null) remove(pendingDeleteIndex);
    setPendingDeleteIndex(null);
  }

  function renderInput(rowIndex: number, column: RepeatableColumn, readonlyValue?: unknown, onCard = false) {
    const fieldName = `${name}.${rowIndex}.${column.key}` as const;

    if (column.type === "readonly") {
      return (
        <span className="text-fluid-sm text-muted-foreground">{String(readonlyValue ?? "")}</span>
      );
    }

    if (column.type === "computed") {
      return <ComputedField rowName={`${name}.${rowIndex}`} compute={column.compute!} />;
    }

    const error = getErrorAtPath(formState.errors as Record<string, unknown>, fieldName);
    const disabled = column.disabledWhen
      ? column.disabledWhen((watch(`${name}.${rowIndex}` as never) as unknown as Record<string, unknown>) ?? {})
      : false;

    if (column.type === "select") {
      return (
        <>
          <SelectField fieldName={fieldName} options={column.options ?? []} lang={lang} onCard={onCard} invalid={!!error} />
          {onCard && error?.message && <p className="text-fluid-xs text-destructive">{String(error.message)}</p>}
        </>
      );
    }

    return (
      <>
        <TextField
          fieldName={fieldName}
          type={column.type === "number" ? "number" : "text"}
          placeholder={column.placeholder ? (lang === "si" ? column.placeholder.si : column.placeholder.en) : undefined}
          // The card layout's bg-card surface is the same tone as the default input border
          // (--input is defined as "card tone"), so an empty field is otherwise invisible. A
          // same-tone border fix isn't enough in this app's warm cream palette either — background
          // and card are only a few points of lightness apart at the same hue — so the border
          // needs an actual color (brand primary), not another shade of cream, to read clearly.
          className={cn("min-w-32 text-fluid-sm", onCard && "border-2 border-primary/40 bg-background shadow-sm")}
          invalid={!!error}
          disabled={disabled}
        />
        {onCard && error?.message && <p className="text-fluid-xs text-destructive">{String(error.message)}</p>}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {title && (
        <h2 lang={lang} className={cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? title.si : title.en}
        </h2>
      )}

      {/* @container lets rows reflow to cards independently of viewport width —
          matters because sidebar collapse changes available width, not just screen size. */}
      <div className="@container">
        {/* Wide layout: real table — skipped entirely for heavy (6+ column) rows, which always
            use the card layout below instead. */}
        <div className={cn("overflow-x-auto rounded-lg border border-border", useCardLayout ? "hidden" : "hidden @2xl:block")}>
          <table className="w-full border-collapse text-fluid-sm">
            <thead>
              {columns.some((c) => c.group) ? (
                <>
                  {/* Group row: a grouped column's Female/Male labels move to the row below, under
                      one spanning header ("Under 18") — an ungrouped column (e.g. "Total") has
                      nothing to put below it, so it spans both header rows instead. */}
                  <tr className="border-b border-border bg-muted/50">
                    {groupColumns(columns, lang).map((grp, gi) =>
                      grp.group ? (
                        <th
                          key={gi}
                          colSpan={grp.columns.length}
                          lang={lang}
                          className={cn(
                            "border-l border-border px-3 py-1.5 text-center text-fluid-xs font-semibold text-foreground first:border-l-0",
                            lang === "si" && "font-si"
                          )}
                        >
                          {grp.group[lang]}
                        </th>
                      ) : (
                        <th
                          key={gi}
                          rowSpan={2}
                          lang={lang}
                          className={cn("px-3 py-2 text-left align-bottom font-medium text-foreground", lang === "si" && "font-si")}
                        >
                          {lang === "si" ? grp.columns[0].label.si : grp.columns[0].label.en}
                          {grp.columns[0].required && (
                            <span className="ml-1 text-destructive" aria-label={dictionary.required[lang]}>
                              *
                            </span>
                          )}
                        </th>
                      )
                    )}
                    {!fixedRows && <th rowSpan={2} className="w-12 px-3 py-2" aria-label={dictionary.delete[lang]} />}
                  </tr>
                  <tr className="border-b border-border bg-muted/50">
                    {groupColumns(columns, lang).flatMap((grp) =>
                      grp.group
                        ? grp.columns.map((col) => (
                            <th
                              key={col.key}
                              lang={lang}
                              className={cn("border-l border-border px-3 py-1.5 text-left font-medium text-foreground first:border-l-0", lang === "si" && "font-si")}
                            >
                              {lang === "si" ? col.label.si : col.label.en}
                              {col.required && (
                                <span className="ml-1 text-destructive" aria-label={dictionary.required[lang]}>
                                  *
                                </span>
                              )}
                            </th>
                          ))
                        : []
                    )}
                  </tr>
                </>
              ) : (
                <tr className="border-b border-border bg-muted/50">
                  {columns.map((col) => (
                    <th key={col.key} lang={lang} className={cn("px-3 py-2 text-left font-medium text-foreground", lang === "si" && "font-si")}>
                      {lang === "si" ? col.label.si : col.label.en}
                      {col.required && (
                        <span className="ml-1 text-destructive" aria-label={dictionary.required[lang]}>
                          *
                        </span>
                      )}
                    </th>
                  ))}
                  {!fixedRows && <th className="w-12 px-3 py-2" aria-label={dictionary.delete[lang]} />}
                </tr>
              )}
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b border-border last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2 align-top">
                      {renderInput(index, col, (field as Record<string, unknown>)[col.key])}
                    </td>
                  ))}
                  {!fixedRows && (
                    <td className="px-3 py-2 text-right align-top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="touch-target text-destructive hover:text-destructive"
                        onClick={() => requestRemove(index)}
                        aria-label={dictionary.delete[lang]}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card layout: always used for heavy (6+ column) rows, and as the narrow-container
            fallback otherwise. Each field gets its own labeled auto-fit grid cell instead of a
            single cramped column, so a 9-10 field row wraps into a readable mini-form instead
            of either a crushed table row or an unnecessarily tall single-column stack.
            A leading readonly column (e.g. "Mental Illness", "0-4 years") identifies the row —
            its column caption is identical on every card, so showing "caption: value" like the
            other fields just repeats the same label N times while the one thing that actually
            differs between cards sits in small muted text. Promoting it to the card title makes
            cards distinguishable at a glance instead of all looking the same. */}
        <div className={cn("flex flex-col gap-3", !useCardLayout && "@2xl:hidden")}>
          {fields.map((field, index) => {
            const hasIdentifierColumn = columns[0]?.type === "readonly";
            const identifierColumn = hasIdentifierColumn ? columns[0] : undefined;
            const restColumns = hasIdentifierColumn ? columns.slice(1) : columns;
            return (
              <div key={field.id} className="rounded-lg border border-border bg-card p-3">
                {identifierColumn && (
                  <div
                    lang={lang}
                    className={cn(
                      "mb-3 border-b border-border pb-2 text-fluid-base font-semibold text-foreground",
                      lang === "si" && "font-si-heading"
                    )}
                  >
                    {String((field as Record<string, unknown>)[identifierColumn.key] ?? "")}
                  </div>
                )}
                {(() => {
                  function renderField(col: RepeatableColumn) {
                    return (
                      <div key={col.key} className="flex flex-col gap-1">
                        <span lang={lang} className={cn("text-fluid-xs font-medium text-muted-foreground", lang === "si" && "font-si")}>
                          {lang === "si" ? col.label.si : col.label.en}
                          {col.required && (
                            <span className="ml-1 text-destructive" aria-label={dictionary.required[lang]}>
                              *
                            </span>
                          )}
                        </span>
                        {renderInput(index, col, (field as Record<string, unknown>)[col.key], true)}
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                      {groupColumns(restColumns, lang).map((grp, gi) =>
                        grp.group ? (
                          <div key={gi} className="flex min-w-64 flex-col gap-2 rounded-md border border-border/70 bg-background/50 p-2.5">
                            <span lang={lang} className={cn("text-fluid-xs font-semibold text-foreground", lang === "si" && "font-si")}>
                              {grp.group[lang]}
                            </span>
                            <div className="grid grid-cols-2 gap-3">{grp.columns.map(renderField)}</div>
                          </div>
                        ) : (
                          renderField(grp.columns[0])
                        )
                      )}
                    </div>
                  );
                })()}
                {!fixedRows && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="touch-target mt-3 w-full gap-1.5 text-destructive hover:text-destructive"
                    onClick={() => requestRemove(index)}
                  >
                    <Trash2 className="size-4" />
                    <Bilingual {...dictionary.delete} />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {arrayError?.message && (
        <p role="alert" className="flex items-center gap-1.5 text-fluid-sm font-medium text-destructive">
          {String(arrayError.message)}
        </p>
      )}

      {!fixedRows && (
        <Button
          type="button"
          variant="outline"
          className="touch-target w-fit gap-1.5"
          onClick={() => append(emptyRowFactory() as never)}
        >
          <Plus className="size-4" />
          <Bilingual {...dictionary.add} />
        </Button>
      )}

      {title && (lang === "si" ? title.helpSi : title.helpEn) && (
        <p lang={lang} className={cn("whitespace-pre-line text-fluid-xs text-muted-foreground", lang === "si" && "font-si")}>
          {lang === "si" ? title.helpSi : title.helpEn}
        </p>
      )}

      <AlertDialog open={pendingDeleteIndex !== null} onOpenChange={(open) => !open && setPendingDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Bilingual {...dictionary.deleteConfirm} />
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Bilingual {...dictionary.cancel} />
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Bilingual {...dictionary.delete} />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Live read-only value derived from the rest of the row (e.g. a per-row total) — recomputes
 *  on every change to any field in the row, since it watches the whole row object. */
function ComputedField({ rowName, compute }: { rowName: string; compute: (row: Record<string, unknown>) => string | number }) {
  const { watch } = useFormContext();
  const row = watch(rowName as never) as unknown as Record<string, unknown>;
  return <span className="text-fluid-sm font-medium text-foreground nums-tabular">{compute(row ?? {})}</span>;
}

/** Controlled (watch + setValue) rather than `register()`-bound: RepeatableTable renders both
 *  the table layout and the card layout at once (CSS toggles which is visible, for responsive
 *  reflow without a JS remeasure), so every field name is mounted as two separate DOM inputs.
 *  `register()` binds a field name to a single DOM ref, so having two inputs share one name
 *  corrupts the value on any array mutation (e.g. appending a row) — whichever input's ref
 *  re-attaches last wins, silently overwriting what the user typed in the other. A controlled
 *  input has no such single-owner assumption: both copies just mirror the same watched value. */
function TextField({
  fieldName,
  type,
  placeholder,
  className,
  invalid = false,
  disabled = false,
}: {
  fieldName: string;
  type: "text" | "number";
  placeholder?: string;
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const { setValue, watch } = useFormContext();
  const value = watch(fieldName as never) as unknown as string | number | undefined;

  // A disabled field shouldn't keep showing (or silently submitting) a value the officer can no
  // longer see or edit — e.g. flipping "Present" from Yes back to No should blank out the Count
  // that no longer applies, not leave it stuck at whatever was last typed while it was enabled.
  useEffect(() => {
    if (disabled && value !== "" && value !== undefined && value !== null) {
      setValue(fieldName as never, "" as never, { shouldDirty: true });
    }
  }, [disabled, value, fieldName, setValue]);

  // A grayed-out-but-still-there input reads as "broken" rather than "not applicable" — an
  // officer sees a box, tries to click into it, and nothing happens. Replacing it outright with
  // a plain dash removes the box (and the confusion) instead of just dimming it.
  if (disabled) {
    return (
      <span className="text-fluid-sm text-muted-foreground" aria-label="Not applicable">
        —
      </span>
    );
  }

  return (
    <Input
      type={type}
      inputMode={type === "number" ? "numeric" : undefined}
      placeholder={placeholder}
      className={className}
      value={value ?? ""}
      aria-invalid={invalid}
      onChange={(e) => setValue(fieldName as never, e.target.value as never, { shouldDirty: true })}
    />
  );
}

function SelectField({
  fieldName,
  options,
  lang,
  onCard = false,
  invalid = false,
}: {
  fieldName: string;
  options: { value: string; label: Translated }[];
  lang: "en" | "si";
  onCard?: boolean;
  invalid?: boolean;
}) {
  const { setValue, watch } = useFormContext();
  const value = watch(fieldName as never) as unknown as string | undefined;

  return (
    <Select value={value ?? ""} onValueChange={(v) => setValue(fieldName as never, v as never, { shouldDirty: true })}>
      <SelectTrigger aria-invalid={invalid} className={cn("min-w-32 text-fluid-sm", onCard && "border-2 border-primary/40 bg-background shadow-sm")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {lang === "si" ? opt.label.si : opt.label.en}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
