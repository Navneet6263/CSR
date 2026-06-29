import {
  LayoutDashboard,
  FileCheck2,
  ShieldCheck,
  ClipboardList,
  HandHeart,
  GraduationCap,
  Settings,
  Sparkles,
  Radio,
  Map,
  GaugeCircle,
  Wallet,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { label: string; href: string; icon: React.ComponentType<{ className?: string }>; live?: boolean; badge?: string };

const main: Item[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
];

const roles: Item[] = [
  { label: "Document Checkers", href: "/admin/pipeline/reviewer", icon: FileCheck2 },
  { label: "Background Checkers", href: "/admin/pipeline/bgchecker", icon: ShieldCheck },
  { label: "Screening Officers", href: "/admin/pipeline/screener", icon: ClipboardList },
  { label: "CSR Partners", href: "/admin/pipeline/csr", icon: HandHeart },
];

const analytics: Item[] = [
  { label: "Geographic Map", href: "/admin/analytics/geo", icon: Map },
  { label: "SLA Report", href: "/admin/analytics/sla", icon: GaugeCircle, badge: "3" },
];

const operations: Item[] = [
  { label: "Payment Queue", href: "/admin/operations/payments", icon: Wallet, badge: "42" },
  { label: "Bulk Actions", href: "/admin/operations/bulk", icon: Layers },
];

const management: Item[] = [
  { label: "Scholarships", href: "/admin/scholarships", icon: GraduationCap },
  { label: "System Settings", href: "/admin/settings", icon: Settings },
];

const activity: Item[] = [
  { label: "Live Updates", href: "/admin/live-updates", icon: Radio, live: true },
];

function Section({ title, items, pathname }: { title: string; items: Item[]; pathname: string }) {
  return (
    <div className="px-3">
      <p className="px-2 pt-4 pb-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={
                  "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors " +
                  (active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
                }
              >
                <Icon className={"h-[18px] w-[18px] " + (active ? "text-white" : "text-slate-500 group-hover:text-slate-900")} />
                <span className="truncate flex-1">{it.label}</span>
                {it.badge && (
                  <span className={
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold " +
                    (active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600")
                  }>
                    {it.badge}
                  </span>
                )}
                {it.live && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white h-screen sticky top-0">
      <div className="px-5 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 p-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">Scholar Admin</p>
            <p className="text-[11px] text-slate-500 truncate">Operations Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto pb-4">
        <Section title="Main" items={main} pathname={pathname} />
        <Section title="Role Dashboard" items={roles} pathname={pathname} />
        <Section title="Analytics" items={analytics} pathname={pathname} />
        <Section title="Operations" items={operations} pathname={pathname} />
        <Section title="Management" items={management} pathname={pathname} />
        <Section title="Activity" items={activity} pathname={pathname} />
      </nav>
    </aside>
  );
}
