import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, StatusBadge as Badge } from "@/components/shared";
import { FMT } from "@/lib/utils";
import { ensureWidgetColors } from "@/lib/dashboardWidgetConfig";
import type { DashboardWidget as WidgetConfig } from "@/types/pageLayout";
import { resolveDashboardIcon } from "./dashboardIcons";
import { resolveKpiValue, type DashboardWidgetData } from "./dashboardWidgetData";
import {
  ChartLegendPills,
  DashboardChartTooltip,
  DashboardKpiCard,
  DashboardWidgetShell,
  DonutCenterLabel,
  EmptyWidgetState,
  ScheduleListItem,
  SliceLegend,
  chartGridStroke,
} from "./dashboardVisuals";

type Props = {
  widget: WidgetConfig;
  data: DashboardWidgetData;
};

const axisTick = { fontSize: 11, fill: "var(--muted-foreground)" };

export function DashboardWidget({ widget, data }: Props) {
  const colors = ensureWidgetColors(widget);
  const title = widget.title;
  const subtitle = widget.subtitle;
  const primary = colors[0];

  if (widget.type === "stat") {
    const Icon = resolveDashboardIcon(widget.icon);
    const kpi = resolveKpiValue(widget.dataSource, data);
    return (
      <DashboardKpiCard
        icon={Icon}
        label={title}
        value={kpi.value}
        sub={subtitle ?? kpi.sub}
        accentHex={primary}
      />
    );
  }

  if (widget.dataSource === "enrollment-trend") {
    if (widget.type === "line") {
      return (
        <DashboardWidgetShell title={title} subtitle={subtitle}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.enrollmentData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={chartGridStroke()} vertical={false} />
              <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<DashboardChartTooltip />} />
              <Line
                isAnimationActive={false}
                type="monotone"
                dataKey="students"
                stroke={primary}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                name="Students"
              />
            </LineChart>
          </ResponsiveContainer>
        </DashboardWidgetShell>
      );
    }

    if (widget.type === "area") {
      return (
        <DashboardWidgetShell title={title} subtitle={subtitle}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.enrollmentData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={chartGridStroke()} vertical={false} />
              <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<DashboardChartTooltip />} />
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="students"
                stroke={primary}
                strokeWidth={2}
                fill={primary}
                fillOpacity={0.12}
                name="Students"
              />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardWidgetShell>
      );
    }

    if (widget.type === "bar") {
      return (
        <DashboardWidgetShell title={title} subtitle={subtitle}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.enrollmentData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={chartGridStroke()} vertical={false} />
              <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<DashboardChartTooltip />} />
              <Bar
                isAnimationActive={false}
                dataKey="students"
                fill={primary}
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
                name="Students"
              />
            </BarChart>
          </ResponsiveContainer>
        </DashboardWidgetShell>
      );
    }
  }

  if (widget.dataSource === "fee-trend" && (widget.type === "bar" || widget.type === "area" || widget.type === "line")) {
    const Chart = widget.type === "area" ? AreaChart : widget.type === "line" ? LineChart : BarChart;
    const dueColor = colors[1] ?? "#c0392b";

    return (
      <DashboardWidgetShell
        title={title}
        subtitle={subtitle}
        headerExtra={
          <ChartLegendPills
            items={[
              { label: "Collected", color: primary },
              { label: "Due", color: dueColor },
            ]}
          />
        }
      >
        <ResponsiveContainer width="100%" height={210}>
          <Chart data={data.feeData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke={chartGridStroke()} vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} dy={6} />
            <YAxis
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={36}
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <Tooltip content={<DashboardChartTooltip valueFormatter={(v) => FMT.format(v)} />} />
            {widget.type === "area" ? (
              <>
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="collected"
                  stroke={primary}
                  strokeWidth={2}
                  fill={primary}
                  fillOpacity={0.15}
                  name="Collected"
                />
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="due"
                  stroke={dueColor}
                  strokeWidth={2}
                  fill={dueColor}
                  fillOpacity={0.1}
                  name="Due"
                />
              </>
            ) : widget.type === "line" ? (
              <>
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="collected"
                  stroke={primary}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  name="Collected"
                />
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="due"
                  stroke={dueColor}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  name="Due"
                />
              </>
            ) : (
              <>
                <Bar isAnimationActive={false} dataKey="collected" fill={primary} radius={[6, 6, 0, 0]} maxBarSize={28} name="Collected" />
                <Bar isAnimationActive={false} dataKey="due" fill={dueColor} radius={[6, 6, 0, 0]} maxBarSize={28} name="Due" />
              </>
            )}
          </Chart>
        </ResponsiveContainer>
      </DashboardWidgetShell>
    );
  }

  if (widget.dataSource === "course-enrollment") {
    const coloredSlices = data.coursePie.map((slice, i) => ({
      ...slice,
      color: colors[i % colors.length] ?? slice.color,
    }));
    const total = coloredSlices.reduce((sum, slice) => sum + slice.value, 0);

    if (widget.type === "pie" || widget.type === "donut") {
      return (
        <DashboardWidgetShell title={title} subtitle={subtitle}>
          {coloredSlices.length === 0 ? (
            <EmptyWidgetState message="No enrollments yet" />
          ) : (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={168}>
                  <PieChart>
                    <Pie
                      isAnimationActive={false}
                      data={coloredSlices}
                      cx="50%"
                      cy="50%"
                      innerRadius={widget.type === "donut" ? 52 : 0}
                      outerRadius={widget.type === "donut" ? 72 : 74}
                      paddingAngle={widget.type === "donut" ? 4 : 1}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {coloredSlices.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DashboardChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {widget.type === "donut" && <DonutCenterLabel total={total} label="Students" />}
              </div>
              <SliceLegend items={coloredSlices} />
            </>
          )}
        </DashboardWidgetShell>
      );
    }

    if (widget.type === "bar" || widget.type === "horizontal-bar") {
      const barData = coloredSlices.map(({ name, value, color }) => ({ name, value, fill: color }));
      const isHorizontal = widget.type === "horizontal-bar";

      return (
        <DashboardWidgetShell title={title} subtitle={subtitle}>
          {barData.length === 0 ? (
            <EmptyWidgetState message="No enrollments yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={barData}
                layout={isHorizontal ? "vertical" : "horizontal"}
                margin={
                  isHorizontal
                    ? { top: 8, right: 16, left: 4, bottom: 8 }
                    : { top: 8, right: 8, left: -8, bottom: 0 }
                }
              >
                <CartesianGrid strokeDasharray="4 4" stroke={chartGridStroke()} horizontal={!isHorizontal} vertical={isHorizontal} />
                {isHorizontal ? (
                  <>
                    <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      width={88}
                    />
                  </>
                ) : (
                  <>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} dy={6} />
                    <YAxis tick={axisTick} axisLine={false} tickLine={false} width={32} />
                  </>
                )}
                <Tooltip content={<DashboardChartTooltip />} />
                <Bar
                  isAnimationActive={false}
                  dataKey="value"
                  radius={isHorizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                  maxBarSize={isHorizontal ? 22 : 36}
                  name="Students"
                >
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </DashboardWidgetShell>
      );
    }
  }

  if (widget.type === "list" && widget.dataSource === "today-classes") {
    return (
      <DashboardWidgetShell title={title} subtitle={subtitle}>
        {data.todayClasses.length === 0 ? (
          <EmptyWidgetState message="No ongoing batches scheduled" />
        ) : (
          <div className="space-y-2.5">
            {data.todayClasses.map((cls) => (
              <ScheduleListItem
                key={`${cls.batch}-${cls.time}`}
                course={cls.course}
                time={cls.time}
                faculty={cls.faculty}
                batch={cls.batch}
                status={cls.status}
                badge={<Badge status={cls.status} />}
              />
            ))}
          </div>
        )}
      </DashboardWidgetShell>
    );
  }

  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">Unsupported widget configuration</p>
    </Card>
  );
}
