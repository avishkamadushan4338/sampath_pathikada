"use client";

import { useState } from "react";
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
import type { Translated } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

export interface RepeatableColumn {
  key: string;
  label: Translated;
  type: "text" | "number" | "select" | "readonly";
  options?: { value: string; label: Translated }[];
  placeholder?: Translated;
}

interface RepeatableTableProps<T extends FieldValues> {
  name: ArrayPath<T>;
  columns: RepeatableColumn[];
  title?: Translated;
  /** When true, rows can't be added/removed — used for schema-fixed matrices (e.g. age bands). */
  fixedRows?: boolean;
  emptyRowFactory: () => Record<string, unknown>;
}

function hasAnyValue(row: Record<string, unknown>): boolean {
  return Object.values(row).some((v) => v !== "" && v !== undefined && v !== null);
}

export function RepeatableTable<T extends FieldValues>({
  name,
  columns,
  title,
  fixedRows = false,
  emptyRowFactory,
}: RepeatableTableProps<T>) {
  const { lang } = useLanguage();
  const { control, register, watch } = useFormContext<T>();
  const { fields, append, remove } = useFieldArray({ control, name });
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

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

  function renderInput(rowIndex: number, column: RepeatableColumn, readonlyValue?: unknown) {
    const fieldName = `${name}.${rowIndex}.${column.key}` as const;

    if (column.type === "readonly") {
      return (
        <span className="text-fluid-sm text-muted-foreground">{String(readonlyValue ?? "")}</span>
      );
    }

    if (column.type === "select") {
      return (
        <SelectField fieldName={fieldName} options={column.options ?? []} lang={lang} />
      );
    }

    return (
      <Input
        type={column.type === "number" ? "number" : "text"}
        inputMode={column.type === "number" ? "numeric" : undefined}
        placeholder={column.placeholder ? (lang === "si" ? column.placeholder.si : column.placeholder.en) : undefined}
        className="text-fluid-sm"
        {...register(fieldName as never)}
      />
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
        {/* Wide layout: real table */}
        <div className="hidden overflow-x-auto rounded-lg border border-border @2xl:block">
          <table className="w-full border-collapse text-fluid-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {columns.map((col) => (
                  <th key={col.key} lang={lang} className={cn("px-3 py-2 text-left font-medium text-foreground", lang === "si" && "font-si")}>
                    {lang === "si" ? col.label.si : col.label.en}
                  </th>
                ))}
                {!fixedRows && <th className="w-12 px-3 py-2" aria-label={dictionary.delete[lang]} />}
              </tr>
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

        {/* Narrow layout: stacked cards */}
        <div className="flex flex-col gap-3 @2xl:hidden">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex flex-col gap-3">
                {columns.map((col) => (
                  <div key={col.key} className="flex flex-col gap-1">
                    <span lang={lang} className={cn("text-fluid-xs font-medium text-muted-foreground", lang === "si" && "font-si")}>
                      {lang === "si" ? col.label.si : col.label.en}
                    </span>
                    {renderInput(index, col, (field as Record<string, unknown>)[col.key])}
                  </div>
                ))}
              </div>
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
          ))}
        </div>
      </div>

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

function SelectField({
  fieldName,
  options,
  lang,
}: {
  fieldName: string;
  options: { value: string; label: Translated }[];
  lang: "en" | "si";
}) {
  const { setValue, watch } = useFormContext();
  const value = watch(fieldName as never) as unknown as string | undefined;

  return (
    <Select value={value ?? ""} onValueChange={(v) => setValue(fieldName as never, v as never, { shouldDirty: true })}>
      <SelectTrigger className="text-fluid-sm">
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
