import * as React from "react"

import { cn } from "@/lib/utils"

/** Every numeric field in this app is a non-negative count (population, facility counts, etc.)
 *  — none accept negative values — so `type="number"` inputs reject "-" outright instead of
 *  letting it through and only catching it at submit-time validation. */
function blockMinusKey(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "-" || e.key === "Minus") e.preventDefault()
}

function stripMinusOnPaste(e: React.ClipboardEvent<HTMLInputElement>) {
  if (e.clipboardData.getData("text").includes("-")) e.preventDefault()
}

/** keydown/paste blocking only stops the interactions that fire those events — drag-and-drop
 *  text, browser autofill, and IME input all bypass them and land straight in `onChange`. This
 *  is the one handler every value-changing path funnels through, so it's the actual backstop. */
function stripMinusOnChange(e: React.ChangeEvent<HTMLInputElement>) {
  if (e.target.value.includes("-")) e.target.value = e.target.value.replace(/-/g, "")
}

function Input({ className, type, min, onKeyDown, onPaste, onChange, ...props }: React.ComponentProps<"input">) {
  const isNumber = type === "number"

  return (
    <input
      type={type}
      min={isNumber ? (min ?? 0) : min}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      onKeyDown={isNumber ? (e) => { blockMinusKey(e); onKeyDown?.(e) } : onKeyDown}
      onPaste={isNumber ? (e) => { stripMinusOnPaste(e); onPaste?.(e) } : onPaste}
      onChange={isNumber ? (e) => { stripMinusOnChange(e); onChange?.(e) } : onChange}
      {...props}
    />
  )
}

export { Input }
