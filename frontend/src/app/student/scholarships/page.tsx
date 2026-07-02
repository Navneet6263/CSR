'use client';

import { useMemo, useState, useEffect } from "react";
import { ScholarshipCard } from "@/components/student/scholarships/ScholarshipCard";
import {
  ScholarshipFilters,
  type FilterState,
} from "@/components/student/scholarships/ScholarshipFilters";
import { studentApi, scholarshipApi } from "@/lib/api";
import { evaluateMatch, type Scholarship } from "@/lib/scholarships";

export default function ScholarshipsPage() {
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    category: "All",
    onlyMatched: true,
    sort: "match",
  });

  const [loading, setLoading] = useState(true);
  const [scholarshipsData, setScholarshipsData] = useState<Scholarship[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [profRes, scholRes] = await Promise.all([
          studentApi.getProfile().catch(() => ({ data: null })),
          scholarshipApi.getAll().catch(() => ({ data: [] }))
        ]);
        
        const p = profRes.data;
        // Build mock student profile for the evaluator
        const mappedProfile = {
          name: p?.fullName || "Student",
          classLevel: p?.currentSemesterOrYear?.includes("Sem") ? "UG" : "12",
          stream: p?.course === "B.Tech" ? "Engineering" : (p?.course || "Other"),
          category: p?.category || "General",
          annualIncome: p?.annualFamilyIncome || 500000,
          gender: p?.gender?.toLowerCase() || "male",
        };
        setStudentProfile(mappedProfile);

        // Map backend scholarships to the UI interface
        const rawSchols = scholRes.data?.scholarships || scholRes.data || [];
        const mappedSchols: Scholarship[] = Array.isArray(rawSchols) ? rawSchols.map((s: any) => ({
          id: (s.ScholarshipID || s.id || '').toString(),
          title: s.Name || s.name || "Unknown Scholarship",
          provider: s.SponsorName || s.provider || "TalentBridge Partner",
          amount: Number(s.PerStudentAmount || s.perStudentAmount) || 0,
          deadline: s.ApplicationCloseDate || s.applicationCloseDate || "2027-01-01",
          category: "Merit", // Default fallback
          classLevels: ["UG", "PG", "12", "10"],
          tags: ["Open"],
          description: s.Description || s.description || "A great scholarship opportunity.",
        })) : [];

        // fallback to zip mock data if API is empty
        if (mappedSchols.length > 0) {
          setScholarshipsData(mappedSchols);
        } else {
          // Import dynamic to avoid static require errors if not found
          import("@/lib/scholarships").then(m => setScholarshipsData(m.scholarships));
        }

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const evaluated = useMemo(
    () => {
      if (!studentProfile) return [];
      return scholarshipsData.map((s) => ({ s, match: evaluateMatch(s, studentProfile) }));
    },
    [scholarshipsData, studentProfile],
  );

  const matchedCount = evaluated.filter((e) => e.match.matched).length;

  const visible = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const list = evaluated.filter(({ s, match }) => {
      if (filters.onlyMatched && !match.matched) return false;
      if (filters.category !== "All" && s.category !== filters.category) return false;
      if (q) {
        const hay = `${s.title} ${s.provider} ${s.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (filters.sort === "amount") return b.s.amount - a.s.amount;
      if (filters.sort === "deadline")
        return new Date(a.s.deadline).getTime() - new Date(b.s.deadline).getTime();
      return b.match.score - a.match.score;
    });
    return list;
  }, [evaluated, filters]);

  if (loading) {
    return <div className="min-h-screen p-8 text-center text-muted-foreground">Loading scholarships...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          Scholarships matched to you
        </h1>
        <p className="text-sm text-muted-foreground">
          Personalised picks based on your class, stream, income, and category.
          Locked cards mean you don't meet the eligibility yet.
        </p>
      </header>

      <ScholarshipFilters
        value={filters}
        onChange={setFilters}
        totalCount={evaluated.length}
        matchedCount={matchedCount}
      />

      {visible.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No scholarships fit those filters. Try clearing the search or category.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ s, match }) => (
            <ScholarshipCard key={s.id} scholarship={s} match={match} />
          ))}
        </div>
      )}
    </main>
  );
}
