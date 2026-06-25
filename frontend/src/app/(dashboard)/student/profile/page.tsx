'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopBar from '@/components/dashboard/TopBar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { studentApi } from '@/lib/api';
import type { StudentProfile } from '@/types';

import ProfileSidebar from '@/components/student/profile/ProfileSidebar';
import PersonalTab from '@/components/student/profile/PersonalTab';
import FamilyTab from '@/components/student/profile/FamilyTab';
import EducationTab from '@/components/student/profile/EducationTab';
import BankTab from '@/components/student/profile/BankTab';
import CorporateTab from '@/components/student/profile/CorporateTab';
import DocumentsTab from '@/components/student/profile/DocumentsTab';
import { calculateProfileCompletion } from '@/lib/profileUtils';

export type TabType = 'personal' | 'family' | 'education' | 'bank' | 'corporate' | 'documents';

export default function StudentProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>((searchParams?.get('tab') as TabType) || 'personal');
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getProfile();
      if (res.data) {
        setProfile(res.data);
      } else {
        setError('Failed to load profile data.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
          <button onClick={fetchProfile} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate profile completion percentage based on real data
  const completionPercentage = calculateProfileCompletion(profile);

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <TopBar title="My Profile" subtitle="Manage your personal information and documents" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Sidebar */}
        <div className="lg:col-span-1">
          <ProfileSidebar 
            profile={profile} 
            completionPercentage={completionPercentage}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Right Column: Tab Content */}
        <div className="lg:col-span-3">
          <div className="clay-card p-6 md:p-8 border border-white/60 bg-white/70 min-h-[500px]">
            {activeTab === 'personal' && <PersonalTab profile={profile} onUpdate={fetchProfile} />}
            {activeTab === 'family' && <FamilyTab profile={profile} onUpdate={fetchProfile} />}
            {activeTab === 'education' && <EducationTab profile={profile} onUpdate={fetchProfile} />}
            {activeTab === 'bank' && <BankTab profile={profile} onUpdate={fetchProfile} />}
            {activeTab === 'corporate' && <CorporateTab profile={profile} onUpdate={fetchProfile} />}
            {activeTab === 'documents' && <DocumentsTab />}
          </div>
        </div>

      </div>
    </div>
  );
}
