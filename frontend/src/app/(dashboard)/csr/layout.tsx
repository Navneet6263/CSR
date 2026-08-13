import Header from "@/components/csr/Header";
import { ReactNode } from "react";

export default function CsrLayout({ children }: { children: ReactNode }) {
  return (
    <div className="csr-theme h-full">
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-emerald-50/40 text-slate-900">
        <Header />
        <main className="mx-auto max-w-7xl px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-pink-100 bg-white/60 py-6 text-center text-xs text-slate-500">
          © 2026 Shikshavritti Partner Portal
        </footer>
      </div>
    </div>
  );
}
