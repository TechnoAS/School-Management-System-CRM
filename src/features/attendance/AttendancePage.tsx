import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download } from "lucide-react";
import { Student, Batch, AttendanceRecord, AttnStatus } from "@/types";
import { ATTENDANCE_RECORDS } from "@/constants/data";
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
  const [attn, setAttn] = useState<Record<string, boolean>>({});

  const selectedBatch = batches.find(b => b.id === selectedBatchId) ?? batches[0];
  const batchStudents = useMemo(
    () =>
      selectedBatch
        ? students.filter(s => s.batch === selectedBatch.name)
        : students.slice(0, 6),
    [students, selectedBatch]
  );

  useEffect(() => {
    if (!selectedBatch) return;
    const loaded: Record<string, boolean> = {};
    for (const s of batchStudents) {
      const rec = attendanceRecords.find(
        r =>
          r.studentId === s.id &&
          r.batchId === selectedBatch.id &&
          r.date === date
      );
      loaded[s.id] = rec ? rec.status === "present" : true;
    }
    setAttn(loaded);
  }, [selectedBatch, date, batchStudents, attendanceRecords]);

  const presentCount = Object.values(attn).filter(Boolean).length;
  const absentCount = Object.values(attn).length - presentCount;

  const handleSave = () => {
    if (!selectedBatch) return;
    const marks = batchStudents.map(s => ({
      studentId: s.id,
      status: (attn[s.id] ? "present" : "absent") as AttnStatus,
    }));
    saveAttendanceSession(selectedBatch.id, selectedBatch.name, date, marks);
    toast.success(`Attendance saved for ${selectedBatch.name}`, {
      description: `${presentCount} Present · ${absentCount} Absent · ${date}`,
    });
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
                batchStudents.map(s => (
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
                      onClick={() => setAttn(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        attn[s.id]
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      }`}
                    >
                      {attn[s.id] ? "Present" : "Absent"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === "report" && (
        <Card>
          <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3">
              <select className="text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 outline-none">
                <option>March 2024</option>
                <option>February 2024</option>
                <option>January 2024</option>
              </select>
              <select className="text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 outline-none">
                <option>All Batches</option>
                {batches.map(b => (
                  <option key={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <Btn variant="secondary" size="sm" onClick={() => handleExport("Attendance Report")}>
              <Download size={13} /> Export
            </Btn>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full border-collapse">
                <thead className="bg-muted/20">
                  <tr>
                    {["Student ID", "Name", "Total Classes", "Present", "Absent", "Attendance %", "Remark"].map(h => (
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
                  {ATTENDANCE_RECORDS.map((r, i) => {
                    const pct = Math.round((r.present / r.total) * 100);
                    return (
                      <tr key={r.id} className={`hover:bg-muted/20 ${i % 2 !== 0 ? "bg-muted/5" : ""}`}>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground border-b border-border">
                          {r.id}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground border-b border-border">
                          {r.student}
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
                        <td className="px-4 py-3 border-b border-border">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 75 ? "bg-emerald-500" : "bg-red-400"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-bold w-8 ${pct >= 75 ? "text-emerald-600" : "text-red-500"}`}
                            >
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-border">
                          <Badge status={pct >= 75 ? "Active" : "Inactive"} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AttendancePage;
