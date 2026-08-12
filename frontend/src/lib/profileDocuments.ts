export type DocKey =
  | 'aadhaar_card' | 'photo' | 'income_cert' | 'caste_cert' | 'domicile_cert'
  | 'marksheet_10' | 'marksheet_12' | 'bonafide' | 'passbook' | 'recommendation'
  | 'father_aadhaar' | 'mother_aadhaar' | 'father_payslip' | 'bank_statement';

export const DOC_LIST: { id: DocKey; name: string; hint: string; required: boolean }[] = [
  { id: 'aadhaar_card', name: 'Aadhaar Card', hint: 'Front + back, clear scan', required: true },
  { id: 'photo', name: 'Passport Photo', hint: 'Recent colour, white bg', required: true },
  { id: 'income_cert', name: 'Income Certificate', hint: 'BPL / Ration / ITR', required: true },
  { id: 'caste_cert', name: 'Caste Certificate', hint: 'SC / ST / OBC if applicable', required: false },
  { id: 'domicile_cert', name: 'Domicile Certificate', hint: 'State proof', required: true },
  { id: 'marksheet_10', name: '10th Marksheet', hint: 'Board issued', required: true },
  { id: 'marksheet_12', name: '12th Marksheet', hint: 'Board issued', required: true },
  { id: 'bonafide', name: 'Bonafide Certificate', hint: 'From current college', required: true },
  { id: 'passbook', name: 'Bank Passbook / Cheque', hint: 'Front page with IFSC', required: true },
  { id: 'recommendation', name: 'Recommendation Letter', hint: 'Principal / teacher', required: false },
  { id: 'father_aadhaar', name: "Father's Aadhaar", hint: 'Clear scan', required: true },
  { id: 'mother_aadhaar', name: "Mother's Aadhaar", hint: 'Clear scan', required: true },
  { id: 'father_payslip', name: "Father's Payslip", hint: 'If salaried', required: false },
  { id: 'bank_statement', name: '6 Months Bank Statement', hint: 'PDF from bank', required: false },
];
