'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  limit: number;
  total: number;
  loading?: boolean;
  pageSizes?: number[];
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

function pageItems(page: number, pages: number) {
  const values = new Set([1, pages, page - 1, page, page + 1]);
  return [...values].filter((value) => value >= 1 && value <= pages).sort((a, b) => a - b);
}

export default function DataPagination({ page, limit, total, loading = false,
  pageSizes = [12, 24, 48], onPageChange, onLimitChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = total ? (safePage - 1) * limit + 1 : 0;
  const end = Math.min(total, safePage * limit);
  const items = pageItems(safePage, pages);

  return <nav aria-label="List pagination" className="flex flex-col gap-3 rounded-xl border bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
      <span>Showing <b className="text-slate-900">{start}–{end}</b> of <b className="text-slate-900">{total}</b></span>
      {onLimitChange && <label className="inline-flex items-center gap-1.5">Rows
        <select value={limit} disabled={loading} onChange={(event) => onLimitChange(Number(event.target.value))} className="rounded-lg border bg-white px-2 py-1 text-xs text-slate-700">
          {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>}
    </div>
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Previous page" disabled={loading || safePage <= 1} onClick={() => onPageChange(safePage - 1)} className="grid h-8 w-8 place-items-center rounded-lg border disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft className="h-4 w-4" /></button>
      {items.map((item, index) => <span key={item} className="contents">
        {index > 0 && item - items[index - 1] > 1 && <span className="px-1 text-xs text-slate-400">…</span>}
        <button type="button" aria-current={item === safePage ? 'page' : undefined} disabled={loading} onClick={() => onPageChange(item)} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold ${item === safePage ? 'bg-slate-950 text-white' : 'border bg-white text-slate-600 hover:bg-slate-50'}`}>{item}</button>
      </span>)}
      <button type="button" aria-label="Next page" disabled={loading || safePage >= pages} onClick={() => onPageChange(safePage + 1)} className="grid h-8 w-8 place-items-center rounded-lg border disabled:cursor-not-allowed disabled:opacity-35"><ChevronRight className="h-4 w-4" /></button>
    </div>
  </nav>;
}
