'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, MapPin, Calendar, Users, IndianRupee, ArrowRight, Search, Filter } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { scholarshipApi } from '@/lib/api';
import { mapScholarship } from '@/lib/mappers';
import type { Scholarship } from '@/types';

export default function ScholarshipCatalogPage() {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    scholarshipApi.getAll('status=Active')
      .then(res => {
        if (res.data?.scholarships) {
          const mapped = res.data.scholarships.map((s: any) => mapScholarship(s));
          setScholarships(mapped);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredScholarships = scholarships.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.sponsorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <TopBar title="Scholarship Opportunities" subtitle="Browse and apply for scholarships that match your profile" />

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/60 p-4 rounded-3xl border border-white/50 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search scholarships or sponsors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-[#5b2c6f]/20 outline-none text-sm text-slate-700"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl text-sm font-bold text-slate-600 shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScholarships.map((s) => (
          <div key={s.scholarshipId} className="clay-card p-6 border border-white/60 bg-white/70 flex flex-col group hover:-translate-y-1 transition-all duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-br from-[#5b2c6f]/10 to-[#2e86c1]/10 rounded-2xl">
                <GraduationCap size={24} className="text-[#5b2c6f]" />
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-emerald-100">
                Active
              </span>
            </div>
            
            {/* Title & Sponsor */}
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-[#5b2c6f] transition-colors">{s.name}</h3>
              <p className="text-sm font-semibold text-slate-500 mt-1">{s.sponsorName}</p>
            </div>

            {/* Quick Details */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <IndianRupee size={14} className="text-slate-500" />
                </div>
                <span><strong className="text-slate-800">₹{s.perStudentAmount.toLocaleString('en-IN')}</strong> / student</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-slate-500" />
                </div>
                <span>Closes: <strong className="text-slate-800">{new Date(s.applicationCloseDate).toLocaleDateString()}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Users size={14} className="text-slate-500" />
                </div>
                <span>{s.maxApplicants ? `${s.maxApplicants} Slots Available` : 'Unlimited Slots'}</span>
              </div>
            </div>

            <div className="mt-auto">
              <button 
                onClick={() => router.push(`/student/scholarships/${s.scholarshipId}`)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-800 text-white font-bold text-sm rounded-2xl hover:bg-slate-700 transition-colors shadow-lg shadow-slate-200"
              >
                View Details & Apply <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredScholarships.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No scholarships found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
