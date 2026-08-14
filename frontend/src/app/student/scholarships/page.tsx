'use client';

import { useMemo, useState, useEffect } from "react";
import { ScholarshipCard } from "@/components/student/scholarships/ScholarshipCard";
import {
  ScholarshipFilters,
  type FilterState,
} from "@/components/student/scholarships/ScholarshipFilters";
import { studentApi, scholarshipApi } from "@/lib/api";
import type { MatchResult, Scholarship } from "@/lib/scholarships";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, CalendarClock, PauseCircle } from 'lucide-react';
import DataPagination from '@/components/shared/DataPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function ScholarshipsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    query: searchParams.get('query') ?? "",
    sort: "deadline",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scholarshipsData, setScholarshipsData] = useState<Scholarship[]>([]);
  const [matches, setMatches] = useState<Map<string, MatchResult>>(new Map());
  const [profileStatus, setProfileStatus] = useState({ completion: 0, missing: [] as string[] });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const debouncedQuery = useDebouncedValue(filters.query);

  useEffect(() => {
    studentApi.getProfile().then((profileRes) => setProfileStatus({
      completion: profileRes.data?.profileCompletion ?? 0,
      missing: profileRes.data?.missingProfileSections ?? [],
    })).catch((reason) => setError(reason instanceof Error ? reason.message : 'Profile could not be loaded.'));
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ status: 'Active,Paused', page: String(page), limit: String(limit), sort: filters.sort });
        if (debouncedQuery.trim()) params.set('search', debouncedQuery.trim());
        const scholRes = await scholarshipApi.getAll(params.toString());
        const rawSchols = scholRes.data?.scholarships || scholRes.data || [];
        const ids = Array.isArray(rawSchols) ? rawSchols.map((item: any) => Number(item.ScholarshipID ?? item.scholarshipId)).filter(Boolean) : [];
        const matchRes = await studentApi.getMatches(ids);
        if (!active) return;
        const evaluationMap = new Map<string, MatchResult>();
        for (const item of matchRes.data?.matched ?? []) evaluationMap.set(String(item.scholarshipId), { matched: true, score: 100, reasons: ['All configured eligibility rules passed'], blockers: [] });
        for (const item of matchRes.data?.failed ?? []) evaluationMap.set(String(item.scholarshipId), { matched: false, score: 0, reasons: [], blockers: item.reasons });
        setMatches(evaluationMap);
        const mappedSchols: Scholarship[] = Array.isArray(rawSchols) ? rawSchols.map((s: any) => ({
          id: (s.ScholarshipID || s.id || '').toString(),
          title: s.Name || s.name || "",
          provider: s.SponsorName || s.provider || "",
          amount: Number(s.PerStudentAmount || s.perStudentAmount) || 0,
          deadline: s.ApplicationCloseDate || s.applicationCloseDate,
          category: "General",
          tags: [s.Status || s.status].filter(Boolean),
          description: s.Description || s.description || "",
          logoUrl: s.SponsorLogoURL || s.sponsorLogoURL || undefined,
          status: s.Status || s.status || 'Active',
          pauseReason: s.PauseReason || s.pauseReason || undefined,
          resumeAt: s.ResumeAt || s.resumeAt || undefined,
          publishPauseNotice: Boolean(s.PublishPauseNotice ?? s.publishPauseNotice),
        })) : [];
        setScholarshipsData(mappedSchols);
        setTotal(Number(scholRes.data?.pagination?.total ?? mappedSchols.length));
        setError('');
      } catch (e) {
        if (active) { setError(e instanceof Error ? e.message : 'Scholarships could not be loaded.'); setScholarshipsData([]); setTotal(0); }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [debouncedQuery, filters.sort, limit, page]);

  const evaluated = useMemo(
    () => {
      return scholarshipsData.map((s) => ({ s, match: matches.get(s.id) ?? {
        matched: false, score: 0, reasons: [], blockers: ['Complete your profile to evaluate eligibility'],
      } }));
    },
    [scholarshipsData, matches],
  );

  const matchedCount = evaluated.filter((e) => e.match.matched).length;
  const pausedScholarships = evaluated.filter(({ s }) => s.status === 'Paused').map(({ s }) => s);

  if (loading && !scholarshipsData.length) {
    return <div className="min-h-screen p-8 text-center text-muted-foreground">Loading scholarships...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          Scholarships matched to you
        </h1>
        <p className="text-sm text-muted-foreground">
          Personalised picks based on your class, stream, income, and category.
          Locked cards mean you don't meet the eligibility yet.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </p>
      )}

      {pausedScholarships.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-orange-200 bg-orange-50">
          <div className="flex items-center gap-2 border-b border-orange-200 px-4 py-3 text-orange-950">
            <PauseCircle className="h-5 w-5" />
            <h2 className="font-semibold">Temporarily paused scholarship updates</h2>
          </div>
          <ul className="divide-y divide-orange-200">
            {pausedScholarships.map((item) => (
              <li key={item.id} className="px-4 py-3 text-sm text-orange-950">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-orange-900/80">{item.pauseReason || 'Applications are temporarily unavailable while the program is reviewed.'}</p>
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {item.resumeAt ? `Planned reopening: ${new Date(item.resumeAt).toLocaleString('en-IN')}` : 'Reopening date will be announced soon'}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profileStatus.completion < 100 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">Your profile is only {profileStatus.completion}% complete</h2>
              <p className="mt-1 text-sm text-amber-900/80">
                You cannot submit a scholarship application until the required profile details and documents are complete.
              </p>
              {profileStatus.missing.length > 0 && (
                <p className="mt-2 text-xs font-medium">
                  Missing sections: {profileStatus.missing.join(', ')}
                </p>
              )}
            </div>
            <Link href="/student/profile" className="shrink-0 rounded-full bg-amber-900 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800">
              Complete profile
            </Link>
          </div>
        </section>
      )}

      <ScholarshipFilters
        value={filters}
        onChange={(value) => { setFilters(value); setPage(1); }}
        totalCount={total}
        pageCount={evaluated.length}
        matchedCount={matchedCount}
      />

      {loading && <div className="h-1 overflow-hidden rounded-full bg-muted"><div className="h-full w-1/3 animate-pulse rounded-full bg-primary" /></div>}
      {evaluated.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No scholarships fit those filters. Try clearing the search or category.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evaluated.map(({ s, match }) => (
            <ScholarshipCard key={s.id} scholarship={s} match={match} />
          ))}
        </div>
      )}
      {total > 0 && <DataPagination page={page} limit={limit} total={total} loading={loading}
        pageSizes={[12, 24, 48]} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />}
    </main>
  );
}
