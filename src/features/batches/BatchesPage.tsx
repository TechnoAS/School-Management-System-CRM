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
} from "lucide-react";
import { Batch, Course, FacultyMember, Student } from "@/types";
import { SectionHeader, Btn, Card, StatusBadge as Badge } from "@/components/shared";
import { genId } from "@/lib/utils";
import { BatchFormModal } from "./BatchFormModal";
import { BatchStudentsModal } from "./BatchStudentsModal";

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

  const handleAdd = (data: Omit<Batch, "id">) => {
    const id = genId("BAT", batches);
    setBatches(prev => [{ id, ...data }, ...prev]);
    toast.success(`Batch "${data.name}" created!`);
    setShowAdd(false);
  };

  const handleEdit = (data: Omit<Batch, "id">) => {
    if (!editTarget) return;
    setBatches(prev => prev.map(b => (b.id === editTarget.id ? { ...b, ...data } : b)));
    toast.success("Batch updated successfully.");
    setEditTarget(null);
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
        {batches.map(b => (
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
            </div>
          </Card>
        ))}
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
    </div>
  );
}

export default BatchesPage;
