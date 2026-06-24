import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[280px] flex-1 min-h-screen bg-gradient-to-br from-[#f5f0ff] via-[#f0f4ff] to-[#f0faf5]">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
