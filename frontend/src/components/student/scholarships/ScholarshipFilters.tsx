import { Search, SlidersHorizontal } from "lucide-react";
import { scholarshipCategories, type ScholarshipCategory } from "@/lib/scholarships";

export interface FilterState {
  query: string;
  category: ScholarshipCategory | "All";
  onlyMatched: boolean;
  sort: "match" | "amount" | "deadline";
}

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  totalCount: number;
  matchedCount: number;
}

export function ScholarshipFilters({ value, onChange, totalCount, matchedCount }: Props) {
  const set = <K extends keyof FilterState>(key: K, v: FilterState[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={value.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Search by title, provider, or tag…"
            className="h-10 w-full rounded-full border border-border bg-muted/40 pl-9 pr-4 text-sm outline-none ring-ring/40 transition focus:border-ring focus:bg-card focus:ring-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={value.sort}
            onChange={(e) => set("sort", e.target.value as FilterState["sort"])}
            className="h-10 rounded-full border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="match">Best match</option>
            <option value="amount">Highest amount</option>
            <option value="deadline">Closing soon</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["All", ...scholarshipCategories] as const).map((c) => {
          const active = value.category === c;
          return (
            <button
              key={c}
              onClick={() => set("category", c)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={value.onlyMatched}
            onChange={(e) => set("onlyMatched", e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Show only scholarships matched to my profile
        </label>
        <span>
          Showing <strong className="text-foreground">{matchedCount}</strong> matched of{" "}
          {totalCount} total
        </span>
      </div>
    </div>
  );
}
