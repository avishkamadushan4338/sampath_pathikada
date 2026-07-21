"use client";

import { useState } from "react";
import { ClipboardList, ChevronDown } from "lucide-react";
import { SECTION_KEYS } from "@/lib/types/submission";
import { SECTION_DICTS } from "@/lib/i18n/sections";

const NAVY = "#0E2B4E";

export default function FormConfigPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: NAVY }}>
          <ClipboardList size={20} color="#fff" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}>
            Form Configuration
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Reference view of the {SECTION_KEYS.length} sections officers fill in — view only
          </p>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden divide-y" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
        {SECTION_KEYS.map((key) => {
          const dict = SECTION_DICTS[key];
          const fieldCount = Object.keys(dict.fields).length;
          const isOpen = open === key;
          return (
            <div key={key}>
              <button
                onClick={() => setOpen(isOpen ? null : key)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
              >
                <div>
                  <p className="text-[13.5px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>{dict.title.en}</p>
                  {dict.description && (
                    <p className="text-[12px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{dict.description.en}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(14,43,78,0.08)", color: NAVY }}>
                    {fieldCount} fields
                  </span>
                  <ChevronDown size={15} style={{ color: "hsl(var(--muted-foreground))", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
                </div>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5" style={{ background: "hsl(var(--muted))" }}>
                  {Object.entries(dict.fields).map(([fieldKey, label]) => (
                    <div key={fieldKey} className="text-[12.5px] py-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {(label as { en: string }).en}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
