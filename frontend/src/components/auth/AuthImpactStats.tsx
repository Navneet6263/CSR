'use client';

import { useEffect, useState } from 'react';
import type { PublicPortal } from '@/lib/api';
import { loadPublicPortal } from '@/lib/publicPortalCache';

function money(value: number) {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)}L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function AuthImpactStats() {
  const [portal, setPortal] = useState<PublicPortal | null>(null);
  useEffect(() => { if (!portal) void loadPublicPortal().then(setPortal); }, [portal]);
  const stats = [
    [portal ? portal.stats.registeredStudents.toLocaleString('en-IN') : '—', 'Registered students'],
    [portal ? portal.stats.studentsFunded.toLocaleString('en-IN') : '—', 'Students funded'],
    [portal ? money(portal.stats.disbursed) : '—', 'Disbursed'],
    [portal ? portal.stats.activePartners.toLocaleString('en-IN') : '—', 'Active partners'],
  ];
  return <div className="grid grid-cols-2 gap-4 px-2">{stats.map(([value, label]) =>
    <div key={label} className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur-md">
      <p className="mb-1 text-3xl font-bold text-white drop-shadow-sm">{value}</p>
      <p className="text-sm font-semibold text-emerald-100 drop-shadow-sm">{label}</p>
    </div>)}</div>;
}
