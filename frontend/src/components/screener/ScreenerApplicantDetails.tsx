'use client';

import { User, Phone, Mail, Home, GraduationCap, Building2, Banknote, IndianRupee, Calendar, Users, MapPin, Award, CheckSquare, MessageSquare } from 'lucide-react';

export default function ScreenerApplicantDetails({ student, hideBankDetails = false }: { student: any; hideBankDetails?: boolean }) {
  const DataBlock = ({ icon: Icon, label, value, colSpan = 1, isTextarea = false }: any) => (
    <div className={`p-5 rounded-2xl bg-[#f8fafc] border border-slate-100 hover:bg-white shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)] hover:shadow-[4px_4px_10px_rgba(0,0,0,0.03),-4px_-4px_10px_rgba(255,255,255,1)] transition-all ${colSpan === 2 ? 'md:col-span-2' : ''}`}>
      <div className={`flex ${isTextarea ? 'flex-col' : 'items-start'} gap-3`}>
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
            <Icon size={18} className="text-[#2e86c1]" />
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
        </div>
        <div className={`text-sm font-black text-slate-700 ${isTextarea ? 'mt-2 pl-2 border-l-2 border-[#2e86c1]/20 font-medium whitespace-pre-wrap' : ''}`}>
          {value !== undefined && value !== null ? value.toString() : 'N/A'}
        </div>
      </div>
    </div>
  );

  const booleanToText = (val: any) => val ? 'Yes' : 'No';
  const siblingDetails = student.SiblingDetails ? (typeof student.SiblingDetails === 'string' ? JSON.parse(student.SiblingDetails) : student.SiblingDetails) : [];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
          <User className="text-[#2e86c1]" /> Personal & Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <DataBlock icon={User} label="Aadhar Number" value={student.AadharNumber} />
          <DataBlock icon={User} label="Gender & Category" value={`${student.Gender} | ${student.Category}`} />
          <DataBlock icon={Calendar} label="Date of Birth" value={student.DOB ? new Date(student.DOB).toLocaleDateString() : 'N/A'} />
          <DataBlock icon={Phone} label="Phone Number" value={student.Phone} />
          <DataBlock icon={Mail} label="Email Address" value={student.Email} />
          <DataBlock icon={Home} label="Current Address" value={`${student.Address}, ${student.City}, ${student.State} - ${student.Pincode}`} colSpan={2} />
          <DataBlock icon={Calendar} label="Duration at Current Address" value={student.CurrentAddressDurationMonths !== undefined && student.CurrentAddressDurationMonths !== null ? `${student.CurrentAddressDurationMonths} Months` : 'N/A'} />
          <DataBlock 
            icon={Home} 
            label={student.IsPermanentSameAsCurrent ? "Permanent Address (Same as Current)" : "Permanent Address"} 
            value={student.IsPermanentSameAsCurrent 
              ? `${student.Address}, ${student.City}, ${student.State} - ${student.Pincode}`
              : `${student.PermanentAddress || 'N/A'}, ${student.PermanentCity || ''}, ${student.PermanentState || ''} - ${student.PermanentPincode || ''}`
            } 
            colSpan={2} 
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
          <GraduationCap className="text-emerald-500" /> Academic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <DataBlock icon={Building2} label="Current Course" value={student.Course} />
          <DataBlock icon={Calendar} label="Semester / Year" value={student.CurrentSemesterOrYear} />
          <DataBlock icon={GraduationCap} label="Enrollment Year" value={student.EnrollmentYear} />
          <DataBlock icon={Calendar} label="Has Gap Year?" value={booleanToText(student.HasGapYear)} />
          <DataBlock icon={GraduationCap} label="10th Marks" value={`${student.TenthMarks}%`} />
          <DataBlock icon={GraduationCap} label="12th Marks" value={`${student.TwelfthMarks}%`} />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
          <Banknote className="text-rose-500" /> Family & Economic Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <DataBlock icon={User} label="Father's Name & Occ." value={`${student.FatherName || 'N/A'} (${student.FatherOccupation || 'N/A'})`} />
          <DataBlock icon={User} label="Mother's Name & Occ." value={`${student.MotherName || 'N/A'} (${student.MotherOccupation || 'N/A'})`} />
          <DataBlock icon={IndianRupee} label="Annual Family Income" value={`₹${student.AnnualFamilyIncome?.toLocaleString()}`} />
          <DataBlock icon={Users} label="Total Family Size" value={student.FamilySize} />
          <DataBlock icon={Users} label="Number of Siblings" value={student.NumberOfSiblings} />
          <DataBlock icon={CheckSquare} label="Aadhaar Linked to Bank?" value={booleanToText(student.IsAadhaarLinkedToBank)} />
          
          {!hideBankDetails && (
            <>
              <DataBlock icon={Building2} label="Bank Name" value={student.BankName} />
              <DataBlock icon={Building2} label="Account / IFSC" value={`${student.BankAccountNo} / ${student.BankIFSC}`} />
            </>
          )}
        </div>
        
        {siblingDetails.length > 0 && (
          <div className="mt-6 relative z-10">
            <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Sibling Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {siblingDetails.map((sib: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">Sibling #{idx + 1}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-slate-700">
                    <div>Age: <span className="text-slate-900">{sib.age}</span></div>
                    <div>Gender: <span className="text-slate-900">{sib.gender}</span></div>
                    <div>Occupation: <span className="text-slate-900">{sib.occupation}</span></div>
                    <div>Salary: <span className="text-slate-900">₹{sib.salary}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
          <MessageSquare className="text-amber-500" /> Additional Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <DataBlock icon={Home} label="Is Hosteller?" value={booleanToText(student.IsHosteller)} />
          <DataBlock icon={MapPin} label="Distance From Home (km)" value={student.DistanceFromHome} />
          <DataBlock icon={Award} label="Previous Scholarship?" value={booleanToText(student.ReceivedPreviousScholarship)} />
          <DataBlock icon={CheckSquare} label="E-KYC Verified?" value={booleanToText(student.IsEKYCVerified)} />
          <DataBlock icon={MessageSquare} label="Statement of Purpose" value={student.StatementOfPurpose} colSpan={2} isTextarea={true} />
          <DataBlock icon={Award} label="Extracurricular Activities" value={student.ExtracurricularActivities} colSpan={2} isTextarea={true} />
        </div>
      </div>
    </div>
  );
}
