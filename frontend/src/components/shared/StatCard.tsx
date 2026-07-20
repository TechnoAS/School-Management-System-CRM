import { ElementType } from "react";
import { DashboardKpiCard } from "@/features/dashboard/dashboardVisuals";

export function StatCard({
  icon,
  label,
  value,
  sub,
  accentHex,
}: {
  icon: ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: string;
  accentHex?: string;
}) {
  return <DashboardKpiCard icon={icon} label={label} value={value} sub={sub} accentHex={accentHex} />;
}

export default StatCard;
