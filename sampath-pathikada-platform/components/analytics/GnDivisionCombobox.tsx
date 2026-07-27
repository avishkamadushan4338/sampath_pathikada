"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bilingual } from "@/components/Bilingual";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import type { GNDivision } from "@/lib/registration-data";

interface GnDivisionComboboxProps {
  divisions: GNDivision[];
  value: string | null;
  onChange: (gnId: string) => void;
}

/** Searchable GN division picker, scoped by the caller to whichever roster it wants to expose
 *  (typically the signed-in DS's own division). Filters by English name, Sinhala name, and id. */
export function GnDivisionCombobox({ divisions, value, onChange }: GnDivisionComboboxProps) {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = divisions.find((d) => d.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return divisions;
    return divisions.filter(
      (d) => d.en.toLowerCase().includes(q) || d.si.includes(query.trim()) || d.id.toLowerCase().includes(q)
    );
  }, [divisions, query]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between sm:w-80">
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? (
              lang === "si" ? selected.si : selected.en
            ) : (
              <Bilingual en="Search or select a GN division…" si="ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න…" />
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "si" ? "සොයන්න…" : "Search…"}
            className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-fluid-sm text-muted-foreground">
              <Bilingual en="No GN division found." si="ග්‍රාම නිලධාරී වසමක් හමු නොවීය." />
            </p>
          ) : (
            filtered.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  onChange(d.id);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-fluid-sm hover:bg-muted",
                  d.id === value && "bg-muted"
                )}
              >
                <Check className={cn("size-4 shrink-0", d.id === value ? "opacity-100" : "opacity-0")} aria-hidden="true" />
                <span className="truncate">{lang === "si" ? d.si : d.en}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
