"use client";

import { useEffect, useState } from "react";
import { financeApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, Loader2, Send, User, Building2, Shield } from "lucide-react";
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
    setFormData({ paymentType: "Direct", amount: String(app.scholarshipAmount ?? ""), notes: "" });
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

  const totalAmount = applications.reduce((sum, app) => sum + (app.scholarshipAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="clay-card p-4 border-l-4 border-[#5b2c6f]">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending Queue</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{applications.length}</p>
        </div>
        <div className="clay-card p-4 border-l-4 border-[#0e6251]">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Amount</p>
          <p className="text-3xl font-bold text-[#0e6251] mt-2 flex items-center">
            <IndianRupee className="w-6 h-6 mr-1" />{totalAmount.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="clay-card p-4 border-l-4 border-[#2e86c1]">
          <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Shield className="w-3 h-3" />Maker Role
          </p>
          <p className="text-sm font-medium text-gray-700 mt-2">Initiate Payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {applications.length === 0 ? (
            <div className="clay-card p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IndianRupee className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No pending initiations</p>
              <p className="text-sm text-gray-400 mt-1">All payments are up to date</p>
            </div>
          ) : applications.map((app) => (
            <Card key={app.applicationId}
              className={`clickable-card clay-card border-0 transition-all ${
                selectedApp?.applicationId === app.applicationId ? 'ring-2 ring-[#5b2c6f] shadow-lg' : ''
              }`}
              onClick={() => handleSelect(app)}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#5b2c6f]/10 rounded-lg">
                      <User className="w-5 h-5 text-[#5b2c6f]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{app.scholarshipName || 'Scholarship'}</h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span className="font-mono">#{app.applicationId}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="px-2 py-0.5 bg-[#f39c12]/10 text-[#f39c12] rounded-full text-xs font-medium">{app.status}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#0e6251] flex items-center justify-end">
                      <IndianRupee className="w-5 h-5" />{app.scholarshipAmount?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:sticky lg:top-6 lg:h-fit">
          {selectedApp ? (
            <Card className="clay-card border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#5b2c6f]/5 to-[#2e86c1]/5 border-b border-gray-100">
                <CardTitle className="text-[#5b2c6f] flex items-center gap-2">
                  <Send className="w-5 h-5" />Initiate Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 uppercase tracking-wide mb-2">Selected Application</p>
                  <p className="font-mono text-sm font-bold text-gray-800">#{selectedApp.applicationId}</p>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Payment Mode</label>
                  <Select value={formData.paymentType} onValueChange={(v) => setFormData({ ...formData, paymentType: v || 'Direct' })}>
                    <SelectTrigger className="rounded-xl h-12 border-2">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direct">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />Direct to Student
                        </div>
                      </SelectItem>
                      <SelectItem value="Institution">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />To Institution
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Amount (₹)</label>
                  <Input type="number" value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                    className="rounded-xl h-12 border-2 font-semibold text-lg" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Maker Notes</label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="rounded-xl min-h-[80px] border-2" placeholder="Enter notes for checker review..." />
                </div>

                <Button className="w-full h-12 clay-button cursor-pointer bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] text-white font-bold" 
                  onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 mr-2" /> Submit for Verification</>}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="clay-card p-8">
              <div className="border-2 border-dashed border-[#5b2c6f]/20 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-[#5b2c6f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-[#5b2c6f]/40" />
                </div>
                <p className="text-gray-500 font-medium">Select Application</p>
                <p className="text-sm text-gray-400 mt-1">Choose from queue to initiate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
