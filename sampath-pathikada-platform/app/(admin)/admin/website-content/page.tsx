"use client";

import Link from "next/link";
import useSWR from "swr";
import { FileText, Loader2, ChevronRight, Image as ImageIcon } from "lucide-react";

const NAVY = "#0E2B4E";

interface ContentRow { key: string; title: string; body: string; updatedAt: string }

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json.data as ContentRow[];
};

export default function WebsiteContentPage() {
  const { data: content, isLoading } = useSWR("/api/website-content", fetcher);
  const rows = content ?? [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: NAVY }}>
            <FileText size={20} color="#fff" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}>
              Website Content
            </h1>
            <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              Public-facing content entries — view only
            </p>
          </div>
        </div>
        <Link
          href="/admin/website-content/media"
          className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-medium rounded-xl transition-colors self-start sm:self-auto"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
        >
          <ImageIcon size={14} /> Media
        </Link>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
        {isLoading && (
          <div className="px-5 py-8 flex justify-center">
            <Loader2 className="animate-spin" size={18} style={{ color: "hsl(var(--muted-foreground))" }} />
          </div>
        )}
        {!isLoading && rows.length === 0 && (
          <p className="px-5 py-8 text-center text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>
            No website content entries yet.
          </p>
        )}
        <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
          {rows.map((c) => (
            <Link
              key={c.key}
              href={`/admin/website-content/pages/${c.key}`}
              className="flex items-center justify-between px-5 py-3.5 transition-colors"
            >
              <div>
                <p className="text-[13.5px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>{c.title}</p>
                <p className="text-[11.5px] mt-0.5 font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>{c.key}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {new Date(c.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <ChevronRight size={15} style={{ color: "hsl(var(--muted-foreground))" }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
