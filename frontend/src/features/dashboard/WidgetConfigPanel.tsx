import {
  X,
  Sparkles,
  TrendingUp,
  BarChart3,
  LineChart,
  PieChart,
  CircleDot,
  AlignLeft,
  ListTodo,
  Palette,
  Eye,
  EyeOff,
} from "lucide-react";
import { Btn, FormField, inputCls, selectCls } from "@/components/shared";
import type { DashboardWidget, DashboardWidgetType } from "@/types/pageLayout";
import { DASHBOARD_DATA_SOURCES, getDataSourceMeta } from "@/lib/dashboardDataSources";
import {
  applyWidgetTypeChange,
  ensureWidgetColors,
  getColorConfig,
} from "@/lib/dashboardWidgetConfig";
import { DASHBOARD_ICON_OPTIONS, resolveDashboardIcon } from "./dashboardIcons";

type Props = {
  widget: DashboardWidget;
  onChange: (widget: DashboardWidget) => void;
  onClose: () => void;
};

const ALLOWED_TYPES: DashboardWidgetType[] = [
  "stat",
  "area",
  "bar",
  "line",
  "pie",
  "donut",
  "horizontal-bar",
  "list",
];

const CHART_TYPE_META: Record<
  DashboardWidgetType,
  { label: string; icon: React.ComponentType<any>; description: string }
> = {
  stat: { label: "KPI Metric", icon: Sparkles, description: "Large text stat card" },
  area: { label: "Area Chart", icon: TrendingUp, description: "Filled trend graph" },
  bar: { label: "Vertical Bar", icon: BarChart3, description: "Vertical column bars" },
  line: { label: "Line Chart", icon: LineChart, description: "Standard trend lines" },
  pie: { label: "Solid Pie", icon: PieChart, description: "Classical pie slices" },
  donut: { label: "Donut Ring", icon: CircleDot, description: "Hollow ring chart" },
  "horizontal-bar": { label: "Horizontal Bar", icon: AlignLeft, description: "Left-to-right bar rows" },
  list: { label: "Schedule List", icon: ListTodo, description: "Bullet list of records" },
};

const SPAN_META = [
  { value: 1, label: "Quarter", desc: "1/4 width" },
  { value: 2, label: "Half", desc: "2/4 width" },
  { value: 3, label: "Three-Quarters", desc: "3/4 width" },
  { value: 4, label: "Full Width", desc: "4/4 width" },
];

const PALETTE_PRESETS = [
  { name: "Classic Slate", colors: ["#1a3a5c", "#c0392b", "#64748b", "#94a3b8"] },
  { name: "Ocean Breeze", colors: ["#0ea5e9", "#06b6d4", "#14b8a6", "#2dd4bf"] },
  { name: "Forest Emerald", colors: ["#059669", "#10b981", "#0d9488", "#14b8a6"] },
  { name: "Royal Violet", colors: ["#7c3aed", "#8b5cf6", "#a78bfa", "#c084fc"] },
  { name: "Sunset Gold", colors: ["#d97706", "#f59e0b", "#fbbf24", "#fef08a"] },
  { name: "Warm Crimson", colors: ["#dc2626", "#ef4444", "#f87171", "#fca5a5"] },
];

export function WidgetConfigPanel({ widget, onChange, onClose }: Props) {
  const meta = getDataSourceMeta(widget.dataSource);
  const allowedTypes = meta?.widgetTypes ?? ALLOWED_TYPES;
  const colorConfig = getColorConfig(widget);
  const colors = ensureWidgetColors(widget);

  const updateColor = (index: number, hex: string) => {
    const next = [...colors];
    next[index] = hex;
    onChange({ ...widget, colors: next });
  };

  const addColor = () => {
    if (!colorConfig?.canAdd || colors.length >= colorConfig.max) return;
    onChange({ ...widget, colors: [...colors, "#2563eb"] });
  };

  const removeColor = (index: number) => {
    if (!colorConfig?.canRemove || colors.length <= colorConfig.min) return;
    onChange({ ...widget, colors: colors.filter((_, i) => i !== index) });
  };

  const applyPreset = (presetColors: string[]) => {
    if (!colorConfig) return;
    const next = presetColors.slice(0, colorConfig.max);
    while (next.length < colorConfig.min) {
      next.push(presetColors[next.length % presetColors.length] ?? "#2563eb");
    }
    onChange({ ...widget, colors: next });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-all" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border/80 bg-card/98 shadow-2xl backdrop-blur-md transition-all duration-300">
        <div className="border-b border-border bg-gradient-to-r from-primary/8 via-transparent to-transparent px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-foreground">Widget Settings</h2>
              <p className="text-[11px] text-muted-foreground">
                Fine-tune this widget&apos;s look, data, and layout
              </p>
            </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={16} />
          </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="space-y-4">
            <FormField label="Widget Title">
              <input
                className={inputCls}
                value={widget.title}
                onChange={(e) => onChange({ ...widget, title: e.target.value })}
                placeholder="Enter widget title"
              />
            </FormField>

            <FormField label="Widget Subtitle (Optional)">
              <input
                className={inputCls}
                value={widget.subtitle ?? ""}
                onChange={(e) => onChange({ ...widget, subtitle: e.target.value || undefined })}
                placeholder="Enter helpful subtitle"
              />
            </FormField>
          </div>

          <div className="border-t border-border/60" />

          <div className="space-y-4">
            <FormField label="Data Source">
              <select
                className={selectCls}
                value={widget.dataSource}
                onChange={(e) => {
                  const next = getDataSourceMeta(e.target.value);
                  if (!next) return;
                  const updated: DashboardWidget = {
                    ...widget,
                    dataSource: next.key,
                    type: next.defaultType,
                    title: widget.title || next.defaultTitle,
                    subtitle: widget.subtitle ?? next.defaultSubtitle,
                    span: next.defaultSpan,
                    colors: next.defaultColors,
                    icon: next.defaultIcon,
                  };
                  onChange({ ...updated, colors: ensureWidgetColors(updated) });
                }}
              >
                {DASHBOARD_DATA_SOURCES.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-2.5">
                {widget.visible ? (
                  <Eye size={18} className="text-primary" />
                ) : (
                  <EyeOff size={18} className="text-muted-foreground" />
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">Widget Visibility</span>
                  <span className="text-[10px] text-muted-foreground">
                    {widget.visible ? "Visible on dashboard" : "Hidden from layout"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...widget, visible: !widget.visible })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  widget.visible ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    widget.visible ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-border/60" />

          <div className="space-y-5">
            {allowedTypes.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Chart Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {allowedTypes.map((type) => {
                    const typeMeta = CHART_TYPE_META[type];
                    const Icon = typeMeta.icon;
                    const isSelected = widget.type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => onChange(applyWidgetTypeChange(widget, type))}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                            : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon size={18} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                        <span className="text-xs font-medium mt-1">{typeMeta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {widget.type === "stat" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DASHBOARD_ICON_OPTIONS.map((option) => {
                    const Icon = resolveDashboardIcon(option.name);
                    const isSelected = widget.icon === option.name;
                    return (
                      <button
                        key={option.name}
                        type="button"
                        title={option.label}
                        onClick={() => onChange({ ...widget, icon: option.name })}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border bg-card hover:bg-muted"
                        }`}
                      >
                        <Icon size={16} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {widget.type !== "stat" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Width (Grid Columns)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SPAN_META.map((s) => {
                    const isSelected = widget.span === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => onChange({ ...widget, span: s.value as DashboardWidget["span"] })}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                            : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="grid grid-cols-4 gap-[2px] w-9 h-5 bg-card rounded-[4px] border border-border p-[2px] shrink-0">
                          {s.value === 1 && (
                            <>
                              <div className="bg-primary rounded-[1px] col-span-1" />
                              <div className="bg-muted-foreground/15 rounded-[1px] col-span-3" />
                            </>
                          )}
                          {s.value === 2 && (
                            <>
                              <div className="bg-primary rounded-[1px] col-span-2" />
                              <div className="bg-muted-foreground/15 rounded-[1px] col-span-2" />
                            </>
                          )}
                          {s.value === 3 && (
                            <>
                              <div className="bg-primary rounded-[1px] col-span-3" />
                              <div className="bg-muted-foreground/15 rounded-[1px] col-span-1" />
                            </>
                          )}
                          {s.value === 4 && (
                            <div className="bg-primary rounded-[1px] col-span-4" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold truncate text-foreground">{s.label}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{s.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {colorConfig && (
            <>
              <div className="border-t border-border/60" />

              <div className="space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Palette size={14} />
                    <span>Color Presets</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PALETTE_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => applyPreset(p.colors)}
                        className="flex flex-col p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-left transition-all group shadow-xs"
                      >
                        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground mb-1.5 truncate">
                          {p.name}
                        </span>
                        <div className="flex gap-1 h-3.5 rounded-[4px] overflow-hidden">
                          {p.colors.map((c, i) => (
                            <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Custom Colors
                    </label>
                    <span className="text-[10px] text-muted-foreground">{colorConfig.hint}</span>
                  </div>
                  <div className="space-y-2">
                    {colors.map((color, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="relative w-10 h-9 rounded-xl border border-border overflow-hidden shrink-0">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => updateColor(i, e.target.value)}
                            className="absolute inset-0 w-full h-full scale-150 cursor-pointer border-none p-0"
                          />
                        </div>
                        <input
                          className={inputCls}
                          value={color}
                          onChange={(e) => updateColor(i, e.target.value)}
                          placeholder="#ffffff"
                        />
                        {colorConfig.canRemove && colors.length > colorConfig.min && (
                          <button
                            type="button"
                            onClick={() => removeColor(i)}
                            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground"
                            title="Remove color"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {colorConfig.canAdd && colors.length < colorConfig.max && (
                    <Btn variant="ghost" onClick={addColor} className="text-xs mt-1 w-full justify-center">
                      + Add Color
                    </Btn>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-border bg-muted/10">
          <Btn className="w-full" onClick={onClose}>
            Done
          </Btn>
        </div>
      </aside>
    </>
  );
}
