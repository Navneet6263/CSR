'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import { mockMetrics } from '@/lib/mockData';
import MetricsRow from "@/components/admin/MetricsRow";
import FunnelChart from "@/components/admin/FunnelChart";
import WorkloadChart from "@/components/admin/WorkloadChart";
import ZoneDistribution from "@/components/admin/ZoneDistribution";
import CriticalAlerts from "@/components/admin/CriticalAlerts";
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await adminApi.getDashboardMetrics();
      if (res.success && res.data) {
        setMetrics(res.data);
      } else {
        setMetrics(mockMetrics); // fallback to mock data if API response is empty
      }
    } catch (err) {
      console.error("API failed, falling back to mock data:", err);
      setMetrics(mockMetrics);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center min-h-[50vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">A snapshot of applications, funds, and bottlenecks.</p>
        </div>
      </header>

      <MetricsRow data={metrics} />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-5">
          <FunnelChart data={metrics?.funnel} />
        </div>
        <div className="col-span-12 md:col-span-7">
          <WorkloadChart data={metrics?.workload} />
        </div>
        <div className="col-span-12 md:col-span-5">
          <CriticalAlerts data={metrics?.alerts} />
        </div>
        <div className="col-span-12 md:col-span-7">
          <ZoneDistribution data={metrics} />
        </div>
      </div>
    </div>
  );
}
