import { useState, ChangeEvent } from "react";
import { toast } from "sonner";
import { Camera, Trash2, BadgeCheck } from "lucide-react";
import { Student, Course, Batch } from "@/types";
import {
  Modal,
  FormField,
  Btn,
  AvatarChip as Avatar,
  inputCls,
  selectCls,
} from "@/components/shared";
import { TODAY } from "@/lib/utils";
import { studentFormSchema } from "@/lib/validation/student";
import { validateForm } from "@/lib/validation/formErrors";

export function StudentFormModal({
  title,
  initial,
  courses,
  batches,
  onSave,
  onClose,
}: {
  title: string;
  initial?: Student;
  courses: Course[];
  batches: Batch[];
  onSave: (data: Omit<Student, "id">) => void;
  onClose: () => void;
}) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    dob: initial?.dob ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    course: initial?.course ?? "",
    batch: initial?.batch ?? "",
    guardian: initial?.guardian ?? "",
    guardianPhone: initial?.guardianPhone ?? "",
    status: initial?.status ?? "Active",
    grade: initial?.grade ?? "-",
    admissionDate: initial?.admissionDate ?? TODAY,
    feesTotal: initial?.feesTotal ?? 0,
    feesPaid: initial?.feesPaid ?? 0,
    photo: initial?.photo ?? "",
  });
  const up = (k: string) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setF(prev => ({ ...prev, photo: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const payload = {
      ...f,
      feesTotal: initial ? f.feesTotal : (courses.find(c => c.name === f.course)?.fees ?? 0),
      feesPaid: initial ? f.feesPaid : 0,
    };
    const checked = validateForm(studentFormSchema, payload);
    if (!checked.ok) {
      toast.error(checked.message);
      return;
    }
    onSave(checked.data);
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
        <Avatar name={f.name || "Student"} size="lg" src={f.photo || undefined} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground mb-0.5">Student Photo</p>
          <p className="text-xs text-muted-foreground mb-2">Upload a passport-style photo (JPG/PNG, max 2 MB).</p>
          <div className="flex gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground border border-border hover:bg-secondary/70 transition-all cursor-pointer">
              <Camera size={12} /> {f.photo ? "Change Photo" : "Upload Photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
            {f.photo && (
              <button
                type="button"
                onClick={() => up("photo")("")}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-all"
              >
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Full Name">
          <input className={inputCls} value={f.name} onChange={e => up("name")(e.target.value)} placeholder="Enter full name" />
        </FormField>
        <FormField label="Date of Birth">
          <input className={inputCls} type="date" value={f.dob} onChange={e => up("dob")(e.target.value)} />
        </FormField>
        <FormField label="Phone Number">
          <input className={inputCls} value={f.phone} onChange={e => up("phone")(e.target.value)} placeholder="10-digit mobile" />
        </FormField>
        <FormField label="Email Address">
          <input className={inputCls} type="email" value={f.email} onChange={e => up("email")(e.target.value)} placeholder="student@email.com" />
        </FormField>
        <div className="col-span-2">
          <FormField label="Address">
            <input className={inputCls} value={f.address} onChange={e => up("address")(e.target.value)} placeholder="Full address" />
          </FormField>
        </div>
        <FormField label="Course">
          <select className={selectCls} value={f.course} onChange={e => up("course")(e.target.value)}>
            <option value="">Select course</option>
            {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField label="Batch">
          <select className={selectCls} value={f.batch} onChange={e => up("batch")(e.target.value)}>
            <option value="">Select batch</option>
            {batches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        </FormField>
        <FormField label="Guardian Name">
          <input className={inputCls} value={f.guardian} onChange={e => up("guardian")(e.target.value)} placeholder="Parent / Guardian name" />
        </FormField>
        <FormField label="Guardian Phone">
          <input className={inputCls} value={f.guardianPhone} onChange={e => up("guardianPhone")(e.target.value)} placeholder="Guardian mobile" />
        </FormField>
        {initial && (
          <>
            <FormField label="Status">
              <select className={selectCls} value={f.status} onChange={e => up("status")(e.target.value)}>
                <option>Active</option><option>Completed</option><option>Inactive</option>
              </select>
            </FormField>
            <FormField label="Grade">
              <select className={selectCls} value={f.grade} onChange={e => up("grade")(e.target.value)}>
                <option>A+</option><option>A</option><option>B+</option><option>B</option><option>C</option><option>-</option>
              </select>
            </FormField>
          </>
        )}
      </div>
      <div className="flex items-center justify-between mt-5 pt-5 border-t border-border">
        <p className="text-xs text-muted-foreground">{initial ? "Changes will update the student record." : "Student ID will be auto-generated."}</p>
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSave}><BadgeCheck size={14} /> {initial ? "Save Changes" : "Enroll Student"}</Btn>
        </div>
      </div>
    </Modal>
  );
}

export default StudentFormModal;
