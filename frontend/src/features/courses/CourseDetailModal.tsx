import { BookOpen, Edit2 } from "lucide-react";
import { Course } from "@/types";
import { Modal, Btn, StatusBadge as Badge } from "@/components/shared";
import { FMT } from "@/lib/utils";

export function CourseDetailModal({
  course: c,
  onEdit,
  onClose,
}: {
  course: Course;
  onEdit: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Course Details" onClose={onClose}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen size={22} className="text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground text-base">{c.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-muted/30 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Duration</p>
          <p className="text-sm font-bold text-foreground">{c.duration}</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Fees</p>
          <p className="text-sm font-bold text-foreground">{FMT.format(c.fees)}</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Enrolled</p>
          <p className="text-sm font-bold text-foreground">{c.enrolled}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Badge status={c.status} />
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={onClose}>
            Close
          </Btn>
          <Btn onClick={onEdit}>
            <Edit2 size={14} /> Edit Course
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

export default CourseDetailModal;
