'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Plus, GraduationCap, Users, Wallet, Calendar, CalendarClock, Building2, Search, SlidersHorizontal, X } from "lucide-react";
import { adminApi, scholarshipApi } from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import DataPagination from '@/components/shared/DataPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

function inr(n: number) {
  return "₹ " + n.toLocaleString("en-IN");
}

export default function ScholarshipsListPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [company, setCompany] = useState('All');
  const [status, setStatus] = useState('All');
  const [companies, setCompanies] = useState<Array<{ SponsorID: number; SponsorName: string }>>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (debouncedQuery.trim()) params.set('search', debouncedQuery.trim());
    if (company !== 'All') params.set('sponsorId', company);
    if (status !== 'All') params.set('status', status);
    scholarshipApi.getAll(params.toString()).then((response) => {
      if (!active) return;
      setPrograms(response.data?.scholarships ?? []);
      setTotal(Number(response.data?.pagination?.total ?? 0));
      setError('');
    }).catch((reason) => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : 'Scholarships could not be loaded.');
      setPrograms([]); setTotal(0);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [company, debouncedQuery, limit, page, status]);

  useEffect(() => {
    adminApi.getSponsors().then((response) => setCompanies((response.data ?? []).map((item) => ({
      SponsorID: Number(item.SponsorID), SponsorName: String(item.SponsorName),
    })))).catch(() => setCompanies([]));
  }, []);

  const hasFilters = Boolean(query.trim()) || company !== 'All' || status !== 'All';
  function clearFilters() { setQuery(''); setCompany('All'); setStatus('All'); setPage(1); }

  if (loading && !programs.length) return <div className="h-full flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Scholarships
          </h1>
          <p className="text-[13px] text-slate-500">
            Manage active programs, drafts and eligibility configurations.
          </p>
        </div>
        <Link
          href="/admin/scholarships/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Scholarship
        </Link>
      </header>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100"><SlidersHorizontal className="h-4 w-4 text-slate-600" /></span><div><h2 className="text-sm font-semibold text-slate-900">Find scholarships</h2><p className="text-[11px] text-slate-500">Search by program or filter funding company.</p></div></div>
          <p className="text-xs text-slate-500"><b className="text-slate-900">{programs.length}</b> on this page · <b className="text-slate-900">{total}</b> results</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(260px,1fr)_minmax(220px,0.65fr)_180px_auto]">
          <label className="relative block"><span className="sr-only">Search scholarships</span><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search scholarship name or company…" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white" /></label>
          <label className="relative block"><span className="sr-only">Filter by funding company</span><Building2 className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><select value={company} onChange={(event) => { setCompany(event.target.value); setPage(1); }} className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-slate-400"><option value="All">All funding companies ({companies.length})</option>{companies.map((item) => <option key={item.SponsorID} value={item.SponsorID}>{item.SponsorName}</option>)}</select></label>
          <label><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"><option value="All">All statuses</option><option value="Active">Active</option><option value="Paused">Paused</option><option value="Inactive">Inactive</option><option value="Closed">Closed</option></select></label>
          <button type="button" onClick={clearFilters} disabled={!hasFilters} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><X className="h-3.5 w-3.5" />Clear</button>
        </div>
        {company !== 'All' && <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800"><Building2 className="h-3.5 w-3.5" />Showing only scholarships funded by <b>{companies.find((item) => String(item.SponsorID) === company)?.SponsorName || 'selected company'}</b></div>}
      </section>

      {loading && <div className="h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-1/3 animate-pulse rounded-full bg-slate-500" /></div>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {programs.map((p) => {
          const seats = Number(p.MaxApplicants ?? 0);
          const filled = Number(p.ApplicantCount ?? 0);
          const pct = seats > 0 ? Math.round((filled / seats) * 100) : 0;
          return (
            <div key={p.ScholarshipID} className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white shrink-0">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                    (p.Status === "Active"
                      ? "bg-emerald-50 text-emerald-700"
                      : p.Status === "Paused" ? "bg-orange-50 text-orange-700"
                      : "bg-slate-100 text-slate-600")
                  }
                >
                  {p.Status}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900 truncate">{p.Name}</h3>
              <p className="text-[12px] text-slate-500 truncate">{p.SponsorName}</p>
              {p.Status === 'Paused' && <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-900"><p className="font-semibold">{p.PauseReason || 'Temporarily paused'}</p><p className="mt-1 flex items-center gap-1 text-[10px]"><CalendarClock className="h-3 w-3" />{p.ResumeAt ? `Auto-resume ${new Date(p.ResumeAt).toLocaleString('en-IN')}` : 'Manual resume required'}</p></div>}

              <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                <Stat icon={<Wallet className="h-3.5 w-3.5" />} label="Budget" value={inr(Number(p.TotalBudget))} />
                <Stat icon={<Users className="h-3.5 w-3.5" />} label="Seats" value={seats ? `${filled}/${seats}` : String(filled)} />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Filled</span>
                  <span className="tabular-nums">{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Closes {new Date(p.ApplicationCloseDate).toLocaleDateString('en-IN')}
                </span>
                <Link
                  href={`/admin/scholarships/${p.ScholarshipID}`}
                  className="text-slate-900 font-medium hover:underline"
                >
                  Manage →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {!programs.length && !error && !loading && <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 text-sm font-semibold text-slate-800">No matching scholarships</h2><p className="mt-1 text-xs text-slate-500">Search ya company/status filter change karke dekho.</p>{hasFilters && <button onClick={clearFilters} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Clear all filters</button>}</section>}
      {total > 0 && <DataPagination page={page} limit={limit} total={total} loading={loading} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5">
      <div className="flex items-center gap-1 text-slate-500">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-slate-900 tabular-nums truncate">{value}</p>
    </div>
  );
}
