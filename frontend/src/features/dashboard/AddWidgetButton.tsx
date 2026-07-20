import { LayoutGrid, Plus } from "lucide-react";
import { DASHBOARD_DATA_SOURCES } from "@/lib/dashboardDataSources";
import { ensureWidgetColors } from "@/lib/dashboardWidgetConfig";
import type { DashboardWidget } from "@/types/pageLayout";

type Props = {
  onAdd: (widget: DashboardWidget) => void;
};

export function AddWidgetButton({ onAdd }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-30">
      <details className="group relative">
        <summary className="list-none flex cursor-pointer items-center gap-2 rounded-full border border-primary/20 bg-primary px-4 py-2.5 text-primary-foreground shadow-[0_8px_24px_rgba(26,58,92,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(26,58,92,0.34)]">
          <Plus size={16} />
          <span className="text-sm font-semibold">Add widget</span>
        </summary>
        <div className="absolute bottom-full right-0 mb-3 w-72 overflow-hidden rounded-2xl border border-border/80 bg-card/98 shadow-2xl backdrop-blur-md">
          <div className="border-b border-border/70 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <LayoutGrid size={15} className="text-primary" />
              Choose a widget
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Each widget can be styled independently</p>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {DASHBOARD_DATA_SOURCES.map((source) => (
              <button
                key={source.key}
                type="button"
                className="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70"
                onClick={() => {
                  const widget: DashboardWidget = {
                    id: `widget-${source.key}-${Date.now()}`,
                    type: source.defaultType,
                    title: source.defaultTitle,
                    subtitle: source.defaultSubtitle,
                    span: source.defaultSpan,
                    visible: true,
                    dataSource: source.key,
                    colors: source.defaultColors,
                    icon: source.defaultIcon,
                  };
                  onAdd({ ...widget, colors: ensureWidgetColors(widget) });
                }}
              >
                <span className="block text-sm font-medium text-foreground">{source.label}</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">{source.defaultTitle}</span>
              </button>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
