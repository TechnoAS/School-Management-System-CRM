import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download } from "lucide-react";
import { Student, Batch, AttendanceRecord, AttnStatus } from "@/types";
import { TODAY, handleExport } from "@/lib/utils";
import {
  SectionHeader,
  Tabs,
  Card,
  FormField,
  Btn,
  AvatarChip as Avatar,
  StatusBadge as Badge,
  inputCls,
  selectCls,
} from "@/components/shared";
import { API_ENABLED } from "@/api/config";
import { attendanceService } from "@/api/services/attendance.service";
import { fetchAttendanceReport } from "@/api/sync";
import { ApiError } from "@/api/client";
import {
  getAttendanceMonthOptions,
  buildMonthlyAttendanceReport,
  nextAttendanceStatus,
  ATTENDANCE_STATUS_STYLES,
  type MonthlyAttendanceRow,
} from "@/store/attendanceHelpers";

export interface AttendancePageProps {
  students: Student[];
  batches: Batch[];
  attendanceRecords: AttendanceRecord[];
  saveAttendanceSession: (
    batchId: string,
    batchName: string,
    date: string,
    marks: { studentId: string; status: AttnStatus }[]
  ) => void;
}

export function AttendancePage({
  students,
  batches,
  attendanceRecords,
  saveAttendanceSession,
}: AttendancePageProps) {
  const [tab, setTab] = useState("mark");
  const selectedBatchObj = batches[0];
  const [selectedBatchId, setSelectedBatchId] = useState(selectedBatchObj?.id ?? "");
  const [date, setDate] = useState(TODAY);
  const [attn, setAttn] = useState<Record<string, AttnStatus>>({});

  const monthOptions = useMemo(
    () => getAttendanceMonthOptions(attendanceRecords),
    [attendanceRecords]
  );
  const [reportMonthKey, setReportMonthKey] = useState(monthOptions[0]?.key ?? "");
  const [reportBatchId, setReportBatchId] = useState("all");
  const [apiReportRows, setApiReportRows] = useState<MonthlyAttendanceRow[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  const selectedBatch = batches.find(b => b.id === selectedBatchId) ?? batches[0];
  const batchStudents = useMemo(
    () =>
      selectedBatch
        ? students.filter(
            s => s.batchId === selectedBatch.id || s.batch === selectedBatch.name
          )
        : [],
    [students, selectedBatch]
  );

  useEffect(() => {
    if (!selectedBatch) return;
    const loaded: Record<string, AttnStatus> = {};
    for (const s of batchStudents) {
      const rec = attendanceRecords.find(
        r =>
          r.studentId === s.id &&
          r.batchId === selectedBatch.id &&
          r.date === date
      );
      loaded[s.id] = rec?.status ?? "present";
    }
    setAttn(loaded);
  }, [selectedBatch, date, batchStudents, attendanceRecords]);

  useEffect(() => {
    if (!API_ENABLED || !selectedBatch) return;
    let cancelled = false;
    attendanceService
      .get(selectedBatch.id, date, selectedBatch.name)
      .then(records => {
        if (cancelled) return;
        const loaded: Record<string, AttnStatus> = {};
        for (const s of batchStudents) {
          const rec = records.find(r => r.studentId === s.id);
          loaded[s.id] = rec?.status ?? "present";
        }
        setAttn(loaded);
      })
      .catch(() => {
        /* keep store-backed values */
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBatch, date, batchStudents]);

  const reportMonth = monthOptions.find(m => m.key === reportMonthKey) ?? monthOptions[0];

  useEffect(() => {
    if (!API_ENABLED || tab !== "report" || !reportMonth) {
      setApiReportRows([]);
      return;
    }
    const monthParam = `${reportMonth.year}-${String(reportMonth.month + 1).padStart(2, "0")}`;
    const batchIds =
      reportBatchId === "all" ? batches.map(b => b.id) : [reportBatchId];

    let cancelled = false;
    setReportLoading(true);

    Promise.all(
      batchIds.map(id => fetchAttendanceReport(id, monthParam).catch(() => null))
    )
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
        setApiReportRows(
          [...merged.values()].sort((a, b) => a.studentName.localeCompare(b.studentName))
        );
      })
      .finally(() => {
        if (!cancelled) setReportLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, reportMonth, reportBatchId, batches]);

  const monthlyRows = useMemo(() => {
    if (API_ENABLED && tab === "report") return apiReportRows;
    if (!reportMonth) return [];
    return buildMonthlyAttendanceReport(
      attendanceRecords,
      students,
      reportMonth.year,
      reportMonth.month,
      reportBatchId
    );
  }, [
    API_ENABLED,
    tab,
    apiReportRows,
    attendanceRecords,
    students,
    reportMonth,
    reportBatchId,
  ]);

  const presentCount = Object.values(attn).filter(s => s === "present").length;
  const absentCount = Object.values(attn).filter(s => s === "absent").length;
  const leaveCount = Object.values(attn).filter(s => s === "leave").length;

  const handleSave = async () => {
    if (!selectedBatch) return;
    const marks = batchStudents.map(s => ({
      studentId: s.id,
      status: attn[s.id] ?? "present",
    }));
    try {
      if (API_ENABLED) {
        await attendanceService.save(selectedBatch.id, date, marks);
      }
      saveAttendanceSession(selectedBatch.id, selectedBatch.name, date, marks);
      toast.success(`Attendance saved for ${selectedBatch.name}`, {
        description: `${presentCount} Present · ${absentCount} Absent · ${leaveCount} Leave · ${date}`,
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save attendance");
    }
  };

  const exportMonthlyReport = () => {
    handleExport(
      "Attendance Report",
      monthlyRows.map(r => ({
        "Student ID": r.studentId,
        Name: r.studentName,
        "Total Classes": r.total,
        Present: r.present,
        Absent: r.absent,
        Leave: r.leave,
        "Attendance %": r.pct,
        Remark: r.pct >= 75 ? "Good" : "Below 75%",
      }))
    );
  };

  return (
    <div>
      <SectionHeader
        title="Attendance Management"
        subtitle="Mark daily attendance and generate monthly reports"
      />
      <Tabs
        tabs={[
          { id: "mark", label: "Mark Attendance" },
          { id: "report", label: "Monthly Report" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "mark" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Session</h3>
            <div className="space-y-3">
              <FormField label="Batch">
                <select
                  className={selectCls}
                  value={selectedBatch?.id ?? ""}
                  onChange={e => setSelectedBatchId(e.target.value)}
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Date">
                <input
                  className={inputCls}
                  type="date"
                  value={date}
                  max={TODAY}
                  onChange={e => setDate(e.target.value)}
                />
              </FormField>
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Present</span>
                  <span className="font-bold text-emerald-600">{presentCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Absent</span>
                  <span className="font-bold text-red-500">{absentCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Leave</span>
                  <span className="font-bold text-amber-600">{leaveCount}</span>
                </div>
              </div>
              <Btn className="w-full justify-center" onClick={handleSave}>
                <CheckCircle2 size={14} /> Save Attendance
              </Btn>
            </div>
          </Card>

          <Card className="lg:col-span-3 p-4">
            <h3 className="text-sm font-semibold mb-3 text-foreground">
              {selectedBatch?.name} · {date}
            </h3>
            <div className="space-y-2">
              {batchStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No students enrolled in this batch.
                </p>
              ) : (
                batchStudents.map(s => {
                  const status = attn[s.id] ?? "present";
                  const style = ATTENDANCE_STATUS_STYLES[status];
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <Avatar name={s.name} size="sm" src={s.photo} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{s.name}</p>
                        <p className="text-xs font-mono text-muted-foreground">{s.id}</p>
                      </div>
                      <button
                        onClick={() =>
                          setAttn(prev => ({
                            ...prev,
                            [s.id]: nextAttendanceStatus(prev[s.id] ?? "present"),
                          }))
                        }
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${style.className}`}
                      >
                        {style.label}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === "report" && (
        <Card>
          <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3">
              <select
                className="text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 outline-none"
                value={reportMonthKey}
                onChange={e => setReportMonthKey(e.target.value)}
              >
                {monthOptions.map(m => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                className="text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 outline-none"
                value={reportBatchId}
                onChange={e => setReportBatchId(e.target.value)}
              >
                <option value="all">All Batches</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <Btn variant="secondary" size="sm" onClick={exportMonthlyReport}>
              <Download size={13} /> Export
            </Btn>
          </div>
          <div className="p-4">
            {reportLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading report…</p>
            ) : monthlyRows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No attendance records for the selected month{batchFilterLabel(reportBatchId, batches)}.
              </p>
            ) : (
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full border-collapse">
                  <thead className="bg-muted/20">
                    <tr>
                      {["Student ID", "Name", "Total", "Present", "Absent", "Leave", "Attendance %", "Remark"].map(h => (
                        <th
                          key={h}
                          className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 border-b border-border"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRows.map((r, i) => (
                      <tr key={r.studentId} className={`hover:bg-muted/20 ${i % 2 !== 0 ? "bg-muted/5" : ""}`}>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground border-b border-border">
                          {r.studentId}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground border-b border-border">
                          {r.studentName}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-muted-foreground border-b border-border">
                          {r.total}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-emerald-600 border-b border-border">
                          {r.present}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-red-500 border-b border-border">
                          {r.absent}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-amber-600 border-b border-border">
                          {r.leave}
                        </td>
                        <td className="px-4 py-3 border-b border-border">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${r.pct >= 75 ? "bg-emerald-500" : "bg-red-400"}`}
                                style={{ width: `${r.pct}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-bold w-8 ${r.pct >= 75 ? "text-emerald-600" : "text-red-500"}`}
                            >
                              {r.pct}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-border">
                          <Badge status={r.pct >= 75 ? "Active" : "Inactive"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function batchFilterLabel(batchId: string, batches: Batch[]) {
  if (batchId === "all") return "";
  const b = batches.find(x => x.id === batchId);
  return b ? ` in ${b.name}` : "";
}

export default AttendancePage;
