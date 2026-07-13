export default function ProfilePage() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-emerald-100 p-6">
        <svg className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h2 className="mt-6 text-2xl font-bold text-slate-900">Partner Profile</h2>
      <p className="mt-2 max-w-md text-slate-500">
        Profile management settings for CSR Partners will be available here soon.
      </p>
    </div>
  );
}
