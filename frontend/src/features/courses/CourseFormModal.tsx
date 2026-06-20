import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Course } from "@/types";
import { Modal, FormField, Btn, inputCls, selectCls } from "@/components/shared";
import { courseFormSchema } from "@/lib/validation/course";
import { validateForm } from "@/lib/validation/formErrors";

export function CourseFormModal({
  title,
  initial,
  onSave,
  onClose,
}: {
  title: string;
  initial?: Course;
  onSave: (d: Omit<Course, "id" | "batches" | "enrolled">) => void;
  onClose: () => void;
}) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    duration: initial?.duration ?? "",
    fees: String(initial?.fees ?? ""),
    description: initial?.description ?? "",
    status: initial?.status ?? "Active",
  });
  const up = (k: string) => (v: string) => setF(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    const checked = validateForm(courseFormSchema, {
      name: f.name,
      duration: f.duration,
      fees: f.fees,
      description: f.description,
      status: f.status as "Active" | "Inactive",
    });
    if (!checked.ok) {
      toast.error(checked.message);
      return;
    }
    onSave({
      ...checked.data,
      description: checked.data.description ?? "",
    });
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormField label="Course Name">
            <input
              className={inputCls}
              value={f.name}
              onChange={e => up("name")(e.target.value)}
              placeholder="e.g. Full Stack Web Development"
            />
          </FormField>
        </div>
        <FormField label="Duration">
          <input
            className={inputCls}
            value={f.duration}
            onChange={e => up("duration")(e.target.value)}
            placeholder="e.g. 6 Months"
          />
        </FormField>
        <FormField label="Course Fees (₹)">
          <input
            className={inputCls}
            type="number"
            value={f.fees}
            onChange={e => up("fees")(e.target.value)}
            placeholder="25000"
          />
        </FormField>
        <div className="col-span-2">
          <FormField label="Description">
            <textarea
              rows={3}
              value={f.description}
              onChange={e => up("description")(e.target.value)}
              placeholder="Course description and topics covered…"
              className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </FormField>
        </div>
        <FormField label="Status">
          <select className={selectCls} value={f.status} onChange={e => up("status")(e.target.value)}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </FormField>
      </div>
      <div className="flex justify-end gap-2 mt-5 pt-5 border-t border-border">
        <Btn variant="secondary" onClick={onClose}>
          Cancel
        </Btn>
        <Btn onClick={handleSave}>
          <Plus size={14} /> {initial ? "Save Changes" : "Create Course"}
        </Btn>
      </div>
    </Modal>
  );
}

export default CourseFormModal;
