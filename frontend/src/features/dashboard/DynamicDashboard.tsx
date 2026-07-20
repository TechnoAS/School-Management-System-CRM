import { useState } from "react";
import type { PageLayout, DashboardWidget } from "@/types/pageLayout";
import { spanClass } from "@/lib/dashboardWidgetConfig";
import { DashboardWidget as DashboardWidgetView } from "./DashboardWidget";
import { WidgetEditChrome } from "./WidgetEditChrome";
import { WidgetConfigPanel } from "./WidgetConfigPanel";
import { AddWidgetButton } from "./AddWidgetButton";
import type { DashboardWidgetData } from "./dashboardWidgetData";

type Props = {
  layout: PageLayout;
  data: DashboardWidgetData;
  editMode: boolean;
  onLayoutChange: (layout: PageLayout) => void;
};

export function DynamicDashboard({ layout, data, editMode, onLayoutChange }: Props) {
  const [configuringId, setConfiguringId] = useState<string | null>(null);

  const widgets = layout.widgets.filter((w) => w.visible || editMode);
  const statWidgets = widgets.filter((w) => w.type === "stat");
  const mainWidgets = widgets.filter((w) => w.type !== "stat");

  const updateWidget = (id: string, patch: Partial<DashboardWidget>) => {
    onLayoutChange({
      widgets: layout.widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    });
  };

  const removeWidget = (id: string) => {
    onLayoutChange({ widgets: layout.widgets.filter((w) => w.id !== id) });
    if (configuringId === id) setConfiguringId(null);
  };

  const moveWidget = (id: string, direction: -1 | 1) => {
    const list = [...layout.widgets];
    const index = list.findIndex((w) => w.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(target, 0, item);
    onLayoutChange({ widgets: list });
  };

  const renderWidget = (widget: DashboardWidget, index: number, list: DashboardWidget[]) => {
    const body = <DashboardWidgetView widget={widget} data={data} />;
    if (!editMode) return body;

    return (
      <WidgetEditChrome
        onConfigure={() => setConfiguringId(widget.id)}
        onRemove={() => removeWidget(widget.id)}
        onMoveUp={() => moveWidget(widget.id, -1)}
        onMoveDown={() => moveWidget(widget.id, 1)}
        canMoveUp={index > 0}
        canMoveDown={index < list.length - 1}
      >
        {body}
      </WidgetEditChrome>
    );
  };

  const configuring = layout.widgets.find((w) => w.id === configuringId);

  return (
    <div className="space-y-5">
      {statWidgets.length > 0 && (
        <section>
          <div className="dashboard-stat-grid">
            {statWidgets.map((widget, index) => (
              <div
                key={widget.id}
                className={`dashboard-widget-enter h-full ${widget.visible ? "" : "opacity-50"}`}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                {renderWidget(widget, layout.widgets.indexOf(widget), layout.widgets)}
              </div>
            ))}
          </div>
        </section>
      )}

      {mainWidgets.length > 0 && (
        <section className="dashboard-chart-grid">
          {mainWidgets.map((widget, index) => (
            <div
              key={widget.id}
              className={`dashboard-widget-enter h-full ${spanClass(widget.span)} ${widget.visible ? "" : "opacity-50"}`}
              style={{ animationDelay: `${(statWidgets.length + index) * 55}ms` }}
            >
              {renderWidget(widget, layout.widgets.indexOf(widget), layout.widgets)}
            </div>
          ))}
        </section>
      )}

      {editMode && (
        <AddWidgetButton onAdd={(widget) => onLayoutChange({ widgets: [...layout.widgets, widget] })} />
      )}

      {configuring && (
        <WidgetConfigPanel
          widget={configuring}
          onChange={(next) => updateWidget(configuring.id, next)}
          onClose={() => setConfiguringId(null)}
        />
      )}
    </div>
  );
}
