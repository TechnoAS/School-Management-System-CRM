import { useState, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Plus, BookOpen, Eye, Edit2, Trash2 } from "lucide-react";
import { Course } from "@/types";
import { SectionHeader, Btn, Card, StatusBadge as Badge, ConfirmDialog, EmptyState } from "@/components/shared";
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
  const navigate = useNavigate();
  const [viewTarget, setViewTarget] = useState<Course | null>(null);
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

  return (
    <div>
      <SectionHeader
        title="Course Management"
        subtitle={`${courses.length} courses · ${courses.filter(c => c.status === "Active").length} active`}
        action={
          <Btn onClick={() => navigate("/courses/new")}>
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
              action={<Btn onClick={() => navigate("/courses/new")}><Plus size={14} /> Create Course</Btn>}
            />
          </Card>
        ) : (
        courses.map(c => (
          <Card key={c.id} className="p-0 overflow-hidden border-border/80 hover:shadow-md transition-shadow">
            <div className="relative aspect-[3/1] bg-gradient-to-br from-primary/12 to-muted/50">
              {c.banner ? (
                <img src={c.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen size={22} className="text-primary/25" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-4 translate-y-1/2 w-11 h-11 rounded-xl border-2 border-background bg-muted overflow-hidden shadow-md flex items-center justify-center">
                {c.logo ? (
                  <img src={c.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={16} className="text-primary" />
                )}
              </div>
            </div>
            <div className="p-5 pt-9">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground pr-2 line-clamp-1">{c.name}</h3>
              <Badge status={c.status} />
            </div>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {c.description || "No description"}
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
                onClick={() => navigate(`/courses/${c.id}/edit`)}
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
            </div>
          </Card>
        )))}
      </div>

      {viewTarget && (
        <CourseDetailModal
          course={viewTarget}
          onEdit={() => {
            navigate(`/courses/${viewTarget.id}/edit`);
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
