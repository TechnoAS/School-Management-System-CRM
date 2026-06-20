import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { FacultyMember, Course } from "@/types";
import { Modal, FormField, Btn, inputCls, selectCls } from "@/components/shared";
import { facultyFormSchema } from "@/lib/validation/faculty";
import { validateForm } from "@/lib/validation/formErrors";

export interface FacultyFormModalProps {
  title: string;
  initial?: FacultyMember;
  courses: Course[];
  onSave: (d: Omit<FacultyMember, "id" | "attendance">) => void;
  onClose: () => void;
}

export function FacultyFormModal({
  title,
  initial,
  courses,
  onSave,
  onClose,
}: FacultyFormModalProps) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    subject: initial?.subject ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    qualification: initial?.qualification ?? "",
    experience: initial?.experience ?? "",
    salary: String(initial?.salary ?? ""),
  });
  const up = (k: string) => (v: string) => setF(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    const checked = validateForm(facultyFormSchema, f);
    if (!checked.ok) {
      toast.error(checked.message);
      return;
    }
    const d = checked.data;
    onSave({
      name: d.name,
      subject: d.subject,
      phone: (d.phone as string | null | undefined) ?? "",
      email: (d.email as string | null | undefined) ?? "",
      qualification: (d.qualification as string | null | undefined) ?? "",
      experience: (d.experience as string | null | undefined) ?? "",
      salary: d.salary,
    });
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Full Name">
          <input
            className={inputCls}
            value={f.name}
            onChange={e => up("name")(e.target.value)}
            placeholder="Faculty full name"
          />
        </FormField>
        <FormField label="Subject / Expertise">
          <input
            className={inputCls}
            value={f.subject}
            onChange={e => up("subject")(e.target.value)}
            placeholder="e.g. Full Stack Web Dev"
          />
        </FormField>
        <FormField label="Phone">
          <input
            className={inputCls}
            value={f.phone}
            onChange={e => up("phone")(e.target.value)}
            placeholder="Mobile number"
          />
        </FormField>
        <FormField label="Email">
          <input
            className={inputCls}
            type="email"
            value={f.email}
            onChange={e => up("email")(e.target.value)}
            placeholder="faculty@school.com"
          />
        </FormField>
        <FormField label="Qualification">
          <input
            className={inputCls}
            value={f.qualification}
            onChange={e => up("qualification")(e.target.value)}
            placeholder="e.g. B.Tech, MBA"
          />
        </FormField>
        <FormField label="Experience">
          <input
            className={inputCls}
            value={f.experience}
            onChange={e => up("experience")(e.target.value)}
            placeholder="e.g. 5 Years"
          />
        </FormField>
        <FormField label="Monthly Salary (₹)">
          <input
            className={inputCls}
            type="number"
            value={f.salary}
            onChange={e => up("salary")(e.target.value)}
            placeholder="35000"
          />
        </FormField>
        <FormField label="Assign Course">
          <select className={selectCls} value={f.subject} onChange={e => up("subject")(e.target.value)}>
            <option value="">Select course</option>
            {courses.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="flex justify-end gap-2 mt-5 pt-5 border-t border-border">
        <Btn variant="secondary" onClick={onClose}>
          Cancel
        </Btn>
        <Btn onClick={handleSave}>
          <UserPlus size={14} /> {initial ? "Save Changes" : "Add Faculty"}
        </Btn>
      </div>
    </Modal>
  );
}
