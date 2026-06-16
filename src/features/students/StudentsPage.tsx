import { useState, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Plus, Search, X, Download, Eye, Edit2, Trash2 } from "lucide-react";
import { Student, Course, Batch } from "@/types";
import {
  SectionHeader,
  Btn,
  Card,
  ConfirmDialog,
  AvatarChip as Avatar,
  StatusBadge as Badge,
} from "@/components/shared";
import { genId, handleExport, FMT } from "@/lib/utils";
import { StudentProfile } from "./StudentProfile";
import { StudentFormModal } from "./StudentFormModal";

const PAGE_SIZE = 7;

export function StudentsPage({
  students,
  setStudents,
  courses,
  batches,
}: {
  students: Student[];
  setStudents: Dispatch<SetStateAction<Student[]>>;
  courses: Course[];
  batches: Batch[];
}) {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [selected, setSelected] = useState<Student | null>(null);

  if (selected) {
    return (
      <StudentProfile
        student={selected}
        onBack={() => setSelected(null)}
        onEdit={s => {
          setSelected(null);
          setEditTarget(s);
        }}
      />
    );
  }

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (
      (!q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q)) &&
      (courseFilter === "All Courses" || s.course === courseFilter) &&
      (statusFilter === "All Status" || s.status === statusFilter)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleAdd = (data: Omit<Student, "id">) => {
    const id = genId("STU", students);
    setStudents(prev => [{ id, ...data }, ...prev]);
    toast.success(`${data.name} enrolled successfully!`, { description: `Student ID: ${id}` });
    setShowAdd(false);
  };

  const handleEdit = (data: Omit<Student, "id">) => {
    if (!editTarget) return;
    setStudents(prev => prev.map(s => (s.id === editTarget.id ? { ...s, ...data } : s)));
    toast.success("Student record updated successfully.");
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setStudents(prev => prev.filter(s => s.id !== deleteTarget.id));
    toast.success(`${deleteTarget.name} has been removed.`);
    setDeleteTarget(null);
  };

  return (
    <div>
      <SectionHeader
        title="Student Management"
        subtitle={`${students.length} students enrolled across all courses`}
        action={
          <Btn onClick={() => setShowAdd(true)}>
            <Plus size={14} /> New Admission
          </Btn>
        }
      />
      <Card>
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search by name, ID, course…"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
            />
          </div>
          <select
            value={courseFilter}
            onChange={e => {
              setCourseFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Inactive</option>
          </select>
          {(courseFilter !== "All Courses" || statusFilter !== "All Status") && (
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => {
                setCourseFilter("All Courses");
                setStatusFilter("All Status");
              }}
            >
              <X size={12} /> Clear
            </Btn>
          )}
          <Btn variant="secondary" size="sm" onClick={() => handleExport("Students")}>
            <Download size={13} /> Export
          </Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/20 border-b border-border">
              <tr>
                {["Student ID", "Name", "Course", "Batch", "Admission", "Paid", "Due", "Status", ""].map(h => (
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
              {paginated.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                    i % 2 !== 0 ? "bg-muted/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.name} size="sm" src={s.photo} />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{s.course}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{s.batch}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{s.admissionDate}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-700">{FMT.format(s.feesPaid)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600">
                    {FMT.format(s.feesTotal - s.feesPaid)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={s.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelected(s)}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                        title="View"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => setEditTarget(s)}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No students match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Showing {paginated.length} of {filtered.length} students
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 text-xs rounded-lg ${
                  safePage === p
                    ? "bg-primary text-white"
                    : "border border-border hover:bg-muted transition-colors"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {showAdd && (
        <StudentFormModal
          title="New Student Admission"
          courses={courses}
          batches={batches}
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editTarget && (
        <StudentFormModal
          title="Edit Student"
          initial={editTarget}
          courses={courses}
          batches={batches}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Student"
          message={`Are you sure you want to remove ${deleteTarget.name} (${deleteTarget.id})? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default StudentsPage;
