import { ChevronDown, ChevronUp, Settings2, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onConfigure: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function WidgetEditChrome({
  children,
  onConfigure,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: Props) {
  return (
    <div className="relative group rounded-xl ring-2 ring-dashed ring-primary/40 ring-offset-2 ring-offset-background">
      <div className="absolute -top-3 right-2 z-10 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="p-1.5 rounded-md bg-card border border-border shadow-sm hover:bg-muted disabled:opacity-40"
          title="Move up"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="p-1.5 rounded-md bg-card border border-border shadow-sm hover:bg-muted disabled:opacity-40"
          title="Move down"
        >
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          onClick={onConfigure}
          className="p-1.5 rounded-md bg-card border border-border shadow-sm hover:bg-muted"
          title="Configure"
        >
          <Settings2 size={14} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-md bg-card border border-border shadow-sm hover:bg-red-50 hover:text-red-600"
          title="Remove"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {children}
    </div>
  );
}
