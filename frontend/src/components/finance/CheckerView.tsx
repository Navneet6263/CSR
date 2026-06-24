"use client";

import { useEffect, useState } from "react";
import { financeApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, Loader2, CheckCircle, XCircle } from "lucide-react";
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        {payments.length === 0 ? (
          <p className="text-gray-500 italic">No pending verifications.</p>
        ) : payments.map((p) => (
          <Card key={p.paymentId} className="clickable-card clay-card border-0" onClick={() => { setSelected(p); setFormData({ referenceNo: '', status: 'Completed', notes: '' }); }}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-[#2e86c1]">Payment #{p.paymentId}</h3>
                <p className="text-gray-600">{p.paymentType} • App #{p.applicationId}</p>
              </div>
              <p className="text-2xl font-bold text-[#0e6251] flex items-center">
                <IndianRupee className="w-5 h-5 mr-1" /> {p.amount.toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        {selected ? (
          <Card className="clay-card border-0 sticky top-6">
            <CardHeader><CardTitle className="text-[#2e86c1]">Verify Payment</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <Input value={formData.referenceNo} placeholder="UTR / Reference No."
                onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })} className="rounded-xl" />
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: (v || 'Completed') as PaymentVerifyStatus })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="rounded-xl min-h-[80px]" placeholder="Optional notes..." />
              <Button className="w-full cursor-pointer" onClick={handleSubmit}
                disabled={submitting || (formData.status === 'Completed' && !formData.referenceNo)}>
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : formData.status === 'Completed'
                  ? <><CheckCircle className="w-5 h-5 mr-2" /> Verify Completed</>
                  : <><XCircle className="w-5 h-5 mr-2" /> Mark Failed</>}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="h-64 rounded-3xl border-2 border-dashed border-[#2e86c1]/20 flex items-center justify-center text-gray-400 clay-card">
            Select a payment to verify
          </div>
        )}
      </div>
    </div>
  );
}
