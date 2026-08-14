'use client';

import { KeyRound, Search, Trash2, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CreateUserModal } from '@/components/admin/users/CreateUserModal';
import DataPagination from '@/components/shared/DataPagination';
import { adminApi } from '@/lib/api/admin';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { StaffRole, StaffUser } from '@/types/admin';

const roleLabel: Record<StaffRole, string> = { Finance: 'Finance', CSRPartner: 'CSR Partner', DocReviewer: 'Document Checker', BGCheckOfficer: 'Background Checker', ScreeningOfficer: 'Screening Officer', SupportAgent: 'Support Agent' };
const filterRoles: Array<'all' | StaffRole> = ['all', ...(Object.keys(roleLabel) as StaffRole[])];
const emptySummary = { total: 0, csrPartners: 0, internalStaff: 0, inactive: 0 };
const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;
function mapUser(row: Record<string, unknown>): StaffUser { return { userId: Number(row.UserID), fullName: String(row.FullName), email: String(row.Email), role: String(row.Role) as StaffRole, isActive: Boolean(row.IsActive), mustChangePassword: Boolean(row.MustChangePassword), createdAt: String(row.CreatedAt), financeFunction: row.FinanceFunction ? String(row.FinanceFunction) as 'Maker' | 'Checker' : undefined, sponsorName: row.SponsorName ? String(row.SponsorName) : undefined, totalFund: Number(row.TotalFund ?? 0), fundAllocated: Number(row.FundAllocated ?? 0), fundUtilized: Number(row.FundUtilized ?? 0) }; }

export default function UsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]); const [query, setQuery] = useState(''); const debouncedQuery = useDebouncedValue(query);
  const [filter, setFilter] = useState<'all' | StaffRole>('all'); const [open, setOpen] = useState(false);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(20); const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(emptySummary);
  const load = useCallback(async () => {
    setLoading(true); const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter !== 'all') params.set('role', filter); if (debouncedQuery.trim()) params.set('search', debouncedQuery.trim());
    try { const response = await adminApi.getUsers(params.toString()); setUsers((response.data?.users ?? []).map(mapUser)); setTotal(Number(response.data?.pagination?.total ?? 0)); setSummary(response.data?.summary ?? emptySummary); setError(''); }
    catch (reason) { setUsers([]); setTotal(0); setError(reason instanceof Error ? reason.message : 'Accounts could not be loaded.'); }
    finally { setLoading(false); }
  }, [debouncedQuery, filter, limit, page]);
  useEffect(() => { void load(); }, [load]);
  const deactivate = async (user: StaffUser) => { if (!window.confirm(`Deactivate ${user.fullName}? Their active sessions will be revoked.`)) return; try { await adminApi.deactivateUser(user.userId); await load(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Account could not be deactivated.'); } };

  return <div className="space-y-5 pb-10"><header className="flex items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-widest text-slate-400">Management</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold"><KeyRound className="h-5 w-5" />User & Access Management</h1><p className="text-sm text-slate-500">Provision role-scoped accounts and revoke access.</p></div><button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"><UserPlus className="h-3.5 w-3.5" />Create new ID</button></header>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[['Total Accounts', summary.total], ['CSR Partners', summary.csrPartners], ['Internal Staff', summary.internalStaff], ['Inactive', summary.inactive]].map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase tracking-widest text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</div>
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <div className="overflow-hidden rounded-xl border bg-white"><div className="flex flex-wrap items-center gap-2 border-b px-4 py-3"><div className="relative"><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search accounts…" className="rounded-lg border py-1.5 pl-8 pr-3 text-xs" /></div>
      {filterRoles.map((role) => <button key={role} onClick={() => { setFilter(role); setPage(1); }} className={`rounded-md px-2 py-1 text-[11px] ${filter === role ? 'bg-slate-900 text-white' : ''}`}>{role === 'all' ? 'All' : roleLabel[role]}</button>)}<span className="ml-auto text-xs text-slate-500">{total} accounts</span></div>
      {loading && <div className="h-1 bg-slate-100"><div className="h-full w-1/3 animate-pulse bg-slate-500" /></div>}
      <ul className="divide-y">{users.map((user) => <li key={user.userId} className="grid grid-cols-1 gap-2 px-4 py-3 text-xs sm:grid-cols-[2fr_1.4fr_1.6fr_80px_40px] sm:items-center sm:gap-3"><div><p className="text-sm font-medium">{user.fullName}</p><p className="text-slate-500">{user.email} · U-{user.userId}</p></div><span>{user.role === 'Finance' ? `Finance ${user.financeFunction ?? 'Unassigned'}` : roleLabel[user.role]}</span><div>{user.sponsorName ? <><p className="font-medium">{user.sponsorName}</p><p className="text-slate-500">{money((user.fundAllocated ?? 0) + (user.fundUtilized ?? 0))} / {money(user.totalFund ?? 0)}</p></> : user.role === 'CSRPartner' ? <span className="font-medium text-rose-600">Unlinked — no data access</span> : <span className="text-slate-400">Internal</span>}</div><span className={user.isActive ? 'text-emerald-700' : 'text-slate-400'}>{user.isActive ? (user.mustChangePassword ? 'Invited' : 'Active') : 'Inactive'}</span><button disabled={!user.isActive} onClick={() => void deactivate(user)} aria-label={`Deactivate ${user.fullName}`} className="text-slate-400 hover:text-rose-600 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button></li>)}{!users.length && !loading && <li className="p-10 text-center text-xs text-slate-400">No accounts found.</li>}</ul>
    </div>
    {total > 0 && <DataPagination page={page} limit={limit} total={total} loading={loading} pageSizes={[20, 50, 100]} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />}
    {open && <CreateUserModal onClose={() => setOpen(false)} onCreated={load} />}
  </div>;
}
