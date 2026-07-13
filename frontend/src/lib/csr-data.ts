export type StudentFull = {
  id: string;
  fullName: string;
  dob: string;
  gender: string;
  category: string;
  aadhar: string;
  phone: string;
  email: string;
  altPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  fatherName: string;
  motherName: string;
  familySize: number;
  annualIncome: string;
  tenthBoard: string;
  tenthMarks: string;
  twelfthBoard: string;
  twelfthMarks: string;
  course: string;
  enrollmentYear: string;
  currentSemMarks: string;
  tuitionFee: string;
  docsStatus: "Verified";
  bgCheck: "Passed";
  meritScore: number;
  requestedAmount: string;
};

export const STUDENTS: StudentFull[] = [
  {
    id: "APP-1001", fullName: "Ananya Sharma", dob: "12 Aug 2004", gender: "Female", category: "OBC",
    aadhar: "4521-8890-1123", phone: "+91 98211 45678", email: "ananya.sharma@email.com", altPhone: "+91 98765 22110",
    address: "H.No 21, Gandhi Nagar, Sector 4", city: "Jaipur", state: "Rajasthan", pincode: "302015",
    fatherName: "Mr. Rakesh Sharma", motherName: "Mrs. Sunita Sharma", familySize: 5, annualIncome: "₹1,80,000",
    tenthBoard: "CBSE", tenthMarks: "92.4%", twelfthBoard: "RBSE", twelfthMarks: "89.6%",
    course: "B.Tech Computer Science", enrollmentYear: "2023", currentSemMarks: "8.7 CGPA", tuitionFee: "₹85,000",
    docsStatus: "Verified", bgCheck: "Passed", meritScore: 88, requestedAmount: "₹50,000",
  },
  {
    id: "APP-1002", fullName: "Rohan Verma", dob: "05 Mar 2003", gender: "Male", category: "SC",
    aadhar: "7712-4409-8821", phone: "+91 97045 21133", email: "rohan.verma@email.com", altPhone: "+91 91123 44890",
    address: "45B, Model Town, Phase II", city: "Ludhiana", state: "Punjab", pincode: "141002",
    fatherName: "Mr. Suresh Verma", motherName: "Mrs. Kamla Verma", familySize: 4, annualIncome: "₹1,20,000",
    tenthBoard: "PSEB", tenthMarks: "88.0%", twelfthBoard: "PSEB", twelfthMarks: "85.2%",
    course: "B.Com (Hons)", enrollmentYear: "2022", currentSemMarks: "8.1 CGPA", tuitionFee: "₹42,000",
    docsStatus: "Verified", bgCheck: "Passed", meritScore: 82, requestedAmount: "₹35,000",
  },
  {
    id: "APP-1003", fullName: "Priya Nair", dob: "22 Nov 2004", gender: "Female", category: "General",
    aadhar: "9982-1145-6672", phone: "+91 99887 33221", email: "priya.nair@email.com", altPhone: "+91 90000 12345",
    address: "Flat 12, Rose Villa, MG Road", city: "Kochi", state: "Kerala", pincode: "682016",
    fatherName: "Mr. Vinod Nair", motherName: "Mrs. Latha Nair", familySize: 4, annualIncome: "₹2,40,000",
    tenthBoard: "ICSE", tenthMarks: "94.8%", twelfthBoard: "ISC", twelfthMarks: "91.4%",
    course: "MBBS", enrollmentYear: "2023", currentSemMarks: "78%", tuitionFee: "₹1,20,000",
    docsStatus: "Verified", bgCheck: "Passed", meritScore: 91, requestedAmount: "₹75,000",
  },
  {
    id: "APP-1004", fullName: "Arjun Patel", dob: "17 Jun 2003", gender: "Male", category: "OBC",
    aadhar: "3345-7789-1102", phone: "+91 98333 12211", email: "arjun.patel@email.com", altPhone: "+91 97445 66332",
    address: "House 8, Satellite Road", city: "Ahmedabad", state: "Gujarat", pincode: "380015",
    fatherName: "Mr. Mahesh Patel", motherName: "Mrs. Nirmala Patel", familySize: 6, annualIncome: "₹2,10,000",
    tenthBoard: "GSEB", tenthMarks: "86.5%", twelfthBoard: "GSEB", twelfthMarks: "84.0%",
    course: "B.Sc Mathematics", enrollmentYear: "2022", currentSemMarks: "7.9 CGPA", tuitionFee: "₹38,000",
    docsStatus: "Verified", bgCheck: "Passed", meritScore: 79, requestedAmount: "₹30,000",
  },
  {
    id: "APP-1005", fullName: "Meera Reddy", dob: "30 Jan 2005", gender: "Female", category: "ST",
    aadhar: "5567-8890-3341", phone: "+91 96770 11223", email: "meera.reddy@email.com", altPhone: "+91 93221 55667",
    address: "12-4-A, Jubilee Hills", city: "Hyderabad", state: "Telangana", pincode: "500033",
    fatherName: "Mr. Ravi Reddy", motherName: "Mrs. Anjali Reddy", familySize: 5, annualIncome: "₹1,50,000",
    tenthBoard: "TSBIE", tenthMarks: "90.2%", twelfthBoard: "TSBIE", twelfthMarks: "87.8%",
    course: "B.Tech Electronics", enrollmentYear: "2023", currentSemMarks: "8.4 CGPA", tuitionFee: "₹78,000",
    docsStatus: "Verified", bgCheck: "Passed", meritScore: 85, requestedAmount: "₹55,000",
  },
];

export const findStudent = (id: string) => STUDENTS.find((s) => s.id === id);
