import { useState, useEffect } from "react";
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
import { getOSINTData } from "@/data/mockData";
import AnimatedPurpleBackground from "@/components/AnimatedPurpleBackground";

interface DashboardProps {
  targetName: string;
  onBack: () => void;
}

export default function Dashboard({ targetName, onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoadingOSINT, setIsLoadingOSINT] = useState(true);
  const osintData = getOSINTData(targetName);

  const isOsintComplete = osintData?.osintCompletionPercentage === 100;

  // Simulate 10 seconds loading for OSINT data
  useEffect(() => {
    setIsLoadingOSINT(true);
    const timer = setTimeout(() => {
      setIsLoadingOSINT(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [targetName]);

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
