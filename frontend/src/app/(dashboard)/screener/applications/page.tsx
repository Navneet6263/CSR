'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Search, Filter } from 'lucide-react';
import { screeningApi } from '@/lib/api';
import { Input } from '@/components/ui/input';

type App = {
  applicationId: number;
  studentName: string;
  scholarshipName: string;
  submissionDate: string;
  bgCheckResult: string;
  urgency: 'high' | 'medium' | 'low';
  daysPending: number;
};

export default function ScreeningApplications() {
  const [apps, setApps] = useState<App[]>([]);
  const [filtered, setFiltered] = useState<App[]>([]);
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    screeningApi.getPendingScreening()
      .then(res => {
        const data = res.data || [];
        setApps(data);
        setFiltered(data);
      })
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = apps;
    if (search) {
      result = result.filter(a => 
        a.studentName.toLowerCase().includes(search.toLowerCase()) ||
        a.applicationId.toString().includes(search)
      );
    }
    if (urgencyFilter !== 'all') {
      result = result.filter(a => (a.urgency || 'medium') === urgencyFilter);
    }
    setFiltered(result);
  }, [search, urgencyFilter, apps]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b2c6f]" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Screening Queue</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} applications pending review</p>
        </div>
        <div className="flex gap-3">
          <div className="clay-card px-3 py-2 text-center flex-1 md:flex-initial">
            <p className="text-xs text-gray-500">High Priority</p>
            <p className="text-xl md:text-2xl font-bold text-[#c0392b]">{apps.filter(a => a.urgency === 'high').length}</p>
          </div>
          <div className="clay-card px-3 py-2 text-center flex-1 md:flex-initial">
            <p className="text-xs text-gray-500">Medium</p>
            <p className="text-xl md:text-2xl font-bold text-[#f39c12]">{apps.filter(a => a.urgency === 'medium').length}</p>
          </div>
        </div>
      </div>

      <div className="clay-card p-3 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10" />
        </div>
        <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="clay-input px-4 h-10">
          <option value="all">All Urgency</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(app => (
          <Link key={app.applicationId} href={`/screener/review/${app.applicationId}`}>
            <div className={`clay-card p-4 hover:shadow-lg transition-all cursor-pointer border-l-4 ${
              app.urgency === 'high' ? 'border-[#c0392b]' : app.urgency === 'medium' ? 'border-[#f39c12]' : 'border-gray-300'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-500">#{app.applicationId}</span>
                    <h3 className="font-semibold text-gray-800">{app.studentName}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      (app.urgency || 'medium') === 'high' ? 'bg-red-100 text-red-700' : 
                      (app.urgency || 'medium') === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}>{(app.urgency || 'medium').toUpperCase()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{app.scholarshipName}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">BG Check</p>
                    <p className={`font-medium ${app.bgCheckResult === 'Pass' ? 'text-[#0e6251]' : 'text-[#c0392b]'}`}>
                      {app.bgCheckResult}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Days</p>
                    <p className="font-medium text-gray-700">{app.daysPending}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-[#5b2c6f]" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
