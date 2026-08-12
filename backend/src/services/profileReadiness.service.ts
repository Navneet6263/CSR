function present(value: unknown) { return value !== null && value !== undefined && value !== ''; }
function all(profile: Record<string, unknown>, fields: string[]) { return fields.every((field) => present(profile[field])); }

export function profileReadiness(profile: Record<string, unknown>, documentCount = 0) {
  const sections = [
    { label: 'Personal details', complete: all(profile, ['Phone', 'DOB', 'Gender', 'Category', 'Address', 'City', 'State', 'Pincode'])
      && Boolean(profile.AadharCiphertext || profile.AadharNumber) },
    { label: 'Education', complete: all(profile, ['Course', 'InstitutionID', 'EnrollmentYear', 'PreviousYearMarks']) },
    { label: 'Family & income', complete: all(profile, ['AnnualFamilyIncome', 'FamilySize', 'FatherName', 'MotherName']) },
    { label: 'Bank details', complete: present(profile.BankName)
      && Boolean(profile.BankAccountCiphertext || profile.BankAccountNo)
      && Boolean(profile.BankIFSCCiphertext || profile.BankIFSC) },
    { label: 'Statement of purpose', complete: present(profile.StatementOfPurpose) },
    { label: 'Documents uploaded', complete: documentCount > 0 },
  ];
  return { completion: Math.round(sections.filter((item) => item.complete).length / sections.length * 100),
    sections, missing: sections.filter((item) => !item.complete).map((item) => item.label) };
}
