// Base UI Components
export * from "./src/components/ui/card";
export * from "./src/components/ui/button";
export * from "./src/components/ui/input";
export * from "./src/components/ui/label";
export * from "./src/components/ui/scroll-area";
export * from "./src/components/ui/avatar";
export * from "./src/components/ui/badge";
export * from "./src/components/ui/alert";
export * from "./src/components/ui/select";
export * from "./src/components/ui/textarea";
export * from "./src/components/ui/toast";
export * from "./src/components/ui/separator";
export * from "./src/components/ui/dialog";
export * from "./src/components/ui/tabs";
export * from "./src/components/ui/checkbox";
export * from "./src/components/ui/command";
export * from "./src/components/ui/popover";
export * from "./src/components/ui/progress";
export * from "./src/components/ui/skeleton";
export * from "./src/components/ui/toaster";
export * from "./src/components/ui/tooltip";
export * from "./src/components/ui/dropdown-menu";
export * from "./src/components/ui/table";
export * from "./src/components/ui/sheet";
export * from "./src/components/ui/collapsible";
export * from "./src/components/ui/sonner";
export * from "./src/components/ui/breadcrumb";

// Legacy UI Components (to be removed after migration)
export * from "./src/components/ui/okr-template-grid";
// export * from "./src/components/ui/okr-customization-form"; // Component moved to okr/forms/
export * from "./src/components/ui/metric-card";
export * from "./src/components/ui/metric-card-grid";
export * from "./src/components/ui/ai-insight-card";
export * from "./src/components/ui/ai-insights-panel";
export * from "./src/components/ui/dashboard-header";
export * from "./src/components/ui/error-boundary";
export * from "./src/components/ui/loading-states";
export * from "./src/components/ui/loading-states-enhanced";
export * from "./src/components/ui/error-boundary-enhanced";

// OKR Components - Forms
export * from "./src/components/okr/forms/BrandContextForm";
export * from "./src/components/okr/forms/BrandContextFormSimple";
export * from "./src/components/okr/forms/OKRCustomizationForm";
export * from "./src/components/okr/forms/QuickEditForm";

// OKR Components - Display
export * from "./src/components/okr/display/TemplateCard";
export * from "./src/components/okr/display/OKRProgressCard";
export * from "./src/components/okr/display/MetricBadge";
export * from "./src/components/okr/display/OKRHealthBadge";
export * from "./src/components/okr/display/ProgressRing";

// OKR Components - Selectors
export * from "./src/components/okr/selectors/IndustrySelector";
export * from "./src/components/okr/selectors/MetricsSelector";
export * from "./src/components/okr/selectors/PlatformMultiSelect";
export * from "./src/components/okr/selectors/GranularityToggle";
export * from "./src/components/okr/selectors/OKRSourceToggle";

// OKR Components - Tables
export * from "./src/components/okr/tables/BulkActionsToolbar";
export * from "./src/components/okr/tables/OKRManagementTable";

// OKR Types
export * from "./src/types/okr";

// Utilities
export { cn } from "./src/lib/utils";
