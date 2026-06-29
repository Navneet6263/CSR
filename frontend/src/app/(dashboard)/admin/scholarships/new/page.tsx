'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import CoreDetailsCard from "@/components/admin/scholarship/CoreDetailsCard";
import FundAllocationCard from "@/components/admin/scholarship/FundAllocationCard";
import RuleBuilder from "@/components/admin/scholarship/RuleBuilder";
import ActionBar from "@/components/admin/scholarship/ActionBar";
import type { Rule } from "@/components/admin/scholarship/RuleRow";

const seedRules: Rule[] = [
  { id: "r1", field: "category", operator: "in", value: "SC, ST, OBC" },
  { id: "r2", field: "income", operator: "lte", value: "200000" },
  { id: "r3", field: "gpa", operator: "gt", value: "8.0" },
  { id: "r4", field: "course", operator: "in", value: "B.Tech, B.Sc Computer Science" },
];

export default function NewScholarshipPage() {
  const [core, setCore] = useState({
    name: "",
    description: "",
    sponsor: "",
    openDate: "",
    closeDate: "",
  });
  const [totalBudget, setTotalBudget] = useState(5000000);
  const [perStudent, setPerStudent] = useState(50000);
  const [rules, setRules] = useState<Rule[]>(seedRules);

  const capacity = useMemo(
    () => (perStudent > 0 ? Math.floor(totalBudget / perStudent) : 0),
    [totalBudget, perStudent],
  );

  const canLaunch =
    core.name.trim().length > 0 &&
    core.sponsor.length > 0 &&
    core.openDate &&
    core.closeDate &&
    capacity > 0 &&
    rules.length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <Link
            href="/admin/scholarships"
            className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Scholarships
          </Link>
          <h1 className="mt-1 truncate text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Create New Scholarship
          </h1>
          <p className="text-[13px] text-slate-500">
            Define program details, fund capacity and the auto-screening eligibility rules.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2">
          <GraduationCap className="h-4 w-4 text-slate-500" />
          <span className="text-[12px] font-medium text-slate-700">Program Builder</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CoreDetailsCard value={core} onChange={(p) => setCore((c) => ({ ...c, ...p }))} />
        <FundAllocationCard
          totalBudget={totalBudget}
          perStudent={perStudent}
          onChange={(p) => {
            if (p.totalBudget !== undefined) setTotalBudget(p.totalBudget);
            if (p.perStudent !== undefined) setPerStudent(p.perStudent);
          }}
        />
      </div>

      <RuleBuilder rules={rules} onChange={setRules} />

      <ActionBar
        capacity={capacity}
        rulesCount={rules.length}
        canLaunch={!!canLaunch}
        onDraft={() => alert(`Saved as draft: ${core.name || "Untitled scholarship"}`)}
        onLaunch={() => alert(`Scholarship launched: ${core.name} • ${capacity} seats • ${rules.length} rules active`)}
      />
    </div>
  );
}
