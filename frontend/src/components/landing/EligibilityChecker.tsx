"use client";
import { useMemo, useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight, Wand2, X } from "lucide-react";
import { scholarships, type Scholarship } from "./data";

type Form = {
  name: string;
  gender: "" | "Male" | "Female" | "Other";
  classLevel: "" | "10th" | "12th" | "UG" | "PG" | "ITI/Diploma";
  stream: "" | "Engineering" | "Medical" | "Arts" | "ITI/Diploma" | "Other";
  income: "" | "<2.5L" | "2.5L-5L" | "5L-8L" | ">8L";
  school: string;
};

const empty: Form = { name: "", gender: "", classLevel: "", stream: "", income: "", school: "" };

function matchScore(s: Scholarship, f: Form): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let ok = true;

  // Stream / category match
  if (f.stream && s.category !== "ITI/Diploma" && f.stream !== "Other") {
    if (s.category === f.stream) reasons.push(`${f.stream} stream matches`);
    else if (s.tags.some((t) => t.toLowerCase().includes("all"))) reasons.push("Open to all streams");
    else ok = false;
  }
  if (f.classLevel === "ITI/Diploma" && s.category !== "ITI/Diploma") ok = false;
  if (f.classLevel === "ITI/Diploma" && s.category === "ITI/Diploma") reasons.push("ITI / Diploma eligible");

  // Income
  if (f.income === "<2.5L") reasons.push("Low-income priority applies");
  if (f.income === ">8L" && s.tags.some((t) => t.toLowerCase().includes("income"))) ok = false;

  // Gender
  if (f.gender === "Female" && s.tags.some((t) => t.toLowerCase().includes("girls"))) {
    reasons.push("Girls priority scholarship");
  }

  if (reasons.length === 0 && ok) reasons.push("Meets baseline eligibility");
  return { ok, reasons };
}

export function EligibilityChecker() {
  const [form, setForm] = useState<Form>(empty);
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    return scholarships
      .map((s) => ({ s, ...matchScore(s, form) }))
      .filter((r) => r.ok);
  }, [form]);

  const ready = form.gender && form.classLevel && form.stream && form.income;

  return (
    <section id="apply" className="border-t border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Smart match
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Check how many scholarships fit you
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Answer 6 quick details. We'll instantly show every CSR scholarship you're eligible for — no signup needed.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-2">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
              <Wand2 className="h-4 w-4 text-primary" /> Your profile
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ananya Sharma"
                  className="input"
                />
              </Field>
              <Field label="Gender">
                <Select value={form.gender} onChange={(v) => setForm({ ...form, gender: v as Form["gender"] })}
                  options={["Male", "Female", "Other"]} />
              </Field>
              <Field label="Current class">
                <Select value={form.classLevel} onChange={(v) => setForm({ ...form, classLevel: v as Form["classLevel"] })}
                  options={["10th", "12th", "UG", "PG", "ITI/Diploma"]} />
              </Field>
              <Field label="Stream">
                <Select value={form.stream} onChange={(v) => setForm({ ...form, stream: v as Form["stream"] })}
                  options={["Engineering", "Medical", "Arts", "ITI/Diploma", "Other"]} />
              </Field>
              <Field label="Family income (annual)">
                <Select value={form.income} onChange={(v) => setForm({ ...form, income: v as Form["income"] })}
                  options={["<2.5L", "2.5L-5L", "5L-8L", ">8L"]} />
              </Field>
              <Field label="School / College">
                <input
                  value={form.school}
                  onChange={(e) => setForm({ ...form, school: e.target.value })}
                  placeholder="e.g. Kendriya Vidyalaya"
                  className="input"
                />
              </Field>
            </div>
            <button
              disabled={!ready}
              onClick={() => setSubmitted(true)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Find my scholarships <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              We don't store anything. Instant match, 100% private.
            </p>
          </div>

          {/* Results */}
          <div className="rounded-2xl border border-border bg-muted/30 p-6 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Match results</h3>
              {submitted && (
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                  {results.length} eligible
                </span>
              )}
            </div>

            {!submitted ? (
              <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/60 p-10 text-center">
                <Sparkles className="h-8 w-8 text-primary" />
                <p className="mt-3 text-sm font-medium text-foreground">Fill your profile to see matches</p>
                <p className="mt-1 text-xs text-muted-foreground">Live results appear here — instantly.</p>
              </div>
            ) : results.length === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/60 p-10 text-center">
                <X className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">No exact matches yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Try adjusting stream or income range.</p>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {results.map(({ s, reasons }) => (
                  <li key={s.name} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)]">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-[10px] font-bold text-foreground">
                        {s.logo}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.company} · <span className="font-semibold text-primary">{s.amount}</span></p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {reasons.slice(0, 2).map((r) => (
                            <span key={r} className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              <CheckCircle2 className="h-2.5 w-2.5" /> {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <a href="#scholarships" className="shrink-0 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-colors hover:bg-primary">
                      Apply
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .input { width:100%; border-radius:0.5rem; border:1px solid var(--color-border); background:var(--color-background); padding:0.55rem 0.75rem; font-size:0.875rem; color:var(--color-foreground); outline:none; transition:border-color .15s; }
        .input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-primary) 18%, transparent); }
      `}</style>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
      <option value="">Select…</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

