import React, { useState } from "react";
import { CheckCircle2, X, Clock, BadgeCheck } from "lucide-react";
import { FacultyMember, AttnStatus } from "@/types";
import { Modal, FormField, Btn, AvatarChip as Avatar, inputCls } from "@/components/shared";
import { TODAY } from "@/lib/utils";

export interface FacultyAttendanceModalProps {
  faculty: FacultyMember[];
  onSave: (marks: Record<string, AttnStatus>, date: string) => void;
  onClose: () => void;
}

export function FacultyAttendanceModal({
  faculty,
  onSave,
  onClose,
}: FacultyAttendanceModalProps) {
  const [date, setDate] = useState(TODAY);
  const [marks, setMarks] = useState<Record<string, AttnStatus>>(
    Object.fromEntries(
      faculty.map(f => [
        f.id,
        (f.todayDate === TODAY ? f.todayStatus : "present") as AttnStatus,
      ])
    )
  );
  const set = (id: string, status: AttnStatus) => setMarks(prev => ({ ...prev, [id]: status }));
  const counts = {
    present: Object.values(marks).filter(s => s === "present").length,
    absent: Object.values(marks).filter(s => s === "absent").length,
    leave: Object.values(marks).filter(s => s === "leave").length,
  };
  const opts: { value: AttnStatus; label: string; icon: React.ElementType; on: string }[] = [
    { value: "present", label: "Present", icon: CheckCircle2, on: "bg-emerald-600 text-white border-emerald-600" },
    { value: "absent", label: "Absent", icon: X, on: "bg-red-600 text-white border-red-600" },
    { value: "leave", label: "Leave", icon: Clock, on: "bg-amber-500 text-white border-amber-500" },
  ];
  return (
    <Modal title="Mark Faculty Attendance" onClose={onClose} wide>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <FormField label="Attendance Date">
          <input className={inputCls} type="date" value={date} onChange={e => setDate(e.target.value)} />
        </FormField>
        <div className="flex gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
            {counts.present} Present
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-semibold">
            {counts.absent} Absent
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold">
            {counts.leave} Leave
          </span>
        </div>
      </div>
      <div className="space-y-1.5">
        {faculty.map(f => (
          <div key={f.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={f.name} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground truncate">{f.subject}</p>
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {opts.map(o => {
                const active = marks[f.id] === o.value;
                return (
                  <button
                    key={o.value}
                    onClick={() => set(f.id, o.value)}
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                      active ? o.on : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <o.icon size={12} /> {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-5 pt-5 border-t border-border">
        <Btn variant="secondary" onClick={onClose}>
          Cancel
        </Btn>
        <Btn onClick={() => onSave(marks, date)}>
          <BadgeCheck size={14} /> Save Attendance
        </Btn>
      </div>
    </Modal>
  );
}
