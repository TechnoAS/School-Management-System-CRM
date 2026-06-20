import type {
  Student,
  Course,
  Batch,
  FacultyMember,
  Exam,
  Payment,
  Notif,
  Certificate,
  AttendanceRecord,
  ExamMarkRecord,
  InstituteSettings,
} from "@/types";

/** Offline demo seed data — used only when VITE_API_ENABLED=false */
export const INIT_STUDENTS: Student[] = [
  { id: "STU-001", name: "Arjun Sharma",  phone: "9876543210", email: "arjun@email.com",  course: "Full Stack Web Dev",  batch: "Batch A – Morning",   guardian: "Ramesh Sharma", guardianPhone: "9876543200", address: "123, MG Road, Bangalore",      admissionDate: "2024-01-15", feesTotal: 25000, feesPaid: 20000, status: "Active",    dob: "2000-05-12", grade: "A"  },
  { id: "STU-002", name: "Priya Patel",   phone: "9876543211", email: "priya@email.com",  course: "Digital Marketing",   batch: "Batch B – Evening",   guardian: "Suresh Patel",  guardianPhone: "9876543201", address: "45, Ring Road, Ahmedabad",     admissionDate: "2024-02-01", feesTotal: 18000, feesPaid: 18000, status: "Active",    dob: "2001-03-22", grade: "A+" },
  { id: "STU-003", name: "Rohit Kumar",   phone: "9876543212", email: "rohit@email.com",  course: "Data Science & ML",   batch: "Batch C – Weekend",   guardian: "Vikram Kumar",  guardianPhone: "9876543202", address: "78, Civil Lines, Delhi",       admissionDate: "2024-02-10", feesTotal: 35000, feesPaid: 17500, status: "Active",    dob: "1999-11-08", grade: "B"  },
  { id: "STU-004", name: "Sneha Gupta",   phone: "9876543213", email: "sneha@email.com",  course: "Graphic Design",      batch: "Batch A – Morning",   guardian: "Anil Gupta",    guardianPhone: "9876543203", address: "22, Park Street, Kolkata",     admissionDate: "2024-01-20", feesTotal: 20000, feesPaid: 20000, status: "Active",    dob: "2002-07-15", grade: "A"  },
  { id: "STU-005", name: "Mohammed Ali",  phone: "9876543214", email: "mali@email.com",   course: "Tally & Accounting",  batch: "Batch D – Afternoon", guardian: "Ahmed Ali",     guardianPhone: "9876543204", address: "56, Banjara Hills, Hyderabad", admissionDate: "2024-03-01", feesTotal: 12000, feesPaid: 6000,  status: "Active",    dob: "2001-09-30", grade: "C"  },
  { id: "STU-006", name: "Kavya Reddy",   phone: "9876543215", email: "kavya@email.com",  course: "Full Stack Web Dev",  batch: "Batch A – Morning",   guardian: "Ravi Reddy",    guardianPhone: "9876543205", address: "89, Jubilee Hills, Hyderabad", admissionDate: "2024-03-05", feesTotal: 25000, feesPaid: 12500, status: "Active",    dob: "2000-12-01", grade: "A+" },
  { id: "STU-007", name: "Aditya Singh",  phone: "9876543216", email: "aditya@email.com", course: "Data Science & ML",   batch: "Batch C – Weekend",   guardian: "Rajesh Singh",  guardianPhone: "9876543206", address: "34, Gomti Nagar, Lucknow",     admissionDate: "2024-01-08", feesTotal: 35000, feesPaid: 35000, status: "Completed", dob: "1998-04-18", grade: "A"  },
  { id: "STU-008", name: "Meera Nair",    phone: "9876543217", email: "meera@email.com",  course: "Digital Marketing",   batch: "Batch B – Evening",   guardian: "Suresh Nair",   guardianPhone: "9876543207", address: "12, MG Road, Kochi",           admissionDate: "2024-03-10", feesTotal: 18000, feesPaid: 9000,  status: "Active",    dob: "2001-06-25", grade: "B"  },
  { id: "STU-009", name: "Rahul Verma",   phone: "9876543218", email: "rahul@email.com",  course: "Graphic Design",      batch: "Batch A – Morning",   guardian: "Manoj Verma",   guardianPhone: "9876543208", address: "67, Sector 22, Chandigarh",    admissionDate: "2024-02-20", feesTotal: 20000, feesPaid: 10000, status: "Active",    dob: "2000-08-14", grade: "B+" },
  { id: "STU-010", name: "Anita Sharma",  phone: "9876543219", email: "anita@email.com",  course: "Tally & Accounting",  batch: "Batch D – Afternoon", guardian: "Mohan Sharma",  guardianPhone: "9876543209", address: "90, Ashok Nagar, Bhopal",      admissionDate: "2024-03-12", feesTotal: 12000, feesPaid: 12000, status: "Active",    dob: "2002-01-10", grade: "A"  },
];

export const INIT_COURSES: Course[] = [
  { id: "CRS-001", name: "Full Stack Web Development", duration: "6 Months", fees: 25000, description: "Complete web development with HTML, CSS, JavaScript, React, Node.js, and MongoDB.", status: "Active",   batches: 2, enrolled: 45 },
  { id: "CRS-002", name: "Digital Marketing",          duration: "3 Months", fees: 18000, description: "SEO, Social Media Marketing, Google Ads, Content Marketing, and Analytics.",          status: "Active",   batches: 2, enrolled: 32 },
  { id: "CRS-003", name: "Data Science & ML",          duration: "9 Months", fees: 35000, description: "Python, Statistics, Machine Learning, Deep Learning, and Data Visualization.",         status: "Active",   batches: 1, enrolled: 28 },
  { id: "CRS-004", name: "Graphic Design",             duration: "4 Months", fees: 20000, description: "Adobe Photoshop, Illustrator, InDesign, UI/UX fundamentals and brand identity.",       status: "Active",   batches: 1, enrolled: 20 },
  { id: "CRS-005", name: "Tally & Accounting",         duration: "2 Months", fees: 12000, description: "Tally ERP 9, GST filing, accounting principles, and financial reporting.",             status: "Inactive", batches: 1, enrolled: 15 },
];

export const INIT_BATCHES: Batch[] = [
  { id: "BAT-001", course: "Full Stack Web Dev",  name: "Batch A – Morning",   timing: "Mon–Sat  9:00 AM – 12:00 PM", faculty: "Rahul Mehta",  students: 22, status: "Ongoing",  startDate: "2024-01-15", endDate: "2024-07-15" },
  { id: "BAT-002", course: "Full Stack Web Dev",  name: "Batch E – Evening",   timing: "Mon–Fri  5:00 PM – 8:00 PM",  faculty: "Rahul Mehta",  students: 18, status: "Upcoming", startDate: "2024-04-01", endDate: "2024-10-01" },
  { id: "BAT-003", course: "Digital Marketing",   name: "Batch B – Evening",   timing: "Mon–Fri  6:00 PM – 8:00 PM",  faculty: "Priya Nair",   students: 20, status: "Ongoing",  startDate: "2024-02-01", endDate: "2024-05-01" },
  { id: "BAT-004", course: "Digital Marketing",   name: "Batch F – Morning",   timing: "Mon–Sat 10:00 AM – 12:00 PM", faculty: "Priya Nair",   students: 12, status: "Upcoming", startDate: "2024-04-15", endDate: "2024-07-15" },
  { id: "BAT-005", course: "Data Science & ML",   name: "Batch C – Weekend",   timing: "Sat–Sun 10:00 AM – 4:00 PM",  faculty: "Suresh Kumar", students: 25, status: "Ongoing",  startDate: "2024-01-20", endDate: "2024-10-20" },
  { id: "BAT-006", course: "Tally & Accounting",  name: "Batch D – Afternoon", timing: "Mon–Sat  2:00 PM – 4:00 PM",  faculty: "Anita Joshi",  students: 15, status: "Ongoing",  startDate: "2024-03-01", endDate: "2024-05-01" },
];

export const INIT_FACULTY: FacultyMember[] = [
  { id: "FAC-001", name: "Rahul Mehta",  subject: "Full Stack Web Development", phone: "9845012345", email: "rahul.mehta@techacademy.com",  salary: 45000, attendance: 94, experience: "5 Years", qualification: "B.Tech CSE"      },
  { id: "FAC-002", name: "Priya Nair",   subject: "Digital Marketing",          phone: "9845012346", email: "priya.nair@techacademy.com",   salary: 38000, attendance: 97, experience: "4 Years", qualification: "MBA Marketing"   },
  { id: "FAC-003", name: "Suresh Kumar", subject: "Data Science & ML",          phone: "9845012347", email: "suresh.kumar@techacademy.com", salary: 55000, attendance: 91, experience: "7 Years", qualification: "M.Sc Statistics" },
  { id: "FAC-004", name: "Anita Joshi",  subject: "Tally & Accounting",         phone: "9845012348", email: "anita.joshi@techacademy.com",  salary: 32000, attendance: 98, experience: "6 Years", qualification: "CA Inter"        },
  { id: "FAC-005", name: "Vikram Desai", subject: "Graphic Design",             phone: "9845012349", email: "vikram.desai@techacademy.com", salary: 35000, attendance: 89, experience: "3 Years", qualification: "B.Des"           },
];

export const INIT_EXAMS: Exam[] = [
  { id: "EXM-001", title: "Module 1 Assessment",    course: "Full Stack Web Dev", batch: "Batch A", date: "2024-02-10", max: 100, status: "Completed" },
  { id: "EXM-002", title: "Module 2 Mid-Term",       course: "Full Stack Web Dev", batch: "Batch A", date: "2024-03-05", max: 100, status: "Completed" },
  { id: "EXM-003", title: "Module 3 Project Review", course: "Full Stack Web Dev", batch: "Batch A", date: "2024-03-20", max: 100, status: "Upcoming"  },
  { id: "EXM-004", title: "Final Examination",       course: "Digital Marketing",  batch: "Batch B", date: "2024-04-15", max: 150, status: "Upcoming"  },
  { id: "EXM-005", title: "Practical Assessment",    course: "Data Science & ML",  batch: "Batch C", date: "2024-03-18", max: 100, status: "Completed" },
];

export const INIT_PAYMENTS: Payment[] = [
  { receipt: "RCP-2024-0892", student: "Arjun Sharma", studentId: "STU-001", amount: 5000,  mode: "UPI",          date: "2024-03-10" },
  { receipt: "RCP-2024-0891", student: "Priya Patel",  studentId: "STU-002", amount: 18000, mode: "Bank Transfer", date: "2024-03-08" },
  { receipt: "RCP-2024-0890", student: "Kavya Reddy",  studentId: "STU-006", amount: 6250,  mode: "Cash",         date: "2024-03-05" },
  { receipt: "RCP-2024-0889", student: "Meera Nair",   studentId: "STU-008", amount: 9000,  mode: "UPI",          date: "2024-03-03" },
  { receipt: "RCP-2024-0888", student: "Anita Sharma", studentId: "STU-010", amount: 12000, mode: "Cheque",       date: "2024-03-01" },
  { receipt: "RCP-2024-0887", student: "Rohit Kumar",  studentId: "STU-003", amount: 8750,  mode: "UPI",          date: "2024-02-28" },
];

export const ATTENDANCE_RECORDS = [
  { student: "Arjun Sharma", id: "STU-001", present: 22, absent: 2, total: 24 },
  { student: "Priya Patel",  id: "STU-002", present: 24, absent: 0, total: 24 },
  { student: "Rohit Kumar",  id: "STU-003", present: 20, absent: 4, total: 24 },
  { student: "Sneha Gupta",  id: "STU-004", present: 23, absent: 1, total: 24 },
  { student: "Mohammed Ali", id: "STU-005", present: 18, absent: 6, total: 24 },
  { student: "Kavya Reddy",  id: "STU-006", present: 21, absent: 3, total: 24 },
];

export const ENROLLMENT_DATA = [
  { month: "Sep", students: 28 }, { month: "Oct", students: 35 }, { month: "Nov", students: 32 },
  { month: "Dec", students: 20 }, { month: "Jan", students: 45 }, { month: "Feb", students: 52 },
  { month: "Mar", students: 48 },
];

export const FEE_DATA = [
  { month: "Sep", collected: 285000, due: 45000 }, { month: "Oct", collected: 320000, due: 52000 },
  { month: "Nov", collected: 298000, due: 38000 }, { month: "Dec", collected: 180000, due: 62000 },
  { month: "Jan", collected: 415000, due: 48000 }, { month: "Feb", collected: 468000, due: 35000 },
  { month: "Mar", collected: 392000, due: 71000 },
];

export const COURSE_PIE = [
  { name: "Full Stack",     value: 45, color: "#1a3a5c" },
  { name: "Digital Mktg",  value: 32, color: "#c87d1a" },
  { name: "Data Science",  value: 28, color: "#2d6a4f" },
  { name: "Graphic Design",value: 20, color: "#7c3d8f" },
  { name: "Tally",         value: 15, color: "#c0392b" },
];

export const TODAY_CLASSES = [
  { batch: "Batch A – Morning",   course: "Full Stack Web Dev", faculty: "Rahul Mehta",  time: "9:00 AM – 12:00 PM",  room: "Lab 1",  status: "Ongoing"   },
  { batch: "Batch B – Evening",   course: "Digital Marketing",  faculty: "Priya Nair",   time: "10:00 AM – 12:00 PM", room: "Room 2", status: "Completed" },
  { batch: "Batch C – Weekend",   course: "Data Science & ML",  faculty: "Suresh Kumar", time: "10:00 AM – 4:00 PM",  room: "Lab 2",  status: "Upcoming"  },
  { batch: "Batch D – Afternoon", course: "Tally & Accounting", faculty: "Anita Joshi",  time: "2:00 PM – 4:00 PM",   room: "Room 1", status: "Upcoming"  },
];

export const INIT_NOTIFS: Notif[] = [
  { id: 1, type: "fee",        title: "Fee Due Reminder",        message: "5 students have fees due this week. Total outstanding: ₹42,500",              time: "10 mins ago", read: false },
  { id: 2, type: "admission",  title: "New Admission Confirmed", message: "Aditya Singh enrolled in Data Science — Batch C starting April 1st",          time: "1 hour ago",  read: false },
  { id: 3, type: "completion", title: "Course Completion",       message: "Batch C – Data Science weekend batch completed. 25 students cleared.",         time: "2 hours ago", read: true  },
  { id: 4, type: "exam",       title: "Exam Results Published",  message: "Full Stack Web Dev – Module 3 results are now available for review",           time: "Yesterday",   read: true  },
  { id: 5, type: "fee",        title: "Fee Due Reminder",        message: "Mohammed Ali has an outstanding balance of ₹6,000 (overdue 15 days)",          time: "Yesterday",   read: true  },
  { id: 6, type: "admission",  title: "Admission Enquiry",       message: "New enquiry received for Digital Marketing course from Vikram Shah",           time: "2 days ago",  read: true  },
];

export const INIT_CERTIFICATES: Certificate[] = [
  {
    certNo: "CERT-2024-001",
    studentId: "STU-007",
    studentName: "Aditya Singh",
    course: "Data Science & ML",
    issueDate: "2024-03-10",
    grade: "A",
    authorisedBy: "Director, TechAcademy",
  },
  {
    certNo: "CERT-2024-002",
    studentId: "STU-002",
    studentName: "Priya Patel",
    course: "Digital Marketing",
    issueDate: "2024-03-12",
    grade: "A+",
    authorisedBy: "Director, TechAcademy",
  },
  {
    certNo: "CERT-2024-003",
    studentId: "STU-010",
    studentName: "Anita Sharma",
    course: "Tally & Accounting",
    issueDate: "2024-03-14",
    grade: "A",
    authorisedBy: "Director, TechAcademy",
  },
];

export const INIT_EXAM_MARKS: ExamMarkRecord[] = [
  { examId: "EXM-001", studentId: "STU-001", studentName: "Arjun Sharma", marks: 85, grade: "A" },
  { examId: "EXM-002", studentId: "STU-001", studentName: "Arjun Sharma", marks: 78, grade: "A" },
  { examId: "EXM-008", studentId: "STU-001", studentName: "Arjun Sharma", marks: 92, grade: "A+" },
  { examId: "EXM-001", studentId: "STU-006", studentName: "Kavya Reddy", marks: 90, grade: "A+" },
  { examId: "EXM-002", studentId: "STU-006", studentName: "Kavya Reddy", marks: 88, grade: "A" },
  { examId: "EXM-008", studentId: "STU-006", studentName: "Kavya Reddy", marks: 94, grade: "A+" },
  { examId: "EXM-006", studentId: "STU-004", studentName: "Sneha Gupta", marks: 80, grade: "A" },
  { examId: "EXM-005", studentId: "STU-003", studentName: "Rohit Kumar", marks: 72, grade: "B" },
  { examId: "EXM-004", studentId: "STU-008", studentName: "Meera Nair", marks: 78, grade: "B+" },
  { examId: "EXM-007", studentId: "STU-005", studentName: "Mohammed Ali", marks: 55, grade: "C" },
];

/** Daily attendance sessions — empty until marked; monthly summary uses ATTENDANCE_RECORDS until Phase 3 */
export const INIT_ATTENDANCE_RECORDS: AttendanceRecord[] = [];

export const INIT_INSTITUTE_SETTINGS: InstituteSettings = {
  name: "TechAcademy Institute of Technology",
  phone: "+91-9876540000",
  email: "info@techacademy.com",
  address: "123, Tech Park, Whitefield, Bangalore – 560001",
  registrationNo: "REG-KA-2019-004821",
  academicYear: "2024-25",
  logoUrl: "",
  receipt: {
    prefix: "RCP-2024-",
    startingNumber: "0001",
    footerText: "Thank you for choosing TechAcademy. Fees once paid are non-refundable.",
    showLogo: "Yes",
    printFormat: "A4",
  },
  certificate: {
    prefix: "CERT-2024-",
    authorisedBy: "Director, TechAcademy",
    bodyText:
      "This is to certify that [Student Name] has successfully completed the [Course Name] program with distinction.",
  },
};

/** @deprecated Use INIT_EXAM_MARKS — kept for imports during transition */
export const EXAM_RESULTS_INIT = INIT_EXAM_MARKS.map((r) => ({
  student: r.studentName,
  id: r.studentId,
  marks: r.marks,
  grade: r.grade,
}));
