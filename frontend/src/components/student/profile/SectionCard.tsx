import type { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, description, icon, children }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-7">
      <header className="mb-6 flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}
