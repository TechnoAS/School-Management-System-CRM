import { AlertTriangle } from "lucide-react";
import { Btn } from "@/components/shared/Btn";

export function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel, variant = "danger" }: {
  title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void;
  variant?: "danger" | "neutral";
}) {
  const isDanger = variant === "danger";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDanger ? "bg-red-100" : "bg-primary/10"}`}>
            <AlertTriangle size={18} className={isDanger ? "text-red-600" : "text-primary"} />
          </div>
          <h2 className="font-semibold text-foreground">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2 justify-end">
          <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
          <Btn variant={isDanger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
