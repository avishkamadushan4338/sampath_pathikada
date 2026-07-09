"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, Loader2 } from "lucide-react";

const NAVY = "#0E2B4E";

interface ContentRow { key: string; title: string; body: string; updatedAt: string }

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json.data as ContentRow[];
};

export default function WebsiteContentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: content, isLoading } = useSWR("/api/website-content", fetcher);
  const entry = content?.find((c) => c.key === slug);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <Link href="/admin/website-content" className="inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
        <ArrowLeft size={14} /> Back to Website Content
      </Link>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin" size={20} style={{ color: "hsl(var(--muted-foreground))" }} />
        </div>
      )}

      {!isLoading && !entry && (
        <div className="rounded-2xl p-6 text-center" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <p className="text-[14px] font-semibold" style={{ color: "#92400e" }}>This content entry was not found.</p>
        </div>
      )}

      {entry && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
          <div className="px-6 py-4" style={{ background: NAVY }}>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display,'Playfair Display',serif)" }}>
              {entry.title}
            </h1>
            <p className="text-[11.5px] mt-0.5 font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>{entry.key}</p>
          </div>
          <div className="p-6">
            <p className="text-[13.5px] whitespace-pre-wrap leading-relaxed" style={{ color: "hsl(var(--foreground))" }}>
              {entry.body}
            </p>
            <p className="text-[11.5px] mt-6" style={{ color: "hsl(var(--muted-foreground))" }}>
              Last updated {new Date(entry.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
