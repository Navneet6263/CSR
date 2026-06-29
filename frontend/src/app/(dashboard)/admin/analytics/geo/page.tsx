'use client';

import IndiaHeatmap, { type RegionDatum } from "@/components/admin/analytics/IndiaHeatmap";
import CityBreakdown, { type CityRow } from "@/components/admin/analytics/CityBreakdown";
import GeoMap from "@/components/admin/analytics/GeoMap";
import { Download, Filter } from "lucide-react";


const STATES = [
  { code: "MH", name: "Maharashtra", applicants: 2840, approved: 1620 },
  { code: "UP", name: "Uttar Pradesh", applicants: 2310, approved: 1180 },
  { code: "KA", name: "Karnataka", applicants: 1980, approved: 1240 },
  { code: "TN", name: "Tamil Nadu", applicants: 1750, approved: 1090 },
  { code: "DL", name: "Delhi", applicants: 1420, approved: 870 },
  { code: "WB", name: "West Bengal", applicants: 1180, approved: 640 },
  { code: "GJ", name: "Gujarat", applicants: 1020, approved: 590 },
  { code: "RJ", name: "Rajasthan", applicants: 890, approved: 470 },
  { code: "BR", name: "Bihar", applicants: 760, approved: 320 },
  { code: "KL", name: "Kerala", applicants: 640, approved: 410 },
  { code: "TS", name: "Telangana", applicants: 580, approved: 360 },
  { code: "AP", name: "Andhra Pradesh", applicants: 540, approved: 290 },
  { code: "MP", name: "Madhya Pradesh", applicants: 510, approved: 240 },
  { code: "PB", name: "Punjab", applicants: 380, approved: 210 },
  { code: "HR", name: "Haryana", applicants: 360, approved: 195 },
  { code: "OD", name: "Odisha", applicants: 320, approved: 160 },
];

const CITIES: CityRow[] = [
  { city: "Mumbai", state: "Maharashtra", applicants: 1280, approved: 760, trend: 12 },
  { city: "Bengaluru", state: "Karnataka", applicants: 1140, approved: 720, trend: 18 },
  { city: "Delhi NCR", state: "Delhi", applicants: 1420, approved: 870, trend: 8 },
  { city: "Pune", state: "Maharashtra", applicants: 920, approved: 540, trend: 15 },
  { city: "Chennai", state: "Tamil Nadu", applicants: 880, approved: 540, trend: 4 },
  { city: "Hyderabad", state: "Telangana", applicants: 580, approved: 360, trend: 22 },
  { city: "Lucknow", state: "Uttar Pradesh", applicants: 540, approved: 260, trend: -3 },
  { city: "Kolkata", state: "West Bengal", applicants: 510, approved: 280, trend: -6 },
  { city: "Ahmedabad", state: "Gujarat", applicants: 480, approved: 260, trend: 9 },
  { city: "Jaipur", state: "Rajasthan", applicants: 420, approved: 220, trend: 5 },
  { city: "Patna", state: "Bihar", applicants: 380, approved: 160, trend: -2 },
  { city: "Kochi", state: "Kerala", applicants: 280, approved: 180, trend: 11 },
];

export default function GeoPage() {
  const total = STATES.reduce((s, r) => s + r.applicants, 0);
  const approved = STATES.reduce((s, r) => s + r.approved, 0);

  const regions: RegionDatum[] = STATES.map((s) => ({
    code: s.code,
    name: s.name,
    applicants: s.applicants,
    pct: +((s.applicants / total) * 100).toFixed(1),
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Analytics</div>
          <h1 className="mt-1 text-xl font-semibold text-slate-900 truncate">Geographic Distribution</h1>
          <p className="mt-0.5 text-sm text-slate-500">State + city level applicant volume, conversion and trend.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { l: "Total Applicants", v: total.toLocaleString() },
          { l: "Approved", v: approved.toLocaleString() },
          { l: "Conversion", v: `${Math.round((approved / total) * 100)}%` },
          { l: "States Covered", v: `${STATES.length}` },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-slate-200/80 bg-white p-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">{k.l}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{k.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
        <IndiaHeatmap regions={regions} />
        <CityBreakdown rows={CITIES} />
      </div>

      <GeoMap rows={STATES.slice(0, 10).map((s) => ({ state: s.name, applicants: s.applicants, approved: s.approved }))} />
    </div>
  );
}

