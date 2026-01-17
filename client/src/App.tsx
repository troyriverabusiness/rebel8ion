import { useState, useEffect } from "react";
import Dashboard from "@/pages/Dashboard";
import TargetSelection from "@/pages/TargetSelection";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

type ViewType = "target-selection" | "dashboard";

function App() {
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [currentView, setCurrentView] = useState<ViewType>("target-selection");

  const handlePenetrate = () => {
    setCurrentView("dashboard");
  };

  const handleBackToTargetSelection = () => {
    setCurrentView("target-selection");
  };

  // Listen for webhook events via SSE
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/api/v1/webhook/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Display toast with webhook data
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
      } catch (error) {
        console.error("Error parsing webhook data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (currentView === "dashboard" && selectedTarget) {
    return (
      <>
        <Dashboard
          targetName={selectedTarget}
          onBack={handleBackToTargetSelection}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <TargetSelection
        selectedTarget={selectedTarget}
        onTargetChange={setSelectedTarget}
        onPenetrate={handlePenetrate}
      />
      <Toaster />
    </>
  );
}

export default App;
