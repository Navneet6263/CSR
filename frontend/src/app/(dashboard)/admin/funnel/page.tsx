'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, AlertCircle, Clock, Users } from 'lucide-react';

type StageData = {
  stage: string;
  count: number;
  avgDays: number;
  slaTarget: number;
  slaViolations: number;
  dropOff: number;
};

export default function AdminFunnel() {
  const [stages, setStages] = useState<StageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/api').then(({ applicationApi }) => {
      applicationApi.getAll().then(res => {
        const apps = res.data?.applications || [];
        
        const counts = {
          registered: apps.length,
          docAudit: apps.filter(a => ['DocAuditInProgress', 'DocAuditComplete', 'BGCheckInProgress', 'BGCheckComplete', 'ScreeningPending', 'ScreeningApproved', 'CSRPending', 'CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted'].includes(a.Status)).length,
          screening: apps.filter(a => ['ScreeningPending', 'ScreeningApproved', 'CSRPending', 'CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted'].includes(a.Status)).length,
          csr: apps.filter(a => ['CSRPending', 'CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted'].includes(a.Status)).length,
          funded: apps.filter(a => a.Status === 'PaymentCompleted').length,
        };

        setStages([
          { stage: 'Registered', count: counts.registered, avgDays: 0, slaTarget: 2, slaViolations: 0, dropOff: 0 },
          { stage: 'Doc Audit', count: counts.docAudit, avgDays: 2, slaTarget: 3, slaViolations: 0, dropOff: counts.registered - counts.docAudit },
          { stage: 'Screening', count: counts.screening, avgDays: 3, slaTarget: 4, slaViolations: 0, dropOff: counts.docAudit - counts.screening },
          { stage: 'CSR Approval', count: counts.csr, avgDays: 1, slaTarget: 2, slaViolations: 0, dropOff: counts.screening - counts.csr },
          { stage: 'Funded', count: counts.funded, avgDays: 1, slaTarget: 2, slaViolations: 0, dropOff: counts.csr - counts.funded },
        ]);
      }).finally(() => setLoading(false));
    });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b2c6f]" /></div>;

  const totalRegistered = stages[0]?.count || 0;
  const totalFunded = stages[stages.length - 1]?.count || 0;
  const conversionRate = totalRegistered > 0 ? ((totalFunded / totalRegistered) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Application Funnel</h1>
        <p className="text-sm text-gray-500 mt-1">Stage-wise analysis & bottleneck detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="clay-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Registered</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalRegistered}</p>
            </div>
            <Users className="w-8 h-8 text-[#5b2c6f]" />
          </div>
        </div>
        <div className="clay-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Funded</p>
              <p className="text-2xl font-bold text-[#0e6251] mt-1">{totalFunded}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-[#0e6251]" />
          </div>
        </div>
        <div className="clay-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-[#2e86c1] mt-1">{conversionRate}%</p>
            </div>
            <Clock className="w-8 h-8 text-[#2e86c1]" />
          </div>
        </div>
        <div className="clay-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">SLA Violations</p>
              <p className="text-2xl font-bold text-[#c0392b] mt-1">
                {stages.reduce((sum, s) => sum + s.slaViolations, 0)}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-[#c0392b]" />
          </div>
        </div>
      </div>

      <div className="clay-card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Stage Analysis</h2>
        <div className="space-y-4">
          {stages.map((stage, idx) => {
            const prevCount = idx > 0 ? stages[idx - 1].count : stage.count;
            const dropOffPercent = prevCount > 0 ? ((stage.dropOff / prevCount) * 100).toFixed(1) : 0;
            const slaCompliance = stage.count > 0 ? (((stage.count - stage.slaViolations) / stage.count) * 100).toFixed(0) : 100;

            return (
              <div key={stage.stage} className="border-l-4 border-[#5b2c6f] pl-4 py-3 bg-white rounded-r-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{stage.stage}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500">Count: </span>
                        <span className="font-medium text-gray-800">{stage.count}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Days: </span>
                        <span className={`font-medium ${stage.avgDays > stage.slaTarget ? 'text-[#c0392b]' : 'text-[#0e6251]'}`}>
                          {stage.avgDays}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">SLA Target: </span>
                        <span className="font-medium text-gray-800">{stage.slaTarget} days</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {stage.dropOff > 0 && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Drop-off</p>
                        <p className="text-lg font-bold text-[#c0392b]">{dropOffPercent}%</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-xs text-gray-500">SLA Compliance</p>
                      <p className={`text-lg font-bold ${Number(slaCompliance) < 80 ? 'text-[#c0392b]' : 'text-[#0e6251]'}`}>
                        {slaCompliance}%
                      </p>
                    </div>
                    {stage.slaViolations > 0 && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Violations</p>
                        <p className="text-lg font-bold text-[#c0392b]">{stage.slaViolations}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {stage.slaViolations > stage.count * 0.2 && (
                  <div className="mt-3 flex items-start gap-2 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-[#c0392b] mt-0.5" />
                    <p className="text-xs text-[#c0392b]">
                      <strong>Bottleneck Detected:</strong> Over 20% applications are past SLA at this stage
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
