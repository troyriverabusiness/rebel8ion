import { useState, useEffect, useCallback } from "react";
import Dashboard from "@/pages/Dashboard";
import TargetSelection from "@/pages/TargetSelection";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { type OSINTData, isOSINTPayload } from "@/data/mockData";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type ViewType = "target-selection" | "dashboard";

function App() {
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [currentView, setCurrentView] = useState<ViewType>("target-selection");
  const [osintData, setOsintData] = useState<OSINTData | null>(null);

  const handlePenetrate = () => {
    setCurrentView("dashboard");
  };

  const handleBackToTargetSelection = () => {
    setCurrentView("target-selection");
    setOsintData(null); // Clear OSINT data when going back
  };

  // Reset OSINT data when target changes
  const handleTargetChange = useCallback((target: string) => {
    setSelectedTarget(target);
    setOsintData(null);
  }, []);

  // Listen for webhook events via SSE with automatic reconnection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      eventSource = new EventSource(`${API_BASE_URL}/api/v1/webhook/stream`);

      eventSource.onopen = () => {
        console.log("SSE connection established");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Check if this is an OSINT payload
          if (isOSINTPayload(data)) {
            setOsintData(data);
            toast.success("OSINT Data Received", {
              description: `Intelligence gathered for ${data.companyProfile.name}`,
              duration: 3000,
            });
          } else {
            // Display toast for other webhook data
            toast.success("Webhook Received", {
              description: (
                <div className="mt-2 space-y-1">
                  <div className="text-xs font-mono bg-black/20 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(data, null, 2)}
                  </div>
                </div>
              ),
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Error parsing webhook data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        eventSource?.close();
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeout = setTimeout(() => {
          console.log("Attempting to reconnect SSE...");
          connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      eventSource?.close();
    };
  }, []);

  if (currentView === "dashboard" && selectedTarget) {
    return (
      <>
        <Dashboard
          targetName={selectedTarget}
          onBack={handleBackToTargetSelection}
          osintData={osintData}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <TargetSelection
        selectedTarget={selectedTarget}
        onTargetChange={handleTargetChange}
        onPenetrate={handlePenetrate}
      />
      <Toaster />
    </>
  );
}

export default App;
