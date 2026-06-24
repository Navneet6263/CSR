import { IndianRupee, Calendar, CheckCircle, Building2, User, Copy } from 'lucide-react';

type PaymentStatus = 'Pending' | 'Initiated' | 'Completed' | 'Failed';

type PaymentDetailsProps = {
  amount: number;
  status: PaymentStatus;
  paymentType?: 'Direct' | 'Institution';
  referenceNo?: string;
  disbursementDate?: string;
  institutionName?: string;
};

const statusConfig = {
  Pending: { color: 'text-[#f39c12]', bg: 'bg-[#f39c12]/10', label: 'Pending' },
  Initiated: { color: 'text-[#2e86c1]', bg: 'bg-[#2e86c1]/10', label: 'In Progress' },
  Completed: { color: 'text-[#0e6251]', bg: 'bg-[#0e6251]/10', label: 'Completed' },
  Failed: { color: 'text-[#c0392b]', bg: 'bg-[#c0392b]/10', label: 'Failed' },
};

export default function PaymentDetails({ 
  amount, status, paymentType, referenceNo, disbursementDate, institutionName 
}: PaymentDetailsProps) {
  const config = statusConfig[status];

  const copyReference = () => {
    if (referenceNo) {
      navigator.clipboard.writeText(referenceNo);
      alert('Reference number copied!');
    }
  };

  return (
    <div className="clay-card p-6 border-l-4 border-[#0e6251]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Payment Status</h3>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>
        <div className="p-3 bg-[#0e6251]/10 rounded-xl">
          <IndianRupee className="w-6 h-6 text-[#0e6251]" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Scholarship Amount</p>
          <p className="text-3xl font-bold text-[#0e6251] flex items-center">
            <IndianRupee className="w-6 h-6" />{amount.toLocaleString('en-IN')}
          </p>
        </div>

        {paymentType && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Payment Mode</p>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
              {paymentType === 'Direct' ? (
                <><User className="w-4 h-4" />Direct to Student</>
              ) : (
                <><Building2 className="w-4 h-4" />To Institution</>
              )}
            </div>
            {institutionName && (
              <p className="text-xs text-gray-600 mt-1">{institutionName}</p>
            )}
          </div>
        )}

        {status === 'Completed' && referenceNo && (
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-green-700 uppercase tracking-wide font-semibold">UTR / Reference No.</p>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm font-bold text-gray-800">{referenceNo}</p>
              <button onClick={copyReference} className="p-1 hover:bg-green-100 rounded">
                <Copy className="w-3 h-3 text-green-600" />
              </button>
            </div>
          </div>
        )}

        {disbursementDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Disbursed on {new Date(disbursementDate).toLocaleDateString('en-IN', { 
              day: 'numeric', month: 'long', year: 'numeric' 
            })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
