import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ChevronRight, BookOpen } from "lucide-react";
import { Course } from "@/types";
import { SectionHeader } from "@/components/shared";
import { genId } from "@/lib/utils";
import { API_ENABLED } from "@/api/config";
import { coursesService } from "@/api/services/courses.service";
import { ApiError } from "@/api/client";
import { CourseForm } from "./CourseForm";

export function CourseFormPage({
  courses,
  setCourses,
}: {
  courses: Course[];
  setCourses: Dispatch<SetStateAction<Course[]>>;
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [course, setCourse] = useState<Course | undefined>(
    () => (id ? courses.find(c => c.id === id) : undefined)
  );

  useEffect(() => {
    if (!isEdit || !id) return;
    if (!API_ENABLED) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    coursesService
      .get(id)
      .then(c => {
        if (!cancelled) {
          setCourse(c);
          setCourses(prev => prev.map(x => (x.id === c.id ? { ...x, ...c } : x)));
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load course");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, setCourses]);

  const syncCourse = (updated: Course) => {
    setCourse(updated);
    setCourses(prev => prev.map(c => (c.id === updated.id ? { ...c, ...updated } : c)));
  };

  const uploadFiles = async (
    courseId: string,
    files?: { logo?: File | null; banner?: File | null; materials?: { id: string; title: string; file: File }[] }
  ) => {
    if (!API_ENABLED || !files) return undefined;
    let updated: Course | undefined;
    if (files.logo) {
      updated = await coursesService.uploadLogo(courseId, files.logo);
    }
    if (files.banner) {
      updated = await coursesService.uploadBanner(courseId, files.banner);
    }
    if (files.materials?.length) {
      for (const mat of files.materials) {
        updated = await coursesService.uploadMaterial(courseId, mat.file, mat.title, mat.id);
      }
    }
    return updated;
  };

  const handleSave = async (
    data: Omit<Course, "id" | "batches" | "enrolled">,
    files?: { logo?: File | null; banner?: File | null; materials?: { id: string; title: string; file: File }[] }
  ) => {
    setSaving(true);
    try {
      if (isEdit && id) {
        let updated: Course;
        if (API_ENABLED) {
          updated = await coursesService.update(id, data);
          const withFiles = await uploadFiles(id, files);
          if (withFiles) updated = withFiles;
        } else {
          updated = { ...course!, ...data };
        }
        setCourses(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
        toast.success("Course updated successfully.");
        navigate("/courses");
        return;
      }

      const newId = genId("CRS", courses);
      if (API_ENABLED) {
        let created = await coursesService.create(data, newId);
        const withFiles = await uploadFiles(newId, files);
        if (withFiles) created = withFiles;
        setCourses(prev => [{ ...created, batches: 0, enrolled: 0 }, ...prev]);
      } else {
        setCourses(prev => [{ id: newId, batches: 0, enrolled: 0, ...data }, ...prev]);
      }
      toast.success(`Course "${data.name}" created successfully!`);
      navigate("/courses");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading course…
      </div>
    );
  }

  if (isEdit && !course) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground mb-4">Course not found</p>
        <button onClick={() => navigate("/courses")} className="text-sm text-primary hover:underline">
          Back to courses
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full">
      <button
        onClick={() => navigate("/courses")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronRight size={14} className="rotate-180" /> Back to Courses
      </button>

      <SectionHeader
        title={isEdit ? "Edit Course" : "Create Course"}
        subtitle={
          isEdit
            ? `Update details, branding, and materials for ${course?.name}`
            : "Set up a new course with schedule, branding, and study materials"
        }
        action={
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border">
            <BookOpen size={12} /> {isEdit ? "Editing" : "New course"}
          </span>
        }
      />

      <CourseForm
        key={course?.id ?? "new"}
        initial={course}
        onSave={handleSave}
        onCancel={() => navigate("/courses")}
        saving={saving}
        onUploadLogo={
          isEdit && id
            ? async file => syncCourse(await coursesService.uploadLogo(id, file))
            : undefined
        }
        onUploadBanner={
          isEdit && id
            ? async file => syncCourse(await coursesService.uploadBanner(id, file))
            : undefined
        }
        onUploadMaterial={
          isEdit && id
            ? async (file, title) => syncCourse(await coursesService.uploadMaterial(id, file, title))
            : undefined
        }
        onRemoveMaterial={
          isEdit && id
            ? async materialId => syncCourse(await coursesService.removeMaterial(id, materialId))
            : undefined
        }
      />
    </div>
  );
}

export default CourseFormPage;
