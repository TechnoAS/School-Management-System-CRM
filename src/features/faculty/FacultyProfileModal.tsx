import { Phone, Mail, Star, Award, Edit2 } from "lucide-react";
import { FacultyMember } from "@/types";
import { Modal, Btn, AvatarChip as Avatar } from "@/components/shared";
import { TODAY, FMT } from "@/lib/utils";

export function FacultyTodayBadge({ member: f }: { member: FacultyMember }) {
  const marked = f.todayDate === TODAY && f.todayStatus;
  const cfg = marked
    ? {
        present: {
          label: "Available today",
          cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        },
        absent: {
          label: "Absent today",
          cls: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
        },
        leave: {
          label: "On leave today",
          cls: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        },
      }[f.todayStatus!]
    : { label: "Not marked today", cls: "bg-gray-50 text-gray-500 border-gray-200", dot: "bg-gray-300" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
    </span>
  );
}

export interface FacultyProfileModalProps {
  member: FacultyMember;
  onEdit: () => void;
  onClose: () => void;
}

export function FacultyProfileModal({ member: f, onEdit, onClose }: FacultyProfileModalProps) {
  return (
    <Modal title="Faculty Profile" onClose={onClose}>
      <div className="flex items-center gap-4 mb-5">
        <Avatar name={f.name} size="lg" />
        <div>
          <h2 className="text-base font-semibold text-foreground">{f.name}</h2>
          <p className="text-sm text-muted-foreground">{f.subject}</p>
          <p className="text-xs font-mono text-muted-foreground mb-1.5">{f.id}</p>
          <FacultyTodayBadge member={f} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone size={13} /> {f.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail size={13} /> {f.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star size={13} /> {f.experience}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award size={13} /> {f.qualification}
          </div>
        </div>
        <div className="space-y-2">
          <div className="bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Monthly Salary</p>
            <p className="text-lg font-bold text-foreground">{FMT.format(f.salary)}</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Attendance</p>
            <p
              className={`text-lg font-bold ${
                f.attendance >= 95 ? "text-emerald-600" : f.attendance >= 85 ? "text-amber-600" : "text-red-600"
              }`}
            >
              {f.attendance}%
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Btn variant="secondary" onClick={onClose}>
          Close
        </Btn>
        <Btn onClick={onEdit}>
          <Edit2 size={14} /> Edit
        </Btn>
      </div>
    </Modal>
  );
}
