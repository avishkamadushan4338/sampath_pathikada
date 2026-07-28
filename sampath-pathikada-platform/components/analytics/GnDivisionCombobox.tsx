"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Bilingual } from "@/components/Bilingual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import type { GNDivision } from "@/lib/registration-data";

interface GnDivisionComboboxProps {
  divisions: GNDivision[];
  value: string | null;
  onChange: (gnDivision: string) => void;
}

/** Search-or-select control for choosing one GN division out of a DS's own roster — used at the
 *  top of every GN-scoped "My Division Information" section view. */
export function GnDivisionCombobox({ divisions, value, onChange }: GnDivisionComboboxProps) {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = divisions.find((gn) => gn.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return divisions;
    return divisions.filter(
      (gn) => gn.en.toLowerCase().includes(q) || gn.si.includes(query.trim()) || gn.id.toLowerCase().includes(q)
    );
  }, [divisions, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-full justify-between sm:w-80"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? (
              <Bilingual en={selected.en} si={selected.si} />
            ) : (
              <Bilingual en="Search or select a GN division" si="ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න" />
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "si" ? "වසම සොයන්න..." : "Search GN division..."}
            className="h-10 border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-fluid-sm text-muted-foreground">
              <Bilingual en="No GN division found." si="ග්‍රාම නිලධාරී වසමක් හමු නොවීය." />
            </p>
          ) : (
            filtered.map((gn) => (
              <button
                key={gn.id}
                type="button"
                onClick={() => {
                  onChange(gn.id);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-fluid-sm hover:bg-accent hover:text-accent-foreground"
              >
                <Check className={cn("size-4 shrink-0", gn.id === value ? "opacity-100" : "opacity-0")} />
                <span className="min-w-0 flex-1 truncate">
                  <Bilingual en={gn.en} si={gn.si} />
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
