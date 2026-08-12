import { CheckCircle2, ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import type { OfficerDocument } from '@/types/officer';

export function OfficerDocuments({ rows }: { rows: OfficerDocument[] }) {
  return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700">Evidence pack</p><h2 className="mt-1 text-base font-bold text-slate-900">Verified documents</h2><p className="mt-1 text-[11px] text-slate-500">Open submitted evidence before recording field observations.</p></div>
      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><ShieldCheck size={12} />{rows.filter((row) => row.status === 'Verified').length}/{rows.length}</span></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-2">{rows.map((doc) => <a key={doc.id} href={documentUrl(doc.url)} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-cyan-300 hover:bg-cyan-50/30">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-cyan-600"><FileText size={16} /></span>
      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{doc.type}</span><span className={`mt-0.5 inline-flex items-center gap-1 text-[9px] font-bold ${doc.status === 'Verified' ? 'text-emerald-600' : 'text-amber-600'}`}>{doc.status === 'Verified' ? <CheckCircle2 size={10} /> : null}{doc.status}</span></span><ExternalLink size={13} className="text-slate-300 group-hover:text-cyan-600" /></a>)}
      {!rows.length ? <div className="col-span-full rounded-xl bg-slate-50 py-8 text-center text-xs text-slate-400">No checklist documents are linked to this application.</div> : null}</div>
  </section>;
}

function documentUrl(path: string) { try { return new URL(path, API_BASE_URL).toString(); } catch { return '#'; } }
