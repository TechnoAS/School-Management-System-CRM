import { Plus } from "lucide-react";
import { DASHBOARD_DATA_SOURCES } from "@/lib/dashboardDataSources";
import type { DashboardWidget } from "@/types/pageLayout";

type Props = {
  onAdd: (widget: DashboardWidget) => void;
};

export function AddWidgetButton({ onAdd }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-30">
      <details className="group relative">
        <summary className="list-none flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-lg cursor-pointer hover:opacity-90">
          <Plus size={16} />
          <span className="text-sm font-semibold">Add widget</span>
        </summary>
        <div className="absolute bottom-full right-0 mb-2 w-64 max-h-72 overflow-y-auto bg-card border border-border rounded-xl shadow-xl p-1">
          {DASHBOARD_DATA_SOURCES.map((source) => (
            <button
              key={source.key}
              type="button"
              className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted"
              onClick={() =>
                onAdd({
                  id: `widget-${source.key}-${Date.now()}`,
                  type: source.defaultType,
                  title: source.defaultTitle,
                  subtitle: source.defaultSubtitle,
                  span: source.defaultSpan,
                  visible: true,
                  dataSource: source.key,
                  colors: source.defaultColors,
                  icon: source.defaultIcon,
                })
              }
            >
              {source.label}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
