import { Calendar, CheckCircle2, IndianRupee, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import type { MatchResult, Scholarship } from "@/lib/scholarships";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const API_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, '');
const assetUrl = (value: string) => value.startsWith('/api/v1/') ? `${API_ORIGIN}${value}` : `${API_BASE}${value}`;

interface Props {
  scholarship: Scholarship;
  match: MatchResult;
}

export function ScholarshipCard({ scholarship: s, match }: Props) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(s.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
  const urgent = daysLeft <= 14;

  return (
    <article
      className={`group relative flex flex-col rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
        match.matched ? "border-border" : "border-dashed border-border/70 opacity-75"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
            {s.category}
          </span>
          {match.matched && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> {match.score}% match
            </span>
          )}
        </div>
        {!match.matched && (
          <span title="Not eligible based on your profile">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </span>
        )}
      </div>

      {s.logoUrl && (
        <div className="mt-3 flex h-12 items-center rounded-xl border border-border bg-white px-3">
          {/* Authenticated API image; browser sends the existing session cookie. */}
          <img src={assetUrl(s.logoUrl)} alt={`${s.provider} logo`} className="max-h-8 max-w-[140px] object-contain" />
        </div>
      )}

      <h3 className="mt-3 font-display text-lg font-semibold leading-tight tracking-tight">
        {s.title}
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">by {s.provider}</p>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          <IndianRupee className="h-4 w-4 text-primary" />
          <span className="font-semibold">₹{s.amount.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={urgent ? "font-semibold text-destructive" : "text-muted-foreground"}>
            {daysLeft}d left
          </span>
        </div>
      </div>

      {match.matched ? (
        <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
          {match.reasons.slice(0, 2).map((r) => (
            <li key={r} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              {r}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
          {match.blockers.slice(0, 2).map((b) => (
            <li key={b}>• {b}</li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
        {match.matched ? (
          <Link
            href={`/student/scholarships/${s.id}/apply`}
            className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Apply now
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title={match.blockers.join(', ') || 'Your profile does not meet the configured rules'}
            className="flex-1 cursor-not-allowed rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground"
          >
            Not eligible
          </button>
        )}
        <Link href={`/student/scholarships/${s.id}`} className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent">
          Details
        </Link>
      </div>
    </article>
  );
}
