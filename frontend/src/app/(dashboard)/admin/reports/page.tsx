'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, Users, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { applicationApi } from '@/lib/api';

type ReportType = 'sla' | 'funnel' | 'diversity' | 'disbursement' | 'audit';

const reports: { type: ReportType; title: string; description: string; icon: typeof FileText; color: string }[] = [
  { type: 'sla', title: 'SLA Report', description: 'Stage turnaround times and compliance', icon: Calendar, color: '#5b2c6f' },
  { type: 'funnel', title: 'Funnel Report', description: 'Application flow and drop-off analysis', icon: TrendingUp, color: '#2e86c1' },
  { type: 'diversity', title: 'Diversity Coverage', description: 'Category, region, and income distribution', icon: Users, color: '#0e6251' },
  { type: 'disbursement', title: 'Disbursement Report', description: 'Payment history and reconciliation', icon: FileText, color: '#f39c12' },
  { type: 'audit', title: 'Audit Export', description: 'Full audit trail for CSR compliance', icon: FileText, color: '#c0392b' },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<ReportType | null>(null);
  const [fundedApps, setFundedApps] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    applicationApi.getAll()
      .then(res => {
        const apps = res.data?.applications || [];
        setFundedApps(apps.filter((a: any) => a.Status === 'PaymentCompleted'));
      })
      .finally(() => setLoadingApps(false));
  }, []);

  const handleDownload = async (type: ReportType, format: 'csv' | 'pdf') => {
    setDownloading(type);
    try {
      if (format !== 'csv') {
        alert('PDF format is coming soon. Downloading CSV instead.');
      }

      // Fetch all data for reports
      const res = await applicationApi.getAll();
      const apps = res.data?.applications || [];
      
      let csvContent = '';
      
      if (type === 'disbursement') {
        const funded = apps.filter((a: any) => a.Status === 'PaymentCompleted');
        csvContent = 'ApplicationID,StudentName,Scholarship,Amount,Date\n';
        funded.forEach((a: any) => {
          csvContent += `${a.ApplicationID},"${a.StudentName}","${a.ScholarshipName}",${a.ScholarshipAmount || 0},${new Date().toLocaleDateString()}\n`;
        });
      } else if (type === 'funnel') {
        csvContent = 'Stage,Count\n';
        csvContent += `Registered,${apps.length}\n`;
        csvContent += `DocAudit,${apps.filter((a: any) => ['DocAuditInProgress', 'DocAuditComplete', 'BGCheckInProgress', 'BGCheckComplete', 'ScreeningPending', 'ScreeningApproved', 'CSRPending', 'CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted'].includes(a.Status)).length}\n`;
        csvContent += `Screening,${apps.filter((a: any) => ['ScreeningPending', 'ScreeningApproved', 'CSRPending', 'CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted'].includes(a.Status)).length}\n`;
        csvContent += `CSR,${apps.filter((a: any) => ['CSRPending', 'CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted'].includes(a.Status)).length}\n`;
        csvContent += `Funded,${apps.filter((a: any) => a.Status === 'PaymentCompleted').length}\n`;
      } else {
        csvContent = 'AppID,Status,StudentName\n';
        apps.forEach((a: any) => {
          csvContent += `${a.ApplicationID},${a.Status},"${a.StudentName}"\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download report');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[#5b2c6f]/10 rounded-xl">
          <FileText className="w-6 h-6 text-[#5b2c6f]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reports & Exports</h1>
          <p className="text-sm text-gray-500 mt-1">Download comprehensive reports for analysis and compliance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const isDownloading = downloading === report.type;

          return (
            <div key={report.type} className="clay-card p-6 border-l-4" style={{ borderColor: report.color }}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${report.color}15` }}>
                  <Icon className="w-6 h-6" style={{ color: report.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{report.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleDownload(report.type, 'csv')} disabled={isDownloading}
                      className="flex-1 h-10 text-sm font-medium" style={{ backgroundColor: report.color }}>
                      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <><Download className="w-4 h-4 mr-2" /> CSV</>
                      )}
                    </Button>
                    <Button onClick={() => handleDownload(report.type, 'pdf')} disabled={isDownloading}
                      variant="outline" className="flex-1 h-10 text-sm font-medium border-2"
                      style={{ borderColor: report.color, color: report.color }}>
                      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <><Download className="w-4 h-4 mr-2" /> PDF</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="clay-card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg">
            <FileText className="w-5 h-5 text-[#5b2c6f]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Report Scheduling</h3>
            <p className="text-sm text-gray-600 mt-1">
              Need automated reports? Configure email delivery for daily, weekly, or monthly reports via Admin Settings.
            </p>
          </div>
        </div>
      </div>

      {/* Funded Applications Table */}
      <div className="clay-card p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="text-[#0e6251] w-6 h-6" />
            Recently Funded Applications
          </h2>
          <div className="px-3 py-1 bg-[#0e6251]/10 text-[#0e6251] font-semibold rounded-full text-sm">
            {fundedApps.length} Total Funded
          </div>
        </div>

        {loadingApps ? (
          <div className="py-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#5b2c6f]" /></div>
        ) : fundedApps.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No funded applications found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">App ID</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Student Name</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Scholarship</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fundedApps.map((app, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm font-mono text-gray-500">#{app.ApplicationID}</td>
                    <td className="p-3 text-sm font-medium text-gray-800">{app.StudentName}</td>
                    <td className="p-3 text-sm text-gray-600">{app.ScholarshipName}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                        Funded
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
