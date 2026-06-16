import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
import { Student, Course, Batch } from "@/types";
import {
  TODAY_CLASSES,
  ENROLLMENT_DATA,
  COURSE_PIE,
  FEE_DATA,
} from "@/constants/data";
import { SectionHeader, StatCard, Card, StatusBadge as Badge } from "@/components/shared";
import { FMT } from "@/lib/utils";

export function DashboardPage({
  students,
  courses,
  batches,
}: {
  students: Student[];
  courses: Course[];
  batches: Batch[];
}) {
  const activeStudents = students.filter(s => s.status === "Active").length;
  const totalPaid = students.reduce((sum, s) => sum + s.feesPaid, 0);
  const totalDue  = students.reduce((sum, s) => sum + (s.feesTotal - s.feesPaid), 0);

  const now = new Date();
  const newAdmissions = students.filter(s => {
    const d = new Date(s.admissionDate);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const upcomingBatches = batches.filter(b => b.status === "Upcoming").length;

  return (
    <div>
      <SectionHeader title="Dashboard" subtitle="Welcome back! Here's what's happening at TechAcademy today." />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-5">
        <StatCard icon={Users}        label="Total Students"            value={String(students.length)} sub="Across all courses"  color="bg-primary"     />
        <StatCard icon={CheckCircle2} label="Active Students"           value={String(activeStudents)}  sub="Currently enrolled" color="bg-emerald-600" />
        <StatCard icon={UserPlus}     label="New Admissions"            value={String(newAdmissions)}   sub={now.toLocaleString("en-IN", { month: "long" }) + " " + now.getFullYear()} color="bg-violet-600" />
        <StatCard icon={AlertCircle}  label="Fees Due"                  value={FMT.format(totalDue)}    sub={`From ${students.filter(s => s.feesPaid < s.feesTotal).length} students`} color="bg-red-500" />
        <StatCard icon={Wallet}       label="Fees Collected"            value={FMT.format(totalPaid)}   sub="This academic year" color="bg-amber-600"   />
        <StatCard icon={BookOpen}     label="Total Courses"             value={String(courses.length)}  sub={`${courses.filter(c => c.status === "Active").length} active`} color="bg-teal-600" />
        <StatCard icon={Layers}       label="Upcoming Batches"          value={String(upcomingBatches)} sub={`${batches.filter(b => b.status === "Ongoing").length} ongoing`} color="bg-indigo-600" />
        <StatCard icon={Calendar}     label="Today's Classes"           value={String(TODAY_CLASSES.length)} sub={`${TODAY_CLASSES.filter(c => c.status === "Ongoing").length} ongoing now`} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Student Enrollment Trend</h3>
            <span className="text-xs text-muted-foreground">Last 7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ENROLLMENT_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }} />
              <Area isAnimationActive={false} type="monotone" dataKey="students" stroke="#1a3a5c" strokeWidth={2} fill="#1a3a5c" fillOpacity={0.1} name="Students" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Enrollment by Course</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie isAnimationActive={false} data={COURSE_PIE} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
                {COURSE_PIE.map(entry => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {COURSE_PIE.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-muted-foreground">{name}</span>
                </div>
                <span className="font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Fee Collection vs Due</h3>
            <span className="text-xs text-muted-foreground">Monthly overview</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={FEE_DATA} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => FMT.format(v)} />
              <Bar isAnimationActive={false} dataKey="collected" fill="#1a3a5c" radius={[4,4,0,0]} name="Collected" />
              <Bar isAnimationActive={false} dataKey="due"       fill="#c0392b" radius={[4,4,0,0]} name="Due"       />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Today&apos;s Classes</h3>
          <div className="space-y-3">
            {TODAY_CLASSES.map((cls, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cls.status === "Ongoing" ? "bg-emerald-500" : cls.status === "Completed" ? "bg-blue-400" : "bg-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{cls.course}</div>
                  <div className="text-xs text-muted-foreground">{cls.time}</div>
                  <div className="text-xs text-muted-foreground">{cls.faculty} · {cls.room}</div>
                </div>
                <Badge status={cls.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
