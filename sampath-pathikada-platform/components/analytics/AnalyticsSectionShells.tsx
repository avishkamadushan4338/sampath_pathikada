"use client";

import type { ReactNode } from "react";
import { Bilingual } from "@/components/Bilingual";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GnOption {
  id: string;
  en: string;
  si: string;
}

interface GnDivisionFilterSelectProps {
  lang: string;
  value: string;
  onValueChange: (value: string) => void;
  options: GnOption[];
}

export function GnDivisionFilterSelect({
  lang,
  value,
  onValueChange,
  options,
}: GnDivisionFilterSelectProps) {
  return (
    <div className="max-w-sm space-y-1">
      <p className="text-fluid-xs font-medium text-muted-foreground">
        <Bilingual en="Filter by GN Division" si="ග්‍රාම නිලධාරී වසම අනුව පෙරහන්න" />
      </p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {lang === "si" ? "සියලුම ග්‍රාම නිලධාරී වසම්" : "All GN divisions"}
          </SelectItem>
          {options.map((gn) => (
            <SelectItem key={gn.id} value={gn.id}>
              {lang === "si" ? gn.si : gn.en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface AnalyticsTableWrapperProps {
  children: ReactNode;
  horizontalScroll?: boolean;
}

export function AnalyticsTableWrapper({
  children,
  horizontalScroll = false,
}: AnalyticsTableWrapperProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      {horizontalScroll ? <div className="overflow-x-auto">{children}</div> : children}
    </div>
  );
}