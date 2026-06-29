import { Plus, Sparkles, ShieldCheck } from "lucide-react";
import RuleRow, { type Rule, FIELD_OPTIONS, fieldKind } from "./RuleRow";

type Props = {
  rules: Rule[];
  onChange: (rules: Rule[]) => void;
};

const OP_LABEL: Record<string, string> = {
  eq: "EQUALS",
  neq: "NOT EQUALS",
  lt: "LESS THAN",
  lte: "LESS THAN OR EQUAL TO",
  gt: "GREATER THAN",
  gte: "GREATER THAN OR EQUAL TO",
  in: "MUST BE IN",
  notin: "MUST NOT BE IN",
};

function fieldLabel(f: string) {
  return FIELD_OPTIONS.find((o) => o.value === f)?.label ?? f;
}

function previewValue(r: Rule) {
  const k = fieldKind(r.field);
  if (!r.value) return "—";
  if (k === "list") return `[${r.value}]`;
  if (r.field === "income") return `₹ ${Number(r.value).toLocaleString("en-IN")}`;
  return r.value;
}

export default function RuleBuilder({ rules, onChange }: Props) {
  const add = () => {
    onChange([
      ...rules,
      {
        id: crypto.randomUUID(),
        field: "income",
        operator: "lte",
        value: "",
      },
    ]);
  };
  const update = (id: string, patch: Partial<Rule>) =>
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => onChange(rules.filter((r) => r.id !== id));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Eligibility Rules Engine</h3>
            <p className="text-[11px] text-slate-500 truncate">
              Applicants must satisfy ALL rules to qualify
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Rule
        </button>
      </div>

      {/* Preview strip */}
      {rules.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
          <div className="flex items-center gap-1.5 pb-2">
            <Sparkles className="h-3 w-3 text-slate-500" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Live Preview
            </span>
          </div>
          <ul className="space-y-1.5">
            {rules.map((r, i) => (
              <li key={r.id} className="text-[12px] text-slate-700 leading-relaxed">
                <span className="font-mono text-slate-400 mr-2">{String(i + 1).padStart(2, "0")}.</span>
                <span className="font-medium text-slate-900">{fieldLabel(r.field)}</span>{" "}
                <span className="text-slate-500">{OP_LABEL[r.operator]}</span>{" "}
                <span className="font-medium text-slate-900">{previewValue(r)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {rules.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <p className="text-sm text-slate-500">No rules yet — click "Add Rule" to begin.</p>
          </div>
        )}
        {rules.map((r, i) => (
          <RuleRow
            key={r.id}
            rule={r}
            index={i}
            onChange={(patch) => update(r.id, patch)}
            onRemove={() => remove(r.id)}
          />
        ))}
      </div>
    </div>
  );
}
