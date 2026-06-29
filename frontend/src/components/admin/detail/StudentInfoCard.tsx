type Props = {
  name: string;
  appId: string;
  address: string;
  college: string;
  income: string;
  course: string;
  phone: string;
};

export default function StudentInfoCard({ name, appId, address, college, income, course, phone }: Props) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">{name}</div>
          <div className="text-[11px] text-slate-500">{appId}</div>
        </div>
      </div>
      <dl className="grid grid-cols-1 divide-y divide-slate-100">
        {[
          ["Address", address],
          ["College", college],
          ["Course", course],
          ["Annual Income", income],
          ["Phone", phone],
        ].map(([k, v]) => (
          <div key={k} className="px-4 py-2.5">
            <dt className="text-[10px] uppercase tracking-widest text-slate-400">{k}</dt>
            <dd className="mt-0.5 text-sm text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
