export default function DashboardLoading() {
  return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl space-y-4"><div className="h-16 animate-pulse rounded-2xl bg-white" />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-white" />)}</div>
    <div className="h-96 animate-pulse rounded-2xl bg-white" /></div></div>;
}
