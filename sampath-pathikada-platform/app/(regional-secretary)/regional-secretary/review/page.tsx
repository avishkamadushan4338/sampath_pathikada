"use client";

import Link from "next/link";
import useSWR from "swr";
import { Loader2, Eye } from "lucide-react";
import { Bilingual } from "@/components/Bilingual";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DISTRICTS, GN_DIVISIONS } from "@/lib/registration-data";

interface ReviewListItem {
  id: string;
  year: number;
  district: string;
  dsDivision: string;
  gnDivision: string;
  status: string;
  updatedAt: string;
  submittedBy: { name: string; email: string; phone: string | null };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json as { data: ReviewListItem[]; total: number };
};

function gnLabel(id: string, lang: "en" | "si") {
  const gn = GN_DIVISIONS.find((g) => g.id === id);
  return gn ? (lang === "si" ? gn.si : gn.en) : id;
}
function districtLabel(id: string, lang: "en" | "si") {
  const d = DISTRICTS.find((x) => x.id === id);
  return d ? (lang === "si" ? d.si : d.en) : id;
}

export default function ReviewQueuePage() {
  const { lang } = useLanguage();
  const { data, isLoading } = useSWR("/api/submissions?status=SUBMITTED", fetcher);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-display text-fluid-2xl font-semibold text-primary">
        <Bilingual en="Review Queue" si="සමාලෝචන පෝලිම" />
      </h1>
      <p className="mb-6 text-fluid-sm text-muted-foreground">
        <Bilingual
          en="Submissions awaiting your review."
          si="ඔබගේ සමාලෝචනය බලාපොරොත්තුවෙන් සිටින ඉදිරිපත් කිරීම්."
        />
      </p>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
        </div>
      ) : !data?.data.length ? (
        <Card>
          <CardContent className="flex min-h-32 items-center justify-center text-fluid-sm text-muted-foreground">
            <Bilingual en="No submissions awaiting review." si="සමාලෝචනය සඳහා ඉදිරිපත් කිරීම් නොමැත." />
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {data.data.map((item) => (
            <Card key={item.id} className="card-lift">
              <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-fluid-base">{gnLabel(item.gnDivision, lang)}</CardTitle>
                  <p className="text-fluid-sm text-muted-foreground">
                    {districtLabel(item.district, lang)} · {item.submittedBy.name} · {item.year}
                  </p>
                </div>
                <Badge>{item.status}</Badge>
              </CardHeader>
              <CardContent>
                <Button asChild size="sm" className="touch-target gap-1.5">
                  <Link href={`/regional-secretary/review/${item.id}`}>
                    <Eye className="size-4" />
                    <Bilingual en="Review" si="සමාලෝචනය කරන්න" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
