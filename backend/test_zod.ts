import { updateStudentProfileSchema } from './src/validators/student.validator';

const payload = {
  dob: "2000-01-01", 
  gender: "Male", 
  category: "General",
  address: "some address", 
  city: "CityName", 
  state: "StateName", 
  pincode: "123456",
  course: "B.Tech", 
  institutionId: 1,
  otherInstitutionName: undefined,
  enrollmentYear: 2024,
  annualFamilyIncome: 100000,
  familySize: 4,
  bankAccountNo: "12345678", 
  bankIFSC: "1234567890", 
  bankName: "SBI"
};

const parsed = updateStudentProfileSchema.safeParse(payload);
if (!parsed.success) {
  console.error("Zod Error:", parsed.error.issues);
} else {
  console.log("Success:", parsed.data);
}
