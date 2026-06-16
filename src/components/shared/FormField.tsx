import { ReactNode, useState } from "react";

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export const inputCls = "w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all";
export const selectCls = "w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all";

export function Inp({ placeholder, value, onChange, type = "text" }: { placeholder?: string; value?: string; onChange?: (v: string) => void; type?: string }) {
  const [iv, setIv] = useState(value ?? "");
  return (
    <input
      type={type} placeholder={placeholder} value={iv}
      onChange={e => { setIv(e.target.value); onChange?.(e.target.value); }}
      className={inputCls}
    />
  );
}

export function Sel({ children, defaultValue }: { children: ReactNode; defaultValue?: string }) {
  return <select defaultValue={defaultValue} className={selectCls}>{children}</select>;
}

export default FormField;
