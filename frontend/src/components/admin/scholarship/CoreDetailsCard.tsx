import { CalendarDays, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  value: {
    name: string;
    description: string;
    sponsor: string;
    openDate: string;
    closeDate: string;
  };
  onChange: (patch: Partial<Props["value"]>) => void;
};

const sponsors = [
  "Tata CSR Foundation",
  "Infosys Foundation",
  "Reliance Foundation",
  "Azim Premji Foundation",
  "Wipro Cares",
  "HDFC Parivartan",
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">
          {label}
        </span>
        {hint ? <span className="text-[10px] text-slate-400">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

export default function CoreDetailsCard({ value, onChange }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-white">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">Core Scholarship Details</h3>
          <p className="text-[11px] text-slate-500 truncate">
            Public information shown to applicants
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-5">
        <Field label="Scholarship Name">
          <Input
            placeholder="e.g. Tata Merit-cum-Means Scholarship 2026"
            value={value.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </Field>

        <Field label="Description" hint={`${value.description.length}/500`}>
          <Textarea
            rows={4}
            maxLength={500}
            placeholder="Brief overview of the program, intent and target beneficiaries."
            value={value.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </Field>

        <Field label="Sponsor Name">
          <Select value={value.sponsor} onValueChange={(v) => onChange({ sponsor: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select sponsoring organisation" />
            </SelectTrigger>
            <SelectContent>
              {sponsors.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Application Opens">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="date"
                className="pl-9"
                value={value.openDate}
                onChange={(e) => onChange({ openDate: e.target.value })}
              />
            </div>
          </Field>
          <Field label="Application Closes">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="date"
                className="pl-9"
                value={value.closeDate}
                onChange={(e) => onChange({ closeDate: e.target.value })}
              />
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}
