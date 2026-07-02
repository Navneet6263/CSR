'use client';

import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Filter, Search } from "lucide-react";
import { ApplicationRow } from "@/components/student/applications/ApplicationRow";
import { applicationApi } from "@/lib/api";
import type { Application } from "@/lib/mockData";

const PAGE = 10;
const FILTERS: Array<"All" | Application["status"]> = [
  "All",
  "Under Review",
  "Pending",
  "Funded",
  "Rejected",
];

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [allApplications, setAllApplications] = useState<Application[]>([]);

  useEffect(() => {
    async function fetchApps() {
      try {
        const res = await applicationApi.getMy();
        const raw = res.data || [];
        const mapped = raw.map((a: any) => {
          const st = a.Status || a.status;
          let mappedStatus = 'Pending';
          if (st === 'Approved' || st === 'Disbursed') mappedStatus = 'Funded';
          else if (st === 'Rejected') mappedStatus = 'Rejected';
          else if (st === 'DocVerification' || st === 'BGCheck' || st === 'CommitteeReview') mappedStatus = 'Under Review';
          
          const amt = a.ScholarshipAmount || a.scholarshipAmount;
          return {
            id: (a.ApplicationID || a.id || '').toString(),
            scholarship: a.ScholarshipName || a.scholarshipName || "Scholarship",
            appliedOn: new Date(a.CreatedAt || a.createdAt).toLocaleDateString(),
            currentStage: st,
            amount: amt ? `₹${amt}` : "Variable",
            status: mappedStatus as Application["status"]
          };
        });
        setAllApplications(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const filtered = useMemo(() => {
    return allApplications.filter((a) => {
      const okStatus = filter === "All" || a.status === filter;
      const okQ = !q || a.scholarship.toLowerCase().includes(q.toLowerCase()) || a.id.includes(q);
      return okStatus && okQ;
    });
  }, [allApplications, filter, q]);

  const visible = filtered.slice(0, shown);
  const hasMore = shown < filtered.length;

  if (loading) {
    return <div className="min-h-screen p-8 text-center text-muted-foreground">Loading applications...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl text-foreground">My Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} application{filtered.length === 1 ? "" : "s"} • showing {visible.length}
          </p>
        </div>
        <Link
          href="/student/scholarships"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          + New application
        </Link>
      </header>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShown(PAGE);
            }}
            placeholder="Search by name or ID…"
            className="h-10 w-full rounded-full border border-border bg-muted/40 pl-9 pr-4 text-sm outline-none focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f);
                setShown(PAGE);
              }}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-accent text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((a) => (
          <ApplicationRow key={a.id} app={a} />
        ))}
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No applications match your filters.
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((s) => s + PAGE)}
            className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold hover:bg-accent text-accent-foreground"
          >
            Load 10 more ({filtered.length - shown} left)
          </button>
        </div>
      )}
    </main>
  );
}
