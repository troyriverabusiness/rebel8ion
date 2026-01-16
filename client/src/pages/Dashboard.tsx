import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DashboardSidebar,
  OverviewTab,
  OSINTEngineTab,
  ExecuteAttackTab,
  type TabType,
} from "@/components/dashboard";
import { getOSINTData } from "@/data/mockData";
import AnimatedPurpleBackground from "@/components/AnimatedPurpleBackground";

interface DashboardProps {
  targetName: string;
  onBack: () => void;
}

export default function Dashboard({ targetName, onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const osintData = getOSINTData(targetName);

  const isOsintComplete = osintData?.osintCompletionPercentage === 100;

  return (
    <div className="min-h-screen w-full flex bg-background">
      <AnimatedPurpleBackground />

      <DashboardSidebar
        targetName={targetName}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOsintComplete={isOsintComplete}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        onBack={onBack}
      />

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-hidden">
        <ScrollArea className="h-screen">
          <div className="p-6">
            {activeTab === "overview" && (
              <OverviewTab targetName={targetName} osintData={osintData} />
            )}
            {activeTab === "osint" && osintData && (
              <OSINTEngineTab osintData={osintData} />
            )}
            {activeTab === "attack" && (
              <ExecuteAttackTab
                targetName={targetName}
                isEnabled={isOsintComplete}
              />
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
