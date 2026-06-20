import { ElementType } from "react";
import { Card } from "@/components/shared/Card";

export function StatCard({ icon: Icon, label, value, sub, color, accentHex }: { icon: ElementType; label: string; value: string; sub?: string; color?: string; accentHex?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentHex ? "" : color ?? "bg-primary"}`}
          style={accentHex ? { background: accentHex } : undefined}
        >
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </Card>
  );
}

export default StatCard;
