import { TopNav } from "@/components/reviewer/TopNav";
import { StatsCards } from "@/components/reviewer/StatsCards";
import { QueueTable } from "@/components/reviewer/QueueTable";

export default function ReviewerDashboard() {
  return (
    <div className="min-h-screen pb-16">
      <TopNav />
      <main className="mx-auto mt-8 max-w-7xl space-y-6 px-4 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Good afternoon, Reviewer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's a snapshot of today's audit workload.
          </p>
        </div>
        <StatsCards />
        <QueueTable />
      </main>
    </div>
  );
}
