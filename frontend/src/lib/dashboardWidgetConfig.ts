import type { DashboardWidget } from "@/types/pageLayout";
import { getDataSourceMeta } from "@/lib/dashboardDataSources";

export function spanClass(span: DashboardWidget["span"]): string {
  if (span === 4) return "lg:col-span-4";
  if (span === 3) return "lg:col-span-3";
  if (span === 2) return "lg:col-span-2";
  return "lg:col-span-1";
}

export type ColorConfig = {
  min: number;
  max: number;
  hint: string;
  canAdd: boolean;
  canRemove: boolean;
};

export function getColorConfig(widget: DashboardWidget): ColorConfig | null {
  if (widget.type === "list") return null;

  if (widget.type === "stat") {
    return { min: 1, max: 1, hint: "Accent color for the icon badge", canAdd: false, canRemove: false };
  }

  if (widget.dataSource === "enrollment-trend") {
    return { min: 1, max: 1, hint: "Primary chart color", canAdd: false, canRemove: false };
  }

  if (widget.dataSource === "fee-trend") {
    return { min: 2, max: 2, hint: "First = collected, second = due", canAdd: false, canRemove: false };
  }

  if (widget.dataSource === "course-enrollment") {
    return { min: 1, max: 12, hint: "One color per course slice or bar", canAdd: true, canRemove: true };
  }

  return { min: 1, max: 6, hint: "Chart colors", canAdd: true, canRemove: true };
}

export function defaultColorsForWidget(widget: DashboardWidget): string[] {
  const meta = getDataSourceMeta(widget.dataSource);
  return meta?.defaultColors ?? ["#1a3a5c", "#c0392b"];
}

export function ensureWidgetColors(widget: DashboardWidget): string[] {
  const config = getColorConfig(widget);
  const fallback = defaultColorsForWidget(widget);
  const current = widget.colors?.length ? [...widget.colors] : [...fallback];

  if (!config) return current;

  while (current.length < config.min) {
    current.push(fallback[current.length % fallback.length] ?? "#2563eb");
  }

  return current.slice(0, config.max);
}

export function applyWidgetTypeChange(widget: DashboardWidget, type: DashboardWidget["type"]): DashboardWidget {
  return {
    ...widget,
    type,
    colors: ensureWidgetColors({ ...widget, type }),
  };
}
