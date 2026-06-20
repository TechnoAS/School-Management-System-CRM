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
  EyeOff
} from "lucide-react";
import { Btn, FormField, inputCls, selectCls } from "@/components/shared";
import type { DashboardWidget, DashboardWidgetType } from "@/types/pageLayout";
import { DASHBOARD_DATA_SOURCES, getDataSourceMeta } from "@/lib/dashboardDataSources";

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
  "list"
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
  { value: 4, label: "Full Width", desc: "4/4 width" }
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

  const updateColor = (index: number, hex: string) => {
    const colors = [...(widget.colors ?? ["#1a3a5c"])];
    colors[index] = hex;
    onChange({ ...widget, colors });
  };

  const addColor = () => {
    onChange({ ...widget, colors: [...(widget.colors ?? []), "#2563eb"] });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-all" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card/98 backdrop-blur-md border-l border-border/80 shadow-2xl flex flex-col transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-foreground">Widget Settings</h2>
            <p className="text-[11px] text-muted-foreground">Customize layout, chart styles, and colors</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Identity */}
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

          {/* Section 2: Data Source & Visibility */}
          <div className="space-y-4">
            <FormField label="Data Source">
              <select
                className={selectCls}
                value={widget.dataSource}
                onChange={(e) => {
                  const next = getDataSourceMeta(e.target.value);
                  if (!next) return;
                  onChange({
                    ...widget,
                    dataSource: next.key,
                    type: next.defaultType,
                    title: widget.title || next.defaultTitle,
                    subtitle: widget.subtitle ?? next.defaultSubtitle,
                    span: next.defaultSpan,
                    colors: next.defaultColors,
                    icon: next.defaultIcon,
                  });
                }}
              >
                {DASHBOARD_DATA_SOURCES.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-2.5">
                {widget.visible ? <Eye size={18} className="text-primary" /> : <EyeOff size={18} className="text-muted-foreground" />}
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

          {/* Section 3: Visual Options (Visual Selectors) */}
          <div className="space-y-5">
            {/* Visual Chart Type Grid */}
            {allowedTypes.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Chart Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {allowedTypes.map((type) => {
                    const typeMeta = CHART_TYPE_META[type];
                    const Icon = typeMeta.icon;
                    const isSelected = widget.type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => onChange({ ...widget, type })}
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

            {/* Visual Column Span Selector */}
            {widget.type !== "stat" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Width (Grid Columns)</label>
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
                            <>
                              <div className="bg-primary rounded-[1px] col-span-4" />
                            </>
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

          <div className="border-t border-border/60" />

          {/* Section 4: Colors */}
          {widget.type !== "list" && (
            <div className="space-y-4">
              {/* Presets Grid */}
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
                      onClick={() => onChange({ ...widget, colors: [...p.colors] })}
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

              {/* Custom Individual Color pickers */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Custom Colors</label>
                <div className="space-y-2">
                  {(widget.colors ?? ["#1a3a5c"]).map((color, i) => (
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
                    </div>
                  ))}
                </div>
                {(widget.type === "bar" || widget.type === "area" || widget.type === "line") && widget.dataSource === "fee-trend" && (
                  <Btn variant="ghost" onClick={addColor} className="text-xs mt-1 w-full justify-center">
                    + Add Color Series
                  </Btn>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-muted/10">
          <Btn className="w-full" onClick={onClose}>
            Apply Changes
          </Btn>
        </div>
      </aside>
    </>
  );
}

