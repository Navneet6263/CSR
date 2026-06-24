'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { screeningApi } from '@/lib/api';

type Student = {
  applicationId: number;
  studentName: string;
  college: string;
  amount: number;
  category: string;
  eligibilitySummary: string;
  docsStatus: string;
};

export default function CSRApprovals() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    screeningApi.getPendingCSR()
      .then(res => {
        const mapped = (res.data as any || []).map((item: any) => ({
          ...item,
          amount: item.scholarshipAmount || item.amount || 0,
          college: item.college || 'N/A',
          category: item.category || 'General',
        }));
        setStudents(mapped);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id: number) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  const selectAll = () => {
    if (selected.size === students.length) setSelected(new Set());
    else setSelected(new Set(students.map(s => s.applicationId)));
  };

  const handleBulkAction = async (action: 'approve' | 'decline', specificIds?: number[]) => {
    const ids = specificIds || Array.from(selected);
    if (ids.length === 0) return;
    try {
      // Execute decisions sequentially
      for (const id of ids) {
        await screeningApi.submitCSR(id, { decision: action === 'approve' ? 'Approve' : 'Decline', notes: `${action === 'approve' ? 'Approved' : 'Declined'} by CSR` });
      }
      setStudents(students.filter(s => !ids.includes(s.applicationId)));
      const newSet = new Set(selected);
      ids.forEach(id => newSet.delete(id));
      setSelected(newSet);
    } catch (err) {
      alert(`Failed to ${action}`);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b2c6f]" /></div>;

  const totalAmount = Array.from(selected).reduce((sum, id) => {
    const student = students.find(s => s.applicationId === id);
    return sum + (student?.amount || 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Pending Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">{students.length} students awaiting decision</p>
        </div>
        <div className="clay-card px-4 py-2">
          <p className="text-xs text-gray-500">Selected Amount</p>
          <p className="text-xl md:text-2xl font-bold text-[#5b2c6f]">₹{totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="clay-card p-4 flex flex-col md:flex-row items-center gap-3 bg-[#5b2c6f]/5">
          <p className="text-sm font-medium text-gray-700">{selected.size} selected</p>
          <div className="flex gap-2 flex-1 md:flex-initial">
            <Button onClick={() => handleBulkAction('approve')} className="bg-[#0e6251] text-white hover:bg-[#0b4e41]">
              <CheckCircle className="w-4 h-4 mr-2" /> Approve Selected
            </Button>
            <Button onClick={() => handleBulkAction('decline')} className="bg-[#c0392b] text-white hover:bg-[#a93226]">
              <XCircle className="w-4 h-4 mr-2" /> Decline Selected
            </Button>
          </div>
        </div>
      )}

      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 text-left">
                  <input type="checkbox" checked={selected.size === students.length && students.length > 0} 
                    onChange={selectAll} className="w-4 h-4 rounded" />
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">College</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Category</th>
                <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(s => (
                <tr key={s.applicationId} className="hover:bg-gray-50">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.has(s.applicationId)} 
                      onChange={() => toggleSelect(s.applicationId)} className="w-4 h-4 rounded" />
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-gray-800 text-sm">{s.studentName}</p>
                    <p className="text-xs text-gray-500">#{s.applicationId}</p>
                  </td>
                  <td className="p-3 text-sm text-gray-700 hidden md:table-cell">{s.college}</td>
                  <td className="p-3 text-sm font-semibold text-gray-800">₹{s.amount.toLocaleString()}</td>
                  <td className="p-3 hidden md:table-cell">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">{s.category}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleBulkAction('approve', [s.applicationId])} 
                        className="p-2 text-[#0e6251] hover:bg-green-50 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleBulkAction('decline', [s.applicationId])} 
                        className="p-2 text-[#c0392b] hover:bg-red-50 rounded-lg">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
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
