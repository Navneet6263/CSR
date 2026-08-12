import { BadgeIndianRupee, BookOpen, Building2, CalendarDays, Mail, MapPin, Phone, ShieldAlert, UserRound } from 'lucide-react';

export function OfficerCaseSummary({ student, completed }: { student: Record<string, unknown>; completed: number }) {
  const held = Boolean(student.isHeld);
  return <div className="space-y-4">
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 via-white to-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-white px-2 py-1 font-mono text-[10px] font-bold text-cyan-700 ring-1 ring-cyan-100">APP-{show(student.applicationId)}</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">{show(student.applicationStatus)}</span></div>
          <h1 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">{show(student.name)}</h1><p className="mt-1 text-xs font-medium text-slate-500">{show(student.scholarship)}</p></div>
          <div className="w-full rounded-xl bg-white p-3 ring-1 ring-slate-200 sm:w-48"><div className="flex items-center justify-between text-[10px] font-semibold text-slate-500"><span>Verification progress</span><span>{completed}/3</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500" style={{ width: `${Math.min(completed, 3) / 3 * 100}%` }} /></div></div></div>
      </div>
      {held ? <div className="flex gap-3 border-b border-rose-100 bg-rose-50 px-5 py-3 text-xs text-rose-700"><ShieldAlert className="h-4 w-4 shrink-0" /><div><b>Application is on administrative hold.</b><p className="mt-0.5">{show(student.holdReason, 'Contact an administrator before continuing.')}</p></div></div> : null}
      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
        <InfoGroup title="Identity & contact" icon={UserRound} rows={[
          ['Masked Aadhaar', student.aadhar], ['Date of birth', formatDate(student.dob)], ['Gender / Category', join(student.gender, student.category)],
          ['Phone', student.phone, Phone], ['Email', student.email, Mail], ['Parents', join(student.fatherName, student.motherName)],
        ]} />
        <InfoGroup title="Residence" icon={MapPin} rows={[
          ['Current address', address(student.address, student.city, student.state, student.pincode)],
          ['Permanent address', address(student.permanentAddress, student.permanentCity, student.permanentState, student.permanentPincode)],
          ['Stage entered', formatDateTime(student.stageEnteredAt), CalendarDays],
        ]} />
        <InfoGroup title="Education & income" icon={BookOpen} rows={[
          ['Institution', student.institution, Building2], ['Course', student.course], ['Registration no.', student.registrationNo],
          ['Declared family income', money(student.income), BadgeIndianRupee],
          ['Parent occupations', join(student.fatherOccupation, student.motherOccupation)],
        ]} />
      </div>
    </section>
  </div>;
}

type SmallIcon = React.ComponentType<{ className?: string }>;
function InfoGroup({ title, icon: Icon, rows }: { title: string; icon: SmallIcon; rows: Array<[string, unknown, SmallIcon?]> }) {
  return <div><h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700"><span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-50 text-cyan-600"><Icon className="h-3.5 w-3.5" /></span>{title}</h2>
    <dl className="mt-3 space-y-3">{rows.map(([label, value, RowIcon]) => <div key={label}><dt className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">{RowIcon ? <RowIcon className="h-3 w-3" /> : null}{label}</dt><dd className="mt-0.5 break-words text-xs font-medium leading-relaxed text-slate-700">{show(value)}</dd></div>)}</dl></div>;
}

function show(value: unknown, fallback = 'Not provided') { return value == null || value === '' ? fallback : String(value); }
function join(...values: unknown[]) { return values.filter((value) => value != null && value !== '').join(' · ') || undefined; }
function address(...values: unknown[]) { return values.filter((value) => value != null && value !== '').join(', ') || undefined; }
function money(value: unknown) { const amount = Number(value); return Number.isFinite(amount) && amount > 0 ? `₹${amount.toLocaleString('en-IN')}` : undefined; }
function formatDate(value: unknown) { if (!value) return undefined; const date = new Date(String(value)); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { dateStyle: 'medium' }); }
function formatDateTime(value: unknown) { if (!value) return undefined; const date = new Date(String(value)); return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
