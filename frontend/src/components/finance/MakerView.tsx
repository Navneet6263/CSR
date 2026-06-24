"use client";

import { useEffect, useState } from "react";
import { financeApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, Loader2, Send } from "lucide-react";
import type { PaymentQueueRow } from "@/types/domain";

export default function MakerView() {
  const [applications, setApplications] = useState<PaymentQueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<PaymentQueueRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ paymentType: "Direct", amount: "", notes: "" });

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getPendingInitiation();
      setApplications(res.data || []);
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleSelect = (app: PaymentQueueRow) => {
    setSelectedApp(app);
    setFormData({
      paymentType: "Direct",
      amount: String(app.scholarshipAmount ?? ""),
      notes: "",
    });
  };

  const handleSubmit = async () => {
    if (!selectedApp) return;
    try {
      setSubmitting(true);
      await financeApi.initiatePayment({
        appId: selectedApp.applicationId,
        paymentType: formData.paymentType,
        amount: parseFloat(formData.amount),
        makerNotes: formData.notes || undefined,
      });
      setSelectedApp(null);
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
        {applications.length === 0 ? (
          <p className="text-gray-500 italic">No pending initiations.</p>
        ) : applications.map((app) => (
          <Card key={app.applicationId}
            className="clickable-card clay-card border-0 overflow-hidden"
            onClick={() => handleSelect(app)}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-[#5b2c6f]">{app.scholarshipName || 'Scholarship'}</h3>
                <p className="text-sm text-gray-500 mt-1">App #{app.applicationId} • {app.status}</p>
              </div>
              <p className="text-2xl font-bold text-[#0e6251] flex items-center">
                <IndianRupee className="w-5 h-5 mr-1" /> {app.scholarshipAmount?.toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        {selectedApp ? (
          <Card className="clay-card border-0 sticky top-6">
            <CardHeader><CardTitle className="text-[#5b2c6f]">Initiate Payment</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <Select value={formData.paymentType} onValueChange={(v) => setFormData({ ...formData, paymentType: v || 'Direct' })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Payment type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Direct">Direct to Student</SelectItem>
                  <SelectItem value="Institution">To Institution</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="rounded-xl" />
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="rounded-xl min-h-[80px]" placeholder="Optional notes..." />
              <Button className="w-full clay-button cursor-pointer" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 mr-2" /> Submit</>}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="h-64 rounded-3xl border-2 border-dashed border-[#5b2c6f]/20 flex items-center justify-center text-gray-400 clay-card">
            Select an application to initiate
          </div>
        )}
      </div>
    </div>
  );
}
