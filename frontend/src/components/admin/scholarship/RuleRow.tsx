import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type RuleField =
  | "category"
  | "income"
  | "gpa"
  | "course"
  | "state"
  | "gender"
  | "age";

export type RuleOperator = "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "in" | "notin";

export type Rule = {
  id: string;
  field: RuleField;
  operator: RuleOperator;
  value: string;
};

export const FIELD_OPTIONS: { value: RuleField; label: string; kind: "num" | "list" | "text" }[] = [
  { value: "category", label: "Caste / Category", kind: "list" },
  { value: "income", label: "Annual Family Income", kind: "num" },
  { value: "gpa", label: "Minimum GPA", kind: "num" },
  { value: "course", label: "Course Enrolled", kind: "list" },
  { value: "state", label: "State / Zone", kind: "list" },
  { value: "gender", label: "Gender", kind: "list" },
  { value: "age", label: "Age", kind: "num" },
];

const OP_BY_KIND: Record<"num" | "list" | "text", { value: RuleOperator; label: string }[]> = {
  num: [
    { value: "lte", label: "≤ Less than or equal" },
    { value: "lt", label: "< Less than" },
    { value: "gte", label: "≥ Greater than or equal" },
    { value: "gt", label: "> Greater than" },
    { value: "eq", label: "= Equals" },
  ],
  list: [
    { value: "in", label: "MUST BE IN" },
    { value: "notin", label: "MUST NOT BE IN" },
    { value: "eq", label: "= Equals" },
  ],
  text: [
    { value: "eq", label: "= Equals" },
    { value: "neq", label: "≠ Not equals" },
  ],
};

export function fieldKind(f: RuleField) {
  return FIELD_OPTIONS.find((o) => o.value === f)?.kind ?? "text";
}

type Props = {
  rule: Rule;
  index: number;
  onChange: (patch: Partial<Rule>) => void;
  onRemove: () => void;
};

export default function RuleRow({ rule, index, onChange, onRemove }: Props) {
  const kind = fieldKind(rule.field);
  const ops = OP_BY_KIND[kind];
  const valuePlaceholder =
    kind === "list" ? "SC, ST, OBC" : kind === "num" ? "e.g. 200000" : "Enter value";

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 sm:p-4">
      <div className="flex items-center justify-between pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Rule {String(index + 1).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          aria-label="Delete rule"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-4">
          <Select
            value={rule.field}
            onValueChange={(v) => onChange({ field: v as RuleField, operator: OP_BY_KIND[fieldKind(v as RuleField)][0].value })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FIELD_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-4">
          <Select value={rule.operator} onValueChange={(v) => onChange({ operator: v as RuleOperator })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ops.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-4">
          <Input
            placeholder={valuePlaceholder}
            value={rule.value}
            onChange={(e) => onChange({ value: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
