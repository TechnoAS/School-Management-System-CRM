import { useState } from "react";
import { toast } from "sonner";
import { Plus, Download, Printer, CheckCircle2 } from "lucide-react";
import { Course, Batch, Exam, ExamMarkRecord } from "@/types";
import { genId, handleExport, handlePrint } from "@/lib/utils";
import {
  SectionHeader,
  Tabs,
  Card,
  FormField,
  Btn,
  AvatarChip as Avatar,
  StatusBadge as Badge,
  GradeChip,
  Sel,
} from "@/components/shared";
import { ExamFormModal } from "./ExamFormModal";

export function calcGrade(pct: number) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 40) return "C";
  return "F";
}

export interface ExamsPageProps {
  courses: Course[];
  batches: Batch[];
  exams: Exam[];
  addExam: (exam: Exam) => void;
  examMarks: ExamMarkRecord[];
  setExamMarks: (
    marks: ExamMarkRecord[] | ((prev: ExamMarkRecord[]) => ExamMarkRecord[])
  ) => void;
}

export function ExamsPage({
  courses,
  batches,
  exams,
  addExam,
  examMarks,
  setExamMarks,
}: ExamsPageProps) {
  const [tab, setTab] = useState("list");
  const [showCreateExam, setShowCreateExam] = useState(false);

  const handleCreateExam = (data: Omit<Exam, "id" | "status">) => {
    const id = genId("EXM", exams);
    addExam({ id, status: "Upcoming", ...data });
    toast.success(`Exam "${data.title}" scheduled for ${data.date}`);
    setShowCreateExam(false);
  };

  const handleSaveMarks = () => {
    toast.success("Marks saved successfully!", {
      description: "Results are now visible in the Results tab.",
    });
  };

  return (
    <div>
      <SectionHeader
        title="Exam Management"
        subtitle="Create exams, enter marks, and generate results"
      />
      <Tabs
        tabs={[
          { id: "list", label: "Exam List" },
          { id: "marks", label: "Enter Marks" },
          { id: "results", label: "Results" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "list" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Btn onClick={() => setShowCreateExam(true)}>
              <Plus size={14} /> Create Exam
            </Btn>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/20">
                  <tr>
                    {["Exam ID", "Title", "Course", "Batch", "Date", "Max Marks", "Status"].map(h => (
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
                  {exams.map((e, i) => (
                    <tr
                      key={e.id}
                      className={`border-t border-border/50 hover:bg-muted/20 ${
                        i % 2 !== 0 ? "bg-muted/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.id}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">{e.title}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{e.course}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{e.batch}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{e.date}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground text-center">{e.max}</td>
                      <td className="px-4 py-3">
                        <Badge status={e.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === "marks" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Filter</h3>
            <div className="space-y-3">
              <FormField label="Course">
                <Sel>
                  <option>Full Stack Web Dev</option>
                </Sel>
              </FormField>
              <FormField label="Batch">
                <Sel>
                  <option>Batch A – Morning</option>
                </Sel>
              </FormField>
              <FormField label="Exam">
                <Sel>
                  {exams.map(e => (
                    <option key={e.id}>{e.title}</option>
                  ))}
                </Sel>
              </FormField>
            </div>
          </Card>
          <Card className="lg:col-span-3 p-4">
            <h3 className="text-sm font-semibold mb-3 text-foreground">
              Enter Marks – Module-wise (each out of 100)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left text-xs font-semibold text-muted-foreground py-2 pr-4">
                      Student
                    </th>
                    <th className="text-center text-xs font-semibold text-muted-foreground py-2 px-3">
                      Module 1
                    </th>
                    <th className="text-center text-xs font-semibold text-muted-foreground py-2 px-3">
                      Module 2
                    </th>
                    <th className="text-center text-xs font-semibold text-muted-foreground py-2 px-3">
                      Module 3
                    </th>
                    <th className="text-center text-xs font-semibold text-muted-foreground py-2 px-3">
                      Total / 300
                    </th>
                    <th className="text-center text-xs font-semibold text-muted-foreground py-2">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {examMarks.map(r => {
                    const total = r.m1 + r.m2 + r.m3;
                    const updateMark = (key: "m1" | "m2" | "m3", raw: string) => {
                      const val = Math.max(0, Math.min(100, parseInt(raw) || 0));
                      setExamMarks(prev =>
                        prev.map(x => {
                          if (x.studentId !== r.studentId) return x;
                          const next = { ...x, [key]: val };
                          return {
                            ...next,
                            grade: calcGrade(
                              Math.round(((next.m1 + next.m2 + next.m3) / 300) * 100)
                            ),
                          };
                        })
                      );
                    };
                    return (
                      <tr key={r.studentId} className="border-t border-border/50">
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <Avatar name={r.studentName} size="sm" />
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {r.studentName}
                              </p>
                              <p className="text-xs font-mono text-muted-foreground">
                                {r.studentId}
                              </p>
                            </div>
                          </div>
                        </td>
                        {(["m1", "m2", "m3"] as const).map(key => (
                          <td key={key} className="px-3 py-2.5 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={r[key]}
                              onChange={e => updateMark(key, e.target.value)}
                              className="w-16 text-center px-2 py-1.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 bg-transparent text-foreground"
                            />
                          </td>
                        ))}
                        <td className="px-3 py-2.5 text-center font-bold text-foreground">
                          {total}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <GradeChip grade={r.grade} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
              <Btn variant="secondary" onClick={() => handleExport("Exam Marks")}>
                <Download size={14} /> Export
              </Btn>
              <Btn onClick={handleSaveMarks}>
                <CheckCircle2 size={14} /> Save Marks
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {tab === "results" && (
        <Card>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Results – Full Stack Web Dev · Batch A
            </h3>
            <div className="flex gap-2">
              <Btn variant="secondary" size="sm" onClick={handlePrint}>
                <Printer size={13} /> Print
              </Btn>
              <Btn variant="secondary" size="sm" onClick={() => handleExport("Results")}>
                <Download size={13} /> Export
              </Btn>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  {[
                    "Student",
                    "Module 1",
                    "Module 2",
                    "Module 3",
                    "Total / 300",
                    "%",
                    "Grade",
                    "Progress",
                  ].map(h => (
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
                {[...examMarks]
                  .sort((a, b) => b.m1 + b.m2 + b.m3 - (a.m1 + a.m2 + a.m3))
                  .map((r, i) => {
                    const total = r.m1 + r.m2 + r.m3;
                    const pct = Math.round((total / 300) * 100);
                    return (
                      <tr
                        key={r.studentId}
                        className={`border-t border-border/50 hover:bg-muted/20 ${
                          i % 2 !== 0 ? "bg-muted/5" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={r.studentName} size="sm" />
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {r.studentName}
                              </p>
                              <p className="text-xs font-mono text-muted-foreground">
                                {r.studentId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                          {r.m1}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                          {r.m2}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                          {r.m3}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-foreground">{total}</td>
                        <td className="px-4 py-3 text-sm font-bold text-foreground">{pct}%</td>
                        <td className="px-4 py-3">
                          <GradeChip grade={r.grade} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 80
                                  ? "bg-emerald-500"
                                  : pct >= 60
                                    ? "bg-amber-400"
                                    : "bg-red-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
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

      {showCreateExam && (
        <ExamFormModal
          courses={courses}
          batches={batches}
          onSave={handleCreateExam}
          onClose={() => setShowCreateExam(false)}
        />
      )}
    </div>
  );
}

export default ExamsPage;
