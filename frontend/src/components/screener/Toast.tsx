"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  message: string;
  tone: "success" | "danger";
  onClose: () => void;
}

export function Toast({ message, tone, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed right-6 top-24 z-50 animate-in slide-in-from-right">
      <div className={`glass-card flex items-center gap-3 px-4 py-3 shadow-[var(--shadow-glow)] ${
        tone === "success" ? "border-success/30" : "border-danger/30"
      }`}>
        <div className={`grid h-8 w-8 place-items-center rounded-full ${
          tone === "success" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
        }`}>
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="text-sm font-medium text-text">{message}</div>
        <button onClick={onClose} className="ml-2 text-text-dim hover:text-text">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
