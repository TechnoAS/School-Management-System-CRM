import { BookOpen, UserCog, Clock, Users2, Download } from "lucide-react";
import { Batch, Student } from "@/types";
import { Modal, Btn, AvatarChip as Avatar, StatusBadge as Badge } from "@/components/shared";
import { handleExport } from "@/lib/utils";

export interface BatchStudentsModalProps {
  batch: Batch;
  students: Student[];
  onClose: () => void;
}

export function BatchStudentsModal({
  batch,
  students,
  onClose,
}: BatchStudentsModalProps) {
  const list = students.filter(s => s.batch === batch.name);
  return (
    <Modal title={`Students · ${batch.name}`} onClose={onClose}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><BookOpen size={12} /> {batch.course}</span>
          <span className="flex items-center gap-1.5"><UserCog size={12} /> {batch.faculty}</span>
          <span className="flex items-center gap-1.5"><Clock size={12} /> {batch.timing}</span>
        </div>
        <span className="text-xs font-semibold text-foreground">{list.length} enrolled</span>
      </div>
      {list.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          <Users2 size={28} className="mx-auto mb-2 opacity-40" />
          No students are assigned to this batch yet.
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/20">
              <tr>
                {["Student ID", "Name", "Phone", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => (
                <tr key={s.id} className={`border-t border-border/50 ${i % 2 !== 0 ? "bg-muted/5" : ""}`}>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{s.id}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.name} size="sm" src={s.photo} />
                      <span className="text-sm font-semibold text-foreground">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{s.phone}</td>
                  <td className="px-4 py-2.5"><Badge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end gap-2 mt-5 pt-5 border-t border-border">
        <Btn variant="secondary" onClick={() =>
            handleExport(
              `${batch.name} Students`,
              list.map(s => ({
                "Student ID": s.id,
                Name: s.name,
                Phone: s.phone,
                Course: s.course,
                Status: s.status,
              }))
            )
          }>
          <Download size={14} /> Export
        </Btn>
        <Btn onClick={onClose}>Close</Btn>
      </div>
    </Modal>
  );
}
