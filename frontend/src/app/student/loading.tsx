export default function StudentLoading() {
  return <div className="mx-auto max-w-7xl space-y-5 p-6"><div className="h-40 animate-pulse rounded-2xl bg-muted" />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted" />)}</div>
    <div className="h-72 animate-pulse rounded-2xl bg-muted" /></div>;
}
