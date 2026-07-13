"use client";
import { ReactNode } from "react";
import { TopNav } from "@/components/finance/TopNav";
import { FinanceProvider } from "@/lib/store/finance-store";

export default function FinanceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="finance-theme h-full">
      <FinanceProvider>
        <div className="min-h-screen bg-navy-50/40 font-sans text-navy-900">
          <TopNav />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-navy-100 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-navy-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span>© 2026 TalentBridge · Finance &amp; Accounts</span>
              <span className="font-medium">RBI-compliant · ISO 27001 audited · Maker-Checker enforced</span>
            </div>
          </footer>
        </div>
      </FinanceProvider>
    </div>
  );
}

