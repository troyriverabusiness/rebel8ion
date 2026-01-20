import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DashboardSidebar,
  OverviewTab,
  OSINTEngineTab,
  OSINTEngineTabSkeleton,
  GoogleMeetAttackTab,
  ExecuteAttackTab,
  type TabType,
} from "@/components/dashboard";
import { type OSINTData } from "@/types/osint";
import AnimatedPurpleBackground from "@/components/AnimatedPurpleBackground";

interface DashboardProps {
  targetName: string;
  onBack: () => void;
  osintData: OSINTData | null;
}

export default function Dashboard({ targetName, onBack, osintData }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Loading state is determined by whether we have OSINT data
  const isLoadingOSINT = !osintData;
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
              <OverviewTab 
                targetName={targetName} 
                osintData={osintData} 
                isLoading={isLoadingOSINT}
              />
            )}
            {activeTab === "osint" && (
              isLoadingOSINT ? (
                <OSINTEngineTabSkeleton />
              ) : osintData ? (
                <OSINTEngineTab osintData={osintData} />
              ) : null
            )}
            {activeTab === "gmeet" && (
              <GoogleMeetAttackTab targetName={targetName} />
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
