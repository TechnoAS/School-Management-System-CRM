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
import { Card, StatCard, StatusBadge as Badge } from "@/components/shared";
import { FMT } from "@/lib/utils";
import type { DashboardWidget as WidgetConfig } from "@/types/pageLayout";
import { resolveDashboardIcon } from "./dashboardIcons";
import { resolveKpiValue, type DashboardWidgetData } from "./dashboardWidgetData";

type Props = {
  widget: WidgetConfig;
  data: DashboardWidgetData;
};

export function DashboardWidget({ widget, data }: Props) {
  const colors = widget.colors ?? ["#1a3a5c", "#c0392b"];
  const subtitle = widget.subtitle;

  if (widget.type === "stat") {
    const Icon = resolveDashboardIcon(widget.icon);
    const kpi = resolveKpiValue(widget.dataSource, data);
    return (
      <StatCard
        icon={Icon}
        label={widget.title}
        value={kpi.value}
        sub={subtitle || kpi.sub}
        accentHex={colors[0]}
      />
    );
  }

  // Enrollment Trend Line Chart
  if (widget.type === "line" && widget.dataSource === "enrollment-trend") {
    return (
      <Card className="p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.enrollmentData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }} />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="students"
              stroke={colors[0]}
              strokeWidth={3}
              activeDot={{ r: 6 }}
              name="Students"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  if (widget.type === "area" && widget.dataSource === "enrollment-trend") {
    return (
      <Card className="p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.enrollmentData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }} />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey="students"
              stroke={colors[0]}
              strokeWidth={2}
              fill={colors[0]}
              fillOpacity={0.1}
              name="Students"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  if (widget.type === "bar" && widget.dataSource === "enrollment-trend") {
    return (
      <Card className="p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.enrollmentData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar isAnimationActive={false} dataKey="students" fill={colors[0]} radius={[4, 4, 0, 0]} name="Students" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  if ((widget.type === "bar" || widget.type === "area" || widget.type === "line") && widget.dataSource === "fee-trend") {
    const Chart = widget.type === "area" ? AreaChart : widget.type === "line" ? LineChart : BarChart;
    return (
      <Card className="p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <Chart data={data.feeData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => FMT.format(v)} />
            {widget.type === "area" ? (
              <>
                <Area isAnimationActive={false} type="monotone" dataKey="collected" stroke={colors[0]} fill={colors[0]} fillOpacity={0.15} name="Collected" />
                <Area isAnimationActive={false} type="monotone" dataKey="due" stroke={colors[1] ?? "#c0392b"} fill={colors[1] ?? "#c0392b"} fillOpacity={0.1} name="Due" />
              </>
            ) : widget.type === "line" ? (
              <>
                <Line isAnimationActive={false} type="monotone" dataKey="collected" stroke={colors[0]} strokeWidth={3} activeDot={{ r: 6 }} name="Collected" />
                <Line isAnimationActive={false} type="monotone" dataKey="due" stroke={colors[1] ?? "#c0392b"} strokeWidth={3} activeDot={{ r: 6 }} name="Due" />
              </>
            ) : (
              <>
                <Bar isAnimationActive={false} dataKey="collected" fill={colors[0]} radius={[4, 4, 0, 0]} name="Collected" />
                <Bar isAnimationActive={false} dataKey="due" fill={colors[1] ?? "#c0392b"} radius={[4, 4, 0, 0]} name="Due" />
              </>
            )}
          </Chart>
        </ResponsiveContainer>
      </Card>
    );
  }

  // Course Enrollment Pie & Donut Charts
  if ((widget.type === "pie" || widget.type === "donut") && widget.dataSource === "course-enrollment") {
    const pieData = data.coursePie.map((slice, i) => ({
      ...slice,
      color: colors[i % colors.length] ?? slice.color,
    }));
    return (
      <Card className="p-5 h-full">
        <h3 className="text-sm font-semibold text-foreground mb-3">{widget.title}</h3>
        {pieData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No enrollments yet</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  isAnimationActive={false}
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={widget.type === "donut" ? 44 : 0}
                  outerRadius={65}
                  paddingAngle={widget.type === "donut" ? 3 : 0}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-1">
              {pieData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-muted-foreground">{name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    );
  }

  // Course Enrollment Vertical Bar Chart
  if (widget.type === "bar" && widget.dataSource === "course-enrollment") {
    const barData = data.coursePie.map((slice, i) => ({
      name: slice.name,
      value: slice.value,
      fill: colors[i % colors.length] ?? slice.color,
    }));
    return (
      <Card className="p-5 h-full">
        <h3 className="text-sm font-semibold text-foreground mb-3">{widget.title}</h3>
        {barData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No enrollments yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar isAnimationActive={false} dataKey="value" radius={[4, 4, 0, 0]} name="Students">
                {barData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    );
  }

  // Course Enrollment Horizontal Bar Chart
  if (widget.type === "horizontal-bar" && widget.dataSource === "course-enrollment") {
    const barData = data.coursePie.map((slice, i) => ({
      name: slice.name,
      value: slice.value,
      fill: colors[i % colors.length] ?? slice.color,
    }));
    return (
      <Card className="p-5 h-full">
        <h3 className="text-sm font-semibold text-foreground mb-3">{widget.title}</h3>
        {barData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No enrollments yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar isAnimationActive={false} dataKey="value" radius={[0, 4, 4, 0]} name="Students">
                {barData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    );
  }

  if (widget.type === "list" && widget.dataSource === "today-classes") {
    return (
      <Card className="p-5 h-full">
        <h3 className="text-sm font-semibold text-foreground mb-3">{widget.title}</h3>
        {data.todayClasses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No ongoing batches scheduled</p>
        ) : (
          <div className="space-y-3">
            {data.todayClasses.map((cls) => (
              <div key={`${cls.batch}-${cls.time}`} className="flex items-start gap-2.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    cls.status === "Ongoing" ? "bg-emerald-500" : cls.status === "Completed" ? "bg-blue-400" : "bg-amber-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{cls.course}</div>
                  <div className="text-xs text-muted-foreground">{cls.time}</div>
                  <div className="text-xs text-muted-foreground">
                    {cls.faculty} · {cls.batch}
                  </div>
                </div>
                <Badge status={cls.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">Unsupported widget configuration</p>
    </Card>
  );
}

