export type DashboardWidgetType =
  | "stat"
  | "area"
  | "bar"
  | "line"
  | "pie"
  | "donut"
  | "horizontal-bar"
  | "list";


export type DashboardWidget = {
  id: string;
  type: DashboardWidgetType;
  title: string;
  subtitle?: string;
  span: 1 | 2 | 3 | 4;
  visible: boolean;
  dataSource: string;
  colors?: string[];
  icon?: string;
};

export type PageLayout = {
  widgets: DashboardWidget[];
};

export type PageLayouts = {
  dashboard?: PageLayout;
};
