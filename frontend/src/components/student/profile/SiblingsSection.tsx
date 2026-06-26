'use client';

import { Plus, Trash2 } from 'lucide-react';

interface Sibling {
  age: string;
  gender: string;
  occupation: string;
  salary: string;
}

interface SiblingsSectionProps {
  numberOfSiblings: number;
  siblingDetails: Sibling[];
  onChange: (num: number, details: Sibling[]) => void;
}

export default function SiblingsSection({ numberOfSiblings, siblingDetails, onChange }: SiblingsSectionProps) {
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value) || 0;
    
    // Adjust array size
    let newDetails = [...siblingDetails];
    if (count > newDetails.length) {
      for (let i = newDetails.length; i < count; i++) {
        newDetails.push({ age: '', gender: '', occupation: '', salary: '' });
      }
    } else if (count < newDetails.length) {
      newDetails = newDetails.slice(0, count);
    }
    
    onChange(count, newDetails);
  };

  const handleSiblingChange = (index: number, field: keyof Sibling, value: string) => {
    const newDetails = [...siblingDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    onChange(numberOfSiblings, newDetails);
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Siblings Information</h3>
      <div className="space-y-6">
        <div className="w-full md:w-1/2 space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Number of Siblings</label>
          <input 
            type="number" value={numberOfSiblings} onChange={handleCountChange} min="0" max="10"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 outline-none shadow-sm"
          />
        </div>

        {siblingDetails.map((sibling, index) => (
          <div key={index} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-slate-600">Sibling #{index + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Age</label>
                <input 
                  type="number" value={sibling.age} onChange={(e) => handleSiblingChange(index, 'age', e.target.value)} required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                <select 
                  value={sibling.gender} onChange={(e) => handleSiblingChange(index, 'gender', e.target.value)} required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Occupation</label>
                <input 
                  type="text" value={sibling.occupation} onChange={(e) => handleSiblingChange(index, 'occupation', e.target.value)} required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                  placeholder="e.g. Student"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Annual Salary (₹)</label>
                <input 
                  type="number" value={sibling.salary} onChange={(e) => handleSiblingChange(index, 'salary', e.target.value)} min="0" required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                  placeholder="0 if none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
