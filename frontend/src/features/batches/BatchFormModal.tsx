import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Batch, Course, FacultyMember } from "@/types";
import { Modal, FormField, Btn, inputCls, selectCls } from "@/components/shared";
import { TODAY } from "@/lib/utils";
import { batchFormSchema } from "@/lib/validation/batch";
import { validateForm } from "@/lib/validation/formErrors";

export interface BatchFormModalProps {
  title: string;
  initial?: Batch;
  courses: Course[];
  faculty: FacultyMember[];
  onSave: (d: Omit<Batch, "id">) => void;
  onClose: () => void;
}

export function BatchFormModal({
  title,
  initial,
  courses,
  faculty,
  onSave,
  onClose,
}: BatchFormModalProps) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    course: initial?.course ?? "",
    faculty: initial?.faculty ?? "",
    startDate: initial?.startDate ?? TODAY,
    endDate: initial?.endDate ?? "",
    timing: initial?.timing ?? "",
    students: String(initial?.students ?? ""),
    status: (initial?.status ?? "Upcoming") as Batch["status"],
  });
  const up = (k: string) => (v: string) => setF(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    const checked = validateForm(batchFormSchema, f);
    if (!checked.ok) {
      toast.error(checked.message);
      return;
    }
    onSave(checked.data);
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormField label="Batch Name">
            <input className={inputCls} value={f.name} onChange={e => up("name")(e.target.value)} placeholder="e.g. Batch A – Morning" />
          </FormField>
        </div>
        <FormField label="Course">
          <select className={selectCls} value={f.course} onChange={e => up("course")(e.target.value)}>
            <option value="">Select course</option>
            {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField label="Assign Faculty">
          <select className={selectCls} value={f.faculty} onChange={e => up("faculty")(e.target.value)}>
            <option value="">Select faculty</option>
            {faculty.map(fm => <option key={fm.id} value={fm.name}>{fm.name}</option>)}
          </select>
        </FormField>
        <FormField label="Start Date">
          <input className={inputCls} type="date" value={f.startDate} onChange={e => up("startDate")(e.target.value)} />
        </FormField>
        <FormField label="End Date">
          <input className={inputCls} type="date" value={f.endDate} onChange={e => up("endDate")(e.target.value)} />
        </FormField>
        <FormField label="Timing">
          <input className={inputCls} value={f.timing} onChange={e => up("timing")(e.target.value)} placeholder="e.g. Mon–Sat 9:00 AM – 12:00 PM" />
        </FormField>
        <FormField label="Max Students">
          <input className={inputCls} type="number" value={f.students} onChange={e => up("students")(e.target.value)} placeholder="25" />
        </FormField>
        <FormField label="Status">
          <select className={selectCls} value={f.status} onChange={e => up("status")(e.target.value)}>
            <option>Upcoming</option><option>Ongoing</option><option>Completed</option>
          </select>
        </FormField>
      </div>
      <div className="flex justify-end gap-2 mt-5 pt-5 border-t border-border">
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}><Plus size={14} /> {initial ? "Save Changes" : "Create Batch"}</Btn>
      </div>
    </Modal>
  );
}
