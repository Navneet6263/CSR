import { Search, Bell, Filter, Download, Wallet } from "lucide-react";
import Link from "next/link";

export default function Topbar() {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/70">
      <div className="flex items-center gap-3 px-6 py-3.5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search applications, students, partners…"
            className="w-full rounded-lg border border-slate-200/80 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="hidden md:inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 transition">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
          <button className="hidden md:inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 transition">
            <Download className="h-3.5 w-3.5" />
            Export Report
          </button>
          <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 transition">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          <Link
            href="/admin/operations/payments"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Wallet className="h-3.5 w-3.5" />
            Initiate Payment Batch
            <span className="ml-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">42</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
