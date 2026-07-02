'use client';

import { Suspense, useMemo, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Save, ShieldCheck } from "lucide-react";
import { ProgressRing } from "@/components/student/profile/ProgressRing";
import { SectionNav } from "@/components/student/profile/SectionNav";
import { PersonalSection } from "@/components/student/profile/sections/PersonalSection";
import { FamilySection } from "@/components/student/profile/sections/FamilySection";
import { EducationSection } from "@/components/student/profile/sections/EducationSection";
import { BankSection } from "@/components/student/profile/sections/BankSection";
import { SopSection } from "@/components/student/profile/sections/SopSection";
import { DocumentsSection } from "@/components/student/profile/sections/DocumentsSection";
import { studentApi, authApi } from "@/lib/api";
import {
  INITIAL_FORM,
  SECTIONS,
  overallCompletion,
  type ProfileFormState,
  type SectionId,
} from "@/lib/profileForm";

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileFormState>(INITIAL_FORM);
  const [active, setActive] = useState<SectionId>("personal");
  const [userName, setUserName] = useState("Student");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = authApi.getUser();
    if (u) setUserName(u.fullName);

    studentApi.getProfile().then(res => {
      const data = res.data;
      if (data) {
        setForm(prev => ({
          ...prev,
          phone: data.phone || "",
          altPhone: data.alternatePhone || "",
          aadhaar: data.aadharNumber || "",
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : "",
          gender: data.gender?.toLowerCase() || "",
          category: data.category || "",
          curHouse: data.address || "",
          curCity: data.city || "",
          curState: data.state || "",
          curPincode: data.pincode || "",
          curMonths: String(data.currentAddressDurationMonths || ""),
          sameAddress: data.isPermanentSameAsCurrent || false,
          permHouse: data.permanentAddress || "",
          permCity: data.permanentCity || "",
          permState: data.permanentState || "",
          permPincode: data.permanentPincode || "",
          
          fatherName: data.fatherName || "",
          fatherOccupation: data.fatherOccupation || "",
          motherName: data.motherName || "",
          motherOccupation: data.motherOccupation || "",
          siblings: String(data.numberOfSiblings || "0"),
          familySize: String(data.familySize || ""),
          annualIncome: String(data.annualFamilyIncome || ""),
          religion: data.religion || "",
          disability: data.isDisabled ? "yes" : "no",
          disabilityPercent: String(data.disabilityPercentage || ""),
          domicileState: data.domicileState || "",
          domicileDistrict: data.domicileDistrict || "",
          casteCertNo: data.casteCertificateNumber || "",
          casteCertDate: data.casteCertificateIssueDate ? new Date(data.casteCertificateIssueDate).toISOString().split('T')[0] : "",
          domicileCertNo: data.domicileCertificateNumber || "",

          board10: data.tenthBoardName || "",
          year10: String(data.tenthPassingYear || ""),
          marks10: String(data.tenthMarks || ""),
          board12: data.twelfthBoardName || "",
          year12: String(data.twelfthPassingYear || ""),
          marks12: String(data.twelfthMarks || ""),
          college: String(data.institutionId || ""),
          course: data.course || "",
          semester: data.currentSemesterOrYear || "",
          regNo: data.admissionRegistrationNo || "",
          prevMarks: String(data.previousYearMarks || ""),
          accommodation: data.isHosteller ? "hostel" : "day_scholar",
          distanceKm: String(data.distanceFromHome || ""),
          gapYear: data.hasGapYear ? "yes" : "no",
          gapReason: data.gapYearExplanation || "",
          prevScholarship: data.receivedPreviousScholarship ? "yes" : "no",
          
          bankAccount: data.bankAccountNo || "",
          ifsc: data.bankIFSC || "",
          bankName: data.bankName || "",
          
          sop: data.statementOfPurpose || "",
        }));
      }
      setLoading(false);
    });
  }, []);

  const set = <K extends keyof ProfileFormState>(k: K, v: ProfileFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const overall = useMemo(() => overallCompletion(form), [form]);
  const idx = SECTIONS.findIndex((s) => s.id === active);
  const prev = SECTIONS[idx - 1];
  const next = SECTIONS[idx + 1];

  const handleSave = async () => {
    setSaving(true);
    try {
      await studentApi.updateProfile({
        phone: form.phone,
        alternatePhone: form.altPhone,
        aadharNumber: form.aadhaar,
        dob: form.dob ? new Date(form.dob).toISOString() : undefined,
        gender: form.gender,
        category: form.category,
        address: form.curHouse,
        city: form.curCity,
        state: form.curState,
        pincode: form.curPincode,
        currentAddressDurationMonths: form.curMonths ? parseInt(form.curMonths) : undefined,
        isPermanentSameAsCurrent: form.sameAddress,
        permanentAddress: form.permHouse,
        permanentCity: form.permCity,
        permanentState: form.permState,
        permanentPincode: form.permPincode,
        
        fatherName: form.fatherName,
        fatherOccupation: form.fatherOccupation,
        motherName: form.motherName,
        motherOccupation: form.motherOccupation,
        numberOfSiblings: parseInt(form.siblings) || 0,
        familySize: parseInt(form.familySize) || undefined,
        annualFamilyIncome: parseInt(form.annualIncome) || undefined,
        religion: form.religion,
        isDisabled: form.disability === "yes",
        disabilityPercentage: form.disabilityPercent ? parseInt(form.disabilityPercent) : undefined,
        domicileState: form.domicileState,
        domicileDistrict: form.domicileDistrict,
        casteCertificateNumber: form.casteCertNo,
        casteCertificateIssueDate: form.casteCertDate ? new Date(form.casteCertDate).toISOString() : undefined,
        domicileCertificateNumber: form.domicileCertNo,
        
        tenthBoardName: form.board10,
        tenthPassingYear: parseInt(form.year10) || undefined,
        tenthMarks: parseFloat(form.marks10) || undefined,
        twelfthBoardName: form.board12,
        twelfthPassingYear: parseInt(form.year12) || undefined,
        twelfthMarks: parseFloat(form.marks12) || undefined,
        institutionId: parseInt(form.college) || undefined,
        course: form.course,
        currentSemesterOrYear: form.semester,
        admissionRegistrationNo: form.regNo,
        previousYearMarks: parseFloat(form.prevMarks) || undefined,
        isHosteller: form.accommodation === "hostel",
        distanceFromHome: parseFloat(form.distanceKm) || undefined,
        hasGapYear: form.gapYear === "yes",
        gapYearExplanation: form.gapReason,
        receivedPreviousScholarship: form.prevScholarship === "yes",
        
        bankAccountNo: form.bankAccount,
        bankIFSC: form.ifsc,
        bankName: form.bankName,
        
        statementOfPurpose: form.sop,
      });
      alert("Draft saved successfully!");
    } catch (e) {
      alert("Error saving draft.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-muted" />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <ProfileHeader name={userName} overall={overall} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <SectionNav form={form} active={active} onSelect={setActive} />
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mb-1 inline h-4 w-4 text-success" /> Your data is encrypted &
            only shared with approved CSR partners.
          </div>
        </aside>

        <div className="space-y-6">
          <Suspense fallback={<div className="h-40 rounded-2xl bg-muted animate-pulse" />}>
            {active === "personal" && <PersonalSection form={form} set={set} />}
            {active === "family" && <FamilySection form={form} set={set} />}
            {active === "education" && <EducationSection form={form} set={set} />}
            {active === "bank" && <BankSection form={form} set={set} />}
            {active === "sop" && <SopSection form={form} set={set} />}
            {active === "documents" && <DocumentsSection form={form} set={set} />}
          </Suspense>

          <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={!prev}
              onClick={() => prev && setActive(prev.id)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold transition hover:bg-accent disabled:opacity-40 text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> {prev ? prev.title : "Back"}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold transition hover:bg-accent text-foreground"
              >
                {saving ? "Saving..." : <><Save className="h-4 w-4" /> Save draft</>}
              </button>
              <button
                type="button"
                disabled={!next}
                onClick={() => next && setActive(next.id)}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-40"
              >
                {next ? next.title : "Submit"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </main>
  );
}

function ProfileHeader({ name, overall }: { name: string; overall: number }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <section
      className="relative overflow-hidden rounded-2xl p-5 text-primary-foreground sm:p-7 shadow-[var(--shadow-glow)]"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-base font-bold backdrop-blur">
            {initials}
          </div>
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur">
              Profile completion
            </span>
            <h1 className="mt-1.5 truncate text-xl font-bold sm:text-2xl font-sans">
              Hi {name.split(" ")[0]}, you're {overall}% connected
            </h1>
            <p className="mt-1 max-w-md text-xs text-white/85 sm:text-sm">
              Finish the remaining sections to unlock all matched scholarships and faster CSR approvals.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <ProgressRing value={overall} />
        </div>
      </div>
    </section>
  );
}
