"use client";
import { usePublicPortal } from './PublicPortalProvider';

export function Partners() {
  const { data, loading } = usePublicPortal(); const partners = data?.partners ?? []; const items = [...partners, ...partners];
  return <section id="partners" className="content-auto border-y border-border bg-muted/30 py-16 sm:py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold uppercase tracking-widest text-primary">Corporate partners</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Active Scholarship Sponsors</h2></div>
    {partners.length ? <div className="group relative mt-10 overflow-hidden"><div className="ticker-track flex w-max gap-4 group-hover:[animation-play-state:paused]">{items.map((partner, index) => <div key={`${partner}-${index}`} className="grid h-16 w-44 shrink-0 place-items-center rounded-xl border bg-background px-5 text-center text-sm font-semibold text-muted-foreground">{partner}</div>)}</div></div> : !loading && <p className="mt-10 text-center text-sm text-muted-foreground">No active sponsors are listed.</p>}
  </div></section>;
}
