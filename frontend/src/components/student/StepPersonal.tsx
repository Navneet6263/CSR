'use client';

interface StepPersonalProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

const genderOptions = ['Male', 'Female', 'Other'];
const categoryOptions = ['General', 'OBC', 'SC', 'ST'];
const stateOptions = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

function ClayInput({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-600 mb-1.5">{label}</label>
      <input {...props}
        className="w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all"
      />
      {error && <p className="text-xs text-[#c0392b] mt-1">{error}</p>}
    </div>
  );
}

function ClaySelect({ label, options, error, ...props }: { label: string; options: string[]; error?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-600 mb-1.5">{label}</label>
      <select {...props}
        className="w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all"
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-xs text-[#c0392b] mt-1">{error}</p>}
    </div>
  );
}

export default function StepPersonal({ data, onChange, errors }: StepPersonalProps) {
  return (
    <div className="clay-card p-6 space-y-5 animate-card-entrance">
      <h3 className="text-lg font-bold text-slate-800">Personal Details</h3>
      <p className="text-sm text-slate-400">Tell us about yourself</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClayInput label="Full Name" value={data.fullName || ''} readOnly
          onChange={() => {}} placeholder="From profile" />
        <ClayInput label="Date of Birth" type="date" value={data.dob || ''}
          onChange={(e) => onChange('dob', e.target.value)} error={errors.dob} />
        <ClaySelect label="Gender" options={genderOptions} value={data.gender || ''}
          onChange={(e) => onChange('gender', e.target.value)} error={errors.gender} />
        <ClaySelect label="Category" options={categoryOptions} value={data.category || ''}
          onChange={(e) => onChange('category', e.target.value)} error={errors.category} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1.5">Address</label>
        <textarea value={data.address || ''} onChange={(e) => onChange('address', e.target.value)}
          rows={3} placeholder="Enter your full address"
          className="w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all resize-none"
        />
        {errors.address && <p className="text-xs text-[#c0392b] mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ClayInput label="City" value={data.city || ''}
          onChange={(e) => onChange('city', e.target.value)} error={errors.city} placeholder="City" />
        <ClaySelect label="State" options={stateOptions} value={data.state || ''}
          onChange={(e) => onChange('state', e.target.value)} error={errors.state} />
        <ClayInput label="Pincode" value={data.pincode || ''} maxLength={6}
          onChange={(e) => onChange('pincode', e.target.value)} error={errors.pincode} placeholder="6-digit pincode" />
      </div>
    </div>
  );
}
