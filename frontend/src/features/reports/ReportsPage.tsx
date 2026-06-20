import { useState, useMemo, useEffect } from "react";
import { Printer, Download } from "lucide-react";
import { Student, FacultyMember, Payment, AttendanceRecord, Batch } from "@/types";
import { handlePrint, handleExport, FMT, TODAY } from "@/lib/utils";
import { buildFeeTrend } from "@/lib/dashboardStats";
import {
  getAttendanceMonthOptions,
  buildMonthlyAttendanceReport,
  type MonthlyAttendanceRow,
} from "@/store/attendanceHelpers";
import { API_ENABLED } from "@/api/config";
import { fetchAttendanceReport } from "@/api/sync";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  SectionHeader,
  Tabs,
  Card,
  AvatarChip as Avatar,
  StatusBadge as Badge,
  Btn,
} from "@/components/shared";

export interface ReportsPageProps {
  students: Student[];
  faculty: FacultyMember[];
  payments: Payment[];
  attendanceRecords: AttendanceRecord[];
  batches: Batch[];
}

export function ReportsPage({ students, faculty, payments, attendanceRecords, batches }: ReportsPageProps) {
  const [tab, setTab] = useState("student");
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState(TODAY);
  const [reportMonthKey, setReportMonthKey] = useState("");
  const [apiAttendanceRows, setApiAttendanceRows] = useState<MonthlyAttendanceRow[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const inDateRange = (dateStr: string) => dateStr >= dateFrom && dateStr <= dateTo;

  const filteredStudents = useMemo(
    () => students.filter(s => inDateRange(s.admissionDate)),
    [students, dateFrom, dateTo]
  );
  const filteredPayments = useMemo(
    () => payments.filter(p => inDateRange(p.date)),
    [payments, dateFrom, dateTo]
  );

  const pendingDocs = useMemo(
    () => students.filter((s) => !s.phone?.trim() || !s.email?.trim() || !s.address?.trim()).length,
    [students]
  );
  const dueStudents = useMemo(
    () => students.filter(s => s.feesPaid < s.feesTotal),
    [students]
  );
  const totalDue = useMemo(
    () => dueStudents.reduce((sum, s) => sum + (s.feesTotal - s.feesPaid), 0),
    [dueStudents]
  );
  const feeChartData = useMemo(
    () => buildFeeTrend(students, filteredPayments),
    [students, filteredPayments]
  );
  const monthOptions = useMemo(
    () => getAttendanceMonthOptions(attendanceRecords),
    [attendanceRecords]
  );
  const activeMonthKey = reportMonthKey || monthOptions[0]?.key || "";
  const activeMonth = useMemo(
    () => monthOptions.find(m => m.key === activeMonthKey),
    [monthOptions, activeMonthKey]
  );

  useEffect(() => {
    if (!API_ENABLED || tab !== "attendance" || !activeMonth) {
      setApiAttendanceRows([]);
      return;
    }
    const monthParam = `${activeMonth.year}-${String(activeMonth.month + 1).padStart(2, "0")}`;
    let cancelled = false;
    setAttendanceLoading(true);

    Promise.all(batches.map(b => fetchAttendanceReport(b.id, monthParam).catch(() => null)))
      .then(results => {
        if (cancelled) return;
        const merged = new Map<string, MonthlyAttendanceRow>();
        for (const report of results) {
          if (!report) continue;
          for (const row of report.students) {
            const existing = merged.get(row.studentId);
            if (!existing) {
              merged.set(row.studentId, { ...row });
              continue;
            }
            const total = existing.total + row.total;
            const present = existing.present + row.present;
            merged.set(row.studentId, {
              ...existing,
              total,
              present,
              absent: existing.absent + row.absent,
              leave: existing.leave + row.leave,
              pct: total > 0 ? Math.round((present / total) * 100) : 0,
            });
          }
        }
        setApiAttendanceRows(
          [...merged.values()].sort((a, b) => a.studentName.localeCompare(b.studentName))
        );
      })
      .finally(() => {
        if (!cancelled) setAttendanceLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, activeMonth?.year, activeMonth?.month, batches]);

  const attendanceRows = useMemo(() => {
    if (tab !== "attendance") return [];
    if (API_ENABLED) return apiAttendanceRows;
    if (!activeMonth) return [];
    return buildMonthlyAttendanceReport(
      attendanceRecords,
      students,
      activeMonth.year,
      activeMonth.month,
      "all"
    );
  }, [tab, apiAttendanceRows, activeMonth, attendanceRecords, students]);

  const DateRangeFilters = () => (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        type="date"
        value={dateFrom}
        onChange={e => setDateFrom(e.target.value)}
        className="text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 outline-none"
      />
      <span className="text-xs text-muted-foreground">to</span>
      <input
        type="date"
        value={dateTo}
        onChange={e => setDateTo(e.target.value)}
        className="text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 outline-none"
      />
    </div>
  );

  return (
    <div>
      <SectionHeader title="Reports" subtitle="Generate and export detailed reports across all modules" />
      <Tabs
        tabs={[
          { id: "student", label: "Student" },
          { id: "admission", label: "Admission" },
          { id: "fee", label: "Fee Collection" },
          { id: "due", label: "Due Fee" },
          { id: "attendance", label: "Attendance" },
          { id: "faculty", label: "Faculty" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "student" && (
        <Card>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Student Master Report</h3>
            <div className="flex gap-2">
              <Btn variant="secondary" size="sm" onClick={handlePrint}>
                <Printer size={13} /> Print
              </Btn>
              <Btn variant="secondary" size="sm" onClick={() =>
                  handleExport(
                    "Student Report",
                    students.map(s => ({
                      "Student ID": s.id,
                      Name: s.name,
                      Course: s.course,
                      Batch: s.batch,
                      Phone: s.phone,
                      Paid: s.feesPaid,
                      Due: s.feesTotal - s.feesPaid,
                      Status: s.status,
                    }))
                  )
                }>
                <Download size={13} /> CSV
              </Btn>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-border">
            {[
              [String(students.length), "Total Students", "text-foreground"],
              [String(students.filter(s => s.status === "Active").length), "Active", "text-emerald-600"],
              [String(students.filter(s => s.status === "Completed").length), "Completed", "text-blue-600"],
              [String(new Set(students.map(s => s.course)).size), "Courses Covered", "text-primary"],
            ].map(([v, l, c]) => (
              <div key={l} className="bg-muted/20 rounded-xl p-3 text-center">
                <p className={`text-2xl font-bold ${c}`}>{v}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  {["Student ID", "Name", "Course", "Batch", "Phone", "Paid", "Due", "Status"].map(h => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-t border-border/50 hover:bg-muted/20 ${
                      i % 2 !== 0 ? "bg-muted/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.id}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.course}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.batch}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.phone}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-700">
                      {FMT.format(s.feesPaid)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600">
                      {FMT.format(s.feesTotal - s.feesPaid)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "admission" && (
        <Card>
          <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <DateRangeFilters />
            <div className="flex gap-2">
              <Btn variant="secondary" size="sm" onClick={handlePrint}>
                <Printer size={13} /> Print
              </Btn>
              <Btn variant="secondary" size="sm" onClick={() =>
                  handleExport(
                    "Admission Report",
                    filteredStudents.map(s => ({
                      Name: s.name,
                      Course: s.course,
                      Batch: s.batch,
                      "Admission Date": s.admissionDate,
                      Fees: s.feesTotal,
                      Status: s.status,
                    }))
                  )
                }>
                <Download size={13} /> CSV
              </Btn>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-border">
            {[
              [String(students.length), "Total Admissions", "text-foreground"],
              [String(students.filter(s => s.status === "Active").length), "Active", "text-emerald-600"],
              [String(pendingDocs), "Pending Docs", "text-amber-600"],
              [FMT.format(students.reduce((sum, s) => sum + s.feesTotal, 0)), "Revenue", "text-primary"],
            ].map(([v, l, c]) => (
              <div key={l} className="bg-muted/20 rounded-xl p-3 text-center animate-fade-in">
                <p className={`text-xl md:text-2xl font-bold ${c}`}>{v}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  {["Name", "Course", "Batch", "Admission Date", "Fees", "Status"].map(h => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-t border-border/50 hover:bg-muted/20 ${
                      i % 2 !== 0 ? "bg-muted/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.course}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.batch}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.admissionDate}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{FMT.format(s.feesTotal)}</td>
                    <td className="px-4 py-3">
                      <Badge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "fee" && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold text-foreground">Fee Collection vs Due – Monthly</h3>
            <div className="flex items-center gap-2">
              <DateRangeFilters />
            <Btn variant="secondary" size="sm" onClick={() =>
                handleExport(
                  "Fee Report",
                  feeChartData.map(row => ({
                    Month: row.month,
                    Collected: row.collected ?? 0,
                    Due: row.due ?? 0,
                  }))
                )
              }>
              <Download size={13} /> Export
            </Btn>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={feeChartData} margin={{ top: 5, right: 5, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v: number) => FMT.format(v)}
              />
              <Bar
                isAnimationActive={false}
                dataKey="collected"
                fill="#1a3a5c"
                radius={[4, 4, 0, 0]}
                name="Collected"
              />
              <Bar
                isAnimationActive={false}
                dataKey="due"
                fill="#c0392b"
                radius={[4, 4, 0, 0]}
                name="Due"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {tab === "due" && (
        <Card>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Due Fee Report</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dueStudents.length} students · {FMT.format(totalDue)} outstanding
              </p>
            </div>
            <div className="flex gap-2">
              <Btn variant="secondary" size="sm" onClick={handlePrint}>
                <Printer size={13} /> Print
              </Btn>
              <Btn variant="secondary" size="sm" onClick={() =>
                  handleExport(
                    "Due Fee Report",
                    dueStudents.map(s => ({
                      "Student ID": s.id,
                      Name: s.name,
                      Course: s.course,
                      "Total Fees": s.feesTotal,
                      Paid: s.feesPaid,
                      Due: s.feesTotal - s.feesPaid,
                      Status: s.status,
                    }))
                  )
                }>
                <Download size={13} /> CSV
              </Btn>
            </div>
          </div>
          {dueStudents.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <span className="text-2xl mb-2 block">✓</span>
              No outstanding dues — all fees are cleared.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/20">
                  <tr>
                    {["Student ID", "Name", "Course", "Total Fees", "Paid", "Due", "Status"].map(h => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dueStudents.map((s, i) => (
                    <tr
                      key={s.id}
                      className={`border-t border-border/50 hover:bg-muted/20 ${
                        i % 2 !== 0 ? "bg-muted/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.id}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">{s.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{s.course}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{FMT.format(s.feesTotal)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-700">
                        {FMT.format(s.feesPaid)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-red-600">
                        {FMT.format(s.feesTotal - s.feesPaid)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/10 font-bold">
                    <td className="px-4 py-3 text-sm text-foreground" colSpan={5}>
                      Total Outstanding
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">{FMT.format(totalDue)}</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "attendance" && (
        <Card>
          <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <select
              className="text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 outline-none"
              value={activeMonthKey}
              onChange={e => setReportMonthKey(e.target.value)}
            >
              {monthOptions.map(m => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
            <Btn variant="secondary" size="sm" onClick={() =>
                handleExport(
                  "Attendance Report",
                  attendanceRows.map(r => ({
                    "Student ID": r.studentId,
                    Name: r.studentName,
                    "Total Classes": r.total,
                    Present: r.present,
                    Absent: r.absent,
                    Leave: r.leave,
                    "Attendance %": r.pct,
                  }))
                )
              }>
              <Download size={13} /> Export
            </Btn>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  {["Student", "Total Classes", "Present", "Absent", "Attendance %"].map(h => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendanceRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      {attendanceLoading
                        ? "Loading attendance from server…"
                        : "No attendance data recorded yet."}
                    </td>
                  </tr>
                ) : (
                  attendanceRows.map((r, i) => (
                    <tr
                      key={r.studentId}
                      className={`border-t border-border/50 hover:bg-muted/20 ${
                        i % 2 !== 0 ? "bg-muted/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">{r.studentName}</td>
                      <td className="px-4 py-3 text-sm text-center text-muted-foreground">{r.total}</td>
                      <td className="px-4 py-3 text-sm text-center font-semibold text-emerald-600">
                        {r.present}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-semibold text-red-500">
                        {r.absent + r.leave}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                r.pct >= 75 ? "bg-emerald-500" : "bg-red-400"
                              }`}
                              style={{ width: `${r.pct}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold w-8 ${
                              r.pct >= 75 ? "text-emerald-600" : "text-red-500"
                            }`}
                          >
                            {r.pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "faculty" && (
        <Card>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Faculty Performance Report</h3>
            <Btn variant="secondary" size="sm" onClick={() =>
                handleExport(
                  "Faculty Report",
                  faculty.map(f => ({
                    "Faculty ID": f.id,
                    Name: f.name,
                    Subject: f.subject,
                    Attendance: `${f.attendance}%`,
                    Salary: f.salary,
                  }))
                )
              }>
              <Download size={13} /> Export
            </Btn>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  {["Faculty", "Subject", "Batches", "Attendance", "Salary"].map(h => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {faculty.map((f, i) => (
                  <tr
                    key={f.id}
                    className={`border-t border-border/50 hover:bg-muted/20 ${
                      i % 2 !== 0 ? "bg-muted/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={f.name} size="sm" />
                        <span className="text-sm font-semibold text-foreground">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{f.subject}</td>
                    <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                      {batches.filter((b) => b.faculty === f.name).length}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${f.attendance}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground">{f.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">{FMT.format(f.salary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default ReportsPage;
