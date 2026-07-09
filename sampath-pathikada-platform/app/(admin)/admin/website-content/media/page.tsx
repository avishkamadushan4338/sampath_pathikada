import Link from "next/link";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

const NAVY = "#0E2B4E";

export default function WebsiteContentMediaPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto space-y-6">
      <Link href="/admin/website-content" className="inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
        <ArrowLeft size={14} /> Back to Website Content
      </Link>

      <div className="rounded-2xl p-8 text-center" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(14,43,78,0.08)" }}>
          <ImageIcon size={22} style={{ color: NAVY }} />
        </div>
        <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}>
          Media Management
        </h1>
        <p className="text-[13px] mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
          Media asset management is not yet available. Uploaded files and images are not currently stored
          in a browsable library.
        </p>
      </div>
    </div>
  );
}
