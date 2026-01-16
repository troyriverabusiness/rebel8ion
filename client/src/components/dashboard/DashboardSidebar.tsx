import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Search,
  Video,
  Crosshair,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export type TabType = "overview" | "osint" | "gmeet" | "attack";

interface NavItem {
  id: TabType;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "osint", label: "OSINT Engine", icon: Search },
  { id: "gmeet", label: "Google Meet Attack", icon: Video },
  { id: "attack", label: "Execute Attack", icon: Crosshair },
];

interface DashboardSidebarProps {
  targetName: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isOsintComplete: boolean;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onBack: () => void;
}

export default function DashboardSidebar({
  targetName,
  activeTab,
  onTabChange,
  isOsintComplete,
  collapsed,
  onCollapsedChange,
  onBack,
}: DashboardSidebarProps) {
  return (
    <Collapsible
      open={!collapsed}
      onOpenChange={(open) => onCollapsedChange(!open)}
      className="relative z-10"
    >
      <div
        className={`h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between">
          <CollapsibleContent>
            <h2 className="text-sm font-medium tracking-wider text-foreground/80">
              REVEL<span className="text-primary text-glow-purple">8</span>
            </h2>
          </CollapsibleContent>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Target Info */}
        <div className="p-4">
          <CollapsibleContent>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Target
            </p>
          </CollapsibleContent>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {collapsed ? (
              <span className="text-xs text-primary font-medium">
                {targetName.charAt(0)}
              </span>
            ) : (
              <span className="text-sm text-primary font-medium">
                {targetName}
              </span>
            )}
          </div>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.id === "attack" && !isOsintComplete;

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start mb-1 ${
                  collapsed ? "px-0 justify-center" : ""
                } ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                onClick={() => !isDisabled && onTabChange(item.id)}
                disabled={isDisabled}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-4 w-4 ${collapsed ? "" : "mr-2"}`}
                />
                {!collapsed && (
                  <span className="text-sm">{item.label}</span>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Back Button */}
        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className={`w-full justify-start text-muted-foreground hover:text-foreground ${
              collapsed ? "px-0 justify-center" : ""
            }`}
            onClick={onBack}
            title={collapsed ? "Back to Target Selection" : undefined}
          >
            <ArrowLeft
              className={`h-4 w-4 ${collapsed ? "" : "mr-2"}`}
            />
            {!collapsed && <span className="text-sm">Back</span>}
          </Button>
        </div>
      </div>
    </Collapsible>
  );
}
