import Link from "next/link";
import { Bell, ChevronDown, Search } from "lucide-react";
import type { StudentProfile } from "@/lib/mockData";

interface TopNavProps {
  profile: StudentProfile;
}

const navItems = [
  { label: "Dashboard", href: "/student" },
  { label: "Scholarships", href: "/student/scholarships" },
  { label: "My Applications", href: "/student/applications" },
  { label: "Profile & Documents", href: "/student/profile" },
];

export function TopNav({ profile }: TopNavProps) {
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/student" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            TB
          </div>
          <span className="hidden text-base font-semibold tracking-tight sm:inline">
            TalentBridge
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search scholarships..."
              className="h-9 w-64 rounded-full border border-border bg-muted/40 pl-9 pr-4 text-sm outline-none ring-ring/40 transition focus:border-ring focus:bg-card focus:ring-2"
            />
          </div>

          <button
            type="button"
            className="relative grid h-9 w-9 place-items-center rounded-full bg-muted/60 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm font-medium transition hover:bg-accent"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </span>
            <span className="hidden sm:inline">{profile.name.split(" ")[0]}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
