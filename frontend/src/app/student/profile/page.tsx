'use client';

import { Suspense, useMemo, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Save, ShieldCheck } from "lucide-react";
import { ProgressRing } from "@/components/student/profile/ProgressRing";
import { SectionNav } from "@/components/student/profile/SectionNav";
import { PersonalSection } from "@/components/student/profile/sections/PersonalSection";
import { FamilySection } from "@/components/student/profile/sections/FamilySection";
import { EducationSection } from "@/components/student/profile/sections/EducationSection";
import { BankSection } from "@/components/student/profile/sections/BankSection";
import { SopSection } from "@/components/student/profile/sections/SopSection";
import { DocumentsSection } from "@/components/student/profile/sections/DocumentsSection";
import { studentApi, authApi, institutionApi } from "@/lib/api";
import type { Institution } from '@/types';
import { profileUpdatePayload, studentToForm } from '@/lib/profilePayload';
import {
  INITIAL_FORM,
  SECTIONS,
  overallCompletion,
  type ProfileFormState,
  type SectionId,
} from "@/lib/profileForm";

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileFormState>(INITIAL_FORM);
  const [active, setActive] = useState<SectionId>("personal");
  const [userName, setUserName] = useState("Student");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const u = authApi.getUser();
    if (u) setUserName(u.fullName);

    Promise.all([studentApi.getProfile(), institutionApi.getAll()]).then(([profile, institutionList]) => {
      if (profile.data) setForm(studentToForm(profile.data));
      setInstitutions(institutionList.data ?? []);
    }).catch((error) => setNotice(error instanceof Error ? error.message : 'Unable to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof ProfileFormState>(k: K, v: ProfileFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const overall = useMemo(() => overallCompletion(form), [form]);
  const idx = SECTIONS.findIndex((s) => s.id === active);
  const prev = SECTIONS[idx - 1];
  const next = SECTIONS[idx + 1];

  const handleSave = async () => {
    setSaving(true); setNotice('');
    try {
      await studentApi.updateProfile(profileUpdatePayload(form));
      setNotice('Draft saved securely.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-muted" />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <ProfileHeader name={userName} overall={overall} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <SectionNav form={form} active={active} onSelect={setActive} />
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mb-1 inline h-4 w-4 text-success" /> Your data is encrypted &
            only shared with approved CSR partners.
          </div>
        </aside>

        <div className="space-y-6">
          <Suspense fallback={<div className="h-40 rounded-2xl bg-muted animate-pulse" />}>
            {active === "personal" && <PersonalSection form={form} set={set} />}
            {active === "family" && <FamilySection form={form} set={set} />}
            {active === "education" && <EducationSection form={form} set={set} institutions={institutions} />}
            {active === "bank" && <BankSection form={form} set={set} />}
            {active === "sop" && <SopSection form={form} set={set} />}
            {active === "documents" && <DocumentsSection form={form} set={set} />}
          </Suspense>

          {notice && <p role="status" className="rounded-xl border border-border bg-card p-3 text-sm text-foreground">{notice}</p>}

          <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={!prev}
              onClick={() => prev && setActive(prev.id)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold transition hover:bg-accent disabled:opacity-40 text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> {prev ? prev.title : "Back"}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold transition hover:bg-accent text-foreground"
              >
                {saving ? "Saving..." : <><Save className="h-4 w-4" /> Save draft</>}
              </button>
              <button
                type="button"
                disabled={!next}
                onClick={() => next && setActive(next.id)}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-40"
              >
                {next ? next.title : "Submit"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </main>
  );
}

function ProfileHeader({ name, overall }: { name: string; overall: number }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <section
      className="relative overflow-hidden rounded-2xl p-5 text-primary-foreground sm:p-7 shadow-[var(--shadow-glow)]"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-base font-bold backdrop-blur">
            {initials}
          </div>
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur">
              Profile completion
            </span>
            <h1 className="mt-1.5 truncate text-xl font-bold sm:text-2xl font-sans">
              Hi {name.split(" ")[0]}, you're {overall}% connected
            </h1>
            <p className="mt-1 max-w-md text-xs text-white/85 sm:text-sm">
              Finish the remaining sections to unlock all matched scholarships and faster CSR approvals.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <ProgressRing value={overall} />
        </div>
      </div>
    </section>
  );
}
