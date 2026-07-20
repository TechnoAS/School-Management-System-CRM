import type { LucideIcon } from "lucide-react";
import {
  Users,
  CheckCircle2,
  UserPlus,
  AlertCircle,
  Wallet,
  BookOpen,
  Layers,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  GraduationCap,
  Clock,
  DollarSign,
  Activity,
  Star,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  CheckCircle2,
  UserPlus,
  AlertCircle,
  Wallet,
  BookOpen,
  Layers,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  GraduationCap,
  Clock,
  DollarSign,
  Activity,
  Star,
};

export const DASHBOARD_ICON_OPTIONS = [
  { name: "Users", label: "Users" },
  { name: "CheckCircle2", label: "Active" },
  { name: "UserPlus", label: "Admissions" },
  { name: "AlertCircle", label: "Alert" },
  { name: "Wallet", label: "Wallet" },
  { name: "BookOpen", label: "Courses" },
  { name: "Layers", label: "Batches" },
  { name: "Calendar", label: "Calendar" },
  { name: "TrendingUp", label: "Trend" },
  { name: "BarChart3", label: "Chart" },
  { name: "PieChart", label: "Pie" },
  { name: "GraduationCap", label: "Graduation" },
  { name: "Clock", label: "Clock" },
  { name: "DollarSign", label: "Revenue" },
  { name: "Activity", label: "Activity" },
  { name: "Star", label: "Star" },
] as const;

export function resolveDashboardIcon(name?: string): LucideIcon {
  return (name && ICON_MAP[name]) || Users;
}
