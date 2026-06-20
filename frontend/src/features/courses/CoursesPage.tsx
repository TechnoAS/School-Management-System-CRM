import { useState, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Plus, BookOpen, Eye, Edit2, Trash2 } from "lucide-react";
import { Course } from "@/types";
import { SectionHeader, Btn, Card, StatusBadge as Badge, ConfirmDialog, EmptyState } from "@/components/shared";
import { genId } from "@/lib/utils";
import { CourseFormModal } from "./CourseFormModal";
import { CourseDetailModal } from "./CourseDetailModal";
import { API_ENABLED } from "@/api/config";
import { coursesService } from "@/api/services/courses.service";
import { ApiError } from "@/api/client";

export function CoursesPage({
  courses,
  setCourses,
}: {
  courses: Course[];
  setCourses: Dispatch<SetStateAction<Course[]>>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [viewTarget, setViewTarget] = useState<Course | null>(null);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.enrolled > 0) {
      toast.error("Cannot delete — students are enrolled in this course");
      setDeleteTarget(null);
      return;
    }
    if (deleteTarget.batches > 0) {
      toast.error("Cannot delete — batches exist for this course");
      setDeleteTarget(null);
      return;
    }
    try {
      if (API_ENABLED) await coursesService.remove(deleteTarget.id);
      setCourses(prev => prev.filter(c => c.id !== deleteTarget.id));
      toast.success(`Course "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete course");
    }
  };

  const handleAdd = async (data: Omit<Course, "id" | "batches" | "enrolled">) => {
    const id = genId("CRS", courses);
    try {
      if (API_ENABLED) {
        const course = await coursesService.create(data, id);
        setCourses(prev => [{ ...course, batches: 0, enrolled: 0 }, ...prev]);
      } else {
        setCourses(prev => [{ id, batches: 0, enrolled: 0, ...data }, ...prev]);
      }
      toast.success(`Course "${data.name}" created successfully!`);
      setShowAdd(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create course");
    }
  };

  const handleEdit = async (data: Omit<Course, "id" | "batches" | "enrolled">) => {
    if (!editTarget) return;
    try {
      if (API_ENABLED) {
        const course = await coursesService.update(editTarget.id, data);
        setCourses(prev =>
          prev.map(c => (c.id === editTarget.id ? { ...c, ...course } : c))
        );
      } else {
        setCourses(prev => prev.map(c => (c.id === editTarget.id ? { ...c, ...data } : c)));
      }
      toast.success("Course updated successfully.");
      setEditTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update course");
    }
  };

  return (
    <div>
      <SectionHeader
        title="Course Management"
        subtitle={`${courses.length} courses · ${courses.filter(c => c.status === "Active").length} active`}
        action={
          <Btn onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Create Course
          </Btn>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.length === 0 ? (
          <Card className="col-span-full">
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description="Create your first course to start enrolling students."
              action={<Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Create Course</Btn>}
            />
          </Card>
        ) : (
        courses.map(c => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen size={18} className="text-primary" />
              </div>
              <Badge status={c.status} />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{c.name}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {c.description}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Duration</p>
                <p className="text-xs font-bold text-foreground">{c.duration}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Fees</p>
                <p className="text-xs font-bold text-foreground">
                  ₹{(c.fees / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Enrolled</p>
                <p className="text-xs font-bold text-foreground">{c.enrolled}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Btn
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => setViewTarget(c)}
              >
                <Eye size={12} /> View
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => setEditTarget(c)}
              >
                <Edit2 size={12} /> Edit
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                onClick={() => setDeleteTarget(c)}
              >
                <Trash2 size={12} />
              </Btn>
            </div>
          </Card>
        )))}
      </div>

      {showAdd && (
        <CourseFormModal
          title="Create New Course"
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editTarget && (
        <CourseFormModal
          title="Edit Course"
          initial={editTarget}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
      {viewTarget && (
        <CourseDetailModal
          course={viewTarget}
          onEdit={() => {
            setEditTarget(viewTarget);
            setViewTarget(null);
          }}
          onClose={() => setViewTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Course"
          message={`Delete "${deleteTarget.name}"? This cannot be undone.${
            deleteTarget.enrolled > 0 || deleteTarget.batches > 0
              ? " Remove enrolled students and batches first."
              : ""
          }`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default CoursesPage;
