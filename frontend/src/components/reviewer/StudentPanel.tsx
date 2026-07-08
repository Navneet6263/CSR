"use client";
import type { Student } from "@/lib/mock-data";
import { User, Calendar, IdCard, Wallet, GraduationCap, MapPin, Accessibility } from "lucide-react";

export function StudentPanel({ student, appId, scholarship }: { student: Student; appId: string; scholarship: string }) {
  return (
    <div className="glass p-5">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center text-bg font-display font-bold">
          {student.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </div>
        <div>
          <div className="font-display font-semibold">{student.fullName}</div>
          <div className="text-xs text-fg-subtle font-mono">{student.id} · {appId}</div>
        </div>
      </div>
      <div className="mt-4 space-y-4 text-sm">
        <Group icon={User} title="Personal">
          <Row k="Full Name" v={student.fullName} />
          <Row k="DOB" v={student.dob} />
          <Row k="Gender" v={student.gender} />
          <Row k="Category" v={<CategoryPill c={student.category} />} />
          {student.disability && <Row k="Disability" v={<span className="text-warn">{student.disability}</span>} />}
        </Group>
        <Group icon={IdCard} title="Identity & Income">
          <Row k="Aadhaar" v={<span className="font-mono">{student.aadhar}</span>} />
          <Row k="Annual Income" v={student.income} />
        </Group>
        <Group icon={Wallet} title="Bank Details">
          <Row k="Account No" v={<span className="font-mono">{student.bank.acc}</span>} />
          <Row k="IFSC" v={<span className="font-mono">{student.bank.ifsc}</span>} />
          <Row k="Bank" v={student.bank.name} />
        </Group>
        <Group icon={GraduationCap} title="Academic">
          <Row k="10th Marks" v={student.scores.tenth} />
          <Row k="12th Marks" v={student.scores.twelfth} />
          <Row k="Current" v={student.scores.current} />
        </Group>
        <Group icon={MapPin} title="Domicile">
          <Row k="State" v={student.state} />
          <Row k="District" v={student.district} />
        </Group>
      </div>
      <div className="mt-5 pt-4 border-t border-border">
        <div className="text-[10px] font-mono uppercase tracking-widest text-fg-subtle">Applying for</div>
        <div className="mt-1 font-semibold text-primary">{scholarship}</div>
      </div>
    </div>
  );
}

function Group({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-fg-subtle mb-2">
        <Icon className="w-3 h-3" /> {title}
      </div>
      <div className="rounded-lg bg-surface/40 border border-border divide-y divide-border">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex items-center justify-between px-3 py-2 text-sm"><span className="text-fg-subtle text-xs">{k}</span><span className="font-medium text-right">{v}</span></div>;
}
function CategoryPill({ c }: { c: string }) {
  return <span className="rounded-md bg-primary/15 border border-primary/40 text-primary px-2 py-0.5 text-xs font-mono">{c}</span>;
}
// Accessibility export dummy to satisfy tree-shake reference
export const _a = Accessibility;
