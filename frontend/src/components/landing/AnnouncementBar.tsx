"use client";
import { Radio } from 'lucide-react';
import { usePublicPortal } from './PublicPortalProvider';

export function AnnouncementBar() {
  const { data } = usePublicPortal();
  const notices = data?.announcements?.map((item) => `${item.title}: ${item.message}`) ?? [];
  const announcements = notices.slice(0, 10);
  if (!announcements.length) return null;
  const items = [...announcements, ...announcements];
  return <div className="relative border-b border-border/70 bg-foreground text-background"><div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6 lg:px-8"><span className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em]"><Radio className="h-3.5 w-3.5" />Notice</span><div className="group relative flex-1 overflow-hidden"><div className="ticker-track flex w-max items-center gap-12">{items.map((text, index) => <div key={`${text}-${index}`} className="flex shrink-0 items-center gap-2.5 text-[13px]"><span className="rounded-sm bg-background/10 px-1.5 py-0.5 text-[10px] font-bold">LIVE</span><span>{text}</span></div>)}</div></div></div></div>;
}
