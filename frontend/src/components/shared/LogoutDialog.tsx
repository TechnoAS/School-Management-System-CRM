import { LogOut } from "lucide-react";
import { Btn } from "@/components/shared/Btn";

export function LogoutDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-border" style={{ background: "linear-gradient(135deg, rgba(26,58,92,0.06) 0%, rgba(200,125,26,0.04) 100%)" }}>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--primary)" }}>
              <LogOut size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Sign out</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                You&apos;ll return to the login screen. Unsaved changes in open forms may be lost.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-2 bg-card">
          <Btn variant="secondary" onClick={onCancel}>Stay signed in</Btn>
          <Btn onClick={onConfirm}><LogOut size={14} /> Sign out</Btn>
        </div>
      </div>
    </div>
  );
}

export default LogoutDialog;
