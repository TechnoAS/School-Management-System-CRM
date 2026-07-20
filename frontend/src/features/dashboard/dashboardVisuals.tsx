import type { ReactNode, ElementType } from "react";
import type { TooltipProps } from "recharts";

export function chartGridStroke(): string {
  return "rgba(28, 30, 42, 0.06)";
}

type ShellProps = {
  title: string;
  subtitle?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DashboardWidgetShell({
  title,
  subtitle,
  headerExtra,
  children,
  className = "",
}: ShellProps) {
  return (
    <div className={`h-full rounded-xl border border-border bg-card shadow-sm ${className}`}>
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {headerExtra}
        </div>
        {children}
      </div>
    </div>
  );
}

type LegendItem = { label: string; color: string };

export function ChartLegendPills({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
        >
          <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function EmptyWidgetState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 19V5M4 19H20M8 15V11M12 15V7M16 15V9"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

type SliceLegendItem = { name: string; value: number; color: string };

export function SliceLegend({ items }: { items: SliceLegendItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="mt-4 space-y-2.5">
      {items.map(({ name, value, color }) => {
        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
        return (
          <div key={name}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/80" style={{ background: color }} />
                <span className="truncate">{name}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                {value}
                <span className="ml-1 font-normal text-muted-foreground">({pct}%)</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted/80">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DonutCenterLabel({ total, label }: { total: number; label: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{total}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

type DashboardTooltipProps = TooltipProps<number, string> & {
  valueFormatter?: (value: number) => string;
};

export function DashboardChartTooltip({ active, payload, label, valueFormatter }: DashboardTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border/80 bg-card/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md">
      {label && <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>}
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-foreground">
              {valueFormatter && typeof entry.value === "number"
                ? valueFormatter(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type KpiCardProps = {
  icon: ElementType;
  label: string;
  value: string;
  sub?: string;
  accentHex?: string;
};

export function DashboardKpiCard({ icon: Icon, label, value, sub, accentHex = "#1a3a5c" }: KpiCardProps) {
  return (
    <div className="h-full rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-none text-foreground tabular-nums">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: accentHex }}
        >
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

type ScheduleItemProps = {
  course: string;
  time: string;
  faculty: string;
  batch: string;
  status: string;
  badge: ReactNode;
};

export function ScheduleListItem({ course, time, faculty, batch, status, badge }: ScheduleItemProps) {
  const accent =
    status === "Ongoing" ? "#059669" : status === "Completed" ? "#3b82f6" : "#d97706";

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/25 p-3.5 transition-colors duration-200 hover:bg-muted/40"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{course}</p>
          {badge}
        </div>
        <p className="mt-1 text-xs font-medium text-foreground/80">{time}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {faculty} · {batch}
        </p>
      </div>
    </div>
  );
}
