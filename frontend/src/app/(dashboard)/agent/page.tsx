'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AgentStats = {
  totalRegistered: number;
  submitted: number;
  approved: number;
  rejected: number;
  approvalRate: number;
  commission: number;
};

type Student = {
  studentId: number;
  name: string;
  status: string;
  appliedDate: string;
};

export default function AgentDashboard() {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/agent/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
      fetch('/api/v1/agent/students', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    ])
      .then(async ([statsRes, studentsRes]) => {
        const statsData = await statsRes.json();
        const studentsData = await studentsRes.json();
        setStats(statsData.data);
        setStudents(studentsData.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b2c6f]" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Agent Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Track your students and performance</p>
        </div>
        <Button className="bg-[#5b2c6f] text-white">
          <Upload className="w-4 h-4 mr-2" /> Bulk Register Students
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="clay-card p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-[#5b2c6f]" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalRegistered || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Total Students</p>
        </div>
        <div className="clay-card p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-6 h-6 text-[#2e86c1]" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats?.submitted || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Submitted</p>
        </div>
        <div className="clay-card p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-[#0e6251]" />
          </div>
          <p className="text-2xl font-bold text-[#0e6251]">{stats?.approvalRate || 0}%</p>
          <p className="text-xs text-gray-500 mt-1">Approval Rate</p>
        </div>
        <div className="clay-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl">₹</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">₹{stats?.commission?.toLocaleString() || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Commission</p>
        </div>
      </div>

      <div className="clay-card p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">My Students</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Applied Date</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(s => (
                <tr key={s.studentId} className="hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-500">ID: {s.studentId}</p>
                  </td>
                  <td className="p-3 text-sm text-gray-600 hidden md:table-cell">
                    {new Date(s.appliedDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      s.status.includes('Approved') ? 'bg-green-100 text-green-700' :
                      s.status.includes('Rejected') ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
