"use client";
import { GraduationCap } from "lucide-react";

const cols = [
  { title: "Quick Links", items: ["Home", "About Us", "How It Works", "FAQs", "Contact"] },
  { title: "Scholarships", items: ["Engineering", "Medical", "Arts", "ITI/Diploma", "Girls Education"] },
  { title: "Company Types", items: ["CSR Programs", "NGO Grants", "Govt Schemes", "Foundations", "Trusts"] },
  { title: "Contact", items: ["hello@talentbridge.in", "+91 80 4567 8900", "Bengaluru, India"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-base font-bold tracking-tight text-foreground">TalentBridge</span>
                <span className="text-[11px] font-medium text-muted-foreground">Empowering Every Student</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              India's dedicated CSR scholarship portal connecting deserving students with the country's most trusted corporate foundations.
            </p>
            <div className="mt-5 flex gap-2">
              {/* Social icons removed due to lucide-react version mismatch */}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold text-foreground">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.items.map((i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">{i}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© 2026 TalentBridge Foundation. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

