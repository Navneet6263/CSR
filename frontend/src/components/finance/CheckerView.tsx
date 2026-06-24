"use client";

import { useEffect, useState } from "react";
import { financeApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, Loader2, CheckCircle, XCircle, Shield, AlertTriangle } from "lucide-react";
import type { PendingPaymentRow, PaymentVerifyStatus } from "@/types/domain";

export default function CheckerView() {
  const [payments, setPayments] = useState<PendingPaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PendingPaymentRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ referenceNo: "", status: "Completed" as PaymentVerifyStatus, notes: "" });

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getPendingVerifications();
      setPayments(res.data || []);
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleSubmit = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      await financeApi.verifyPayment(selected.paymentId, {
        referenceNo: formData.referenceNo,
        status: formData.status,
        checkerNotes: formData.notes || undefined,
      });
      setSelected(null);
      fetchPending();
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="clay-card p-4 border-l-4 border-[#2e86c1]">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending Verification</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{payments.length}</p>
        </div>
        <div className="clay-card p-4 border-l-4 border-[#0e6251]">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Value</p>
          <p className="text-3xl font-bold text-[#0e6251] mt-2 flex items-center">
            <IndianRupee className="w-6 h-6 mr-1" />{totalAmount.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="clay-card p-4 border-l-4 border-[#5b2c6f]">
          <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Shield className="w-3 h-3" />Checker Role
          </p>
          <p className="text-sm font-medium text-gray-700 mt-2">Verify Payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {payments.length === 0 ? (
            <div className="clay-card p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No pending verifications</p>
              <p className="text-sm text-gray-400 mt-1">All payments verified</p>
            </div>
          ) : payments.map((p) => (
            <Card key={p.paymentId} 
              className={`clickable-card clay-card border-0 transition-all ${
                selected?.paymentId === p.paymentId ? 'ring-2 ring-[#2e86c1] shadow-lg' : ''
              }`}
              onClick={() => { setSelected(p); setFormData({ referenceNo: '', status: 'Completed', notes: '' }); }}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#2e86c1]/10 rounded-lg">
                      <Shield className="w-5 h-5 text-[#2e86c1]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Payment #{p.paymentId}</h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span>{p.paymentType}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="font-mono">App #{p.applicationId}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#0e6251] flex items-center justify-end">
                      <IndianRupee className="w-5 h-5" />{p.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Initiated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:sticky lg:top-6 lg:h-fit">
          {selected ? (
            <Card className="clay-card border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#2e86c1]/5 to-[#5b2c6f]/5 border-b border-gray-100">
                <CardTitle className="text-[#2e86c1] flex items-center gap-2">
                  <Shield className="w-5 h-5" />Verify Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-amber-600 uppercase font-semibold tracking-wide">Security Check</p>
                      <p className="text-xs text-amber-700 mt-1">Verify bank transfer before approval</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 uppercase tracking-wide mb-2">Payment ID</p>
                  <p className="font-mono text-sm font-bold text-gray-800">#{selected.paymentId}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Verification Status</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: (v || 'Completed') as PaymentVerifyStatus })}>
                    <SelectTrigger className="rounded-xl h-12 border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#0e6251]" />Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="Failed">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-[#c0392b]" />Failed
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                    UTR / Reference No. {formData.status === 'Completed' && <span className="text-red-500">*</span>}
                  </label>
                  <Input value={formData.referenceNo} placeholder="Enter bank reference number"
                    onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })} 
                    className="rounded-xl h-12 border-2 font-mono" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Checker Notes</label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="rounded-xl min-h-[80px] border-2" placeholder="Optional verification notes..." />
                </div>

                <Button className="w-full h-12 cursor-pointer font-bold" onClick={handleSubmit}
                  disabled={submitting || (formData.status === 'Completed' && !formData.referenceNo)}
                  style={{
                    background: formData.status === 'Completed' ? 'linear-gradient(to right, #0e6251, #0b4e41)' : 'linear-gradient(to right, #c0392b, #a93226)'
                  }}>
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : formData.status === 'Completed'
                    ? <><CheckCircle className="w-5 h-5 mr-2" /> Verify Completed</>
                    : <><XCircle className="w-5 h-5 mr-2" /> Mark Failed</>}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="clay-card p-8">
              <div className="border-2 border-dashed border-[#2e86c1]/20 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-[#2e86c1]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#2e86c1]/40" />
                </div>
                <p className="text-gray-500 font-medium">Select Payment</p>
                <p className="text-sm text-gray-400 mt-1">Choose from queue to verify</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
