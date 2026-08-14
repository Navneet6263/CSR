'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import ConsentForm from '@/components/student/apply/ConsentForm';
import SuccessView from '@/components/student/apply/SuccessView';
import { applicationApi, scholarshipApi, studentApi } from '@/lib/api';
import type { Scholarship, StudentProfile } from '@/types';

export default function ApplyForScholarshipPage() {
  const scholarshipId = Number(useParams<{ id: string }>().id);
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Number.isInteger(scholarshipId) || scholarshipId <= 0) {
      setError('Invalid scholarship.');
      setLoading(false);
      return;
    }
    Promise.all([scholarshipApi.getById(scholarshipId), studentApi.getProfile()])
      .then(([scholarshipResponse, profileResponse]) => {
        setScholarship(scholarshipResponse.data);
        setProfile(profileResponse.data);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Application details could not be loaded.'))
      .finally(() => setLoading(false));
  }, [scholarshipId]);

  async function submitApplication() {
    if (!agreed || !scholarship) return;
    setSubmitting(true);
    setError('');
    try {
      const draft = await applicationApi.create(scholarshipId);
      if (!draft.data.applicationId) throw new Error('Application draft could not be created.');
      await applicationApi.submit(draft.data.applicationId);
      setSubmitted(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Application could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  if (!scholarship || !profile) return <Message message={error || 'Application details are unavailable.'} />;
  if (scholarship.status === 'Paused') return <Message message={scholarship.resumeAt
    ? `Applications are paused. Planned reopening: ${new Date(scholarship.resumeAt).toLocaleString('en-IN')}. ${scholarship.pauseReason || ''}`
    : `Applications are paused. ${scholarship.pauseReason || 'A reopening date will be announced soon.'}`} />;
  if (submitted) return <main className="mx-auto max-w-5xl px-4 py-8"><SuccessView scholarship={scholarship} /></main>;

  const completion = profile.profileCompletion ?? 0;
  const missing = profile.missingProfileSections ?? [];
  const profileIncomplete = completion < 100;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <Link href="/student/scholarships" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to scholarships
      </Link>

      <header className="rounded-2xl border bg-card p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Scholarship application</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">{scholarship.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{scholarship.sponsorName} · ₹{scholarship.perStudentAmount.toLocaleString('en-IN')}</p>
      </header>

      {profileIncomplete ? (
        <section role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
            <div>
              <h2 className="text-lg font-bold">Application cannot be submitted yet</h2>
              <p className="mt-1 text-sm leading-6">Your profile is {completion}% complete. Finish all required sections before applying.</p>
              {missing.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                  {missing.map((section) => <li key={section}>{section}</li>)}
                </ul>
              )}
              <Link href="/student/profile" className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800">
                Complete my profile <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <ConsentForm scholarship={scholarship} agreed={agreed} setAgreed={setAgreed} />
          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
          <div className="flex justify-end border-t pt-5">
            <button type="button" onClick={() => void submitApplication()} disabled={!agreed || submitting}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</> : <>Submit application <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        </>
      )}
    </main>
  );
}

function Message({ message }: { message: string }) {
  return <main className="mx-auto max-w-3xl px-4 py-10"><p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{message}</p><Link href="/student/scholarships" className="mt-4 inline-flex text-sm font-semibold text-primary">Back to scholarships</Link></main>;
}
