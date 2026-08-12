import { ArrowRight, Sparkles } from "lucide-react";
import type { DashboardStudentProfile as StudentProfile } from "@/types/dashboard";
import Link from 'next/link';

interface Props {
  profile: StudentProfile;
}

export function WelcomeBanner({ profile }: Props) {
  const incomplete = profile.profileCompletion < 100;
  return (
    <section
      className="relative overflow-hidden rounded-2xl p-6 text-primary-foreground sm:p-8"
      style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}
    >
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-black/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3 w-3" /> Welcome back
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Hi {profile.name.split(" ")[0]}, ready to unlock your next scholarship?
          </h1>
          <p className="mt-2 text-sm text-white/85 sm:text-base">
            {incomplete
              ? `Your profile is ${profile.profileCompletion}% complete. Finish it to unlock personalised matches.`
              : "Your profile is fully complete. Explore new scholarships matched to you."}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          {incomplete && (
            <div className="w-full sm:w-64">
              <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-white/85">
                <span>Profile completion</span>
                <span>{profile.profileCompletion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${profile.profileCompletion}%` }}
                />
              </div>
            </div>
          )}
          <Link href={incomplete ? '/student/profile' : '/student/scholarships'} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-white/90">
            {incomplete ? "Complete profile" : "Browse scholarships"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
