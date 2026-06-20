import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Download, Printer, CheckCircle2, Trash2 } from "lucide-react";
import { Course, Batch, Exam, ExamMarkRecord, Student } from "@/types";
import { genId, handleExport, handlePrint } from "@/lib/utils";
import { calcGrade } from "@/lib/grades";
import {
  SectionHeader,
  Tabs,
  Card,
  FormField,
  Btn,
  AvatarChip as Avatar,
  StatusBadge as Badge,
  GradeChip,
  selectCls,
  ConfirmDialog,
} from "@/components/shared";
import { ExamFormModal } from "./ExamFormModal";
import { API_ENABLED } from "@/api/config";
import { examsService } from "@/api/services/exams.service";
import { ApiError } from "@/api/client";

export { calcGrade };

function batchBelongsToCourse(batch: Batch, course: Course | undefined) {
  if (!course) return false;
  return batch.course === course.name || batch.course === course.id;
}

function examBelongsToBatch(exam: Exam, course: Course | undefined, batch: Batch | undefined) {
  if (!course || !batch) return false;
  return (
    (exam.course === course.name || exam.course === course.id) &&
    (exam.batch === batch.name || exam.batch === batch.id)
  );
}

function studentInBatch(student: Student, batch: Batch | undefined) {
  if (!batch) return false;
  if (student.batchId) return student.batchId === batch.id;
  return student.batch === batch.name;
}

export interface ExamsPageProps {
  courses: Course[];
  batches: Batch[];
  exams: Exam[];
  addExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  students: Student[];
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
  deleteExam,
  students,
  examMarks,
  setExamMarks,
}: ExamsPageProps) {
  const [tab, setTab] = useState("list");
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);

  const selectedCourse = useMemo(
    () => courses.find(c => c.id === selectedCourseId),
    [courses, selectedCourseId]
  );

  const courseBatches = useMemo(
    () => batches.filter(b => batchBelongsToCourse(b, selectedCourse)),
    [batches, selectedCourse]
  );

  const selectedBatch = useMemo(
    () => courseBatches.find(b => b.id === selectedBatchId),
    [courseBatches, selectedBatchId]
  );

  const courseExams = useMemo(
    () => exams.filter(e => examBelongsToBatch(e, selectedCourse, selectedBatch)),
    [exams, selectedCourse, selectedBatch]
  );

  const selectedExam = useMemo(
    () => courseExams.find(e => e.id === selectedExamId) ?? courseExams[0],
    [courseExams, selectedExamId]
  );

  const batchStudents = useMemo(
    () => students.filter(s => studentInBatch(s, selectedBatch)),
    [students, selectedBatch]
  );

  const displayMarks = useMemo(() => {
    const examId = selectedExam?.id ?? "";
    return batchStudents.map(s => {
      const existing = examMarks.find(m => m.examId === examId && m.studentId === s.id);
      return (
        existing ?? {
          examId,
          studentId: s.id,
          studentName: s.name,
          marks: 0,
          grade: "F",
        }
      );
    });
  }, [batchStudents, examMarks, selectedExam?.id]);

  // Initialise course once data loads
  useEffect(() => {
    if (!selectedCourseId && courses[0]) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // Cascade: course → first batch in that course
  useEffect(() => {
    if (!selectedCourseId) return;
    if (!courseBatches.some(b => b.id === selectedBatchId)) {
      setSelectedBatchId(courseBatches[0]?.id ?? "");
    }
  }, [selectedCourseId, courseBatches, selectedBatchId]);

  // Cascade: batch → first exam in that batch
  useEffect(() => {
    if (!selectedBatchId) return;
    if (!courseExams.some(e => e.id === selectedExamId)) {
      setSelectedExamId(courseExams[0]?.id ?? "");
    }
  }, [selectedBatchId, courseExams, selectedExamId]);

  // Load marks for selected exam (API mode)
  useEffect(() => {
    if (!API_ENABLED || !selectedExam?.id) return;
    let cancelled = false;
    examsService
      .getMarks(selectedExam.id, selectedExam.max)
      .then(fetched => {
        if (cancelled) return;
        setExamMarks(prev => {
          const rest = prev.filter(m => m.examId !== selectedExam.id);
          return [...rest, ...fetched];
        });
      })
      .catch(() => {
        /* keep existing marks */
      });
    return () => {
      cancelled = true;
    };
  }, [selectedExam?.id, selectedExam?.max, setExamMarks]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    const course = courses.find(c => c.id === courseId);
    const nextBatches = batches.filter(b => batchBelongsToCourse(b, course));
    setSelectedBatchId(nextBatches[0]?.id ?? "");
    setSelectedExamId("");
  };

  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedExamId("");
  };

  const handleCreateExam = async (data: Omit<Exam, "id" | "status">) => {
    const id = genId("EXM", exams);
    try {
      if (API_ENABLED) {
        const exam = await examsService.create(
          { ...data, status: "Upcoming" },
          courses,
          batches,
          id
        );
        addExam(exam);
      } else {
        addExam({ id, status: "Upcoming", ...data });
      }
      toast.success(`Exam "${data.title}" scheduled for ${data.date}`);
      setShowCreateExam(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create exam");
    }
  };

  const updateMark = (studentId: string, raw: string) => {
    const examId = selectedExam?.id;
    if (!examId) return;
    const max = selectedExam.max ?? 100;
    const val = Math.max(0, Math.min(max, parseInt(raw, 10) || 0));
    const grade = calcGrade(max > 0 ? (val / max) * 100 : 0);
    setExamMarks(prev => {
      const rest = prev.filter(m => !(m.examId === examId && m.studentId === studentId));
      const student = students.find(s => s.id === studentId);
      return [
        ...rest,
        {
          examId,
          studentId,
          studentName: student?.name ?? studentId,
          marks: val,
          grade,
        },
      ];
    });
  };

  const handleDeleteExam = async () => {
    if (!deleteTarget) return;
    try {
      if (API_ENABLED) await examsService.remove(deleteTarget.id);
      deleteExam(deleteTarget.id);
      setExamMarks(prev => prev.filter(m => m.examId !== deleteTarget.id));
      toast.success(`Exam "${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete exam");
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) {
      toast.error("Select an exam first");
      return;
    }
    try {
      if (API_ENABLED) {
        await examsService.saveMarks(
          selectedExam.id,
          displayMarks.map(m => ({ studentId: m.studentId, marks: m.marks }))
        );
      }
      toast.success("Marks saved successfully!", {
        description: "Results are now visible in the Results tab.",
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save marks");
    }
  };

  const exportMarks = () => {
    const max = selectedExam?.max ?? 100;
    handleExport(
      "Exam Marks",
      displayMarks.map(m => ({
        "Student ID": m.studentId,
        Name: m.studentName,
        Marks: m.marks,
        "Max Marks": max,
        "%": max > 0 ? Math.round((m.marks / max) * 100) : 0,
        Grade: m.grade,
      }))
    );
  };

  const exportResults = () => {
    const max = selectedExam?.max ?? 100;
    const sorted = [...displayMarks].sort((a, b) => b.marks - a.marks);
    handleExport(
      "Results",
      sorted.map(m => ({
        "Student ID": m.studentId,
        Name: m.studentName,
        Marks: m.marks,
        "Max Marks": max,
        "%": max > 0 ? Math.round((m.marks / max) * 100) : 0,
        Grade: m.grade,
      }))
    );
  };

  const filterPanel = (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-foreground">Filter</h3>
      <div className="space-y-3">
        <FormField label="Course">
          <select
            className={selectCls}
            value={selectedCourseId}
            onChange={e => handleCourseChange(e.target.value)}
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Batch">
          <select
            className={selectCls}
            value={selectedBatchId}
            onChange={e => handleBatchChange(e.target.value)}
            disabled={courseBatches.length === 0}
          >
            {courseBatches.length === 0 ? (
              <option value="">No batches</option>
            ) : (
              courseBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))
            )}
          </select>
        </FormField>
        <FormField label="Exam">
          <select
            className={selectCls}
            value={selectedExam?.id ?? ""}
            onChange={e => setSelectedExamId(e.target.value)}
            disabled={courseExams.length === 0}
          >
            {courseExams.length === 0 ? (
              <option value="">No exams</option>
            ) : (
              courseExams.map(e => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))
            )}
          </select>
        </FormField>
      </div>
    </Card>
  );

  const maxMarks = selectedExam?.max ?? 100;

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
                    {["Exam ID", "Title", "Course", "Batch", "Date", "Max Marks", "Status", ""].map(h => (
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
                      <td className="px-4 py-3">
                        <Btn size="sm" variant="ghost" onClick={() => setDeleteTarget(e)}>
                          <Trash2 size={13} />
                        </Btn>
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
          {filterPanel}
          <Card className="lg:col-span-3 p-4">
            <h3 className="text-sm font-semibold mb-3 text-foreground">
              Enter Marks – {selectedExam?.title ?? "Select exam"} (out of {maxMarks})
            </h3>
            {!selectedBatch ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Select a course and batch to enter marks.
              </p>
            ) : displayMarks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No students in this batch.
              </p>
            ) : !selectedExam ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No exams scheduled for this batch. Create an exam first.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left text-xs font-semibold text-muted-foreground py-2 pr-4">
                        Student
                      </th>
                      {["Marks", "%", "Grade"].map(h => (
                        <th
                          key={h}
                          className="text-center text-xs font-semibold text-muted-foreground py-2 px-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayMarks.map(r => {
                      const pct = maxMarks > 0 ? Math.round((r.marks / maxMarks) * 100) : 0;
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
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="number"
                              min={0}
                              max={maxMarks}
                              value={r.marks}
                              onChange={e => updateMark(r.studentId, e.target.value)}
                              className="w-20 text-center px-2 py-1.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 bg-transparent text-foreground"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center font-semibold text-foreground">
                            {pct}%
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
            )}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
              <Btn variant="secondary" onClick={exportMarks} disabled={!selectedExam}>
                <Download size={14} /> Export
              </Btn>
              <Btn onClick={handleSaveMarks} disabled={!selectedExam}>
                <CheckCircle2 size={14} /> Save Marks
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {tab === "results" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {filterPanel}
          <Card className="lg:col-span-3">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Results – {selectedExam?.title ?? "Select exam"}
                {selectedBatch ? ` · ${selectedBatch.name}` : ""}
              </h3>
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm" onClick={handlePrint}>
                  <Printer size={13} /> Print
                </Btn>
                <Btn variant="secondary" size="sm" onClick={exportResults} disabled={!selectedExam}>
                  <Download size={13} /> Export
                </Btn>
              </div>
            </div>
            {!selectedExam ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Select a course, batch, and exam to view results.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/20">
                    <tr>
                      {["Student", "Marks", "Max", "%", "Grade", "Progress"].map(h => (
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
                    {[...displayMarks]
                      .sort((a, b) => b.marks - a.marks)
                      .map((r, i) => {
                        const pct = maxMarks > 0 ? Math.round((r.marks / maxMarks) * 100) : 0;
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
                            <td className="px-4 py-3 text-sm font-bold text-foreground text-center">
                              {r.marks}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                              {maxMarks}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-foreground text-center">
                              {pct}%
                            </td>
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
            )}
          </Card>
        </div>
      )}

      {showCreateExam && (
        <ExamFormModal
          courses={courses}
          batches={batches}
          onSave={handleCreateExam}
          onClose={() => setShowCreateExam(false)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Exam"
          message={`Delete "${deleteTarget.title}"? Saved marks for this exam will also be removed.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteExam}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default ExamsPage;
