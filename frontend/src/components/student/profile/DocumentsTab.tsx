'use client';

import { useState, useEffect, useRef } from 'react';
import { UploadCloud, File as FileIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { studentApi } from '@/lib/api';

export default function DocumentsTab() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<string>('Identity');

  const fetchDocs = async () => {
    try {
      const res = await studentApi.getDocuments();
      setDocs(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileClick = (type: string) => {
    setSelectedType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingType(selectedType);
    setError(null);
    try {
      await studentApi.uploadDocument(selectedType, file);
      await fetchDocs();
    } catch (err) {
      console.error(err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploadingType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getDocStatus = (type: string) => {
    return docs.find(d => d.documentType === type);
  };

  const documentTypes = [
    { type: 'Identity', label: 'Aadhaar Card / ID Proof', desc: 'Government issued identity card' },
    { type: 'PassportPhoto', label: 'Passport Size Photo', desc: 'Recent clear passport size photograph' },
    { type: 'Income', label: 'Income Certificate', desc: 'Valid income proof (BPL/Ration/Affidavit/ITR)' },
    { type: 'CasteCertificate', label: 'Caste Certificate', desc: 'Mandatory for SC/ST/OBC category' },
    { type: 'DomicileCertificate', label: 'Domicile Certificate', desc: 'Mandatory for State scholarships' },
    { type: 'Academic10th', label: '10th Marksheet', desc: 'Original 10th marksheet document' },
    { type: 'Academic12th', label: '12th Marksheet', desc: 'Original 12th marksheet document' },
    { type: 'Bonafide', label: 'Bonafide Certificate', desc: 'Freshly issued by current college/institution' },
    { type: 'BankPassbook', label: 'Bank Passbook / Cancelled Cheque', desc: 'Must clearly show Account No. and IFSC' },
    { type: 'Recommendation', label: 'Recommendation Letter', desc: 'From Principal/Teacher (for Corporate CSR)' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Verification Documents</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Upload required documents to process your scholarships faster.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600">
          <AlertCircle size={18} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentTypes.map((docDef) => {
          const uploadedDoc = getDocStatus(docDef.type);
          const isUploading = uploadingType === docDef.type;

          return (
            <div key={docDef.type} className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-[#5b2c6f]/30 transition-colors group flex flex-col h-full shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${uploadedDoc ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-[#5b2c6f]/5 group-hover:text-[#5b2c6f] transition-colors'}`}>
                  {uploadedDoc ? <CheckCircle2 size={24} /> : <FileIcon size={24} />}
                </div>
                {uploadedDoc && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Uploaded</span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm mb-1">{docDef.label}</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4">{docDef.desc}</p>
              </div>

              <button 
                onClick={() => handleFileClick(docDef.type)}
                disabled={isUploading || loading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isUploading 
                    ? 'bg-slate-100 text-slate-400'
                    : uploadedDoc 
                    ? 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50' 
                    : 'bg-[#5b2c6f]/10 text-[#5b2c6f] hover:bg-[#5b2c6f]/20'
                }`}
              >
                {isUploading ? (
                  <><span className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" /> Uploading...</>
                ) : uploadedDoc ? (
                  <>Re-upload File</>
                ) : (
                  <><UploadCloud size={16} /> Upload Document</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
