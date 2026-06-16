import { useState } from "react";
import { Printer, Download } from "lucide-react";
import { Student, FacultyMember } from "@/types";
import { FEE_DATA, ATTENDANCE_RECORDS } from "@/constants/data";
import { handlePrint, handleExport, FMT } from "@/lib/utils";
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
}

export function ReportsPage({ students, faculty }: ReportsPageProps) {
  const [tab, setTab] = useState("student");

  const dueStudents = students.filter(s => s.feesPaid < s.feesTotal);
  const totalDue = dueStudents.reduce((sum, s) => sum + (s.feesTotal - s.feesPaid), 0);

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
              <Btn variant="secondary" size="sm" onClick={() => handleExport("Student Report")}>
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
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex gap-3">
              <select className="text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 outline-none text-foreground bg-transparent">
                <option>March 2024</option>
                <option>February 2024</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Btn variant="secondary" size="sm" onClick={handlePrint}>
                <Printer size={13} /> Print
              </Btn>
              <Btn variant="secondary" size="sm" onClick={() => handleExport("Admission Report")}>
                <Download size={13} /> CSV
              </Btn>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-border">
            {[
              [String(students.length), "Total Admissions", "text-foreground"],
              [String(students.filter(s => s.status === "Active").length), "Active", "text-emerald-600"],
              ["2", "Pending Docs", "text-amber-600"],
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
                {students.map((s, i) => (
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Fee Collection vs Due – Monthly</h3>
            <Btn variant="secondary" size="sm" onClick={() => handleExport("Fee Report")}>
              <Download size={13} /> Export
            </Btn>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={FEE_DATA} margin={{ top: 5, right: 5, left: -5, bottom: 0 }}>
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
              <Btn variant="secondary" size="sm" onClick={() => handleExport("Due Fee Report")}>
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
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Monthly Attendance Summary</h3>
            <Btn variant="secondary" size="sm" onClick={() => handleExport("Attendance Report")}>
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
                {ATTENDANCE_RECORDS.map((r, i) => {
                  const pct = Math.round((r.present / r.total) * 100);
                  return (
                    <tr
                      key={r.id}
                      className={`border-t border-border/50 hover:bg-muted/20 ${
                        i % 2 !== 0 ? "bg-muted/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">{r.student}</td>
                      <td className="px-4 py-3 text-sm text-center text-muted-foreground">{r.total}</td>
                      <td className="px-4 py-3 text-sm text-center font-semibold text-emerald-600">
                        {r.present}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-semibold text-red-500">
                        {r.absent}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 75 ? "bg-emerald-500" : "bg-red-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold w-8 ${
                              pct >= 75 ? "text-emerald-600" : "text-red-500"
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "faculty" && (
        <Card>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Faculty Performance Report</h3>
            <Btn variant="secondary" size="sm" onClick={() => handleExport("Faculty Report")}>
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
                    <td className="px-4 py-3 text-sm text-center text-muted-foreground">2</td>
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
