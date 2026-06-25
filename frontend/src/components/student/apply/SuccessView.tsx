'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Scholarship } from '@/types';

interface SuccessViewProps {
  scholarship: Scholarship;
}

export default function SuccessView({ scholarship }: SuccessViewProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/student');
      return;
    }
    
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <div className="w-full">
      {/* Screen View */}
      <div className="animate-in zoom-in-95 duration-700 text-center py-10 max-w-2xl mx-auto print:hidden">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-40 animate-pulse rounded-full" />
          <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white">
            <CheckCircle2 size={48} />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Application Submitted!</h2>
        <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed">
          Your application for the <strong className="text-slate-800">{scholarship.name}</strong> has been successfully submitted to the review queue.
        </p>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10 text-left space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-800">What happens next?</h3>
          <ul className="space-y-3 text-sm font-medium text-slate-600">
            <li className="flex gap-3">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">1</span>
              Our AI engine will run an automated eligibility match.
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">2</span>
              A document reviewer will audit your uploaded documents.
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">3</span>
              You will be notified here and via email regarding the screening outcome.
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#5b2c6f] border-2 border-[#5b2c6f] font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} /> Download Application PDF
          </button>
          <button 
            onClick={() => router.push('/student')}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(30,41,59,0.3)]"
          >
            Go to Dashboard <ArrowRight size={18} />
          </button>
        </div>
        
        <p className="mt-6 text-sm font-semibold text-slate-400">
          Redirecting to dashboard automatically in <span className="text-[#5b2c6f] font-bold">{countdown}</span> seconds...
        </p>
      </div>

      {/* Printable Form (Hidden on Screen, Visible on Print) */}
      <div className="hidden print:block text-left bg-white text-black min-h-screen pt-8">
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider">{scholarship.sponsorName}</h1>
            <p className="text-sm font-bold text-gray-600 mt-1">Official Scholarship Application Form</p>
          </div>
          <div className="w-28 h-36 border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-500 font-bold text-center p-3">
            Affix Recent<br/>Passport Size<br/>Photo Here
          </div>
        </div>

        <h2 className="text-lg font-bold bg-gray-100 p-2 mb-4 border border-gray-200">Application Details</h2>
        <table className="w-full mb-8 border-collapse border border-gray-300 text-sm">
          <tbody>
            <tr>
              <td className="border border-gray-300 p-3 font-bold w-1/3 bg-gray-50">Scholarship Name</td>
              <td className="border border-gray-300 p-3 font-semibold">{scholarship.name}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-3 font-bold bg-gray-50">Grant Amount</td>
              <td className="border border-gray-300 p-3">INR {scholarship.perStudentAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-3 font-bold bg-gray-50">Application Date</td>
              <td className="border border-gray-300 p-3">{new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-3 font-bold bg-gray-50">Applicant Full Name</td>
              <td className="border border-gray-300 p-3 text-gray-400">__________________________________________</td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-lg font-bold bg-gray-100 p-2 mb-4 border border-gray-200">Checklist of Documents Attached</h2>
        <div className="border border-gray-300 p-4 mb-12">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3"><div className="w-4 h-4 border border-black"></div> Aadhar Card / Identity Proof</li>
            <li className="flex items-center gap-3"><div className="w-4 h-4 border border-black"></div> Income Certificate</li>
            <li className="flex items-center gap-3"><div className="w-4 h-4 border border-black"></div> Previous Year Marksheets</li>
            <li className="flex items-center gap-3"><div className="w-4 h-4 border border-black"></div> Fee Receipt / Bonafide Certificate</li>
            <li className="flex items-center gap-3"><div className="w-4 h-4 border border-black"></div> Bank Passbook Copy</li>
          </ul>
        </div>

        <div className="flex justify-between mt-32 px-10">
          <div className="text-center">
            <div className="border-b border-black w-48 mb-2"></div>
            <p className="text-sm font-bold">Date & Place</p>
          </div>
          <div className="text-center">
            <div className="border-b border-black w-56 mb-2"></div>
            <p className="text-sm font-bold">Signature of Applicant</p>
          </div>
        </div>
        
        <p className="text-xs text-center text-gray-500 mt-20 pt-4 border-t border-gray-200">
          Note: This is a system-generated form. Please attach all required documents and submit a physical copy if requested by the institution or sponsor.
        </p>
      </div>
    </div>
  );
}
