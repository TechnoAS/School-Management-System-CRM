import { User, GraduationCap, Users, FileUp, Paperclip } from "lucide-react";
import type { AdmissionFormConfig } from "@/types/admissionForm";
import { Card } from "@/components/shared";

export function AdmissionFormPreview({ config }: { config: AdmissionFormConfig }) {
  const sectionCls =
    "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3";

  return (
    <Card className="p-5 bg-muted/20 border-dashed sticky top-4">
      <p className="text-xs font-semibold text-foreground mb-1">Live preview</p>
      <p className="text-[11px] text-muted-foreground mb-4">
        Staff will see this layout when enrolling students
      </p>

      <div className="space-y-4 opacity-90 pointer-events-none select-none">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className={sectionCls}><User size={12} /> Personal</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-7 rounded-md bg-muted/60" />
            <div className="h-7 rounded-md bg-muted/60" />
            <div className="h-7 rounded-md bg-muted/60 col-span-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className={sectionCls}><GraduationCap size={12} /> Course</p>
            <div className="h-7 rounded-md bg-muted/60" />
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className={sectionCls}><Users size={12} /> Guardian</p>
            <div className="h-7 rounded-md bg-muted/60" />
          </div>
        </div>

        {config.customFields.length > 0 && (
          <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-4">
            <p className={sectionCls}><FileUp size={12} /> Custom fields ({config.customFields.length})</p>
            <div className="space-y-1.5">
              {config.customFields.map(f => (
                <div key={f.id} className="flex items-center justify-between text-[11px]">
                  <span className="text-foreground font-medium">{f.label}</span>
                  <span className="text-muted-foreground capitalize">
                    {f.type}{f.required ? " · required" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {config.documentSlots.length > 0 && (
          <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-4">
            <p className={sectionCls}><Paperclip size={12} /> Documents ({config.documentSlots.length})</p>
            <div className="grid grid-cols-2 gap-2">
              {config.documentSlots.map(s => (
                <div
                  key={s.id}
                  className="h-14 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center text-[10px] text-muted-foreground text-center px-2"
                >
                  {s.label}{s.required ? " *" : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default AdmissionFormPreview;
