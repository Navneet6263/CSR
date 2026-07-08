import { StatsGrid } from "@/components/reviewer/StatsGrid";
import { QueueTable } from "@/components/reviewer/QueueTable";
import { TopNav } from "@/components/reviewer/TopNav";

export const metadata = {
  title: "Reviewer Dashboard · TalentBridge",
};

export default function ReviewerDashboard() {
  return (
    <div className="min-h-screen pb-16 bg-bg text-fg">
      <TopNav />
      <main className="mx-auto max-w-[1600px] px-6 mt-8">
        <div className="space-y-8">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-primary">Thursday · 02 Jul 2026</div>
              <h1 className="mt-2 text-3xl font-display font-bold">Good morning, Ritu</h1>
              <p className="text-fg-muted mt-1 text-sm">You have <span className="text-primary font-semibold">42 applications</span> waiting for document verification.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-fg-subtle glass px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Queue synced 12s ago
            </div>
          </div>
          <StatsGrid />
          <QueueTable />
        </div>
      </main>
    </div>
  );
}
