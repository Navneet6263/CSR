import ScreenerTopNav from '@/components/screener/ScreenerTopNav';

export default function ScreenerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans selection:bg-[#2e86c1]/30">
      <ScreenerTopNav />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
