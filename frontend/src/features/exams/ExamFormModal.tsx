import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Course, Batch, Exam } from "@/types";
import { Modal, FormField, Btn, inputCls, selectCls } from "@/components/shared";
import { TODAY } from "@/lib/utils";
import { examFormSchema } from "@/lib/validation/exam";
import { validateForm } from "@/lib/validation/formErrors";

export interface ExamFormModalProps {
  courses: Course[];
  batches: Batch[];
  onSave: (d: Omit<Exam, "id" | "status">) => void;
  onClose: () => void;
}

export function ExamFormModal({ courses, batches, onSave, onClose }: ExamFormModalProps) {
  const [f, setF] = useState({ title: "", course: "", batch: "", date: TODAY, max: "100" });
  const up = (k: string) => (v: string) => setF(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    const checked = validateForm(examFormSchema, f);
    if (!checked.ok) {
      toast.error(checked.message);
      return;
    }
    onSave({
      title: checked.data.title,
      course: checked.data.course,
      batch: checked.data.batch,
      date: checked.data.date,
      max: checked.data.max,
    });
  };

  return (
    <Modal title="Create New Exam" onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormField label="Exam Title">
            <input
              className={inputCls}
              value={f.title}
              onChange={e => up("title")(e.target.value)}
              placeholder="e.g. Module 1 Assessment"
            />
          </FormField>
        </div>
        <FormField label="Course">
          <select className={selectCls} value={f.course} onChange={e => up("course")(e.target.value)}>
            <option value="">Select course</option>
            {courses.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Batch">
          <select className={selectCls} value={f.batch} onChange={e => up("batch")(e.target.value)}>
            <option value="">Select batch</option>
            {batches.map(b => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Exam Date">
          <input className={inputCls} type="date" value={f.date} onChange={e => up("date")(e.target.value)} />
        </FormField>
        <FormField label="Maximum Marks">
          <input
            className={inputCls}
            type="number"
            value={f.max}
            onChange={e => up("max")(e.target.value)}
            placeholder="100"
          />
        </FormField>
      </div>
      <div className="flex justify-end gap-2 mt-5 pt-5 border-t border-border">
        <Btn variant="secondary" onClick={onClose}>
          Cancel
        </Btn>
        <Btn onClick={handleSave}>
          <Plus size={14} /> Create Exam
        </Btn>
      </div>
    </Modal>
  );
}
