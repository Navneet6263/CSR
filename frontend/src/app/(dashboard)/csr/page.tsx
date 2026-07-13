import { Metadata } from "next";
import { Wallet, TrendingUp, PiggyBank, Users, Sparkles } from "lucide-react";
import MetricCard from "@/components/csr/MetricCard";
import { CityBarChart, GenderPieChart } from "@/components/csr/Charts";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CSR Analytics Dashboard · Tata TalentBridge",
  description: "Track fund utilization and impact for Tata CSR scholarships.",
};

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            <Sparkles size={12} /> Live Impact Overview
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, Ratan.
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Here's how <span className="font-semibold text-emerald-700">Tata CSR</span> is
            transforming lives this fiscal year.
          </p>
        </div>
        <div className="rounded-xl border border-pink-100 bg-white px-4 py-3 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Program
          </div>
          <div className="text-sm font-bold text-slate-900">TalentBridge FY 2025-26</div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Funds Allocated"
            value="₹15.2 Cr"
            sub="+₹2 Cr since last FY"
            icon={<Wallet size={20} />}
            tone="emerald"
          />
          <MetricCard
            label="Disbursed YTD"
            value="₹8.4 Cr"
            sub="55% of total allocated"
            icon={<TrendingUp size={20} />}
            tone="pink"
          />
          <MetricCard
            label="Remaining Corpus"
            value="₹6.8 Cr"
            sub="Available for Q3-Q4"
            icon={<PiggyBank size={20} />}
            tone="slate"
          />
          <MetricCard
            label="Total Beneficiaries"
            value="1,245"
            sub="Students impacted"
            icon={<Users size={20} />}
            tone="amber"
          />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CityBarChart />
        </div>
        <div className="lg:col-span-2">
          <GenderPieChart />
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-pink-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900">
              32 applications awaiting your approval
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Fully audited, background-verified, and merit-screened by TalentBridge.
            </p>
          </div>
          <a
            href="/csr/approvals"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Review Queue →
          </a>
        </div>
      </section>
    </div>
  );
}
