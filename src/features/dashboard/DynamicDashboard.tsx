import { useState } from "react";
import type { PageLayout, DashboardWidget } from "@/types/pageLayout";
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

function spanClass(span: number, isStat: boolean): string {
  if (isStat) return "";
  if (span >= 2) return "lg:col-span-2";
  return "";
}

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
        key={widget.id}
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
    <>
      {statWidgets.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-5">
          {statWidgets.map((widget) => (
            <div key={widget.id} className={widget.visible ? "" : "opacity-50"}>
              {renderWidget(widget, layout.widgets.indexOf(widget), layout.widgets)}
            </div>
          ))}
        </div>
      )}

      {mainWidgets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {mainWidgets.map((widget) => (
            <div
              key={widget.id}
              className={`${spanClass(widget.span, false)} ${widget.visible ? "" : "opacity-50"}`}
            >
              {renderWidget(widget, layout.widgets.indexOf(widget), layout.widgets)}
            </div>
          ))}
        </div>
      )}

      {editMode && (
        <AddWidgetButton
          onAdd={(widget) => onLayoutChange({ widgets: [...layout.widgets, widget] })}
        />
      )}

      {configuring && (
        <WidgetConfigPanel
          widget={configuring}
          onChange={(next) => updateWidget(configuring.id, next)}
          onClose={() => setConfiguringId(null)}
        />
      )}
    </>
  );
}
