type Tile = { label: string; value: string; sub?: string; accent?: boolean; wide?: boolean };

const SECTIONS: { title: string; tiles: Tile[] }[] = [
  {
    title: "Scholarship",
    tiles: [
      { label: "Scholarship Name", value: "Merit-Need Grant", sub: "Cycle 2026 · Q1", wide: true },
      { label: "Scholarship Amount", value: "₹ 50,000", sub: "annual disbursement", accent: true },
    ],
  },
  {
    title: "Personal",
    tiles: [
      { label: "Student Name", value: "Ananya Sharma" },
      { label: "DOB", value: "12 Mar 2004" },
      { label: "Gender", value: "Female" },
      { label: "Category", value: "OBC" },
      { label: "Phone", value: "+91 98215 44012" },
      { label: "Email", value: "ananya.sharma@univ.ac.in", wide: true },
    ],
  },
  {
    title: "Address",
    tiles: [
      { label: "Full Address", value: "Plot 14, Sector 9, Kothrud", wide: true },
      { label: "City", value: "Pune" },
      { label: "State", value: "Maharashtra" },
      { label: "Pincode", value: "411045" },
    ],
  },
  {
    title: "Financials",
    tiles: [
      { label: "Annual Family Income", value: "₹ 1,80,000" },
      { label: "Family Size", value: "5" },
    ],
  },
  {
    title: "Academics",
    tiles: [
      { label: "College Name", value: "Fergusson College, Pune", wide: true },
      { label: "Course Name", value: "B.Sc. Computer Science" },
      { label: "Enrollment Year", value: "2022" },
      { label: "GPA", value: "8.6 / 10" },
    ],
  },
];

export default function ApplicantBento() {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div className="text-[10px] uppercase tracking-widest text-slate-400">Applicant Master Data</div>
        <div className="text-[10px] uppercase tracking-widest text-slate-400">Snapshot</div>
      </div>
      <div className="divide-y divide-slate-100">
        {SECTIONS.map((s) => (
          <div key={s.title} className="px-5 py-4">
            <div className="mb-3 text-[10px] uppercase tracking-widest text-slate-400">{s.title}</div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-100 bg-slate-100 sm:grid-cols-4">
              {s.tiles.map((t) => (
                <div
                  key={t.label}
                  className={`p-3 ${t.wide ? "col-span-2 sm:col-span-2" : ""} ${
                    t.accent ? "bg-slate-900 text-white" : "bg-white"
                  }`}
                >
                  <div
                    className={`text-[10px] uppercase tracking-widest ${
                      t.accent ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    {t.label}
                  </div>
                  <div
                    className={`mt-1 break-words text-sm font-semibold ${
                      t.accent ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {t.value}
                  </div>
                  {t.sub && (
                    <div className={`mt-0.5 text-[11px] ${t.accent ? "text-slate-400" : "text-slate-500"}`}>
                      {t.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
