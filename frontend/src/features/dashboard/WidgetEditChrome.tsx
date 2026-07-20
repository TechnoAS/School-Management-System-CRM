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
    <div className="group relative rounded-2xl ring-2 ring-dashed ring-primary/35 ring-offset-2 ring-offset-background">
      <div className="absolute -top-4 right-3 z-20 flex items-center gap-1 rounded-full border border-border/80 bg-card/95 p-1 shadow-lg backdrop-blur-md transition-all duration-200 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-35"
          title="Move up"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-35"
          title="Move down"
        >
          <ChevronDown size={14} />
        </button>
        <div className="mx-0.5 h-4 w-px bg-border" />
        <button
          type="button"
          onClick={onConfigure}
          className="rounded-full p-1.5 text-primary transition-colors hover:bg-primary/10"
          title="Configure"
        >
          <Settings2 size={14} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
          title="Remove"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {children}
    </div>
  );
}
