export type VisitStatus = "pending" | "completed" | "flagged";
export type Urgency = "high" | "medium" | "low";

export interface Visit {
  id: string;
  studentName: string;
  phone: string;
  altPhone: string;
  address: {
    house: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  annualIncome: number;
  college: string;
  course: string;
  enrollmentYear: number;
  isHosteller: boolean;
  urgency: Urgency;
  status: VisitStatus;
  assignedOn: string;
}

export const visits: Visit[] = [
  {
    id: "APP-24817",
    studentName: "Riya Sharma",
    phone: "+91 98230 11245",
    altPhone: "+91 98730 88112",
    address: {
      house: "H.No 42-B",
      street: "Ganeshpura Lane, Near Water Tank",
      city: "Nashik",
      state: "Maharashtra",
      pincode: "422003",
    },
    annualIncome: 148000,
    college: "K.T.H.M. College of Arts, Science & Commerce",
    course: "B.Sc Computer Science",
    enrollmentYear: 2024,
    isHosteller: false,
    urgency: "high",
    status: "pending",
    assignedOn: "2026-07-03",
  },
  {
    id: "APP-24822",
    studentName: "Arjun Meena",
    phone: "+91 91100 55221",
    altPhone: "+91 90045 11223",
    address: {
      house: "Plot 7",
      street: "Bhilwara Road, Sector 4",
      city: "Ajmer",
      state: "Rajasthan",
      pincode: "305001",
    },
    annualIncome: 92000,
    college: "Government Engineering College Ajmer",
    course: "B.Tech Mechanical",
    enrollmentYear: 2023,
    isHosteller: true,
    urgency: "medium",
    status: "pending",
    assignedOn: "2026-07-03",
  },
  {
    id: "APP-24805",
    studentName: "Fatima Khan",
    phone: "+91 90800 74412",
    altPhone: "+91 88991 22110",
    address: {
      house: "24/A",
      street: "Charminar East, Mughalpura",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500002",
    },
    annualIncome: 175000,
    college: "Osmania University Women's College",
    course: "BA Economics",
    enrollmentYear: 2024,
    isHosteller: false,
    urgency: "low",
    status: "completed",
    assignedOn: "2026-07-02",
  },
  {
    id: "APP-24790",
    studentName: "Suresh Patil",
    phone: "+91 99870 33221",
    altPhone: "+91 98812 66554",
    address: {
      house: "5",
      street: "Krishi Nagar, Ward 12",
      city: "Kolhapur",
      state: "Maharashtra",
      pincode: "416001",
    },
    annualIncome: 210000,
    college: "Shivaji University",
    course: "B.Com Honors",
    enrollmentYear: 2023,
    isHosteller: false,
    urgency: "medium",
    status: "flagged",
    assignedOn: "2026-07-01",
  },
];

export const dailyStats = {
  assigned: visits.length,
  completed: visits.filter((v) => v.status === "completed").length,
  pending: visits.filter((v) => v.status === "pending").length,
  flagged: visits.filter((v) => v.status === "flagged").length,
};

export const getVisit = (id: string) => visits.find((v) => v.id === id);
