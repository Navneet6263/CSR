import { Search, SlidersHorizontal } from 'lucide-react';

export interface FilterState {
  query: string;
  sort: 'amount' | 'deadline';
}

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  totalCount: number;
  pageCount: number;
  matchedCount: number;
}

export function ScholarshipFilters({ value, onChange, totalCount, pageCount, matchedCount }: Props) {
  return <div className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={value.query} onChange={(event) => onChange({ ...value, query: event.target.value })}
          placeholder="Search scholarship or funding partner…"
          className="h-10 w-full rounded-full border border-border bg-muted/40 pl-9 pr-4 text-sm outline-none ring-ring/40 transition focus:border-ring focus:bg-card focus:ring-2" />
      </div>
      <div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <select value={value.sort} onChange={(event) => onChange({ ...value, sort: event.target.value as FilterState['sort'] })}
          className="h-10 rounded-full border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40">
          <option value="deadline">Closing soon</option><option value="amount">Highest amount</option>
        </select>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
      <span><strong className="text-foreground">{matchedCount}</strong> eligible on this page</span>
      <span><strong className="text-foreground">{pageCount}</strong> loaded · {totalCount} total results</span>
    </div>
  </div>;
}
