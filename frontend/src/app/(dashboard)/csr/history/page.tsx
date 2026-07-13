export default function HistoryPage() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-pink-100 p-6">
        <svg className="h-12 w-12 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="mt-6 text-2xl font-bold text-slate-900">Disbursement History</h2>
      <p className="mt-2 max-w-md text-slate-500">
        This module is currently under development. You'll soon be able to track all your past fund transfers and disbursements here.
      </p>
    </div>
  );
}
