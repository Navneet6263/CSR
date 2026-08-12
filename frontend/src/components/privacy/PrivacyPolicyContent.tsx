import { ExternalLink, ShieldCheck } from 'lucide-react';

const collected = [
  ['Identity & contact', 'Name, date of birth, email, mobile number and address/domicile'],
  ['Eligibility', 'Gender, category/caste, family income, institution, course and academic records'],
  ['Optional sensitive data', 'Aadhaar, bank account, PAN and supporting financial documents'],
  ['Security activity', 'Login/access logs, IP address and document-verification events'],
];
const uses = [
  ['Eligibility assessment', 'Evaluate scholarship rules and application evidence'],
  ['Verification', 'Verify identity, education, income, domicile and category where applicable'],
  ['Disbursement', 'Process an approved award through authorized finance controls'],
  ['Communication & compliance', 'Provide status updates, handle grievances and meet audit obligations'],
];
const rights = ['Access a copy of personal data', 'Correct inaccurate or incomplete information', 'Request portable data',
  'Restrict processing while accuracy is disputed', 'Request erasure where legally permitted', 'Raise a grievance or appeal a verification finding'];

export default function PrivacyPolicyContent({ compact = false }: { compact?: boolean }) {
  return <article className={`text-slate-700 ${compact ? 'space-y-6 text-xs' : 'space-y-10 text-sm'}`}>
    <header className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex items-center gap-2 text-emerald-800"><ShieldCheck size={20} /><strong>User Agreement &amp; Privacy Policy</strong></div>
      <p className="mt-2 leading-6">CSR Scholarship Portal · Version 1.0 · Effective January 2024. This online policy is the version presented for portal consent.</p>
      {!compact && <a href="mailto:privacy@shikshavritti.org" className="mt-3 inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 font-semibold"><ExternalLink size={14} />Privacy contact</a>}
    </header>

    <Section title="1. Scope and standards"><p>This policy governs personal data collected for scholarship eligibility, verification, beneficiary management and fund disbursement. It covers students, parents or guardians, authorized staff, verification agencies and public visitors.</p><p>It states alignment with the DPDP Act 2023, GDPR 2016/679, ISO/IEC 27001:2022 and ISO/IEC 27701:2019.</p></Section>
    <Section title="2. Data collected"><Grid rows={collected} /><p>Sensitive information receives restricted access and enhanced safeguards. The policy states that Aadhaar is optional, tokenized and not stored in plaintext, while bank and financial details are encrypted and masked in portal views.</p></Section>
    <Section title="3. How data is used"><Grid rows={uses} /><p>Personal data is not sold and is not shared with advertisers, marketing firms, social-media platforms or unauthorized organizations.</p></Section>
    <Section title="4. Consent and your rights"><p>Registration requires a clear, unticked consent. Separate or fresh consent may be required for sensitive data or a new processing purpose.</p><ul className="grid gap-2 sm:grid-cols-2">{rights.map((right) => <li key={right} className="rounded-lg bg-slate-50 px-3 py-2">✓ {right}</li>)}</ul><p>Requests are acknowledged within 24 hours and are normally fulfilled within 30 days; complex matters may take longer as permitted by law.</p></Section>
    <Section title="5. Sharing and verification"><p>Data may be shared only where necessary with contracted verification agencies, banks or financial institutions, CSR administration teams, cloud infrastructure providers, government bodies or lawful authorities. The policy requires confidentiality, limited access, audit controls and processor agreements.</p><p>A verification agency may check education, income, domicile and category evidence and may conduct field verification. Users may ask which agency is involved, request the report, correct inaccurate findings and appeal within 30 days.</p></Section>
    <Section title="6. Security and retention"><p>The policy describes TLS in transit, encryption at rest, role-based access, masking, audit logs, monitoring, backups, vulnerability management and secure disposal. Retention varies by record: access logs 12 months; support records 24 months after resolution; application and verification records generally 5 years; disbursement records 7 years. Approved scholarship records are listed as lifetime records in the supplied document.</p></Section>
    <Section title="7. Incident and grievance"><p>Suspected incidents are contained, sessions or tokens revoked where required, evidence preserved and notifications handled according to applicable law. Report privacy, grievance or security concerns to <a className="font-semibold text-emerald-700 underline" href="mailto:privacy@shikshavritti.org">privacy@shikshavritti.org</a>.</p></Section>
    <Section title="8. User agreement" id="terms"><p>Users must keep passwords private, provide accurate information, use one account per person and report suspected unauthorized access. Fraudulent documents, impersonation, unauthorized access, disruption and illegal activity are prohibited.</p><p>A scholarship may be cancelled for fraud, loss of eligibility, insufficient academic progress, misconduct or breach of the agreement. Continued portal use constitutes acceptance of published policy amendments after applicable notice.</p></Section>
    <footer className="rounded-xl border bg-slate-50 p-4 text-xs leading-5 text-slate-600">This Version 1.0 policy covers the portal consent, privacy rights, processing purposes, safeguards, retention, verification, grievance process and user responsibilities.</footer>
  </article>;
}

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return <section id={id} className="space-y-3"><h2 className="text-lg font-bold text-slate-950">{title}</h2><div className="space-y-3 leading-6">{children}</div></section>;
}
function Grid({ rows }: { rows: string[][] }) {
  return <div className="grid gap-2 sm:grid-cols-2">{rows.map(([title, detail]) => <div key={title} className="rounded-xl border bg-white p-3"><p className="font-semibold text-slate-900">{title}</p><p className="mt-1 text-slate-600">{detail}</p></div>)}</div>;
}
