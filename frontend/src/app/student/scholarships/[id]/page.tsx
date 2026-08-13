'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Building2, CalendarDays, CheckCircle2, FileCheck2, Gift, IndianRupee, ListChecks, Loader2, Scale } from 'lucide-react';
import { scholarshipApi } from '@/lib/api';
import type { Scholarship } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const API_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, '');
const assetUrl = (value: string) => value.startsWith('/api/v1/') ? `${API_ORIGIN}${value}` : `${API_BASE}${value}`;

export default function StudentScholarshipDetailsPage() {
  const id = Number(useParams<{ id: string }>().id);
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    scholarshipApi.getById(id).then((response) => setScholarship(response.data))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Scholarship details could not be loaded.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  if (!scholarship) return <main className="mx-auto max-w-4xl p-6"><p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}</p></main>;

  const content = scholarship.publishedContent;
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
    <Link href="/student/scholarships" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to scholarships</Link>

    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Funded scholarship program</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{scholarship.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{content?.overview || scholarship.description || 'Program information is being prepared by the sponsor.'}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5"><Building2 className="h-3.5 w-3.5" />Funded by {scholarship.sponsorName}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800"><IndianRupee className="h-3.5 w-3.5" />₹{scholarship.perStudentAmount.toLocaleString('en-IN')} per student</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-900"><CalendarDays className="h-3.5 w-3.5" />Closes {new Date(scholarship.applicationCloseDate).toLocaleDateString('en-IN')}</span>
          </div>
        </div>
        <div className="flex min-w-48 flex-col items-center justify-center rounded-2xl border bg-white p-5 text-center">
          {scholarship.sponsorLogoURL ? <img src={assetUrl(scholarship.sponsorLogoURL)} alt={`${scholarship.sponsorName} logo`} className="max-h-20 max-w-44 object-contain" /> : <Building2 className="h-12 w-12 text-muted-foreground" />}
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Funding partner</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{scholarship.sponsorName}</p>
        </div>
      </div>
    </section>

    {content ? <div className="grid gap-5 lg:grid-cols-2">
      <ContentCard icon={CheckCircle2} title="Program highlights" items={content.highlights} />
      <ContentCard icon={Scale} title="Eligibility" items={content.eligibility} />
      <ContentCard icon={Gift} title="Benefits" items={content.benefits} />
      <ContentCard icon={FileCheck2} title="Required documents" items={content.requiredDocuments} />
      <ContentCard icon={ListChecks} title="How to apply" items={content.applicationSteps} numbered />
      <ContentCard icon={Scale} title="Terms & conditions" items={content.termsAndConditions} />
      {content.faqs.length > 0 && <section className="rounded-2xl border bg-card p-5 lg:col-span-2"><h2 className="text-lg font-bold">Frequently asked questions</h2><div className="mt-4 divide-y">{content.faqs.map((faq) => <div key={faq.question} className="py-4 first:pt-0 last:pb-0"><h3 className="text-sm font-semibold">{faq.question}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{faq.answer}</p></div>)}</div></section>}
    </div> : <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Detailed terms are still under sponsor review. You can view the core program information now, but the admin must publish the verified content before accepting applications.</p>}

    <div className="sticky bottom-4 flex flex-col items-center justify-between gap-3 rounded-2xl border bg-background/95 p-4 shadow-xl backdrop-blur sm:flex-row">
      <p className="text-xs text-muted-foreground">Review all eligibility rules, documents, and terms before applying.</p>
      <Link href={`/student/scholarships/${id}/apply`} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Review & apply <ArrowRight className="h-4 w-4" /></Link>
    </div>
  </main>;
}

function ContentCard({ icon: Icon, title, items, numbered = false }: { icon: typeof CheckCircle2; title: string; items: string[]; numbered?: boolean }) {
  return <section className="rounded-2xl border bg-card p-5"><h2 className="flex items-center gap-2 text-lg font-bold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>{title}</h2><ol className="mt-4 space-y-3">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-bold text-foreground">{numbered ? index + 1 : '✓'}</span>{item}</li>)}</ol></section>;
}
