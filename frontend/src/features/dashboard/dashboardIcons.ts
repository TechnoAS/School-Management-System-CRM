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
};

export function resolveDashboardIcon(name?: string): LucideIcon {
  return (name && ICON_MAP[name]) || Users;
}
