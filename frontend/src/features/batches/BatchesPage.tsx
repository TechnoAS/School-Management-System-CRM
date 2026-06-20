import { useState, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import {
  Plus,
  Clock,
  Users2,
  UserCog,
  Calendar,
  Users,
  ClipboardCheck,
  Edit2,
  Trash2,
} from "lucide-react";
import { Batch, Course, FacultyMember, Student } from "@/types";
import { SectionHeader, Btn, Card, StatusBadge as Badge, ConfirmDialog, EmptyState } from "@/components/shared";
import { genId } from "@/lib/utils";
import { BatchFormModal } from "./BatchFormModal";
import { BatchStudentsModal } from "./BatchStudentsModal";
import { API_ENABLED } from "@/api/config";
import { batchesService } from "@/api/services/batches.service";
import { ApiError } from "@/api/client";

export interface BatchesPageProps {
  batches: Batch[];
  setBatches: Dispatch<SetStateAction<Batch[]>>;
  courses: Course[];
  faculty: FacultyMember[];
  students: Student[];
  onNavigate: (page: string) => void;
}

export function BatchesPage({
  batches,
  setBatches,
  courses,
  faculty,
  students,
  onNavigate,
}: BatchesPageProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Batch | null>(null);
  const [studentsTarget, setStudentsTarget] = useState<Batch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null);

  const batchStudentCount = (b: Batch) => students.filter(s => s.batch === b.name).length;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const count = batchStudentCount(deleteTarget);
    if (count > 0) {
      toast.error(`Cannot delete — ${count} student(s) enrolled in this batch`);
      setDeleteTarget(null);
      return;
    }
    try {
      if (API_ENABLED) await batchesService.remove(deleteTarget.id);
      setBatches(prev => prev.filter(b => b.id !== deleteTarget.id));
      toast.success(`Batch "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete batch");
    }
  };

  const handleAdd = async (data: Omit<Batch, "id">) => {
    const id = genId("BAT", batches);
    try {
      if (API_ENABLED) {
        const batch = await batchesService.create(data, courses, faculty, id);
        setBatches(prev => [{ ...batch, students: 0 }, ...prev]);
      } else {
        setBatches(prev => [{ id, ...data }, ...prev]);
      }
      toast.success(`Batch "${data.name}" created!`);
      setShowAdd(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create batch");
    }
  };

  const handleEdit = async (data: Omit<Batch, "id">) => {
    if (!editTarget) return;
    try {
      if (API_ENABLED) {
        const batch = await batchesService.update(editTarget.id, data, courses, faculty);
        setBatches(prev =>
          prev.map(b => (b.id === editTarget.id ? { ...b, ...batch } : b))
        );
      } else {
        setBatches(prev => prev.map(b => (b.id === editTarget.id ? { ...b, ...data } : b)));
      }
      toast.success("Batch updated successfully.");
      setEditTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update batch");
    }
  };

  return (
    <div>
      <SectionHeader
        title="Batch Management"
        subtitle={`${batches.length} batches · ${batches.filter(b => b.status === "Upcoming").length} upcoming`}
        action={
          <Btn onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Create Batch
          </Btn>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {batches.length === 0 ? (
          <Card className="col-span-full">
            <EmptyState
              icon={Users2}
              title="No batches yet"
              description="Create a batch to assign students and mark attendance."
              action={<Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Create Batch</Btn>}
            />
          </Card>
        ) : (
        batches.map(b => (
          <Card key={b.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{b.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{b.course}</p>
              </div>
              <Badge status={b.status} />
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock size={12} /> {b.timing}
              </div>
              <div className="flex items-center gap-1.5">
                <Users2 size={12} /> {students.filter(s => s.batch === b.name).length} enrolled
              </div>
              <div className="flex items-center gap-1.5">
                <UserCog size={12} /> {b.faculty}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} /> {b.startDate} – {b.endDate}
              </div>
            </div>
            <div className="flex gap-2">
              <Btn
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => setStudentsTarget(b)}
              >
                <Users size={12} /> Students
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => onNavigate("attendance")}
              >
                <ClipboardCheck size={12} /> Attendance
              </Btn>
              <Btn variant="secondary" size="sm" onClick={() => setEditTarget(b)}>
                <Edit2 size={12} />
              </Btn>
              <Btn variant="secondary" size="sm" onClick={() => setDeleteTarget(b)}>
                <Trash2 size={12} />
              </Btn>
            </div>
          </Card>
        )))}
      </div>

      {showAdd && (
        <BatchFormModal
          title="Create New Batch"
          courses={courses}
          faculty={faculty}
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editTarget && (
        <BatchFormModal
          title="Edit Batch"
          initial={editTarget}
          courses={courses}
          faculty={faculty}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
      {studentsTarget && (
        <BatchStudentsModal
          batch={studentsTarget}
          students={students}
          onClose={() => setStudentsTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Batch"
          message={`Delete "${deleteTarget.name}"? ${
            batchStudentCount(deleteTarget) > 0
              ? "Reassign or remove enrolled students first."
              : "This cannot be undone."
          }`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default BatchesPage;
