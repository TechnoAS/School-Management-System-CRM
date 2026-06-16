import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  ClipboardCheck,
  Wallet,
  UserCog,
  FileText,
  Award,
  BarChart2,
  Bell,
  Settings,
} from "lucide-react";

export const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "batches", label: "Batches", icon: Layers },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "fees", label: "Fee Management", icon: Wallet },
  { id: "faculty", label: "Faculty", icon: UserCog },
  { id: "exams", label: "Exams", icon: FileText },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "reports", label: "Reports", icon: BarChart2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];
