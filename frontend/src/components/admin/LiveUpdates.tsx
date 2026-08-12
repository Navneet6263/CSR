'use client';

import { Radio } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import { mapAuditEvent, type AuditEventView } from '@/lib/auditPresentation';

const dot = { ok: 'bg-emerald-500', warn: 'bg-amber-500', info: 'bg-slate-400', danger: 'bg-rose-500' } as const;

export default function LiveUpdates() {
  const [items, setItems] = useState<AuditEventView[]>([]);
  useEffect(() => {
    let active = true;
    adminApi.getAuditEvents().then((response) => active && setItems((response.data ?? []).slice(0, 6).map(mapAuditEvent))).catch(() => setItems([]));
    return () => { active = false; };
  }, []);
  return <div className="px-3 pb-3 pt-3"><div className="flex items-center gap-2 px-2.5 pb-1.5"><Radio className="h-[14px] w-[14px] text-slate-500" />
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Recent activity</p></div>
    <ul className="space-y-0.5">{items.map((item) => <li key={item.id} className="flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot[item.tone]}`} /><span className="min-w-0 flex-1 truncate text-[12.5px]">{item.actor} {item.action}</span><span className="shrink-0 text-[10px] text-slate-400">{item.target}</span>
    </li>)}{!items.length && <li className="px-2.5 py-2 text-xs text-slate-400">No recent activity.</li>}</ul>
  </div>;
}
