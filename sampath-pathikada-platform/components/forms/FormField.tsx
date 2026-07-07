"use client";

import { useId, type ReactNode } from "react";
import { useFormContext, type FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translated } from "@/lib/i18n/types";
import { dictionary } from "@/lib/i18n/dictionary";

interface FieldWrapperProps {
  name: string;
  label: Translated;
  required?: boolean;
  children: (props: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
}

function getErrorAtPath(errors: Record<string, unknown>, path: string): FieldError | undefined {
  const parts = path.split(".");
  let cursor: unknown = errors;
  for (const part of parts) {
    if (cursor == null || typeof cursor !== "object") return undefined;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return cursor as FieldError | undefined;
}

/** Label + input slot + error message, wired for WCAG-correct label/input association. */
export function FieldWrapper({ name, label, required, children, className }: FieldWrapperProps) {
  const { lang } = useLanguage();
  const {
    formState: { errors },
  } = useFormContext();
  const id = useId();
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const error = getErrorAtPath(errors as Record<string, unknown>, name);
  const helpText = lang === "si" ? label.helpSi : label.helpEn;
  const describedBy = [error ? errorId : null, helpText ? helpId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} lang={lang} className={cn("text-fluid-sm font-medium text-foreground", lang === "si" ? "font-si" : "font-ui")}>
        {lang === "si" ? label.si : label.en}
        {required && (
          <span className="ml-1 text-destructive" aria-label={dictionary.required[lang]}>
            *
          </span>
        )}
      </label>
      {children({ id, describedBy, invalid: !!error })}
      {helpText && (
        <p id={helpId} className="text-fluid-xs text-muted-foreground">
          {helpText}
        </p>
      )}
      {error?.message && (
        <p id={errorId} role="alert" className="text-fluid-xs font-medium text-destructive">
          {String(error.message)}
        </p>
      )}
    </div>
  );
}
