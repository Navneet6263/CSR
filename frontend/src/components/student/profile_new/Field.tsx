import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, hint, required, className, children }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

const baseInput =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/30";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(baseInput, props.className)} />;
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode },
) {
  return (
    <select
      {...props}
      className={cn(baseInput, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23999%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-9", props.className)}
    >
      {props.children}
    </select>
  );
}

export function TextareaInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[120px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/30",
        props.className,
      )}
    />
  );
}
