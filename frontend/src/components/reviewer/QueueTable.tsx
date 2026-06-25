'use client';
// src/components/reviewer/QueueTable.tsx
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { verificationApi } from "@/lib/api/verification";
import { ReviewApplicationRow } from "@/types/domain";

const urgencyStyles: Record<string, string> = {
  High: "bg-rose-100/80 text-rose-700 border-rose-200/60",
  Medium: "bg-amber-100/80 text-amber-700 border-amber-200/60",
  Low: "bg-emerald-100/80 text-emerald-700 border-emerald-200/60",
};

export function QueueTable() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [data, setData] = useState<ReviewApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificationApi.getPendingDocs().then((res) => {
      setData(res.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    return data.map((r) => {
      const dateStr = r.submissionDate || new Date().toISOString();
      const daysOld = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24);
      const urgency = daysOld > 3 ? 'High' : daysOld < 1 ? 'Low' : 'Medium';
      return { ...r, urgency };
    }).filter((r) => {
      const matchesQ =
        !query ||
        (r.studentName || "").toLowerCase().includes(query.toLowerCase()) ||
        String(r.applicationId).includes(query) ||
        (r.scholarshipName || "").toLowerCase().includes(query.toLowerCase());
      const matchesF = filter === "All" || r.urgency === filter;
      return matchesQ && matchesF;
    });
  }, [query, filter, data]);

  return (
    <section className="glass rounded-2xl p-5 sm:p-6 bg-white/50 shadow-sm border-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Review Queue</h2>
          <p className="text-sm text-muted-foreground">
            Applications awaiting document verification
          </p>
        </div>
        <div className="flex flex-1 items-center gap-2 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, ID, scholarship…"
              className="h-10 rounded-xl border-white/60 bg-white/70 pl-9 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-white/60 p-1 shadow-sm">
            <SlidersHorizontal className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
            {(["All", "High", "Medium", "Low"]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-white/80"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/60 bg-white/60 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-white/50">
              <TableHead className="py-3">Application</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Scholarship</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead className="text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading applications...
                </TableCell>
              </TableRow>
            )}
            {!loading && rows.map((r) => (
              <TableRow key={r.applicationId} className="border-b-white/40 transition-colors hover:bg-white/80">
                <TableCell className="py-4 font-mono text-xs text-muted-foreground">#{r.applicationId}</TableCell>
                <TableCell className="font-medium text-slate-800">{r.studentName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.scholarshipName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.submissionDate ? new Date(r.submissionDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`rounded-full font-medium ${urgencyStyles[r.urgency]}`}>
                    {r.urgency}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-4">
                  <Button asChild size="sm" className="rounded-full shadow-sm transition-all hover:scale-[1.04]">
                    <Link href={`/reviewer/audit/${r.applicationId}`}>
                      Audit Now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground bg-white/20">
                  No applications match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}