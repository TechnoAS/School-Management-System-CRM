import { useState, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ChevronRight, UserPlus, Wrench } from "lucide-react";
import { Student, Course, Batch } from "@/types";
import { SectionHeader, Tabs } from "@/components/shared";
import { genId } from "@/lib/utils";
import { API_ENABLED } from "@/api/config";
import { studentsService } from "@/api/services/students.service";
import { ApiError } from "@/api/client";
import { useAppStore } from "@/store/useAppStore";
import { DEFAULT_ADMISSION_FORM } from "@/lib/defaultAdmissionForm";
import { StudentAdmissionForm } from "./StudentAdmissionForm";
import { AdmissionFormCustomizer } from "./AdmissionFormCustomizer";

type PageMode = "enroll" | "builder";

export function StudentAdmissionPage({
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
  const navigate = useNavigate();
  const user = useAppStore(s => s.user);
  const settings = useAppStore(s => s.settings);
  const updateSettings = useAppStore(s => s.updateSettings);
  const admissionForm = settings.admissionForm ?? DEFAULT_ADMISSION_FORM;

  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<PageMode>("enroll");
  const isSuperAdmin = user?.role === "super_admin";

  const tabs = [
    { id: "enroll", label: "Enroll Student" },
    ...(isSuperAdmin ? [{ id: "builder", label: "Form Builder" }] : []),
  ];

  const handleSave = async (
    data: Omit<Student, "id">,
    photoFile?: File | null,
    documentFiles?: Record<string, File>
  ) => {
    const id = genId("STU", students);
    setSaving(true);
    try {
      if (API_ENABLED) {
        let student = await studentsService.create(data, courses, batches, id);
        if (photoFile) {
          student = await studentsService.uploadPhoto(student.id, photoFile);
        }
        if (documentFiles) {
          for (const slot of admissionForm.documentSlots) {
            const file = documentFiles[slot.id];
            if (file) {
              student = await studentsService.uploadDocument(student.id, slot.id, slot.label, file);
            }
          }
        }
        setStudents(prev => [student, ...prev]);
      } else {
        setStudents(prev => [{ id, ...data }, ...prev]);
      }
      toast.success(`${data.name} enrolled successfully!`, { description: `Student ID: ${id}` });
      navigate("/students");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-full">
      <button
        onClick={() => navigate("/students")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronRight size={14} className="rotate-180" /> Back to Students
      </button>

      <SectionHeader
        title="Student Admission"
        subtitle={
          mode === "enroll"
            ? "Fill in student details and upload documents to complete enrollment"
            : "Configure extra fields and document requirements for all admissions"
        }
        action={
          mode === "builder" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Wrench size={12} /> Super Admin
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border">
              <UserPlus size={12} /> New enrollment
            </span>
          )
        }
      />

      {isSuperAdmin && (
        <Tabs
          tabs={tabs}
          active={mode}
          onChange={id => setMode(id as PageMode)}
        />
      )}

      {mode === "enroll" ? (
        <StudentAdmissionForm
          courses={courses}
          batches={batches}
          admissionForm={admissionForm}
          onSave={handleSave}
          onCancel={() => navigate("/students")}
          saving={saving}
        />
      ) : (
        <AdmissionFormCustomizer
          config={admissionForm}
          onSave={saved => {
            updateSettings({ admissionForm: saved });
            toast.success("Form updated — switch to Enroll Student to use it");
          }}
          onCancel={() => setMode("enroll")}
        />
      )}
    </div>
  );
}

export default StudentAdmissionPage;
