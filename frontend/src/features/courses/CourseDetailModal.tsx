import { BookOpen, Edit2, FileText, ExternalLink } from "lucide-react";
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
  const materials = c.extraData?.materials ?? [];

  return (
    <Modal title="Course Details" onClose={onClose} wide>
      <div className="relative h-32 -mx-6 -mt-2 mb-6 bg-gradient-to-br from-primary/15 to-muted/40 overflow-hidden">
        {c.banner ? (
          <img src={c.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-3 left-6 flex items-end gap-3">
          <div className="w-14 h-14 rounded-xl border-2 border-background bg-muted overflow-hidden shadow flex items-center justify-center shrink-0">
            {c.logo ? (
              <img src={c.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <BookOpen size={22} className="text-primary" />
            )}
          </div>
          <div className="pb-0.5">
            <h2 className="font-semibold text-foreground text-base">{c.name}</h2>
            {(c.startDate || c.endDate) && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {c.startDate ?? "—"} → {c.endDate ?? "—"}
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-5">{c.description || "No description provided."}</p>

      <div className="grid grid-cols-3 gap-3 mb-5">
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

      {materials.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Study materials
          </p>
          <div className="space-y-2">
            {materials.map(mat => (
              <a
                key={mat.id}
                href={mat.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors text-sm"
              >
                <FileText size={14} className="text-primary shrink-0" />
                <span className="flex-1 truncate font-medium">{mat.title}</span>
                <ExternalLink size={12} className="text-muted-foreground shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

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
