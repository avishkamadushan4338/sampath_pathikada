"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowUpDown, Eye, Search } from "lucide-react";
import { Bilingual } from "@/components/Bilingual";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DISTRICTS, GN_DIVISIONS } from "@/lib/registration-data";
import { STATUS_LABEL, STATUS_BADGE_CLASS, STATUS_ICON, type SubmissionStatus } from "@/lib/status-ui";
import { CURRENT_YEAR } from "@/lib/constants";

interface ReviewListItem {
  id: string;
  year: number;
  district: string;
  dsDivision: string;
  gnDivision: string;
  status: SubmissionStatus;
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

type SortKey = "gnDivision" | "officer" | "district" | "updatedAt" | "status";
type SortDir = "asc" | "desc";

const STATUS_FILTER_OPTIONS: { value: SubmissionStatus | "all"; label: { en: string; si: string } }[] = [
  { value: "SUBMITTED", label: STATUS_LABEL.SUBMITTED },
  { value: "REVISION_NEEDED", label: STATUS_LABEL.REVISION_NEEDED },
  { value: "APPROVED", label: STATUS_LABEL.APPROVED },
  { value: "REJECTED", label: STATUS_LABEL.REJECTED },
  { value: "all", label: { en: "All statuses", si: "සියලුම තත්ත්ව" } },
];

function QueueSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-6 h-5 w-80" />
      <Skeleton className="mb-4 h-10 w-full" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

export default function ReviewQueuePage() {
  const { lang } = useLanguage();
  const { data, isLoading } = useSWR(`/api/submissions?year=${CURRENT_YEAR}&limit=100`, fetcher);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("SUBMITTED");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    let rows = data?.data ?? [];
    if (statusFilter !== "all") rows = rows.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) => {
        const gn = gnLabel(r.gnDivision, lang).toLowerCase();
        const gnOther = gnLabel(r.gnDivision, lang === "si" ? "en" : "si").toLowerCase();
        return gn.includes(q) || gnOther.includes(q) || r.submittedBy.name.toLowerCase().includes(q);
      });
    }

    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "gnDivision":
          cmp = gnLabel(a.gnDivision, lang).localeCompare(gnLabel(b.gnDivision, lang));
          break;
        case "officer":
          cmp = a.submittedBy.name.localeCompare(b.submittedBy.name);
          break;
        case "district":
          cmp = districtLabel(a.district, lang).localeCompare(districtLabel(b.district, lang));
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "updatedAt":
        default:
          cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [data, statusFilter, search, sortKey, sortDir, lang]);

  function SortHeader({ label, sortKeyValue }: { label: { en: string; si: string }; sortKeyValue: SortKey }) {
    return (
      <button
        type="button"
        onClick={() => toggleSort(sortKeyValue)}
        className="flex touch-target items-center gap-1 text-fluid-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
      >
        <Bilingual {...label} />
        <ArrowUpDown className={`size-3 ${sortKey === sortKeyValue ? "text-primary" : "text-muted-foreground/40"}`} aria-hidden="true" />
      </button>
    );
  }

  if (isLoading) return <QueueSkeleton />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-display text-fluid-2xl font-semibold text-primary">
        <Bilingual en="Review Queue" si="සමාලෝචන පෝලිම" />
      </h1>
      <p className="mb-6 text-fluid-sm text-muted-foreground">
        <Bilingual
          en={`${filtered.length} of ${data?.total ?? 0} submission(s) in your division`}
          si={`ඔබගේ වසමේ ඉදිරිපත් කිරීම් ${data?.total ?? 0} න් ${filtered.length} ක්`}
        />
      </p>

      {/* Search + filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "si" ? "ග්‍රාම නිලධාරී වසම හෝ නිලධාරී නාමය සොයන්න..." : "Search GN division or officer name…"}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SubmissionStatus | "all")}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {lang === "si" ? opt.label.si : opt.label.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-32 items-center justify-center text-fluid-sm text-muted-foreground">
            <Bilingual en="No submissions match your filters." si="ඔබගේ පෙරහන්වලට ගැලපෙන ඉදිරිපත් කිරීම් නොමැත." />
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead><SortHeader label={{ en: "GN Division", si: "ග්‍රාම නිලධාරී වසම" }} sortKeyValue="gnDivision" /></TableHead>
                <TableHead className="hidden md:table-cell"><SortHeader label={{ en: "District", si: "දිස්ත්‍රික්කය" }} sortKeyValue="district" /></TableHead>
                <TableHead><SortHeader label={{ en: "Officer", si: "නිලධාරී" }} sortKeyValue="officer" /></TableHead>
                <TableHead className="hidden sm:table-cell"><SortHeader label={{ en: "Updated", si: "යාවත්කාලීන කළ දිනය" }} sortKeyValue="updatedAt" /></TableHead>
                <TableHead><SortHeader label={{ en: "Status", si: "තත්ත්වය" }} sortKeyValue="status" /></TableHead>
                <TableHead className="text-right">
                  <span className="text-fluid-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Bilingual en="Action" si="ක්‍රියාව" />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const StatusIcon = STATUS_ICON[item.status];
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-foreground">{gnLabel(item.gnDivision, lang)}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{districtLabel(item.district, lang)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-foreground">{item.submittedBy.name}</span>
                        <span className="text-fluid-xs text-muted-foreground">{item.submittedBy.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                      {new Date(item.updatedAt).toLocaleDateString(lang === "si" ? "si-LK" : "en-LK", { year: "numeric", month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`gap-1.5 ${STATUS_BADGE_CLASS[item.status]}`}>
                        <StatusIcon className="size-3" aria-hidden="true" />
                        {STATUS_LABEL[item.status][lang]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline" className="touch-target gap-1.5">
                        <Link href={`/divisional-secretariat/review/${item.id}`}>
                          <Eye className="size-4" />
                          <Bilingual en="Review" si="සමාලෝචනය" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
